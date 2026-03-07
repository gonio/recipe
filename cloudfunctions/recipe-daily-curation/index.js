/**
 * 每日菜谱精选云函数
 * 每天定时执行，使用 AI 搜索新菜谱，智能去重后保存到 Market
 *
 * @cloudbase/node-sdk >= 3.16.0 required for AI features
 */

const cloudbase = require('@cloudbase/node-sdk');
const { calculateSimilarity, findBestMatches } = require('./utils');
const { generateRecipeSearchPrompt, parseRecipeResponse } = require('./prompts');

// 初始化云开发环境
const cloud = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

/**
 * 主入口函数
 * 定时触发器每天 9:00 执行
 */
exports.main = async (event, context) => {
  // 记录执行日志
  const jobId = `curation_${Date.now()}`;
  const startTime = new Date();

  console.log(`[${jobId}] 开始执行每日菜谱精选...`);

  // 初始化日志记录
  const logEntry = {
    jobId,
    status: 'running',
    startTime,
    recipesSearched: 0,
    recipesAdded: 0,
    recipesDuplicated: 0,
    recipesUpdated: 0,
    fallbackToExisting: false,
    modelUsed: 'hunyuan-2.0-instruct-20251111',
    errors: []
  };

  try {
    // 1. 获取今天的日期
    const today = new Date().toISOString().split('T')[0];

    // 2. 检查今天是否已有精选菜谱
    const existingCuration = await db.collection('market_daily')
      .where({ date: today })
      .get();

    if (existingCuration.data.length > 0 && !event.force) {
      console.log(`[${jobId}] 今天已有精选菜谱，跳过执行`);
      logEntry.status = 'skipped';
      logEntry.message = '今日已有精选菜谱';
      await saveLog(logEntry);
      return {
        code: 0,
        message: '今日已有精选菜谱',
        data: { skipped: true }
      };
    }

    // 3. 使用 AI 搜索新菜谱
    console.log(`[${jobId}] 使用 AI 搜索新菜谱...`);
    const aiRecipes = await searchRecipesWithAI();
    logEntry.recipesSearched = aiRecipes.length;

    // 4. 获取现有菜谱用于去重
    const existingRecipes = await getExistingRecipes();
    console.log(`[${jobId}] 现有菜谱数量: ${existingRecipes.length}`);

    // 5. 智能去重和筛选
    const { newRecipes, duplicates, updatedRecipes } = await processRecipes(
      aiRecipes,
      existingRecipes,
      jobId
    );

    logEntry.recipesAdded = newRecipes.length;
    logEntry.recipesDuplicated = duplicates.length;
    logEntry.recipesUpdated = updatedRecipes.length;

    // 6. 保存新菜谱到数据库
    let finalRecipeIds = [];

    if (newRecipes.length > 0) {
      const savedRecipes = await saveNewRecipes(newRecipes);
      finalRecipeIds = savedRecipes.map(r => r._id);
      console.log(`[${jobId}] 保存了 ${savedRecipes.length} 道新菜谱`);
    }

    // 7. 更新热度更高的重复菜谱
    for (const update of updatedRecipes) {
      await updateRecipeHeat(update.existingId, update.newHeatScore);
    }

    // 8. 如果新菜谱不足 2 道，使用降级推荐
    let marketRecipes = [];

    if (finalRecipeIds.length >= 2) {
      // 使用 AI 发现的新菜谱
      marketRecipes = finalRecipeIds.slice(0, 2).map((id, index) => ({
        recipeId: id,
        type: 'new',
        reason: index === 0 ? '今日新品首发' : 'AI 精选推荐',
        addedAt: new Date()
      }));
    } else {
      // 降级：从现有菜谱推荐
      logEntry.fallbackToExisting = true;
      const fallbackRecipes = await getFallbackRecommendations(
        2 - finalRecipeIds.length,
        finalRecipeIds
      );

      marketRecipes = [
        ...finalRecipeIds.map((id, index) => ({
          recipeId: id,
          type: 'new',
          reason: index === 0 ? '今日新品首发' : 'AI 精选推荐',
          addedAt: new Date()
        })),
        ...fallbackRecipes.map((r, index) => ({
          recipeId: r._id,
          type: 'recommended',
          reason: r.recommendReason || '今日精选',
          addedAt: new Date()
        }))
      ];

      console.log(`[${jobId}] 使用降级推荐，补充了 ${fallbackRecipes.length} 道现有菜谱`);
    }

    // 9. 保存到 Market Daily
    await saveMarketDaily(today, marketRecipes);

    // 10. 完成日志记录
    logEntry.status = 'completed';
    logEntry.endTime = new Date();
    logEntry.duration = logEntry.endTime - startTime;
    await saveLog(logEntry);

    console.log(`[${jobId}] 执行完成，共添加 ${marketRecipes.length} 道精选菜谱`);

    return {
      code: 0,
      message: 'success',
      data: {
        jobId,
        date: today,
        recipesAdded: newRecipes.length,
        recipesUpdated: updatedRecipes.length,
        fallbackUsed: logEntry.fallbackToExisting,
        marketRecipes: marketRecipes.length
      }
    };

  } catch (error) {
    console.error(`[${jobId}] 执行失败:`, error);

    logEntry.status = 'failed';
    logEntry.endTime = new Date();
    logEntry.duration = logEntry.endTime - startTime;
    logEntry.errors.push({
      message: error.message,
      stack: error.stack
    });
    await saveLog(logEntry);

    return {
      code: -1,
      message: error.message,
      data: { jobId }
    };
  }
};

/**
 * 使用 AI 搜索新菜谱
 * @returns {Promise<Array>} AI 生成的菜谱列表
 */
async function searchRecipesWithAI() {
  try {
    const ai = cloud.ai();
    const model = ai.createModel('hunyuan-exp');

    const prompt = generateRecipeSearchPrompt();

    const result = await model.generateText({
      model: 'hunyuan-2.0-instruct-20251111',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的美食菜谱助手，擅长发现各种美味佳肴。请严格按照用户要求的 JSON 格式返回数据。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8
    });

    if (!result.text) {
      throw new Error('AI 返回结果为空');
    }

    const recipes = parseRecipeResponse(result.text);
    console.log(`AI 搜索到 ${recipes.length} 道菜谱`);

    return recipes;

  } catch (error) {
    console.error('AI 搜索菜谱失败:', error);
    // 返回空数组，触发降级逻辑
    return [];
  }
}

/**
 * 获取现有菜谱（用于去重）
 * @returns {Promise<Array>} 现有菜谱列表
 */
async function getExistingRecipes() {
  try {
    // 获取最近 200 道菜谱用于去重比较
    const result = await db.collection('recipes')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    return result.data || [];
  } catch (error) {
    console.error('获取现有菜谱失败:', error);
    return [];
  }
}

/**
 * 处理菜谱去重和筛选
 * @param {Array} aiRecipes AI 发现的菜谱
 * @param {Array} existingRecipes 现有菜谱
 * @param {string} jobId 任务 ID
 * @returns {Object} 新菜谱、重复项和更新项
 */
async function processRecipes(aiRecipes, existingRecipes, jobId) {
  const newRecipes = [];
  const duplicates = [];
  const updatedRecipes = [];

  for (const aiRecipe of aiRecipes) {
    // 计算与现有菜谱的名称相似度
    const matches = findBestMatches(aiRecipe.name, existingRecipes, 0.8);

    if (matches.length === 0) {
      // 无重复，是新菜谱
      newRecipes.push({
        ...aiRecipe,
        sourceType: 'ai_generated',
        createdAt: new Date(),
        updatedAt: new Date(),
        favoriteCount: 0,
        viewCount: 0,
        heatScore: calculateInitialHeat(aiRecipe)
      });
    } else {
      // 发现重复
      const bestMatch = matches[0]; // 最相似的现有菜谱
      const similarity = bestMatch.similarity;

      console.log(`[${jobId}] 发现重复: "${aiRecipe.name}" vs "${bestMatch.recipe.name}" (相似度: ${similarity.toFixed(2)})`);

      const newHeatScore = calculateInitialHeat(aiRecipe);
      const existingHeatScore = bestMatch.recipe.heatScore || 0;

      // 如果新菜谱热度更高，标记更新
      if (newHeatScore > existingHeatScore) {
        console.log(`[${jobId}] 新菜谱热度更高 (${newHeatScore} > ${existingHeatScore})，将更新`);
        updatedRecipes.push({
          existingId: bestMatch.recipe._id,
          newHeatScore,
          aiRecipe
        });
      }

      duplicates.push({
        aiRecipe,
        existingRecipe: bestMatch.recipe,
        similarity
      });
    }
  }

  return { newRecipes, duplicates, updatedRecipes };
}

/**
 * 计算初始热度分数
 * @param {Object} recipe 菜谱
 * @returns {number} 热度分数
 */
function calculateInitialHeat(recipe) {
  // 基础分 20，根据难度和烹饪时间调整
  let heat = 20;

  // 难度越低越受欢迎（1-5 级，1 最简单）
  if (recipe.difficulty) {
    heat += (6 - recipe.difficulty) * 5;
  }

  // 烹饪时间适中更受欢迎（30-60 分钟加分）
  if (recipe.cookTime) {
    if (recipe.cookTime >= 20 && recipe.cookTime <= 60) {
      heat += 10;
    }
  }

  // 食材越丰富越有吸引力（但不要太复杂）
  if (recipe.ingredients && recipe.ingredients.length) {
    const ingredientCount = recipe.ingredients.length;
    if (ingredientCount >= 3 && ingredientCount <= 10) {
      heat += 5;
    }
  }

  return heat;
}

/**
 * 保存新菜谱到数据库
 * @param {Array} recipes 菜谱列表
 * @returns {Promise<Array>} 保存后的菜谱（包含 _id）
 */
async function saveNewRecipes(recipes) {
  const saved = [];

  for (const recipe of recipes) {
    try {
      const result = await db.collection('recipes').add({
        data: recipe
      });

      saved.push({
        ...recipe,
        _id: result._id
      });
    } catch (error) {
      console.error(`保存菜谱 "${recipe.name}" 失败:`, error);
    }
  }

  return saved;
}

/**
 * 更新菜谱热度
 * @param {string} recipeId 菜谱 ID
 * @param {number} newHeatScore 新热度分数
 */
async function updateRecipeHeat(recipeId, newHeatScore) {
  try {
    await db.collection('recipes').doc(recipeId).update({
      data: {
        heatScore: newHeatScore,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error(`更新菜谱 ${recipeId} 热度失败:`, error);
  }
}

/**
 * 获取降级推荐菜谱
 * 当 AI 没有新内容时，从现有菜谱中推荐
 * @param {number} count 需要数量
 * @param {Array} excludeIds 排除的 ID 列表
 * @returns {Promise<Array>} 推荐菜谱列表
 */
async function getFallbackRecommendations(count, excludeIds = []) {
  try {
    const today = new Date();
    const month = today.getMonth() + 1; // 1-12

    // 根据季节筛选合适的菜系
    const seasonalCuisines = getSeasonalCuisines(month);

    let query = db.collection('recipes');

    // 构建查询条件
    const whereConditions = {};

    if (excludeIds.length > 0) {
      whereConditions._id = _.nin(excludeIds);
    }

    // 优先选择应季菜系
    if (seasonalCuisines.length > 0) {
      whereConditions.cuisine = _.in(seasonalCuisines);
    }

    if (Object.keys(whereConditions).length > 0) {
      query = query.where(whereConditions);
    }

    // 按热度排序，随机获取
    const result = await query
      .orderBy('heatScore', 'desc')
      .limit(count * 3) // 获取更多，然后随机选择
      .get();

    const candidates = result.data || [];

    // 随机打乱并选择
    const shuffled = candidates.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    // 添加推荐理由
    return selected.map(recipe => ({
      ...recipe,
      recommendReason: getRecommendReason(recipe, month)
    }));

  } catch (error) {
    console.error('获取降级推荐失败:', error);
    return [];
  }
}

/**
 * 获取应季菜系
 * @param {number} month 月份 (1-12)
 * @returns {Array} 应季菜系列表
 */
function getSeasonalCuisines(month) {
  // 根据季节推荐不同菜系
  const seasonalMap = {
    // 春季 (3-5月)
    3: ['粤菜', '浙菜', '家常菜'],
    4: ['粤菜', '浙菜', '家常菜'],
    5: ['粤菜', '浙菜', '家常菜'],
    // 夏季 (6-8月)
    6: ['川菜', '湘菜', '家常菜'], // 开胃辣菜
    7: ['川菜', '湘菜', '家常菜'],
    8: ['川菜', '湘菜', '家常菜'],
    // 秋季 (9-11月)
    9: ['鲁菜', '苏菜', '家常菜'], // 滋补菜品
    10: ['鲁菜', '苏菜', '家常菜'],
    11: ['鲁菜', '苏菜', '家常菜'],
    // 冬季 (12-2月)
    12: ['川菜', '火锅', '家常菜'], // 暖身菜品
    1: ['川菜', '火锅', '家常菜'],
    2: ['川菜', '火锅', '家常菜']
  };

  return seasonalMap[month] || ['家常菜'];
}

/**
 * 获取推荐理由
 * @param {Object} recipe 菜谱
 * @param {number} month 当前月份
 * @returns {string} 推荐理由
 */
function getRecommendReason(recipe, month) {
  const reasons = [];

  // 根据热度
  if (recipe.heatScore > 50) {
    reasons.push('人气爆款');
  }

  // 根据季节
  const seasonalCuisines = getSeasonalCuisines(month);
  if (seasonalCuisines.includes(recipe.cuisine)) {
    reasons.push('当季推荐');
  }

  // 根据难度
  if (recipe.difficulty <= 2) {
    reasons.push('简单快手');
  }

  // 默认理由
  if (reasons.length === 0) {
    reasons.push('今日精选');
  }

  return reasons.join(' · ');
}

/**
 * 保存 Market Daily 记录
 * @param {string} date 日期字符串
 * @param {Array} recipes 菜谱列表
 */
async function saveMarketDaily(date, recipes) {
  try {
    // 检查是否已存在
    const existing = await db.collection('market_daily')
      .where({ date })
      .get();

    if (existing.data.length > 0) {
      // 更新
      await db.collection('market_daily').doc(existing.data[0]._id).update({
        data: {
          recipes,
          updatedAt: new Date()
        }
      });
    } else {
      // 新建
      await db.collection('market_daily').add({
        data: {
          date,
          recipes,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    console.log(`已保存 ${date} 的 Market Daily，共 ${recipes.length} 道菜谱`);

  } catch (error) {
    console.error('保存 Market Daily 失败:', error);
    throw error;
  }
}

/**
 * 保存执行日志
 * @param {Object} log 日志对象
 */
async function saveLog(log) {
  try {
    await db.collection('ai_generation_logs').add({
      data: log
    });
  } catch (error) {
    console.error('保存日志失败:', error);
  }
}

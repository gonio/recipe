/**
 * 菜谱数据访问 API
 * 提供菜谱相关的数据查询方法
 */

const db = wx.cloud.database();
const _ = db.command;

const PAGE_SIZE = 20;

/**
 * 根据菜系获取菜谱列表
 * @param {string} cuisine - 菜系类型或 'all'
 * @param {number} page - 页码（从 0 开始）
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Object>} 菜谱列表
 */
function getRecipesByCuisine(cuisine, page = 0, pageSize = PAGE_SIZE) {
  let query = db.collection('recipes');

  if (cuisine && cuisine !== 'all') {
    query = query.where({ cuisine });
  }

  return query
    .orderBy('heatScore', 'desc')
    .skip(page * pageSize)
    .limit(pageSize)
    .get();
}

/**
 * 搜索菜谱
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 最大返回数量
 * @returns {Promise<Object>} 搜索结果
 */
function searchRecipes(keyword, limit = 20) {
  return db.collection('recipes')
    .where({
      name: db.RegExp({
        regexp: `.*${keyword}.*`,
        options: 'i'
      })
    })
    .limit(limit)
    .get();
}

/**
 * 根据 ID 获取菜谱详情
 * @param {string} recipeId - 菜谱 ID
 * @returns {Promise<Object>} 菜谱详情
 */
function getRecipeById(recipeId) {
  return db.collection('recipes').doc(recipeId).get();
}

/**
 * 获取今日精选菜谱（Market）
 * @returns {Promise<Array>} 精选菜谱列表
 */
async function getMarketRecipes() {
  const today = new Date().toISOString().split('T')[0];

  try {
    const marketResult = await db.collection('market_daily')
      .where({ date: today })
      .get();

    if (!marketResult.data.length) {
      return [];
    }

    const recipeIds = marketResult.data[0].recipes.map(r => r.recipeId);

    if (!recipeIds.length) {
      return [];
    }

    // 获取完整菜谱详情
    const recipesResult = await db.collection('recipes')
      .where({ _id: _.in(recipeIds) })
      .get();

    // 按 Market 顺序排序
    return marketResult.data[0].recipes.map(marketItem => {
      const recipe = recipesResult.data.find(r => r._id === marketItem.recipeId);
      return {
        ...recipe,
        marketType: marketItem.type,
        marketReason: marketItem.reason
      };
    }).filter(item => item._id); // 过滤掉未找到的菜谱

  } catch (error) {
    console.error('获取 Market 菜谱失败:', error);
    return [];
  }
}

/**
 * 获取推荐菜谱
 * 调用云函数获取个性化推荐
 * @param {number} limit - 返回数量
 * @returns {Promise<Array>} 推荐菜谱列表
 */
async function getRecommendations(limit = 10) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'recipe-recommend',
      data: { limit }
    });

    if (result.result.code === 0) {
      return result.result.data.recommendations;
    }

    throw new Error(result.result.message);
  } catch (error) {
    console.error('获取推荐失败:', error);
    // 返回空数组作为降级方案
    return [];
  }
}

/**
 * 获取热门菜谱
 * @param {number} limit - 返回数量
 * @returns {Promise<Object>} 热门菜谱列表
 */
function getHotRecipes(limit = 10) {
  return db.collection('recipes')
    .orderBy('heatScore', 'desc')
    .limit(limit)
    .get();
}

/**
 * 增加菜谱浏览量
 * @param {string} recipeId - 菜谱 ID
 */
async function incrementViewCount(recipeId) {
  try {
    await db.collection('recipes').doc(recipeId).update({
      data: {
        viewCount: _.inc(1),
        heatScore: _.inc(0.1)
      }
    });
  } catch (error) {
    console.error('增加浏览量失败:', error);
  }
}

module.exports = {
  getRecipesByCuisine,
  searchRecipes,
  getRecipeById,
  getMarketRecipes,
  getRecommendations,
  getHotRecipes,
  incrementViewCount,
  PAGE_SIZE
};

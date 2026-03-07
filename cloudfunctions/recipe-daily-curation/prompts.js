/**
 * AI 提示词模板
 * 用于生成菜谱搜索和解析的提示词
 */

/**
 * 生成菜谱搜索提示词
 * @param {Object} options 搜索选项
 * @returns {string} 完整的提示词
 */
function generateRecipeSearchPrompt(options = {}) {
  const { count = 3, includeSeasonal = true } = options;

  const month = new Date().getMonth() + 1;
  const seasonalHint = getSeasonalHint(month);

  return `请搜索并推荐 ${count} 道美味的中式菜谱。

要求：
1. 菜品应该是家常菜或餐厅常见菜，适合家庭制作
2. 优先推荐 ${seasonalHint} 的菜品
3. 每道菜应包含完整的食材清单和详细的烹饪步骤
4. 难度分级 1-5（1 为最简单）
5. 烹饪时间控制在 15-90 分钟内

请严格按照以下 JSON 格式返回，不要包含其他文字：

{
  "recipes": [
    {
      "name": "菜品名称",
      "cuisine": "菜系（如：川菜、粤菜、湘菜、鲁菜、家常菜等）",
      "description": "简短描述（20-50字）",
      "ingredients": [
        { "name": "食材名称", "amount": "用量" }
      ],
      "steps": [
        "详细步骤1",
        "详细步骤2"
      ],
      "cookTime": 30,
      "difficulty": 2,
      "tags": ["标签1", "标签2"],
      "imageKeywords": "用于搜索图片的关键词"
    }
  ]
}

注意：
- 必须返回合法的 JSON 格式
- 步骤要详细且易于操作
- 食材用量要具体（如：500克、2勺等）
- 确保菜品多样性，避免重复推荐相似的菜`;
}

/**
 * 获取季节性提示
 * @param {number} month 月份 (1-12)
 * @returns {string} 季节性描述
 */
function getSeasonalHint(month) {
  const hints = {
    1: '冬季暖身、滋补养生',
    2: '冬季暖身、滋补养生',
    3: '春季清淡、养肝护胃',
    4: '春季清淡、养肝护胃',
    5: '春季清淡、养肝护胃',
    6: '夏季开胃、清热解暑',
    7: '夏季开胃、清热解暑',
    8: '夏季开胃、清热解暑',
    9: '秋季润燥、滋补养生',
    10: '秋季润燥、滋补养生',
    11: '秋季润燥、滋补养生',
    12: '冬季暖身、滋补养生'
  };

  return hints[month] || '当季食材';
}

/**
 * 解析 AI 返回的菜谱数据
 * @param {string} response AI 返回的文本
 * @returns {Array} 解析后的菜谱列表
 */
function parseRecipeResponse(response) {
  try {
    // 尝试直接解析 JSON
    const data = JSON.parse(response);
    if (data.recipes && Array.isArray(data.recipes)) {
      return validateAndCleanRecipes(data.recipes);
    }
  } catch (e) {
    // 不是纯 JSON，尝试提取 JSON 部分
  }

  // 尝试从文本中提取 JSON
  try {
    // 匹配 JSON 代码块
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      if (data.recipes && Array.isArray(data.recipes)) {
        return validateAndCleanRecipes(data.recipes);
      }
    }

    // 尝试匹配花括号包裹的内容
    const bracketMatch = response.match(/\{[\s\S]*\}/);
    if (bracketMatch) {
      const data = JSON.parse(bracketMatch[0]);
      if (data.recipes && Array.isArray(data.recipes)) {
        return validateAndCleanRecipes(data.recipes);
      }
    }
  } catch (e) {
    console.error('解析 AI 响应失败:', e);
  }

  // 如果都无法解析，返回空数组
  console.warn('无法解析 AI 响应，返回空数组');
  return [];
}

/**
 * 验证和清理菜谱数据
 * @param {Array} recipes 菜谱列表
 * @returns {Array} 清理后的菜谱列表
 */
function validateAndCleanRecipes(recipes) {
  return recipes
    .filter(recipe => {
      // 必须有名称
      if (!recipe.name || typeof recipe.name !== 'string') {
        return false;
      }
      // 必须有食材和步骤
      if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        return false;
      }
      if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) {
        return false;
      }
      return true;
    })
    .map(recipe => ({
      name: String(recipe.name).trim(),
      cuisine: String(recipe.cuisine || '家常菜').trim(),
      description: String(recipe.description || '').trim().slice(0, 100),
      ingredients: recipe.ingredients.map(ing => ({
        name: String(ing.name || ing).trim(),
        amount: String(ing.amount || '适量').trim()
      })),
      steps: recipe.steps.map(step => String(step).trim()).filter(Boolean),
      cookTime: parseInt(recipe.cookTime) || 30,
      difficulty: Math.min(5, Math.max(1, parseInt(recipe.difficulty) || 2)),
      tags: Array.isArray(recipe.tags)
        ? recipe.tags.map(t => String(t).trim()).filter(Boolean).slice(0, 5)
        : [],
      imageUrl: recipe.imageUrl || '',
      imageKeywords: String(recipe.imageKeywords || recipe.name).trim()
    }));
}

/**
 * 生成图片搜索提示词
 * @param {Object} recipe 菜谱对象
 * @returns {string} 图片搜索关键词
 */
function generateImageSearchPrompt(recipe) {
  const baseKeywords = recipe.imageKeywords || recipe.name;
  return `${baseKeywords} 美食 菜品 实拍 精美`;
}

/**
 * 生成图片生成提示词（用于 AI 画图）
 * @param {Object} recipe 菜谱对象
 * @returns {string} 图片生成提示词
 */
function generateImageGenerationPrompt(recipe) {
  return `一道精美的中式菜品 "${recipe.name}"，摆盘精美，光线柔和，食欲诱人，专业美食摄影风格，高清，暖色调`;
}

module.exports = {
  generateRecipeSearchPrompt,
  getSeasonalHint,
  parseRecipeResponse,
  validateAndCleanRecipes,
  generateImageSearchPrompt,
  generateImageGenerationPrompt
};

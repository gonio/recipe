/**
 * 个性化菜谱推荐云函数
 * 根据用户偏好和历史行为推荐菜谱
 */

const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 主入口函数
 */
exports.main = async (event, context) => {
  const { limit = 10, refresh = false } = event;
  const { OPENID } = cloud.getWXContext();

  if (!OPENID) {
    // 未登录用户，返回热门推荐
    const hotRecipes = await getHotRecipes(limit);
    return {
      code: 0,
      message: 'success',
      data: {
        recommendations: hotRecipes,
        type: 'hot'
      }
    };
  }

  try {
    // 获取用户信息
    const userResult = await db.collection('users')
      .where({ _openid: OPENID })
      .get();

    const user = userResult.data[0] || {};
    const preferredCuisines = user.preferredCuisines || [];
    const favorites = user.favorites || [];
    const viewedRecipes = (user.viewedRecipes || []).map(v => v.recipeId);

    // 获取推荐
    let recommendations = [];

    if (preferredCuisines.length > 0) {
      // 根据偏好菜系推荐
      const preferenceRecipes = await getPreferenceRecipes(
        preferredCuisines,
        favorites,
        viewedRecipes,
        Math.ceil(limit / 2)
      );
      recommendations = [...recommendations, ...preferenceRecipes];
    }

    // 补充热门推荐
    if (recommendations.length < limit) {
      const hotRecipes = await getHotRecipes(
        limit - recommendations.length,
        [...favorites, ...viewedRecipes, ...recommendations.map(r => r._id)]
      );
      recommendations = [...recommendations, ...hotRecipes];
    }

    // 补充随机推荐
    if (recommendations.length < limit) {
      const randomRecipes = await getRandomRecipes(
        limit - recommendations.length,
        [...favorites, ...viewedRecipes, ...recommendations.map(r => r._id)]
      );
      recommendations = [...recommendations, ...randomRecipes];
    }

    return {
      code: 0,
      message: 'success',
      data: {
        recommendations: recommendations.slice(0, limit),
        type: preferredCuisines.length > 0 ? 'personalized' : 'hot',
        preferredCuisines
      }
    };

  } catch (error) {
    console.error('获取推荐失败:', error);

    // 降级方案：返回热门推荐
    const hotRecipes = await getHotRecipes(limit);
    return {
      code: 0,
      message: 'success',
      data: {
        recommendations: hotRecipes,
        type: 'hot_fallback'
      }
    };
  }
};

/**
 * 根据偏好菜系获取推荐
 */
async function getPreferenceRecipes(preferredCuisines, excludeIds, viewedIds, limit) {
  try {
    const allExcludeIds = [...new Set([...excludeIds, ...viewedIds])];

    let query = db.collection('recipes')
      .where({
        cuisine: _.in(preferredCuisines)
      });

    if (allExcludeIds.length > 0) {
      query = query.where({
        cuisine: _.in(preferredCuisines),
        _id: _.nin(allExcludeIds)
      });
    }

    const result = await query
      .orderBy('heatScore', 'desc')
      .limit(limit)
      .get();

    return result.data.map(recipe => ({
      ...recipe,
      recommendReason: `符合您偏好的${recipe.cuisine}`
    }));
  } catch (error) {
    console.error('获取偏好推荐失败:', error);
    return [];
  }
}

/**
 * 获取热门菜谱
 */
async function getHotRecipes(limit, excludeIds = []) {
  try {
    let query = db.collection('recipes');

    if (excludeIds.length > 0) {
      query = query.where({
        _id: _.nin(excludeIds)
      });
    }

    const result = await query
      .orderBy('heatScore', 'desc')
      .limit(limit)
      .get();

    return result.data.map(recipe => ({
      ...recipe,
      recommendReason: recipe.heatScore > 50 ? '热门推荐' : '为您推荐'
    }));
  } catch (error) {
    console.error('获取热门推荐失败:', error);
    return [];
  }
}

/**
 * 获取随机推荐
 */
async function getRandomRecipes(limit, excludeIds = []) {
  try {
    // 获取总数
    const countResult = await db.collection('recipes').count();
    const total = countResult.total;

    if (total === 0) return [];

    // 随机获取
    let query = db.collection('recipes');

    if (excludeIds.length > 0) {
      query = query.where({
        _id: _.nin(excludeIds)
      });
    }

    const result = await query
      .skip(Math.floor(Math.random() * Math.max(1, total - limit)))
      .limit(limit)
      .get();

    return result.data.map(recipe => ({
      ...recipe,
      recommendReason: '猜您喜欢'
    }));
  } catch (error) {
    console.error('获取随机推荐失败:', error);
    return [];
  }
}

/**
 * 用户数据访问 API
 * 提供用户相关的数据操作方法
 */

const db = wx.cloud.database();
const _ = db.command;

/**
 * 获取当前用户的收藏列表
 * @param {number} page - 页码（从 0 开始）
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Object>} 收藏的菜谱列表
 */
async function getUserFavorites(page = 0, pageSize = 20) {
  try {
    // 获取当前用户的收藏 ID 列表
    const userResult = await db.collection('users')
      .where({ _openid: '{openid}' }) // 云开发自动填充 openid
      .get();

    if (!userResult.data.length) {
      return { data: [], total: 0 };
    }

    const favoriteIds = userResult.data[0].favorites || [];

    if (!favoriteIds.length) {
      return { data: [], total: 0 };
    }

    // 分页处理
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedIds = favoriteIds.slice(start, end);

    if (!paginatedIds.length) {
      return { data: [], total: favoriteIds.length };
    }

    // 获取收藏的菜谱详情
    const recipesResult = await db.collection('recipes')
      .where({ _id: _.in(paginatedIds) })
      .get();

    return {
      data: recipesResult.data,
      total: favoriteIds.length
    };
  } catch (error) {
    console.error('获取收藏失败:', error);
    return { data: [], total: 0 };
  }
}

/**
 * 切换收藏状态（添加/移除）
 * 调用云函数执行事务操作
 * @param {string} recipeId - 菜谱 ID
 * @param {boolean} isFavoriting - true 为添加，false 为移除
 * @returns {Promise<Object>} 操作结果
 */
async function toggleFavorite(recipeId, isFavoriting) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'user-toggle-favorite',
      data: {
        recipeId,
        action: isFavoriting ? 'add' : 'remove'
      }
    });

    return result.result;
  } catch (error) {
    console.error('切换收藏失败:', error);
    throw error;
  }
}

/**
 * 更新用户偏好设置
 * @param {Array<string>} preferredCuisines - 偏好的菜系列表
 * @returns {Promise<Object>} 更新结果
 */
async function updatePreferences(preferredCuisines) {
  try {
    const result = await db.collection('users')
      .where({ _openid: '{openid}' })
      .update({
        data: {
          preferredCuisines,
          updatedAt: db.serverDate()
        }
      });

    return result;
  } catch (error) {
    console.error('更新偏好失败:', error);
    throw error;
  }
}

/**
 * 记录菜谱浏览历史
 * @param {string} recipeId - 菜谱 ID
 */
async function trackRecipeView(recipeId) {
  try {
    await db.collection('users')
      .where({ _openid: '{openid}' })
      .update({
        data: {
          viewedRecipes: _.push([{
            recipeId,
            viewedAt: db.serverDate()
          }]),
          updatedAt: db.serverDate()
        }
      });
  } catch (error) {
    console.error('记录浏览历史失败:', error);
  }
}

/**
 * 检查菜谱是否已收藏
 * @param {string} recipeId - 菜谱 ID
 * @returns {Promise<boolean>} 是否已收藏
 */
async function isRecipeFavorited(recipeId) {
  try {
    const userResult = await db.collection('users')
      .where({ _openid: '{openid}' })
      .get();

    if (!userResult.data.length) {
      return false;
    }

    const favorites = userResult.data[0].favorites || [];
    return favorites.includes(recipeId);
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }
}

/**
 * 获取当前用户信息
 * @returns {Promise<Object|null>} 用户信息
 */
async function getCurrentUser() {
  try {
    const result = await db.collection('users')
      .where({ _openid: '{openid}' })
      .get();

    return result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

module.exports = {
  getUserFavorites,
  toggleFavorite,
  updatePreferences,
  trackRecipeView,
  isRecipeFavorited,
  getCurrentUser
};

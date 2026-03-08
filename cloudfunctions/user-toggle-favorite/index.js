/**
 * 用户收藏/取消收藏云函数
 * 支持事务操作，同时更新用户收藏列表和菜谱收藏数
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
  const { action, recipeId } = event;
  const { OPENID } = cloud.getWXContext();

  // 参数校验
  if (!OPENID) {
    return {
      code: -1,
      message: '未获取到用户身份',
      data: null
    };
  }

  if (!recipeId) {
    return {
      code: -1,
      message: '缺少菜谱ID',
      data: null
    };
  }

  if (!['add', 'remove'].includes(action)) {
    return {
      code: -1,
      message: '无效的操作类型，应为 add 或 remove',
      data: null
    };
  }

  try {
    // 获取用户信息
    const userResult = await db.collection('users')
      .where({ _openid: OPENID })
      .get();

    if (!userResult.data.length) {
      // 用户不存在，自动创建
      await createUser(OPENID);
    }

    // 获取菜谱信息
    const recipeResult = await db.collection('recipes').doc(recipeId).get();
    if (!recipeResult.data) {
      return {
        code: -1,
        message: '菜谱不存在',
        data: null
      };
    }

    const recipe = recipeResult.data;
    const user = userResult.data[0] || { favorites: [] };
    const favorites = user.favorites || [];

    // 检查当前收藏状态
    const isFavorited = favorites.includes(recipeId);

    if (action === 'add') {
      // 添加收藏
      if (isFavorited) {
        return {
          code: 0,
          message: '已经收藏过了',
          data: {
            isFavorited: true,
            favoriteCount: recipe.favoriteCount || 0
          }
        };
      }

      // 执行添加收藏操作
      await Promise.all([
        // 更新用户收藏列表
        db.collection('users')
          .where({ _openid: OPENID })
          .update({
            data: {
              favorites: _.push([recipeId]),
              updatedAt: db.serverDate()
            }
          }),
        // 更新菜谱收藏数
        db.collection('recipes').doc(recipeId).update({
          data: {
            favoriteCount: _.inc(1),
            heatScore: _.inc(1)
          }
        })
      ]);

      return {
        code: 0,
        message: '收藏成功',
        data: {
          isFavorited: true,
          favoriteCount: (recipe.favoriteCount || 0) + 1
        }
      };

    } else {
      // 移除收藏
      if (!isFavorited) {
        return {
          code: 0,
          message: '未收藏此菜谱',
          data: {
            isFavorited: false,
            favoriteCount: recipe.favoriteCount || 0
          }
        };
      }

      // 执行移除收藏操作
      const newFavorites = favorites.filter(id => id !== recipeId);

      await Promise.all([
        // 更新用户收藏列表
        db.collection('users')
          .where({ _openid: OPENID })
          .update({
            data: {
              favorites: newFavorites,
              updatedAt: db.serverDate()
            }
          }),
        // 更新菜谱收藏数
        db.collection('recipes').doc(recipeId).update({
          data: {
            favoriteCount: _.inc(-1),
            heatScore: _.inc(-1)
          }
        })
      ]);

      return {
        code: 0,
        message: '取消收藏成功',
        data: {
          isFavorited: false,
          favoriteCount: Math.max(0, (recipe.favoriteCount || 0) - 1)
        }
      };
    }

  } catch (error) {
    console.error('收藏操作失败:', error);
    return {
      code: -1,
      message: '操作失败: ' + error.message,
      data: null
    };
  }
};

/**
 * 创建新用户
 */
async function createUser(openid) {
  try {
    await db.collection('users').add({
      data: {
        _openid: openid,
        favorites: [],
        viewedRecipes: [],
        preferredCuisines: [],
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });
    console.log('新用户创建成功:', openid);
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
}

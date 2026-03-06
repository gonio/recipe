// 云函数入口文件
const cloudbase = require('@cloudbase/node-sdk');

// 初始化 CloudBase
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});

const db = app.database();

/**
 * 获取用户信息
 * 如果用户不存在则自动创建
 * @param {string} openid - WeChat OpenID
 * @param {Object} userInfo - 微信用户信息（可选）
 */
async function getOrCreateUser(openid, userInfo = {}) {
  const usersCollection = db.collection('users');

  // 查找现有用户
  const userResult = await usersCollection.where({
    _openid: openid
  }).get();

  if (userResult.data.length > 0) {
    // 用户已存在，更新最后登录时间
    const existingUser = userResult.data[0];
    await usersCollection.doc(existingUser._id).update({
      updatedAt: db.serverDate()
    });
    return { user: existingUser, isNewUser: false };
  }

  // 创建新用户
  const newUser = {
    _openid: openid,
    nickname: userInfo.nickName || '',
    avatarUrl: userInfo.avatarUrl || '',
    preferredCuisines: [],
    favorites: [],
    viewedRecipes: [],
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const createResult = await usersCollection.add(newUser);
  return {
    user: { ...newUser, _id: createResult.id },
    isNewUser: true
  };
}

/**
 * 云函数入口函数
 * @param {Object} event - 调用参数
 * @param {Object} context - 上下文
 */
exports.main = async (event, context) => {
  const { action, userInfo } = event;

  // 获取 OpenID
  const { OPENID } = cloudbase.getCloudbaseContext(context);

  if (!OPENID) {
    return {
      code: 1002,
      message: 'WeChat auth failed - cannot get OpenID',
      data: null
    };
  }

  try {
    switch (action) {
      case 'getUserInfo':
        const { user, isNewUser } = await getOrCreateUser(OPENID, userInfo);
        return {
          code: 0,
          message: 'success',
          data: {
            openid: OPENID,
            user,
            isNewUser
          }
        };

      default:
        return {
          code: 1001,
          message: 'Invalid action - supported actions: getUserInfo',
          data: null
        };
    }
  } catch (error) {
    console.error('Auth function error:', error);
    return {
      code: 1003,
      message: 'Database error',
      detail: error.message,
      data: null
    };
  }
};

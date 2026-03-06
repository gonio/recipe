/**
 * 个人中心页面
 * 使用 CloudBase SDK
 */

const { getUserFavorites } = require('../../utils/user-api');
const { showLoading, hideLoading, showError } = require('../../utils/ui-helpers');

Page({
  data: {
    userInfo: {},
    stats: {
      favorites: 0
    },
    isLoading: true,
    preferredCuisines: []
  },

  onLoad() {
    this.loadUserInfo();
    this.loadFavoritesCount();
  },

  onShow() {
    const app = getApp();

    // 检查是否需要刷新
    if (app.globalData.needRefreshProfile) {
      app.globalData.needRefreshProfile = false;
      this.loadUserInfo();
      this.loadFavoritesCount();
    }
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        preferredCuisines: userInfo.preferredCuisines || [],
        isLoading: false
      });
    } else {
      // 尝试从 app 获取用户信息
      this.setData({ isLoading: true });
      app.fetchUserInfo().then(user => {
        if (user) {
          this.setData({
            userInfo: user,
            preferredCuisines: user.preferredCuisines || [],
            isLoading: false
          });
        }
      }).catch(() => {
        this.setData({ isLoading: false });
      });
    }
  },

  // 加载收藏数量
  async loadFavoritesCount() {
    try {
      const result = await getUserFavorites(0, 1000);
      const favorites = result.data || [];

      this.setData({
        'stats.favorites': favorites.length
      });
    } catch (error) {
      console.error('加载收藏数量失败:', error);
    }
  },

  // 加载用户统计数据
  async loadUserStats() {
    try {
      const result = await getUserFavorites(0, 1000);
      const favorites = result.data || [];

      this.setData({
        'stats.favorites': favorites.length
      });
    } catch (error) {
      console.error('加载用户统计失败:', error);
    }
  },

  // 更新用户微信信息
  async updateUserProfile() {
    try {
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });

      showLoading('更新中...');
      const app = getApp();
      const updatedUser = await app.updateUserProfile(userInfo);
      hideLoading();

      this.setData({
        userInfo: updatedUser
      });

      wx.showToast({
        title: '更新成功',
        icon: 'success'
      });
    } catch (error) {
      hideLoading();
      console.error('更新用户信息失败:', error);
      showError('更新失败');
    }
  },

  // 编辑偏好菜系
  editPreferences() {
    wx.navigateTo({
      url: '/pages/preferences/preferences'
    });
  },

  // 分享小程序
  onShareAppMessage() {
    return {
      title: '美味食谱 - 发现美食的乐趣',
      path: '/pages/index/index'
    };
  }
});

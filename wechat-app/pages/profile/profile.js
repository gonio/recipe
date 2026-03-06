const app = getApp();

Page({
  data: {
    userInfo: {},
    stats: {
      favorites: 0,
      newRecipes: 0
    }
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const userInfo = await app.getUserInfo();
      const { favoritesCount, newRecipesCount } = userInfo;
      
      this.setData({
        userInfo: userInfo,
        stats: {
          favorites: favoritesCount || 0,
          newRecipes: newRecipesCount || 0
        }
      });
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  // 编辑资料
  editProfile() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmColor: '#EF5350',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }
    });
  }
});

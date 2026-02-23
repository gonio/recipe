const app = getApp();

Page({
  data: {
    userInfo: {},
    stats: {
      favorites: 0,
      cuisines: 0,
      newRecipes: 0
    },
    preferredCuisinesText: ''
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
      // 使用 getUserInfo 以利用缓存
      const userInfo = await app.getUserInfo();
      const { favoritesCount, preferredCuisines, newRecipesCount } = userInfo;
      
      this.setData({
        userInfo: userInfo,
        stats: {
          favorites: favoritesCount || 0,
          cuisines: preferredCuisines?.length || 0,
          newRecipes: newRecipesCount || 0
        },
        preferredCuisinesText: this.formatCuisines(preferredCuisines)
      });
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  // 格式化菜系显示
  formatCuisines(cuisines) {
    if (!cuisines || cuisines.length === 0) {
      return '未设置';
    }
    if (cuisines.length <= 2) {
      return cuisines.join('、');
    }
    return `${cuisines[0]}、${cuisines[1]}等${cuisines.length}个`;
  },

  // 编辑资料
  editProfile() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 跳转到偏好设置
  goToPreferences() {
    wx.navigateTo({
      url: '/pages/preferences/preferences'
    });
  },

  // 查看全部收藏
  viewAllFavorites() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 按菜系查看
  viewByCuisine() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 关于我们
  aboutUs() {
    wx.showModal({
      title: '关于美味食谱',
      content: '美味食谱是一款智能菜谱小程序，由 Kimi Claw 自动搜罗各地美食菜谱，让你每天都能发现新美味。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#42A5F5'
    });
  },

  // 意见反馈
  feedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有任何问题或建议，欢迎联系我们！',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#42A5F5'
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '发现美味食谱，每天学做新菜',
      path: '/pages/index/index',
      imageUrl: '/images/share-default.png'
    };
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
          // 返回首页
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }
    });
  }
});

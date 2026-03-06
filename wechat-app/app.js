/**
 * 美味食谱 - 小程序入口
 * 使用 CloudBase 云开发
 */

App({
  globalData: {
    // 用户信息
    userInfo: null,
    openid: null,
    isLogin: false,

    // 用户偏好
    preferredCuisines: [],

    // 全局状态
    needRefreshFavorites: false,
    needRefreshProfile: false
  },

  onLaunch() {
    // 初始化 CloudBase
    this.initCloudBase();

    // 获取用户信息
    this.fetchUserInfo();

    // 获取系统信息用于适配
    this.getSystemInfo();
  },

  onShow() {
    // 检查是否需要刷新收藏列表
    if (this.globalData.needRefreshFavorites) {
      this.globalData.needRefreshFavorites = false;
      // 触发收藏页面刷新事件
      this.emitFavoritesRefresh();
    }

    // 检查是否需要刷新个人资料
    if (this.globalData.needRefreshProfile) {
      this.globalData.needRefreshProfile = false;
      this.fetchUserInfo();
    }
  },

  /**
   * 初始化 CloudBase
   */
  initCloudBase() {
    // 检查是否已初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用云开发功能，请升级到最新微信版本后重试。',
        showCancel: false
      });
      return;
    }

    // 初始化云开发环境
    wx.cloud.init({
      env: 'prod-8gcm2k4c7068a0e9', // 云开发环境ID
      traceUser: true // 记录用户访问日志
    });

    console.log('CloudBase 初始化成功');
  },

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;

      // 计算安全区域
      if (systemInfo.safeArea) {
        this.globalData.safeArea = systemInfo.safeArea;
      }

      // 判断是否为刘海屏
      this.globalData.isNotch = systemInfo.screenHeight - systemInfo.windowHeight > 50;
    } catch (error) {
      console.error('获取系统信息失败:', error);
    }
  },

  /**
   * 调用云函数获取用户信息
   */
  async fetchUserInfo() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'getUserInfo'
        }
      });

      if (result.code === 0 && result.data) {
        const { user, openid } = result.data;

        this.globalData.userInfo = user;
        this.globalData.openid = openid;
        this.globalData.isLogin = true;
        this.globalData.preferredCuisines = user.preferredCuisines || [];

        console.log('用户信息获取成功:', user.nickName || '匿名用户');

        // 触发用户登录成功事件
        this.emitLoginSuccess(user);

        return user;
      } else {
        console.warn('获取用户信息失败:', result.message);
        return null;
      }
    } catch (error) {
      console.error('调用 auth 云函数失败:', error);
      return null;
    }
  },

  /**
   * 更新用户微信信息（用户主动授权后）
   */
  async updateUserProfile(userProfile) {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'updateUserInfo',
          userInfo: userProfile
        }
      });

      if (result.code === 0 && result.data) {
        this.globalData.userInfo = result.data;
        this.globalData.isLogin = true;
        return result.data;
      } else {
        throw new Error(result.message || '更新用户信息失败');
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 获取当前用户 OpenID
   */
  getOpenId() {
    return this.globalData.openid;
  },

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    return this.globalData.isLogin && this.globalData.openid;
  },

  /**
   * 获取用户偏好菜系
   */
  getPreferredCuisines() {
    return this.globalData.preferredCuisines || [];
  },

  /**
   * 设置用户偏好菜系
   */
  setPreferredCuisines(cuisines) {
    this.globalData.preferredCuisines = cuisines;
  },

  /**
   * 标记需要刷新收藏列表
   */
  markFavoritesNeedRefresh() {
    this.globalData.needRefreshFavorites = true;
  },

  /**
   * 标记需要刷新个人资料
   */
  markProfileNeedRefresh() {
    this.globalData.needRefreshProfile = true;
  },

  // ========== 事件系统 ==========

  /**
   * 触发登录成功事件
   */
  emitLoginSuccess(userInfo) {
    if (this.loginSuccessCallbacks) {
      this.loginSuccessCallbacks.forEach(callback => {
        try {
          callback(userInfo);
        } catch (error) {
          console.error('登录成功回调执行失败:', error);
        }
      });
    }
  },

  /**
   * 注册登录成功回调
   */
  onLoginSuccess(callback) {
    if (!this.loginSuccessCallbacks) {
      this.loginSuccessCallbacks = [];
    }
    this.loginSuccessCallbacks.push(callback);

    // 如果已经登录，立即执行回调
    if (this.globalData.isLogin && this.globalData.userInfo) {
      callback(this.globalData.userInfo);
    }
  },

  /**
   * 移除登录成功回调
   */
  offLoginSuccess(callback) {
    if (this.loginSuccessCallbacks) {
      const index = this.loginSuccessCallbacks.indexOf(callback);
      if (index > -1) {
        this.loginSuccessCallbacks.splice(index, 1);
      }
    }
  },

  /**
   * 触发收藏列表刷新事件
   */
  emitFavoritesRefresh() {
    if (this.favoritesRefreshCallbacks) {
      this.favoritesRefreshCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('收藏刷新回调执行失败:', error);
        }
      });
    }
  },

  /**
   * 注册收藏列表刷新回调
   */
  onFavoritesRefresh(callback) {
    if (!this.favoritesRefreshCallbacks) {
      this.favoritesRefreshCallbacks = [];
    }
    this.favoritesRefreshCallbacks.push(callback);
  },

  /**
   * 移除收藏列表刷新回调
   */
  offFavoritesRefresh(callback) {
    if (this.favoritesRefreshCallbacks) {
      const index = this.favoritesRefreshCallbacks.indexOf(callback);
      if (index > -1) {
        this.favoritesRefreshCallbacks.splice(index, 1);
      }
    }
  },

  // ========== 通用工具方法 ==========

  /**
   * 显示加载提示
   */
  showLoading(title = '加载中...') {
    wx.showLoading({ title, mask: true });
  },

  /**
   * 隐藏加载
   */
  hideLoading() {
    wx.hideLoading();
  },

  /**
   * 显示成功提示
   */
  showSuccess(title) {
    wx.showToast({ title, icon: 'success' });
  },

  /**
   * 显示错误提示
   */
  showError(title) {
    wx.showToast({ title, icon: 'none' });
  },

  /**
   * 显示确认对话框
   */
  showConfirm(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        success: (res) => {
          resolve(res.confirm);
        }
      });
    });
  }
});

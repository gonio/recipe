/**
 * 美味食谱 - 小程序入口
 * 使用 CloudBase 云开发
 * 环境ID: success-0g0hlzlle75bd6a0
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
    needRefreshProfile: false,

    // 网络状态
    isOnline: true,
    networkType: 'unknown'
  },

  onLaunch() {
    // 初始化 CloudBase
    this.initCloudBase();

    // 获取用户信息
    this.fetchUserInfo();

    // 获取系统信息用于适配
    this.getSystemInfo();

    // 初始化网络状态监听
    this.initNetworkStatus();

    // 设置全局错误处理
    this.setupErrorHandling();
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
      env: 'success-0g0hlzlle75bd6a0', // 云开发环境ID
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
      const { result } = await this.requestWithRetry(
        () => wx.cloud.callFunction({
          name: 'auth',
          data: {
            action: 'getUserInfo'
          }
        }),
        { retries: 3, showErrorToast: false }
      );

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
      // 网络错误已在 requestWithRetry 中提示
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
  },

  /**
   * 初始化网络状态监听
   */
  initNetworkStatus() {
    // 获取初始网络状态
    wx.getNetworkType({
      success: (res) => {
        this.globalData.networkType = res.networkType;
        this.globalData.isOnline = res.networkType !== 'none';
        console.log('网络状态:', res.networkType);
      }
    });

    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      const wasOnline = this.globalData.isOnline;
      this.globalData.isOnline = res.isConnected;
      this.globalData.networkType = res.networkType;

      console.log('网络状态变化:', res.isConnected ? res.networkType : 'offline');

      // 网络恢复时提示
      if (!wasOnline && res.isConnected) {
        this.showSuccess('网络已恢复');
        // 触发网络恢复事件
        this.emitNetworkRestore();
      }

      // 网络断开时提示
      if (wasOnline && !res.isConnected) {
        this.showError('网络已断开');
        // 触发网络断开事件
        this.emitNetworkDisconnect();
      }
    });
  },

  /**
   * 设置全局错误处理
   */
  setupErrorHandling() {
    // 监听全局错误
    wx.onError((error) => {
      console.error('全局错误:', error);
    });

    // 监听未捕获的 Promise 错误
    wx.onUnhandledRejection((res) => {
      console.error('未处理的 Promise 错误:', res);
    });
  },

  /**
   * 检查网络是否可用
   */
  checkNetwork() {
    if (!this.globalData.isOnline) {
      wx.showModal({
        title: '网络错误',
        content: '当前网络不可用，请检查网络连接后重试',
        showCancel: false,
        confirmText: '知道了'
      });
      return false;
    }
    return true;
  },

  /**
   * 带重试的网络请求封装
   */
  async requestWithRetry(requestFn, options = {}) {
    const { retries = 3, retryDelay = 1000, showErrorToast = true } = options;

    // 检查网络状态
    if (!this.checkNetwork()) {
      throw new Error('网络不可用');
    }

    let lastError;

    for (let i = 0; i < retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        console.warn(`请求失败 (${i + 1}/${retries}):`, error.message || error);

        // 非网络错误直接抛出
        if (error.errMsg && !error.errMsg.includes('fail')) {
          throw error;
        }

        // 最后一次尝试失败
        if (i === retries - 1) {
          break;
        }

        // 等待后重试
        await this.delay(retryDelay * (i + 1));
      }
    }

    // 所有重试失败
    if (showErrorToast) {
      this.showError('网络请求失败，请稍后重试');
    }

    throw lastError;
  },

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // ========== 网络事件系统 ==========

  /**
   * 触发网络恢复事件
   */
  emitNetworkRestore() {
    if (this.networkRestoreCallbacks) {
      this.networkRestoreCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('网络恢复回调执行失败:', error);
        }
      });
    }
  },

  /**
   * 注册网络恢复回调
   */
  onNetworkRestore(callback) {
    if (!this.networkRestoreCallbacks) {
      this.networkRestoreCallbacks = [];
    }
    this.networkRestoreCallbacks.push(callback);
  },

  /**
   * 移除网络恢复回调
   */
  offNetworkRestore(callback) {
    if (this.networkRestoreCallbacks) {
      const index = this.networkRestoreCallbacks.indexOf(callback);
      if (index > -1) {
        this.networkRestoreCallbacks.splice(index, 1);
      }
    }
  },

  /**
   * 触发网络断开事件
   */
  emitNetworkDisconnect() {
    if (this.networkDisconnectCallbacks) {
      this.networkDisconnectCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('网络断开回调执行失败:', error);
        }
      });
    }
  },

  /**
   * 注册网络断开回调
   */
  onNetworkDisconnect(callback) {
    if (!this.networkDisconnectCallbacks) {
      this.networkDisconnectCallbacks = [];
    }
    this.networkDisconnectCallbacks.push(callback);
  },

  /**
   * 移除网络断开回调
   */
  offNetworkDisconnect(callback) {
    if (this.networkDisconnectCallbacks) {
      const index = this.networkDisconnectCallbacks.indexOf(callback);
      if (index > -1) {
        this.networkDisconnectCallbacks.splice(index, 1);
      }
    }
  }
});

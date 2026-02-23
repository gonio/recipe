App({
  globalData: {
    userInfo: null,
    token: null,
    apiBaseUrl: 'http://localhost:3999/api', // 开发环境，生产环境需要改成真实域名
    preferredCuisines: []
  },

  onLaunch() {
    // 检查本地存储的 token
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      this.getUserInfo();
    }
  },

  // 微信小程序登录
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 获取用户信息
            wx.getUserProfile({
              desc: '用于完善用户资料',
              success: (userRes) => {
                this.doLogin(res.code, userRes.userInfo, resolve, reject);
              },
              fail: () => {
                // 用户拒绝授权，仍然可以登录
                this.doLogin(res.code, null, resolve, reject);
              }
            });
          } else {
            reject(new Error('登录失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 执行登录请求
  doLogin(code, userInfo, resolve, reject) {
    wx.request({
      url: `${this.globalData.apiBaseUrl}/auth/wechat-login`,
      method: 'POST',
      data: {
        code,
        userInfo
      },
      success: (res) => {
        if (res.data.success) {
          const { token, user } = res.data.data;
          wx.setStorageSync('token', token);
          this.globalData.token = token;
          this.globalData.userInfo = user;
          this.globalData.preferredCuisines = user.preferredCuisines || [];
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message));
        }
      },
      fail: reject
    });
  },

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (!this.globalData.token) {
        reject(new Error('未登录'));
        return;
      }

      wx.request({
        url: `${this.globalData.apiBaseUrl}/auth/user`,
        header: {
          'Authorization': `Bearer ${this.globalData.token}`
        },
        success: (res) => {
          if (res.data.success) {
            this.globalData.userInfo = res.data.data;
            this.globalData.preferredCuisines = res.data.data.preferredCuisines || [];
            resolve(res.data.data);
          } else {
            // token 可能过期了
            if (res.statusCode === 401) {
              this.globalData.token = null;
              wx.removeStorageSync('token');
            }
            reject(new Error(res.data.message));
          }
        },
        fail: reject
      });
    });
  },

  // 封装的请求方法
  request(options) {
    return new Promise((resolve, reject) => {
      const header = options.header || {};
      
      if (this.globalData.token) {
        header['Authorization'] = `Bearer ${this.globalData.token}`;
      }

      wx.request({
        url: `${this.globalData.apiBaseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data,
        header,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            // token 过期，清除登录状态
            this.globalData.token = null;
            wx.removeStorageSync('token');
            wx.showToast({ title: '请重新登录', icon: 'none' });
            reject(new Error('未授权'));
          } else {
            reject(new Error(res.data.message || '请求失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({ title, mask: true });
  },

  // 隐藏加载
  hideLoading() {
    wx.hideLoading();
  },

  // 显示成功提示
  showSuccess(title) {
    wx.showToast({ title, icon: 'success' });
  },

  // 显示错误提示
  showError(title) {
    wx.showToast({ title, icon: 'none' });
  }
});

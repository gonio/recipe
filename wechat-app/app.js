App({
  globalData: {
    userInfo: null,
    token: null,
    refreshToken: null,
    apiBaseUrl: 'https://115.191.56.155/api', // 开发环境，生产环境需要改成真实域名
    preferredCuisines: [],
    isLoggingIn: false, // 登录中标记，防止并发登录
    requestQueue: [] // 请求队列，用于登录后重试
  },

  onLaunch() {
    // 检查本地存储的 token
    const token = wx.getStorageSync('token');
    const refreshToken = wx.getStorageSync('refreshToken');
    if (token) {
      this.globalData.token = token;
      this.globalData.refreshToken = refreshToken;
      this.getUserInfo().catch(() => {
        // 获取用户信息失败，token 可能已过期
        console.log('Token 已过期，需要重新登录');
      });
    }
  },

  // 微信小程序登录
  login() {
    return new Promise((resolve, reject) => {
      // 如果已经在登录中，等待登录完成
      if (this.globalData.isLoggingIn) {
        const checkLogin = setInterval(() => {
          if (!this.globalData.isLoggingIn) {
            clearInterval(checkLogin);
            if (this.globalData.token) {
              resolve({ token: this.globalData.token, user: this.globalData.userInfo });
            } else {
              reject(new Error('登录失败'));
            }
          }
        }, 100);
        return;
      }

      this.globalData.isLoggingIn = true;

      wx.login({
        success: (res) => {
          if (res.code) {
            // 获取用户信息（可选，用户可能拒绝）
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
            this.globalData.isLoggingIn = false;
            reject(new Error('登录失败'));
          }
        },
        fail: (err) => {
          this.globalData.isLoggingIn = false;
          reject(err);
        }
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
          const { token, refreshToken, user } = res.data.data;
          
          // 保存 token
          wx.setStorageSync('token', token);
          this.globalData.token = token;
          
          // 保存 refresh token（如果后端返回）
          if (refreshToken) {
            wx.setStorageSync('refreshToken', refreshToken);
            this.globalData.refreshToken = refreshToken;
          }
          
          this.globalData.userInfo = user;
          this.globalData.preferredCuisines = user.preferredCuisines || [];
          this.globalData.isLoggingIn = false;
          
          // 处理等待队列中的请求
          this.processRequestQueue();
          
          resolve(res.data.data);
        } else {
          this.globalData.isLoggingIn = false;
          reject(new Error(res.data.message || '登录失败'));
        }
      },
      fail: (err) => {
        this.globalData.isLoggingIn = false;
        reject(err);
      }
    });
  },

  // 刷新 Token
  refreshToken() {
    return new Promise((resolve, reject) => {
      const refreshToken = this.globalData.refreshToken;
      if (!refreshToken) {
        reject(new Error('没有 refresh token'));
        return;
      }

      wx.request({
        url: `${this.globalData.apiBaseUrl}/auth/refresh`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${refreshToken}`
        },
        success: (res) => {
          if (res.data.success && res.data.data.token) {
            const { token, refreshToken: newRefreshToken } = res.data.data;
            
            wx.setStorageSync('token', token);
            this.globalData.token = token;
            
            if (newRefreshToken) {
              wx.setStorageSync('refreshToken', newRefreshToken);
              this.globalData.refreshToken = newRefreshToken;
            }
            
            resolve(token);
          } else {
            reject(new Error('刷新 token 失败'));
          }
        },
        fail: reject
      });
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
              this.clearAuthData();
            }
            reject(new Error(res.data.message || '获取用户信息失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 清除认证数据
  clearAuthData() {
    this.globalData.token = null;
    this.globalData.refreshToken = null;
    this.globalData.userInfo = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('refreshToken');
  },

  // 封装的请求方法（支持 JWT 认证和自动重试）
  request(options, isRetry = false) {
    return new Promise((resolve, reject) => {
      const header = options.header || {};
      
      // 添加 Authorization header
      if (this.globalData.token) {
        header['Authorization'] = `Bearer ${this.globalData.token}`;
      }

      const doRequest = () => {
        wx.request({
          url: `${this.globalData.apiBaseUrl}${options.url}`,
          method: options.method || 'GET',
          data: options.data,
          header,
          success: async (res) => {
            if (res.statusCode === 200 && res.data.success) {
              resolve(res.data);
            } else if (res.statusCode === 401) {
              // Token 过期，尝试刷新或重新登录
              if (!isRetry) {
                await this.handleAuthError();
                // 重试原请求
                this.request(options, true)
                  .then(resolve)
                  .catch(reject);
              } else {
                // 重试后仍然 401，清除登录状态
                this.clearAuthData();
                wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
                reject(new Error('未授权'));
              }
            } else {
              reject(new Error(res.data.message || '请求失败'));
            }
          },
          fail: reject
        });
      };

      // 如果正在登录中，将请求加入队列
      if (this.globalData.isLoggingIn && !isRetry) {
        this.globalData.requestQueue.push({ options, resolve, reject });
        return;
      }

      doRequest();
    });
  },

  // 处理认证错误（刷新 token 或重新登录）
  async handleAuthError() {
    try {
      // 先尝试刷新 token
      if (this.globalData.refreshToken) {
        await this.refreshToken();
        return;
      }
    } catch (error) {
      console.log('刷新 token 失败，尝试重新登录');
    }

    // 刷新失败，尝试重新登录
    try {
      await this.login();
    } catch (error) {
      console.log('重新登录失败');
      throw error;
    }
  },

  // 处理请求队列（登录成功后重试）
  processRequestQueue() {
    const queue = this.globalData.requestQueue;
    this.globalData.requestQueue = [];
    
    queue.forEach(({ options, resolve, reject }) => {
      this.request(options, true)
        .then(resolve)
        .catch(reject);
    });
  },

  // 退出登录
  logout() {
    this.clearAuthData();
    wx.showToast({ title: '已退出登录', icon: 'success' });
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

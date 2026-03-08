/**
 * 网络状态提示组件
 * 显示当前网络连接状态
 */

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示网络恢复提示
    showRestore: {
      type: Boolean,
      value: true
    },
    // 是否自动隐藏
    autoHide: {
      type: Boolean,
      value: true
    },
    // 自动隐藏延迟（毫秒）
    hideDelay: {
      type: Number,
      value: 3000
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isOnline: true,
    isVisible: false,
    message: ''
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this.checkNetworkStatus();
      this.registerNetworkListeners();
    },

    detached() {
      this.unregisterNetworkListeners();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 检查初始网络状态
     */
    checkNetworkStatus() {
      const app = getApp();
      this.setData({
        isOnline: app.globalData.isOnline
      });
    },

    /**
     * 注册网络监听
     */
    registerNetworkListeners() {
      const app = getApp();

      // 网络断开监听
      this._disconnectHandler = () => {
        this.setData({
          isOnline: false,
          isVisible: true,
          message: '网络已断开，请检查网络连接'
        });
      };

      // 网络恢复监听
      this._restoreHandler = () => {
        this.setData({
          isOnline: true,
          isVisible: true,
          message: '网络已恢复'
        });

        // 自动隐藏
        if (this.properties.autoHide) {
          this._hideTimer = setTimeout(() => {
            this.setData({ isVisible: false });
          }, this.properties.hideDelay);
        }
      };

      app.onNetworkDisconnect(this._disconnectHandler);
      app.onNetworkRestore(this._restoreHandler);
    },

    /**
     * 移除网络监听
     */
    unregisterNetworkListeners() {
      const app = getApp();

      if (this._disconnectHandler) {
        app.offNetworkDisconnect(this._disconnectHandler);
      }
      if (this._restoreHandler) {
        app.offNetworkRestore(this._restoreHandler);
      }

      if (this._hideTimer) {
        clearTimeout(this._hideTimer);
      }
    },

    /**
     * 手动隐藏提示
     */
    onTap() {
      this.setData({ isVisible: false });
    },

    /**
     * 刷新页面
     */
    onRefresh() {
      // 触发页面刷新
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.onPullDownRefresh) {
        currentPage.onPullDownRefresh();
      }

      this.setData({ isVisible: false });
    }
  }
});

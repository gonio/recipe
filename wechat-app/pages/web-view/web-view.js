Page({
  data: {
    url: ''
  },

  onLoad(options) {
    if (options.url) {
      // 解码 URL
      const url = decodeURIComponent(options.url);
      this.setData({ url });
      
      // 设置标题
      if (options.title) {
        wx.setNavigationBarTitle({
          title: decodeURIComponent(options.title)
        });
      }
    } else {
      wx.showToast({
        title: '链接不存在',
        icon: 'none',
        complete: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    }
  }
});

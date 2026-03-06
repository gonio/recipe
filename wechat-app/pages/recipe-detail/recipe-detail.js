const app = getApp();

Page({
  data: {
    recipeId: '',
    recipe: {},
    isFavorite: false,
    difficultyText: ['简单', '容易', '中等', '较难', '困难'],
    from: '', // 来源页面
    showWebView: false, // 是否显示 web-view
    webViewUrl: '', // web-view 加载的 URL
    canOpenApp: false // 是否支持打开外部APP
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        recipeId: options.id,
        from: options.from || ''
      }, () => {
        // 确保数据设置完成后再加载
        this.loadRecipeDetail();
      });
    } else {
      app.showError('菜谱不存在');
      wx.navigateBack();
    }
  },

  // 加载菜谱详情
  async loadRecipeDetail() {
    app.showLoading('加载中...');
    
    try {
      const res = await app.request({
        url: `/recipes/detail/${this.data.recipeId}`
      });

      if (res.success) {
        const recipe = res.data;
        // 判断是否是平台视频（抖音、快手等）
        const platformInfo = this.checkPlatformVideo(recipe.sourceUrl || recipe.videoUrl);
        
        this.setData({
          recipe: recipe,
          isFavorite: recipe.isFavorite || false,
          isPlatformVideo: platformInfo.isPlatform,
          platformName: platformInfo.name,
          canOpenApp: platformInfo.canOpenApp
        });
        
        // 设置页面标题
        wx.setNavigationBarTitle({
          title: recipe.name
        });
        
        // 如果是平台视频且支持 web-view，直接打开播放
        if (recipe.type === 'video' && platformInfo.isPlatform && platformInfo.useWebView) {
          const url = recipe.sourceUrl || recipe.videoUrl;
          if (url) {
            this.setData({
              showWebView: true,
              webViewUrl: url
            });
          }
        }
      } else {
        app.showError('菜谱不存在');
        wx.navigateBack();
      }
    } catch (error) {
      console.error('加载详情失败:', error);
      app.showError('加载失败');
    } finally {
      app.hideLoading();
    }
  },

  // 切换收藏
  async toggleFavorite() {
    const { isFavorite, recipeId } = this.data;
    
    try {
      if (isFavorite) {
        await app.request({
          url: '/recipes/unfavorite',
          method: 'POST',
          data: { recipeId }
        });
        app.showSuccess('取消收藏');
      } else {
        await app.request({
          url: '/recipes/favorite',
          method: 'POST',
          data: { recipeId }
        });
        app.showSuccess('收藏成功');
      }

      this.setData({ isFavorite: !isFavorite });
      
      // 刷新收藏数
      this.loadRecipeDetail();
    } catch (error) {
      app.showError('操作失败');
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      wx.previewImage({
        urls: [url],
        current: url
      });
    }
  },

  // 检查是否是平台视频（抖音、快手等）
  checkPlatformVideo(url) {
    if (!url) return { isPlatform: false, name: '', useWebView: false, canOpenApp: false };
    
    // 抖音
    if (/douyin\.com|v\.douyin|snssdk1128/.test(url)) {
      // 网页版链接可以用 web-view
      if (url.includes('douyin.com') || url.includes('v.douyin')) {
        return { isPlatform: true, name: '抖音', useWebView: true, canOpenApp: true };
      }
      // APP Scheme 只能通过打开抖音小程序或复制链接
      return { isPlatform: true, name: '抖音', useWebView: false, canOpenApp: true };
    }
    
    // 快手
    if (/kuaishou\.com|v\.kuaishou|kwai:\/\//.test(url)) {
      if (url.includes('kuaishou.com') || url.includes('v.kuaishou')) {
        return { isPlatform: true, name: '快手', useWebView: true, canOpenApp: true };
      }
      return { isPlatform: true, name: '快手', useWebView: false, canOpenApp: true };
    }
    
    // B站
    if (/bilibili\.com|b23\.tv/.test(url)) {
      return { isPlatform: true, name: 'B站', useWebView: true, canOpenApp: false };
    }
    
    return { isPlatform: false, name: '', useWebView: false, canOpenApp: false };
  },

  // 打开视频链接
  openVideoLink() {
    const { recipe, platformName, canOpenApp } = this.data;
    const url = recipe.sourceUrl || recipe.videoUrl;
    
    if (!url) {
      app.showError('链接不存在');
      return;
    }
    
    // 如果是 APP Scheme，尝试打开抖音小程序
    if (canOpenApp && (url.startsWith('snssdk') || url.startsWith('kwai://'))) {
      this.openPlatformMiniProgram(url, platformName);
      return;
    }
    
    // 否则使用 web-view 打开
    this.setData({
      showWebView: true,
      webViewUrl: url
    });
  },

  // 打开平台小程序
  openPlatformMiniProgram(url, platformName) {
    // 抖音小程序 appId
    const douyinAppId = 'ttbd7a19e63b9a025';
    
    // 尝试打开抖音小程序
    wx.openEmbeddedMiniProgram({
      appId: douyinAppId,
      path: 'pages/index/index?url=' + encodeURIComponent(url),
      success: () => {
        console.log('打开抖音小程序成功');
      },
      fail: (err) => {
        console.error('打开抖音小程序失败', err);
        // 失败则提示复制链接
        this.copyAndOpenApp(url, platformName);
      }
    });
  },

  // 复制链接并提示打开 APP
  copyAndOpenApp(url, platformName) {
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showModal({
          title: '请打开' + platformName + 'APP',
          content: '链接已复制到剪贴板，请打开' + platformName + 'APP粘贴观看。或者尝试点击"打开小程序"进入。',
          confirmText: '打开小程序',
          cancelText: '知道了',
          success: (res) => {
            if (res.confirm) {
              // 再次尝试打开小程序
              this.tryOpenMiniProgram();
            }
          }
        });
      }
    });
  },

  // 尝试打开抖音小程序（备用方案）
  tryOpenMiniProgram() {
    // 抖音小程序的原始 ID
    wx.navigateToMiniProgram({
      appId: 'awemej86od0b0c1a',
      path: 'pages/index/index',
      success: () => {
        console.log('跳转成功');
      },
      fail: (err) => {
        console.error('跳转失败', err);
        wx.showToast({
          title: '跳转失败，请手动打开抖音',
          icon: 'none'
        });
      }
    });
  },

  // 关闭 web-view
  closeWebView() {
    this.setData({
      showWebView: false,
      webViewUrl: ''
    });
  }
});

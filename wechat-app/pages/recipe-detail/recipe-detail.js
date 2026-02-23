const app = getApp();

Page({
  data: {
    recipeId: '',
    recipe: {},
    isFavorite: false,
    difficultyText: ['简单', '容易', '中等', '较难', '困难'],
    from: '' // 来源页面
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        recipeId: options.id,
        from: options.from || ''
      });
      this.loadRecipeDetail();
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
        this.setData({
          recipe: res.data,
          isFavorite: res.data.isFavorite || false
        });
        
        // 设置页面标题
        wx.setNavigationBarTitle({
          title: res.data.name
        });
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

  // 分享菜谱
  shareRecipe() {
    // 微信小程序分享
    // 实际分享逻辑在 onShareAppMessage 中
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 开始烹饪
  startCooking() {
    // 可以跳转到烹饪模式页面
    // 这里先显示提示
    wx.showModal({
      title: '开始烹饪',
      content: '即将进入烹饪模式，步骤会按顺序展示',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#42A5F5'
    });
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

  // 转发分享
  onShareAppMessage() {
    const { recipe } = this.data;
    return {
      title: `快来学做「${recipe.name}」`,
      path: `/pages/recipe-detail/recipe-detail?id=${recipe._id}`,
      imageUrl: recipe.imageUrl || '/images/share-default.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { recipe } = this.data;
    return {
      title: `快来学做「${recipe.name}」`,
      query: `id=${recipe._id}`,
      imageUrl: recipe.imageUrl || '/images/share-default.png'
    };
  }
});

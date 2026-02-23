const app = getApp();

Page({
  data: {
    recipes: [],
    page: 1,
    limit: 20,
    loading: false,
    loadingMore: false,
    noMore: false,
    newCount: 0
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 每次显示刷新数据
    if (this.data.recipes.length > 0) {
      this.setData({ page: 1 });
      this.loadRecipes();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, noMore: false });
    this.loadData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.noMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });
    
    try {
      // 获取新菜谱数量
      const userRes = await app.request({ url: '/auth/user' });
      if (userRes.success) {
        this.setData({ newCount: userRes.data.newRecipesCount || 0 });
      }

      await this.loadRecipes();
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载市场菜谱
  async loadRecipes() {
    const { page, limit } = this.data;
    
    try {
      const res = await app.request({
        url: '/recipes/market',
        data: { page, limit }
      });

      if (res.success) {
        const recipes = page === 1 ? res.data.recipes : [...this.data.recipes, ...res.data.recipes];
        this.setData({
          recipes,
          noMore: res.data.pagination.page >= res.data.pagination.pages
        });
      }
    } catch (error) {
      console.error('加载市场菜谱失败:', error);
    }
  },

  // 加载更多
  loadMore() {
    this.setData({
      page: this.data.page + 1,
      loadingMore: true
    }, () => {
      this.loadRecipes().finally(() => {
        this.setData({ loadingMore: false });
      });
    });
  },

  // 收藏菜谱
  async addFavorite(e) {
    e.stopPropagation();
    const item = e.currentTarget.dataset.item;
    
    try {
      const res = await app.request({
        url: '/recipes/favorite',
        method: 'POST',
        data: { recipeId: item._id }
      });

      if (res.success) {
        app.showSuccess('收藏成功');
        // 从市场列表中移除
        const recipes = this.data.recipes.filter(r => r._id !== item._id);
        this.setData({ recipes });
      }
    } catch (error) {
      app.showError('收藏失败');
    }
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}&from=market`
    });
  }
});

const app = getApp();

Page({
  data: {
    recipes: [],
    page: 1,
    limit: 20,
    loading: false,
    loadingMore: false,
    noMore: false,
    newCount: 0,
    // 搜索相关
    keyword: '',
    searchFocus: false,
    // 菜系筛选（从接口获取）
    cuisines: ['全部'],
    selectedCuisine: '全部'
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
      // 获取新菜谱数量（使用 getUserInfo 以利用缓存）
      const userInfo = await app.getUserInfo();
      this.setData({ newCount: userInfo.newRecipesCount || 0 });

      await this.loadRecipes();
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载市场菜谱（支持搜索和筛选）
  async loadRecipes() {
    const { page, limit, keyword, selectedCuisine } = this.data;
    
    try {
      // 构建请求参数
      const params = { page, limit };
      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }
      if (selectedCuisine !== '全部') {
        params.cuisine = selectedCuisine;
      }

      const res = await app.request({
        url: '/recipes/market',
        data: params
      });

      if (res.success) {
        const recipes = page === 1 ? res.data.recipes : [...this.data.recipes, ...res.data.recipes];
        
        // 更新菜系列表（从接口获取）
        const availableCuisines = res.data.availableCuisines || [];
        const cuisines = ['全部', ...availableCuisines];
        
        this.setData({
          recipes,
          cuisines,
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

  // 搜索输入
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  // 确认搜索
  onSearchConfirm() {
    this.setData({ page: 1, noMore: false, searchFocus: false }, () => {
      this.loadRecipes();
    });
  },

  // 聚焦搜索框
  onSearchFocus() {
    this.setData({ searchFocus: true });
  },

  // 失焦搜索框
  onSearchBlur() {
    this.setData({ searchFocus: false });
  },

  // 清除搜索
  clearSearch() {
    this.setData({ keyword: '', page: 1, noMore: false }, () => {
      this.loadRecipes();
    });
  },

  // 选择菜系
  selectCuisine(e) {
    const cuisine = e.currentTarget.dataset.cuisine;
    this.setData({ 
      selectedCuisine: cuisine,
      page: 1,
      noMore: false
    }, () => {
      this.loadRecipes();
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
        data: { recipeId: item._id || item.id }
      });

      if (res.success) {
        app.showSuccess('收藏成功');
        // 从市场列表中移除
        const recipes = this.data.recipes.filter(r => (r._id || r.id) !== (item._id || item.id));
        this.setData({ recipes });
      }
    } catch (error) {
      app.showError('收藏失败');
    }
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      console.error('菜谱ID为空', e.currentTarget.dataset);
      app.showError('菜谱信息有误');
      return;
    }
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}&from=market`
    });
  }
});

const app = getApp();

Page({
  data: {
    userInfo: {},
    greeting: '',
    newRecipesCount: 0,
    cuisines: [],
    selectedCuisine: '',
    recipes: [],
    page: 1,
    limit: 20,
    loading: false,
    loadingMore: false,
    noMore: false,
    isLoggedIn: false
  },

  onLoad() {
    this.setGreeting();
    this.checkLogin();
  },

  onShow() {
    if (this.data.isLoggedIn) {
      this.loadData();
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

  // 设置问候语
  setGreeting() {
    const hour = new Date().getHours();
    let greeting = '你好';
    if (hour < 12) greeting = '早上好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    this.setData({ greeting });
  },

  // 检查登录状态
  checkLogin() {
    const token = app.globalData.token;
    if (!token) {
      this.doLogin();
    } else {
      this.setData({ isLoggedIn: true });
      this.loadData();
    }
  },

  // 执行登录
  doLogin() {
    app.login()
      .then(() => {
        this.setData({ isLoggedIn: true });
        this.loadData();
      })
      .catch(err => {
        console.error('登录失败:', err);
        app.showError('登录失败，请重试');
      });
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });
    
    try {
      // 获取用户信息（使用 getUserInfo 以利用缓存）
      const userInfo = await app.getUserInfo();
      this.setData({
        userInfo: userInfo,
        newRecipesCount: userInfo.newRecipesCount || 0,
        cuisines: userInfo.preferredCuisines || []
      });

      // 加载收藏菜谱
      await this.loadRecipes();
    } catch (error) {
      console.error('加载数据失败:', error);
      if (error.message === '未授权' || error.message === '未登录') {
        this.doLogin();
      }
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载菜谱列表
  async loadRecipes() {
    const { selectedCuisine, page, limit } = this.data;
    
    try {
      const res = await app.request({
        url: '/recipes/favorites',
        data: {
          cuisine: selectedCuisine,
          page,
          limit
        }
      });

      if (res.success) {
        const recipes = page === 1 ? res.data.recipes : [...this.data.recipes, ...res.data.recipes];
        this.setData({
          recipes,
          noMore: res.data.pagination.page >= res.data.pagination.pages
        });
      }
    } catch (error) {
      console.error('加载菜谱失败:', error);
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

  // 选择菜系
  selectCuisine(e) {
    const cuisine = e.currentTarget.dataset.cuisine;
    this.setData({
      selectedCuisine: cuisine,
      page: 1,
      noMore: false,
      recipes: []
    }, () => {
      this.loadRecipes();
    });
  },

  // 取消收藏
  async unfavorite(e) {
    e.stopPropagation();
    const recipeId = e.currentTarget.dataset.id;
    
    try {
      const res = await app.request({
        url: '/recipes/unfavorite',
        method: 'POST',
        data: { recipeId }
      });

      if (res.success) {
        app.showSuccess('取消收藏');
        // 从列表中移除
        const recipes = this.data.recipes.filter(r => r._id !== recipeId);
        this.setData({ recipes });
      }
    } catch (error) {
      app.showError('操作失败');
    }
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}`
    });
  },

  // 跳转到搜索
  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  // 跳转到市场
  goToMarket() {
    wx.switchTab({
      url: '/pages/market/market'
    });
  }
});

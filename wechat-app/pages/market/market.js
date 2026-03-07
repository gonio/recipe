/**
 * 市场页面 - 展示每日精选菜谱
 * 使用 CloudBase SDK
 */

const { getRecipesByCuisine, getMarketRecipes } = require('../../utils/recipe-api');
const { toggleFavorite } = require('../../utils/user-api');
const { showLoading, hideLoading, showSuccess, showError } = require('../../utils/ui-helpers');

Page({
  data: {
    recipes: [],
    page: 0,
    limit: 10,
    loading: false,
    loadingMore: false,
    noMore: false,

    // 搜索相关
    keyword: '',
    searchFocus: false,

    // 菜系筛选
    cuisines: ['全部', '川菜', '粤菜', '湘菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜'],
    selectedCuisine: '全部',

    // 今日新增数量
    newCount: 0
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 检查是否需要刷新
    if (getApp().globalData.needRefreshMarket) {
      getApp().globalData.needRefreshMarket = false;
      this.loadData();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 0, noMore: false });
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
      // 尝试获取市场精选菜谱
      const marketRecipes = await getMarketRecipes();

      if (marketRecipes.length > 0) {
        // 计算今日新增数量
        const newCount = marketRecipes.filter(r => r.marketType === 'new').length;

        this.setData({
          recipes: marketRecipes,
          newCount,
          noMore: true // 市场精选不分页
        });
      } else {
        // 如果没有市场精选，加载热门菜谱
        await this.loadRecipes();
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      // 降级加载普通菜谱
      await this.loadRecipes();
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载菜谱列表
  async loadRecipes() {
    const { page, limit, selectedCuisine } = this.data;

    try {
      const cuisine = selectedCuisine === '全部' ? 'all' : selectedCuisine;
      const res = await getRecipesByCuisine(cuisine, page, limit);
      const recipes = res.data || [];

      this.setData({
        recipes: page === 0 ? recipes : [...this.data.recipes, ...recipes],
        noMore: recipes.length < limit
      });
    } catch (error) {
      console.error('加载菜谱失败:', error);
      showError('加载失败');
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
    // 跳转到搜索页面
    wx.navigateTo({
      url: `/pages/search/search?keyword=${encodeURIComponent(this.data.keyword)}`
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
    this.setData({ keyword: '' });
  },

  // 选择菜系
  selectCuisine(e) {
    const { cuisine } = e.currentTarget.dataset;
    this.setData({
      selectedCuisine: cuisine,
      page: 0,
      noMore: false
    }, () => {
      this.loadRecipes();
    });
  },

  // 收藏菜谱
  async addFavorite(e) {
    e.stopPropagation();
    const { item } = e.currentTarget.dataset;
    const id = item._id || item.id;

    try {
      showLoading('处理中...');
      await toggleFavorite(id, true);
      hideLoading();

      showSuccess('收藏成功');

      // 标记收藏列表需要刷新
      getApp().markFavoritesNeedRefresh();
    } catch (error) {
      hideLoading();
      showError('收藏失败');
      console.error('收藏失败:', error);
    }
  },

  // 跳转到详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      console.error('菜谱ID为空', e.currentTarget.dataset);
      showError('菜谱信息有误');
      return;
    }
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}&from=market`
    });
  }
});

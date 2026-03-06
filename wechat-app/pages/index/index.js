/**
 * 首页 - 菜谱浏览主页面
 * 使用 CloudBase SDK 获取菜谱数据
 */

const { getRecipesByCuisine, searchRecipes, PAGE_SIZE } = require('../../utils/recipe-api');
const { toggleFavorite } = require('../../utils/user-api');
const { showLoading, hideLoading, handleCloudError, showSuccess, showError } = require('../../utils/ui-helpers');

const app = getApp();

Page({
  data: {
    // 用户相关
    greeting: '',
    userInfo: null,

    // 搜索和筛选
    searchKeyword: '',
    selectedCuisine: 'all',
    showFilterModal: false,

    // 菜谱列表
    recipes: [],
    page: 0,
    loading: false,
    loadingMore: false,
    noMore: false,
    showSkeleton: true,

    // 错误状态
    error: null
  },

  onLoad() {
    this.setGreeting();
    this.loadRecipes(true);
  },

  onShow() {
    // 页面显示时刷新数据（可能从详情页返回）
    if (this.data.recipes.length === 0) {
      this.loadRecipes(true);
    }
  },

  onPullDownRefresh() {
    this.loadRecipes(true).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.noMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  /**
   * 设置问候语
   */
  setGreeting() {
    const hour = new Date().getHours();
    let greeting = '你好';
    if (hour < 12) greeting = '早上好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    this.setData({ greeting });
  },

  /**
   * 加载菜谱列表
   * @param {boolean} refresh - 是否刷新（重置页码）
   */
  async loadRecipes(refresh = false) {
    if (this.data.loading) return;

    const page = refresh ? 0 : this.data.page;
    const { selectedCuisine } = this.data;

    this.setData({
      loading: true,
      error: null,
      showSkeleton: refresh && this.data.recipes.length === 0
    });

    try {
      const res = await getRecipesByCuisine(selectedCuisine, page, PAGE_SIZE);
      const recipes = res.data || [];

      this.setData({
        recipes: refresh ? recipes : [...this.data.recipes, ...recipes],
        page: page,
        noMore: recipes.length < PAGE_SIZE,
        loading: false,
        showSkeleton: false
      });

    } catch (error) {
      console.error('加载菜谱失败:', error);
      handleCloudError(error);
      this.setData({
        error: error.message || '加载失败',
        loading: false,
        showSkeleton: false
      });
    }
  },

  /**
   * 加载更多
   */
  async loadMore() {
    if (this.data.loadingMore || this.data.noMore) return;

    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    });

    try {
      const { selectedCuisine, page } = this.data;
      const res = await getRecipesByCuisine(selectedCuisine, page, PAGE_SIZE);
      const recipes = res.data || [];

      this.setData({
        recipes: [...this.data.recipes, ...recipes],
        noMore: recipes.length < PAGE_SIZE,
        loadingMore: false
      });

    } catch (error) {
      console.error('加载更多失败:', error);
      this.setData({
        loadingMore: false,
        page: this.data.page - 1 // 回退页码
      });
      handleCloudError(error);
    }
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 执行搜索
   */
  async onSearch(e) {
    const keyword = e.detail.value || this.data.searchKeyword;

    if (!keyword.trim()) {
      // 如果搜索词为空，恢复普通列表
      this.loadRecipes(true);
      return;
    }

    this.setData({
      loading: true,
      showSkeleton: true
    });

    try {
      const res = await searchRecipes(keyword, 20);
      const recipes = res.data || [];

      this.setData({
        recipes,
        page: 0,
        noMore: true, // 搜索结果不分页
        loading: false,
        showSkeleton: false
      });

      if (recipes.length === 0) {
        wx.showToast({
          title: '未找到相关菜谱',
          icon: 'none'
        });
      }

    } catch (error) {
      console.error('搜索失败:', error);
      handleCloudError(error);
      this.setData({
        loading: false,
        showSkeleton: false
      });
    }
  },

  /**
   * 显示筛选弹窗
   */
  onShowFilter() {
    this.setData({
      showFilterModal: true
    });
  },

  /**
   * 关闭筛选弹窗
   */
  onCloseFilter() {
    this.setData({
      showFilterModal: false
    });
  },

  /**
   * 选择菜系
   */
  onSelectCuisine(e) {
    const { cuisine } = e.detail;
    this.setData({
      selectedCuisine: cuisine,
      showFilterModal: false,
      page: 0,
      noMore: false
    }, () => {
      this.loadRecipes(true);
    });
  },

  /**
   * 重置筛选
   */
  onResetFilter() {
    this.setData({
      selectedCuisine: 'all',
      showFilterModal: false
    }, () => {
      this.loadRecipes(true);
    });
  },

  /**
   * 跳转到搜索页面
   */
  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  /**
   * 跳转到市场页面
   */
  goToMarket() {
    wx.switchTab({
      url: '/pages/market/market'
    });
  },

  /**
   * 处理卡片点击
   */
  onRecipeTap(e) {
    const { recipeId } = e.detail;
    if (recipeId) {
      wx.navigateTo({
        url: `/pages/recipe-detail/recipe-detail?id=${recipeId}`
      });
    }
  },

  /**
   * 处理收藏切换
   */
  async onToggleFavorite(e) {
    const { recipeId, isFavorited } = e.detail;

    try {
      showLoading('处理中...');
      await toggleFavorite(recipeId, isFavorited);
      hideLoading();

      showSuccess(isFavorited ? '收藏成功' : '已取消收藏');

      // 更新本地菜谱数据中的收藏数
      const { recipes } = this.data;
      const updatedRecipes = recipes.map(recipe => {
        if (recipe._id === recipeId) {
          return {
            ...recipe,
            favoriteCount: (recipe.favoriteCount || 0) + (isFavorited ? 1 : -1)
          };
        }
        return recipe;
      });

      this.setData({ recipes: updatedRecipes });

      // 标记收藏列表需要刷新
      getApp().markFavoritesNeedRefresh();
    } catch (error) {
      hideLoading();
      console.error('收藏操作失败:', error);
      showError('操作失败');
    }
  },

  /**
   * 重试加载
   */
  onRetry() {
    this.loadRecipes(true);
  }
});

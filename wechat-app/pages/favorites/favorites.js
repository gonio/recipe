/**
 * 我的收藏页面
 */

const { getUserFavorites, toggleFavorite } = require('../../utils/user-api');
const { showLoading, hideLoading, showError } = require('../../utils/ui-helpers');

Page({
  data: {
    favorites: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    page: 0,
    pageSize: 10,
    // 长按菜单相关
    showActionMenu: false,
    selectedRecipe: null
  },

  onLoad() {
    // 注册收藏刷新回调
    getApp().onFavoritesRefresh(this.refreshFavorites.bind(this));
  },

  onShow() {
    this.loadFavorites();
  },

  onHide() {
    // 移除回调
    getApp().offFavoritesRefresh(this.refreshFavorites.bind(this));
  },

  onUnload() {
    // 移除回调
    getApp().offFavoritesRefresh(this.refreshFavorites.bind(this));
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ page: 0, hasMore: true });
    this.loadFavorites().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoadingMore) {
      this.loadMoreFavorites();
    }
  },

  /**
   * 刷新收藏列表
   */
  refreshFavorites() {
    this.setData({ page: 0, hasMore: true });
    this.loadFavorites();
  },

  /**
   * 加载收藏列表
   */
  async loadFavorites() {
    const { pageSize } = this.data;

    this.setData({ isLoading: true });

    try {
      const result = await getUserFavorites(0, pageSize);
      const favorites = result.data || [];

      this.setData({
        favorites,
        page: 0,
        hasMore: favorites.length >= pageSize && result.total > favorites.length,
        isLoading: false
      });
    } catch (error) {
      console.error('加载收藏失败:', error);
      showError('加载失败');
      this.setData({ isLoading: false });
    }
  },

  /**
   * 加载更多收藏
   */
  async loadMoreFavorites() {
    const { page, pageSize, favorites } = this.data;

    this.setData({ isLoadingMore: true });

    try {
      const result = await getUserFavorites(page + 1, pageSize);
      const newFavorites = result.data || [];

      this.setData({
        favorites: [...favorites, ...newFavorites],
        page: page + 1,
        hasMore: newFavorites.length >= pageSize,
        isLoadingMore: false
      });
    } catch (error) {
      console.error('加载更多收藏失败:', error);
      this.setData({ isLoadingMore: false });
    }
  },

  /**
   * 点击菜谱卡片（由 recipe-card 的 tapCard 事件触发）
   */
  onRecipeTap(e) {
    const { recipeId } = e.detail;
    if (!recipeId) return;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}&from=favorites`
    });
  },

  /**
   * 切换收藏状态（取消收藏）
   */
  async onToggleFavorite(e) {
    const { recipeId, isFavorited } = e.detail;

    try {
      showLoading('处理中...');
      await toggleFavorite(recipeId, isFavorited);
      hideLoading();

      // 更新本地列表（移除已取消收藏的菜谱）
      if (!isFavorited) {
        const { favorites } = this.data;
        const updatedFavorites = favorites.filter(item => item._id !== recipeId);
        this.setData({ favorites: updatedFavorites });

        wx.showToast({
          title: '已取消收藏',
          icon: 'success'
        });
      }
    } catch (error) {
      hideLoading();
      showError('操作失败');
      console.error('切换收藏失败:', error);
    }
  },

  /**
   * 长按菜谱卡片 - 显示操作菜单
   */
  onRecipeLongPress(e) {
    const { recipe } = e.detail;
    this.setData({
      showActionMenu: true,
      selectedRecipe: recipe
    });
  },

  /**
   * 关闭操作菜单
   */
  onCloseActionMenu() {
    this.setData({
      showActionMenu: false,
      selectedRecipe: null
    });
  },

  /**
   * 阻止事件冒泡
   */
  preventBubble() {
    // 什么都不做，只是阻止冒泡
  },

  /**
   * 确认取消收藏
   */
  async onUnfavoriteConfirm() {
    const { selectedRecipe } = this.data;
    if (!selectedRecipe) return;

    this.setData({ showActionMenu: false });

    try {
      showLoading('处理中...');
      await toggleFavorite(selectedRecipe._id, false);
      hideLoading();

      // 更新本地列表（移除已取消收藏的菜谱）
      const { favorites } = this.data;
      const updatedFavorites = favorites.filter(item => item._id !== selectedRecipe._id);
      this.setData({
        favorites: updatedFavorites,
        selectedRecipe: null
      });

      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      });

      // 标记收藏列表需要刷新
      getApp().markFavoritesNeedRefresh();
    } catch (error) {
      hideLoading();
      showError('操作失败');
      console.error('取消收藏失败:', error);
    }
  },

  /**
   * 前往探索页面
   */
  goToExplore() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '我的美食收藏 - 美味食谱',
      path: '/pages/favorites/favorites'
    };
  }
});

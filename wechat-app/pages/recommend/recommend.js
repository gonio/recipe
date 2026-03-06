/**
 * 今日推荐页面
 * 使用 CloudBase SDK
 */

const { getRecommendations } = require('../../utils/recipe-api');
const { isRecipeFavorited, toggleFavorite } = require('../../utils/user-api');
const { showLoading, hideLoading, showSuccess, showError } = require('../../utils/ui-helpers');

Page({
  data: {
    today: '',
    recipes: [],
    loading: false,
    isRefreshing: false
  },

  onLoad() {
    this.setToday();
    this.loadRecommendations();
  },

  onShow() {
    // 检查是否需要刷新
    const app = getApp();
    if (app.globalData.needRefreshRecommend) {
      app.globalData.needRefreshRecommend = false;
      this.loadRecommendations();
    }
  },

  // 设置今天的日期
  setToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];

    this.setData({
      today: `${year}年${month}月${day}日 ${weekDay}`
    });
  },

  // 加载推荐
  async loadRecommendations() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const result = await getRecommendations(10);
      const recipes = result.data || [];

      // 检查收藏状态
      const recipesWithStatus = await Promise.all(
        recipes.map(async (recipe) => {
          const isFavorited = await isRecipeFavorited(recipe._id);
          return {
            ...recipe,
            isFavorite: isFavorited
          };
        })
      );

      this.setData({
        recipes: recipesWithStatus,
        loading: false
      });
    } catch (error) {
      console.error('加载推荐失败:', error);
      showError('加载失败');
      this.setData({ loading: false });
    }
  },

  // 切换收藏状态
  async toggleFavorite(e) {
    const { id } = e.currentTarget.dataset;
    const index = this.data.recipes.findIndex(r => r._id === id);

    if (index === -1) return;

    const recipe = this.data.recipes[index];

    try {
      showLoading('处理中...');
      await toggleFavorite(id, !recipe.isFavorite);
      hideLoading();

      // 更新状态
      const recipes = [...this.data.recipes];
      recipes[index].isFavorite = !recipe.isFavorite;
      this.setData({ recipes });

      showSuccess(recipe.isFavorite ? '取消收藏' : '收藏成功');

      // 标记收藏列表需要刷新
      getApp().markFavoritesNeedRefresh();
    } catch (error) {
      hideLoading();
      showError('操作失败');
      console.error('切换收藏失败:', error);
    }
  },

  // 跳转到详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}`
    });
  },

  // 刷新推荐
  async refreshRecommend() {
    if (this.data.isRefreshing) return;

    this.setData({ isRefreshing: true });

    try {
      // 重新加载推荐
      await this.loadRecommendations();
      showSuccess('已更新推荐');
    } finally {
      this.setData({ isRefreshing: false });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecommendations().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
});

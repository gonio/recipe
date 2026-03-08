/**
 * 菜谱详情页
 * 展示菜谱详细信息，支持收藏功能
 */

const { getRecipeById, incrementViewCount } = require('../../utils/recipe-api');
const { toggleFavorite, isRecipeFavorited, trackRecipeView } = require('../../utils/user-api');
const { showLoading, hideLoading, showSuccess, showError, handleCloudError, formatDifficulty, formatCookTime } = require('../../utils/ui-helpers');

Page({
  data: {
    // 菜谱信息
    recipeId: '',
    recipe: null,
    isFavorited: false,
    isLoading: true,
    error: null,

    // 难度文本映射
    difficultyText: ['', '简单', '入门', '中等', '困难', '大厨']
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ recipeId: options.id });
      this.loadRecipeDetail();
    } else {
      showError('菜谱不存在');
      wx.navigateBack();
    }
  },

  /**
   * 加载菜谱详情
   */
  async loadRecipeDetail() {
    const { recipeId } = this.data;

    this.setData({ isLoading: true, error: null });
    showLoading('加载中...');

    try {
      // 获取菜谱详情
      const res = await getRecipeById(recipeId);
      const recipe = res.data;

      // 检查收藏状态
      const favorited = await isRecipeFavorited(recipeId);

      // 增加浏览量
      incrementViewCount(recipeId);
      trackRecipeView(recipeId);

      // 格式化数据
      recipe.difficultyText = formatDifficulty(recipe.difficulty);
      recipe.cookTimeText = formatCookTime(recipe.cookTime);

      this.setData({
        recipe,
        isFavorited: favorited,
        isLoading: false
      });

      // 设置页面标题
      wx.setNavigationBarTitle({
        title: recipe.name
      });

    } catch (error) {
      console.error('加载详情失败:', error);
      handleCloudError(error);
      this.setData({
        error: error.message || '加载失败',
        isLoading: false
      });
    } finally {
      hideLoading();
    }
  },

  /**
   * 切换收藏状态（带防抖）
   */
  async toggleFavorite() {
    // 防抖：防止重复点击
    if (this.data.isTogglingFavorite) {
      console.log('收藏操作过于频繁，已防抖');
      return;
    }

    this.setData({ isTogglingFavorite: true });

    const { recipeId, isFavorited, recipe } = this.data;

    try {
      const result = await toggleFavorite(recipeId, !isFavorited);

      // 更新本地状态
      this.setData({
        isFavorited: !isFavorited
      });

      // 更新收藏数显示
      if (result.data && result.data.favoriteCount !== undefined) {
        this.setData({
          'recipe.favoriteCount': result.data.favoriteCount
        });
      } else {
        // 本地更新收藏数
        const newCount = (recipe.favoriteCount || 0) + (isFavorited ? -1 : 1);
        this.setData({
          'recipe.favoriteCount': Math.max(0, newCount)
        });
      }

      showSuccess(isFavorited ? '已取消收藏' : '收藏成功');

    } catch (error) {
      console.error('切换收藏失败:', error);
      handleCloudError(error);
    } finally {
      // 500ms 后重置防抖状态
      setTimeout(() => {
        this.setData({ isTogglingFavorite: false });
      }, 500);
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const { recipe } = this.data;
    const url = e.currentTarget.dataset.url || recipe.imageUrl;

    if (url) {
      wx.previewImage({
        urls: [url],
        current: url
      });
    }
  },

  /**
   * 分享菜谱
   */
  onShareAppMessage() {
    const { recipe } = this.data;
    return {
      title: recipe?.name || '美味食谱',
      path: `/pages/recipe-detail/recipe-detail?id=${this.data.recipeId}`,
      imageUrl: recipe?.imageUrl || '/images/share-default.png'
    };
  },

  /**
   * 重试加载
   */
  onRetry() {
    this.loadRecipeDetail();
  }
});

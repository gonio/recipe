const app = getApp();

Page({
  data: {
    today: '',
    recipes: [],
    loading: false,
    difficultyText: ['简单', '容易', '中等', '较难', '困难']
  },

  onLoad() {
    this.setToday();
    this.loadRecommendations();
  },

  onPullDownRefresh() {
    this.loadRecommendations().finally(() => {
      wx.stopPullDownRefresh();
    });
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
    this.setData({ loading: true });
    
    try {
      const res = await app.request({
        url: '/recipes/daily-recommend'
      });

      if (res.success) {
        // 检查是否已收藏
        const recipes = res.data.recipes.map(recipe => ({
          ...recipe,
          isFavorite: false // 需要额外查询收藏状态
        }));
        
        this.setData({ recipes });
        
        // 检查收藏状态
        this.checkFavorites(recipes);
      }
    } catch (error) {
      console.error('加载推荐失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 检查收藏状态
  async checkFavorites(recipes) {
    try {
      const res = await app.request({
        url: '/recipes/favorites',
        data: { limit: 1000 }
      });

      if (res.success) {
        const favoriteIds = res.data.recipes.map(r => r._id);
        const updatedRecipes = recipes.map(recipe => ({
          ...recipe,
          isFavorite: favoriteIds.includes(recipe._id)
        }));
        this.setData({ recipes: updatedRecipes });
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  },

  // 切换收藏状态
  async toggleFavorite(e) {
    const { id, index } = e.currentTarget.dataset;
    const recipe = this.data.recipes[index];
    
    try {
      if (recipe.isFavorite) {
        // 取消收藏
        await app.request({
          url: '/recipes/unfavorite',
          method: 'POST',
          data: { recipeId: id }
        });
        app.showSuccess('取消收藏');
      } else {
        // 添加收藏
        await app.request({
          url: '/recipes/favorite',
          method: 'POST',
          data: { recipeId: id }
        });
        app.showSuccess('收藏成功');
      }

      // 更新状态
      const recipes = [...this.data.recipes];
      recipes[index].isFavorite = !recipe.isFavorite;
      this.setData({ recipes });
    } catch (error) {
      app.showError('操作失败');
    }
  },

  // 刷新推荐（随机获取）
  async refreshRecommend() {
    this.setData({ loading: true });
    
    try {
      // 从市场随机获取
      const res = await app.request({
        url: '/recipes/market',
        data: { page: 1, limit: 5 }
      });

      if (res.success && res.data.recipes.length > 0) {
        // 随机打乱
        const shuffled = res.data.recipes.sort(() => 0.5 - Math.random()).slice(0, 3);
        const recipes = shuffled.map(recipe => ({ ...recipe, isFavorite: false }));
        
        this.setData({ recipes });
        this.checkFavorites(recipes);
      }
    } catch (error) {
      console.error('刷新推荐失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}`
    });
  }
});

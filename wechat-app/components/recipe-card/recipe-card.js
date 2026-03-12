/**
 * 菜谱卡片组件
 * 展示菜谱的基本信息和收藏按钮
 */

const { formatDifficulty } = require('../../utils/ui-helpers');

Component({
  /**
   * 组件属性
   */
  properties: {
    // 菜谱数据
    recipe: {
      type: Object,
      value: {},
      observer: function(newVal) {
        // 格式化难度文本
        if (newVal && newVal.difficulty) {
          this.setData({
            difficultyText: formatDifficulty(newVal.difficulty)
          });
        }
      }
    },
    // 是否已收藏
    isFavorited: {
      type: Boolean,
      value: false
    },
    // 是否显示动画
    showAnimation: {
      type: Boolean,
      value: true
    },
    // 是否启用长按菜单
    enableLongPress: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件内部数据
   */
  data: {
    difficultyText: ''
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件挂载时设置难度文本
      if (this.properties.recipe && this.properties.recipe.difficulty) {
        this.setData({
          difficultyText: formatDifficulty(this.properties.recipe.difficulty)
        });
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 点击卡片
     */
    onTapCard() {
      const { recipe } = this.properties;
      if (!recipe || !recipe._id) {
        console.warn('菜谱数据不完整，无法跳转');
        return;
      }

      // 触发点击事件
      this.triggerEvent('tapCard', {
        recipeId: recipe._id,
        recipe: recipe
      });

      // 跳转到详情页
      wx.navigateTo({
        url: `/pages/recipe-detail/recipe-detail?id=${recipe._id}`
      });
    },

    /**
     * 切换收藏状态
     */
    async onToggleFavorite(e) {
      // 阻止冒泡，防止触发卡片点击
      e.stopPropagation && e.stopPropagation();

      const { recipe, isFavorited } = this.properties;

      if (!recipe || !recipe._id) {
        return;
      }

      // 触发收藏事件，由父页面处理实际逻辑
      this.triggerEvent('toggleFavorite', {
        recipeId: recipe._id,
        isFavorited: !isFavorited,
        recipe: recipe
      });
    },

    /**
     * 图片加载失败
     */
    onImageError() {
      console.log('菜谱图片加载失败，使用默认图片');
      this.setData({
        'recipe.imageUrl': '/images/default-food.png'
      });
    },

    /**
     * 长按卡片
     */
    onLongPressCard() {
      const { recipe, enableLongPress } = this.properties;

      // 只有在启用长按功能时才触发事件
      if (!enableLongPress || !recipe || !recipe._id) {
        return;
      }

      // 触发长按事件
      this.triggerEvent('longpress', {
        recipeId: recipe._id,
        recipe: recipe
      });
    }
  }
});

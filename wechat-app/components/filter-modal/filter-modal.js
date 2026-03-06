/**
 * 菜系筛选弹窗组件
 */

Component({
  /**
   * 组件属性
   */
  properties: {
    // 是否显示
    show: {
      type: Boolean,
      value: false
    },
    // 当前选中的菜系
    selectedCuisine: {
      type: String,
      value: 'all'
    }
  },

  /**
   * 组件内部数据
   */
  data: {
    cuisines: ['全部', '川菜', '粤菜', '湘菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜'],
    tempSelected: 'all'
  },

  /**
   * 数据监听器
   */
  observers: {
    'show, selectedCuisine': function(show, selectedCuisine) {
      if (show) {
        this.setData({
          tempSelected: selectedCuisine || 'all'
        });
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 选择菜系
     */
    onSelectCuisine(e) {
      const { cuisine } = e.currentTarget.dataset;
      const value = cuisine === '全部' ? 'all' : cuisine;
      this.setData({
        tempSelected: value
      });
    },

    /**
     * 确定选择
     */
    onConfirm() {
      const { tempSelected } = this.data;
      this.triggerEvent('confirm', {
        cuisine: tempSelected
      });
      this.onClose();
    },

    /**
     * 重置选择
     */
    onReset() {
      this.setData({
        tempSelected: 'all'
      });
      this.triggerEvent('reset');
    },

    /**
     * 关闭弹窗
     */
    onClose() {
      this.triggerEvent('close');
    },

    /**
     * 阻止触摸穿透
     */
    preventTouchMove() {
      return false;
    }
  }
});

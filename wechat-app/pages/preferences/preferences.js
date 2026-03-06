/**
 * 偏好设置页面
 */

const { updatePreferences } = require('../../utils/user-api');
const { showLoading, hideLoading, showSuccess, showError } = require('../../utils/ui-helpers');

Page({
  data: {
    cuisines: ['川菜', '粤菜', '湘菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜', '西餐', '日料', '韩料'],
    selectedCuisines: []
  },

  onLoad() {
    this.loadCurrentPreferences();
  },

  // 加载当前偏好
  loadCurrentPreferences() {
    const app = getApp();
    const preferredCuisines = app.getPreferredCuisines() || [];

    this.setData({
      selectedCuisines: preferredCuisines
    });
  },

  // 切换菜系选择
  toggleCuisine(e) {
    const { cuisine } = e.currentTarget.dataset;
    const { selectedCuisines } = this.data;

    if (selectedCuisines.includes(cuisine)) {
      // 取消选择
      this.setData({
        selectedCuisines: selectedCuisines.filter(c => c !== cuisine)
      });
    } else {
      // 添加选择
      this.setData({
        selectedCuisines: [...selectedCuisines, cuisine]
      });
    }
  },

  // 保存偏好设置
  async savePreferences() {
    const { selectedCuisines } = this.data;

    showLoading('保存中...');

    try {
      await updatePreferences(selectedCuisines);

      // 更新全局数据
      const app = getApp();
      app.setPreferredCuisines(selectedCuisines);

      // 标记推荐页面需要刷新
      app.globalData.needRefreshRecommend = true;

      hideLoading();
      showSuccess('保存成功');

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 800);
    } catch (error) {
      hideLoading();
      showError('保存失败');
      console.error('保存偏好失败:', error);
    }
  }
});

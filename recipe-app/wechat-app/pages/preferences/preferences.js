const app = getApp();

Page({
  data: {
    allCuisines: ['湘菜', '川菜', '粤菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜', '西餐', '日韩料理', '东南亚菜'],
    selectedCuisines: [],
    saving: false
  },

  onLoad() {
    this.loadUserPreferences();
  },

  // 加载用户偏好
  async loadUserPreferences() {
    try {
      const res = await app.request({ url: '/auth/user' });
      if (res.success && res.data.preferredCuisines) {
        this.setData({
          selectedCuisines: res.data.preferredCuisines
        });
      }
    } catch (error) {
      console.error('加载偏好失败:', error);
    }
  },

  // 切换菜系选择
  toggleCuisine(e) {
    const cuisine = e.currentTarget.dataset.cuisine;
    const { selectedCuisines } = this.data;
    
    if (selectedCuisines.includes(cuisine)) {
      // 已选择则移除
      this.setData({
        selectedCuisines: selectedCuisines.filter(c => c !== cuisine)
      });
    } else {
      // 未选择则添加
      this.setData({
        selectedCuisines: [...selectedCuisines, cuisine]
      });
    }
  },

  // 移除已选择的菜系
  removeCuisine(e) {
    const cuisine = e.currentTarget.dataset.cuisine;
    const { selectedCuisines } = this.data;
    
    this.setData({
      selectedCuisines: selectedCuisines.filter(c => c !== cuisine)
    });
  },

  // 保存偏好
  async savePreferences() {
    const { selectedCuisines } = this.data;
    
    if (selectedCuisines.length === 0) {
      app.showError('请至少选择一个菜系');
      return;
    }

    this.setData({ saving: true });

    try {
      const res = await app.request({
        url: '/auth/preferences',
        method: 'PUT',
        data: { cuisines: selectedCuisines }
      });

      if (res.success) {
        app.showSuccess('保存成功');
        // 更新全局数据
        app.globalData.preferredCuisines = selectedCuisines;
        
        // 延迟返回
        setTimeout(() => {
          wx.navigateBack();
        }, 800);
      } else {
        app.showError(res.message || '保存失败');
      }
    } catch (error) {
      app.showError('保存失败');
    } finally {
      this.setData({ saving: false });
    }
  }
});

const app = getApp();

Page({
  data: {
    // 添加方式：manual 手动添加，video 视频链接
    addMode: 'manual',
    
    // 菜系选项
    cuisines: ['湘菜', '川菜', '粤菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜', '西餐', '日韩料理', '东南亚菜'],
    cuisineIndex: -1,
    
    // 手动添加表单
    form: {
      name: '',
      cuisine: '',
      cookTime: '',
      imageUrl: '',
      ingredients: [],
      steps: []
    },
    
    // 视频链接表单
    videoForm: {
      url: '',
      name: '',
      cuisine: '',
      note: ''
    },
    videoCuisineIndex: -1
  },

  onLoad() {
    // 初始化一个默认食材和一个默认步骤
    this.setData({
      'form.ingredients': [{ name: '', amount: '' }],
      'form.steps': [{ order: 1, description: '', imageUrl: '' }]
    });
  },

  // 切换添加方式
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ addMode: mode });
  },

  // ========== 手动添加相关方法 ==========

  // 输入框变化
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 选择菜系
  onCuisineChange(e) {
    const index = e.detail.value;
    this.setData({
      cuisineIndex: index,
      'form.cuisine': this.data.cuisines[index]
    });
  },

  // 选择图片（相册或拍照）
  chooseImage() {
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: sourceType,
          success: (res) => {
            const tempFilePath = res.tempFiles[0].tempFilePath;
            this.uploadImage(tempFilePath, 'imageUrl');
          }
        });
      }
    });
  },

  // 删除图片
  deleteImage() {
    this.setData({
      'form.imageUrl': ''
    });
  },

  // 上传图片
  uploadImage(filePath, field) {
    app.showLoading('上传中...');
    
    wx.uploadFile({
      url: `${app.globalData.apiBaseUrl}/upload/image`,
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.success) {
          this.setData({
            [`form.${field}`]: data.data.url
          });
        } else {
          app.showError('上传失败');
        }
      },
      fail: () => {
        app.showError('上传失败');
      },
      complete: () => {
        app.hideLoading();
      }
    });
  },

  // 添加食材
  addIngredient() {
    const ingredients = this.data.form.ingredients;
    ingredients.push({ name: '', amount: '' });
    this.setData({
      'form.ingredients': ingredients
    });
  },

  // 删除食材
  deleteIngredient(e) {
    const index = e.currentTarget.dataset.index;
    const ingredients = this.data.form.ingredients;
    ingredients.splice(index, 1);
    this.setData({
      'form.ingredients': ingredients
    });
  },

  // 食材变化
  onIngredientChange(e) {
    const { index, field } = e.currentTarget.dataset;
    const value = e.detail.value;
    const ingredients = this.data.form.ingredients;
    ingredients[index][field] = value;
    this.setData({
      'form.ingredients': ingredients
    });
  },

  // 添加步骤
  addStep() {
    const steps = this.data.form.steps;
    steps.push({ 
      order: steps.length + 1, 
      description: '', 
      imageUrl: '' 
    });
    this.setData({
      'form.steps': steps
    });
  },

  // 删除步骤
  deleteStep(e) {
    const index = e.currentTarget.dataset.index;
    const steps = this.data.form.steps;
    steps.splice(index, 1);
    // 重新排序
    steps.forEach((step, i) => {
      step.order = i + 1;
    });
    this.setData({
      'form.steps': steps
    });
  },

  // 步骤描述变化
  onStepChange(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const steps = this.data.form.steps;
    steps[index].description = value;
    this.setData({
      'form.steps': steps
    });
  },

  // 选择步骤图片（相册或拍照）
  chooseStepImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: sourceType,
          success: (res) => {
            const tempFilePath = res.tempFiles[0].tempFilePath;
            this.uploadStepImage(tempFilePath, index);
          }
        });
      }
    });
  },

  // 上传步骤图片
  uploadStepImage(filePath, index) {
    app.showLoading('上传中...');
    
    wx.uploadFile({
      url: `${app.globalData.apiBaseUrl}/upload/image`,
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.success) {
          const steps = this.data.form.steps;
          steps[index].imageUrl = data.data.url;
          this.setData({
            'form.steps': steps
          });
        } else {
          app.showError('上传失败');
        }
      },
      fail: () => {
        app.showError('上传失败');
      },
      complete: () => {
        app.hideLoading();
      }
    });
  },

  // 删除步骤图片
  deleteStepImage(e) {
    const index = e.currentTarget.dataset.index;
    const steps = this.data.form.steps;
    steps[index].imageUrl = '';
    this.setData({
      'form.steps': steps
    });
  },

  // 提交手动添加的菜谱
  async submitRecipe() {
    const { form } = this.data;
    
    // 表单验证
    if (!form.name.trim()) {
      app.showError('请输入菜谱名称');
      return;
    }
    
    // 过滤空食材
    const ingredients = form.ingredients.filter(item => item.name.trim());
    if (ingredients.length === 0) {
      app.showError('请至少添加一种食材');
      return;
    }
    
    // 过滤空步骤
    const steps = form.steps.filter(item => item.description.trim());
    if (steps.length === 0) {
      app.showError('请至少添加一个步骤');
      return;
    }

    try {
      app.showLoading('保存中...');
      
      const res = await app.request({
        url: '/recipes/custom',
        method: 'POST',
        data: {
          ...form,
          ingredients,
          steps
        }
      });
      
      console.log('保存菜谱响应:', res);

      if (res.success) {
        app.showSuccess('添加成功');
        // 设置全局刷新标记，让首页刷新列表
        app.globalData.needRefreshFavorites = true;
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 800);
      } else {
        app.showError(res.message || '添加失败');
      }
    } catch (error) {
      console.error('添加菜谱失败:', error);
      app.showError('添加失败');
    } finally {
      app.hideLoading();
    }
  },

  // ========== 视频链接相关方法 ==========

  // 视频URL输入
  onVideoUrlInput(e) {
    this.setData({
      'videoForm.url': e.detail.value
    });
  },

  // 视频名称输入
  onVideoNameInput(e) {
    this.setData({
      'videoForm.name': e.detail.value
    });
  },

  // 视频备注输入
  onVideoNoteInput(e) {
    this.setData({
      'videoForm.note': e.detail.value
    });
  },

  // 选择视频菜谱菜系
  onVideoCuisineChange(e) {
    const index = e.detail.value;
    this.setData({
      videoCuisineIndex: index,
      'videoForm.cuisine': this.data.cuisines[index]
    });
  },

  // 提交视频菜谱
  async submitVideoRecipe() {
    const { videoForm } = this.data;
    
    if (!videoForm.url.trim()) {
      app.showError('请输入视频链接');
      return;
    }
    if (!videoForm.name.trim()) {
      app.showError('请输入菜谱名称');
      return;
    }
    
    try {
      app.showLoading('保存中...');
      
      const res = await app.request({
        url: '/recipes/custom-video',
        method: 'POST',
        data: {
          name: videoForm.name,
          cuisine: videoForm.cuisine || null,
          sourceUrl: videoForm.url,
          note: videoForm.note
        }
      });
      
      console.log('保存视频菜谱响应:', res);

      if (res.success) {
        app.showSuccess('添加成功');
        // 设置全局刷新标记，让首页刷新列表
        app.globalData.needRefreshFavorites = true;
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 800);
      } else {
        app.showError(res.message || '添加失败');
      }
    } catch (error) {
      console.error('添加视频菜谱失败:', error);
      app.showError('添加失败');
    } finally {
      app.hideLoading();
    }
  }
});

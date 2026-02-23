const app = getApp();

Page({
  data: {
    keyword: '',
    history: [],
    hotKeywords: ['红烧肉', '麻婆豆腐', '糖醋排骨', '清蒸鱼', '宫保鸡丁', '番茄炒蛋', '火锅', '饺子'],
    results: [],
    total: 0,
    loading: false,
    page: 1,
    limit: 20
  },

  onLoad() {
    this.loadHistory();
  },

  // 加载搜索历史
  loadHistory() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ history });
  },

  // 保存搜索历史
  saveHistory(keyword) {
    if (!keyword.trim()) return;
    
    let history = this.data.history;
    // 移除已存在的相同关键词
    history = history.filter(item => item !== keyword);
    // 添加到开头
    history.unshift(keyword);
    // 最多保存 10 条
    history = history.slice(0, 10);
    
    this.setData({ history });
    wx.setStorageSync('searchHistory', history);
  },

  // 清空搜索历史
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ history: [] });
          wx.removeStorageSync('searchHistory');
        }
      }
    });
  },

  // 输入处理
  onInput(e) {
    this.setData({ keyword: e.detail.value });
    
    // 防抖搜索
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      if (this.data.keyword.trim()) {
        this.search();
      }
    }, 500);
  },

  // 搜索
  onSearch() {
    if (!this.data.keyword.trim()) {
      app.showError('请输入搜索关键词');
      return;
    }
    this.search();
  },

  // 执行搜索
  async search() {
    const { keyword, page, limit } = this.data;
    
    this.setData({ loading: true });
    
    try {
      const res = await app.request({
        url: '/recipes/search',
        data: {
          keyword: keyword.trim(),
          page,
          limit
        }
      });

      if (res.success) {
        this.setData({
          results: page === 1 ? res.data.recipes : [...this.data.results, ...res.data.recipes],
          total: res.data.pagination.total
        });
        
        // 保存搜索历史
        if (page === 1) {
          this.saveHistory(keyword);
        }
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 使用历史搜索
  searchByHistory(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword, page: 1 }, () => {
      this.search();
    });
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      keyword: '',
      results: [],
      total: 0,
      page: 1
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}`
    });
  }
});

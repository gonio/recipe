/**
 * 搜索页面
 * 使用 CloudBase SDK
 */

const { searchRecipes } = require('../../utils/recipe-api');
const { showLoading, hideLoading, showError } = require('../../utils/ui-helpers');

Page({
  data: {
    keyword: '',
    history: [],
    hotKeywords: ['红烧肉', '麻婆豆腐', '糖醋排骨', '清蒸鱼', '宫保鸡丁', '番茄炒蛋', '火锅', '饺子'],
    results: [],
    total: 0,
    loading: false,
    page: 0,
    limit: 20,
    noMore: false
  },

  onLoad(options) {
    this.loadHistory();

    // 如果有传入的关键词，直接搜索
    if (options.keyword) {
      this.setData({ keyword: options.keyword }, () => {
        this.search();
      });
    }
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
      showError('请输入搜索关键词');
      return;
    }
    this.setData({ page: 0, noMore: false }, () => {
      this.search();
    });
  },

  // 执行搜索
  async search() {
    const { keyword, page, limit } = this.data;

    if (!keyword.trim()) return;

    this.setData({ loading: true });
    showLoading('搜索中...');

    try {
      const res = await searchRecipes(keyword.trim(), limit);
      const recipes = res.data || [];

      this.setData({
        results: page === 0 ? recipes : [...this.data.results, ...recipes],
        total: recipes.length, // CloudBase 不支持直接获取总数，这里用返回数量
        noMore: recipes.length < limit,
        loading: false
      });

      // 保存搜索历史
      if (page === 0) {
        this.saveHistory(keyword);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      showError('搜索失败');
      this.setData({ loading: false });
    } finally {
      hideLoading();
    }
  },

  // 加载更多
  loadMore() {
    if (this.data.noMore || this.data.loading) return;

    this.setData({
      page: this.data.page + 1
    }, () => {
      this.search();
    });
  },

  // 使用历史搜索
  searchByHistory(e) {
    const { keyword } = e.currentTarget.dataset;
    this.setData({ keyword, page: 0, noMore: false }, () => {
      this.search();
    });
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      keyword: '',
      results: [],
      total: 0,
      page: 0,
      noMore: false
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 跳转到详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}`
    });
  }
});

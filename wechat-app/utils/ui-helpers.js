/**
 * UI 辅助工具函数
 * 提供加载状态、骨架屏、动画等 UI 相关功能
 */

/**
 * 显示加载提示
 * @param {string} title - 提示文字
 * @param {boolean} mask - 是否显示遮罩
 */
function showLoading(title = '加载中...', mask = true) {
  wx.showLoading({
    title,
    mask
  });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示骨架屏
 * @param {Object} page - 页面实例（this）
 * @param {string} key - 数据键名（默认为 showSkeleton）
 */
function showSkeleton(page, key = 'showSkeleton') {
  page.setData({ [key]: true });
}

/**
 * 隐藏骨架屏
 * @param {Object} page - 页面实例（this）
 * @param {string} key - 数据键名（默认为 showSkeleton）
 */
function hideSkeleton(page, key = 'showSkeleton') {
  page.setData({ [key]: false });
}

/**
 * 显示成功提示
 * @param {string} title - 提示文字
 * @param {number} duration - 持续时间（毫秒）
 */
function showSuccess(title = '操作成功', duration = 1500) {
  wx.showToast({
    title,
    icon: 'success',
    duration
  });
}

/**
 * 显示错误提示
 * @param {string} title - 提示文字
 * @param {number} duration - 持续时间（毫秒）
 */
function showError(title = '操作失败', duration = 2000) {
  wx.showToast({
    title,
    icon: 'error',
    duration
  });
}

/**
 * 显示普通提示
 * @param {string} title - 提示文字
 * @param {number} duration - 持续时间（毫秒）
 */
function showToast(title, duration = 2000) {
  wx.showToast({
    title,
    icon: 'none',
    duration
  });
}

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @returns {Promise<boolean>} 用户是否确认
 */
function showConfirm(title, content) {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

/**
 * 显示操作菜单
 * @param {Array<string>} items - 菜单项
 * @returns {Promise<number>} 选中的索引，取消返回 -1
 */
function showActionSheet(items) {
  return new Promise((resolve) => {
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        resolve(res.tapIndex);
      },
      fail: () => {
        resolve(-1);
      }
    });
  });
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function (...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 格式化时间
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式模板
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute);
}

/**
 * 格式化烹饪时间
 * @param {number} minutes - 分钟数
 * @returns {string} 格式化后的时间
 */
function formatCookTime(minutes) {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

/**
 * 格式化难度
 * @param {number} difficulty - 难度 1-5
 * @returns {string} 难度描述
 */
function formatDifficulty(difficulty) {
  const levels = ['', '简单', '入门', '中等', '困难', '大厨'];
  return levels[difficulty] || '未知';
}

/**
 * 截断文本
 * @param {string} text - 原文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀
 * @returns {string} 截断后的文本
 */
function truncate(text, maxLength = 50, suffix = '...') {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 处理云开发错误
 * @param {Object} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 */
function handleCloudError(error, defaultMessage = '操作失败') {
  console.error('Cloud error:', error);

  const errCode = error.errCode || error.code;
  const errMsg = error.errMsg || error.message || String(error);

  // 根据错误码显示不同的提示
  const errorMap = {
    '-601034': '云开发环境未配置，请检查环境ID',
    '-501001': '数据库查询失败',
    '-501002': '数据库写入失败',
    '-501003': '数据库更新失败',
    '-501004': '数据库删除失败',
    '-502001': '云函数调用失败',
    '-502002': '云函数不存在',
    '-503001': '文件上传失败',
    '-503002': '文件下载失败',
    '-504001': '网络请求失败',
    '-504002': '请求超时',
    '-505001': '用户未登录',
    '-505002': '权限不足'
  };

  const message = errorMap[errCode] || errMsg || defaultMessage;
  showError(message);
}

module.exports = {
  // 加载状态
  showLoading,
  hideLoading,
  showSkeleton,
  hideSkeleton,

  // 提示信息
  showSuccess,
  showError,
  showToast,
  showConfirm,
  showActionSheet,

  // 性能优化
  debounce,
  throttle,

  // 格式化工具
  formatTime,
  formatCookTime,
  formatDifficulty,
  truncate,

  // 错误处理
  handleCloudError
};

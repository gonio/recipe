/**
 * CloudBase SDK 初始化与错误处理工具
 * 提供统一的 SDK 初始化和错误处理方法
 */

const ErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNKNOWN: 'UNKNOWN'
};

/**
 * 初始化 CloudBase SDK
 * 在 app.js 中调用
 */
function initCloudBase() {
  wx.cloud.init({
    env: 'success-0g0hlzlle75bd6a0', // 云开发环境 ID
    traceUser: true // 追踪用户分析
  });
  return wx.cloud.database();
}

/**
 * 处理 CloudBase 错误
 * @param {Error} error - 错误对象
 * @param {Object} options - 配置选项
 */
function handleCloudError(error, options = {}) {
  const { showToast = true, defaultMessage = '操作失败，请重试' } = options;

  console.error('CloudBase Error:', error);

  // 确定错误类型
  let errorType = ErrorCode.UNKNOWN;
  let userMessage = defaultMessage;

  if (error.message && error.message.includes('network')) {
    errorType = ErrorCode.NETWORK_ERROR;
    userMessage = '网络连接失败，请检查网络后重试';
  } else if (error.errCode === -502001) {
    errorType = ErrorCode.DATABASE_ERROR;
    userMessage = '数据查询失败';
  } else if (error.errCode === -401 || error.message?.includes('permission')) {
    errorType = ErrorCode.PERMISSION_DENIED;
    userMessage = '权限不足';
  } else if (error.errCode === -502002) {
    errorType = ErrorCode.NOT_FOUND;
    userMessage = '数据不存在';
  }

  // 显示提示
  if (showToast) {
    wx.showToast({
      title: userMessage,
      icon: 'none',
      duration: 2000
    });
  }

  return { errorType, userMessage, originalError: error };
}

/**
 * 检查网络状态
 * @returns {Promise<boolean>} 是否有网络连接
 */
function checkNetwork() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType !== 'none');
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

/**
 * 带重试的数据库操作
 * @param {Function} operation - 数据库操作函数
 * @param {number} maxRetries - 最大重试次数
 */
async function withRetry(operation, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error);

      // 只有网络错误才重试
      if (error.message?.includes('network') || error.errCode === -402001) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      // 其他错误直接抛出
      throw error;
    }
  }

  throw lastError;
}

module.exports = {
  ErrorCode,
  initCloudBase,
  handleCloudError,
  checkNetwork,
  withRetry
};

// 测试环境配置
// 使用这个文件替换 app.js 中的 apiBaseUrl 来进行本地测试

// 测试模式配置
const TEST_CONFIG = {
  // 本地测试服务器
  apiBaseUrl: 'http://localhost:3999/api',
  
  // 内网测试（手机真机测试时使用电脑IP）
  // apiBaseUrl: 'http://192.168.1.xxx:3999/api',
  
  // 开发环境（后端真机）
  // apiBaseUrl: 'http://your-server:3000/api',
};

module.exports = TEST_CONFIG;

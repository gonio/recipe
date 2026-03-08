const automator = require('miniprogram-automator');

console.log('Testing launch...');
console.log('Project:', 'D:\\recipe\\recipe-miniapp\\wechat-app');
console.log('CLI:', 'E:\\微信web开发者工具\\cli.bat');

automator.launch({
  projectPath: 'D:\\recipe\\recipe-miniapp\\wechat-app',
  cliPath: 'E:\\微信web开发者工具\\cli.bat',
  timeout: 60000
}).then(mp => {
  console.log('SUCCESS! Connected to miniProgram');
  return mp.close();
}).then(() => {
  console.log('Closed');
  process.exit(0);
}).catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});

const automator = require('miniprogram-automator');

console.log('Connecting to ws://127.0.0.1:27925...');

automator.connect({
  wsEndpoint: 'ws://127.0.0.1:27925',
  timeout: 10000
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

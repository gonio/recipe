const { spawn } = require('child_process');
const automator = require('miniprogram-automator');
const net = require('net');

const CLI_PATH = 'E:\\微信web开发者工具\\cli.bat';
const PROJECT_PATH = 'D:\\recipe\\recipe-miniapp\\wechat-app';
const PORT = 9420;
const MAX_WAIT_TIME = 60000;

/**
 * 检测端口是否可用
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection(port, '127.0.0.1');
    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * 轮询等待端口就绪
 */
async function waitForPortReady(port, maxWaitTime) {
  const startTime = Date.now();
  let lastLogTime = 0;

  while (Date.now() - startTime < maxWaitTime) {
    const isReady = await checkPort(port);

    if (isReady) {
      return Date.now() - startTime;
    }

    const elapsed = Date.now() - startTime;
    if (elapsed - lastLogTime > 5000) {
      console.log(`  等待中... ${Math.round(elapsed / 1000)}s`);
      lastLogTime = elapsed;
    }

    await new Promise(r => setTimeout(r, 500));
  }

  throw new Error(`工具启动超时（>${maxWaitTime}ms）`);
}

async function run() {
  const startTime = Date.now();
  console.log('🚀 启动微信开发者工具...');

  const autoProcess = spawn(CLI_PATH, [
    'auto',
    '--project', PROJECT_PATH,
    '--auto-port', String(PORT)
  ], {
    stdio: 'pipe',
    shell: true,
    detached: true
  });

  autoProcess.stdout.on('data', (data) => process.stdout.write(data));
  autoProcess.stderr.on('data', (data) => process.stderr.write(data));

  // 智能轮询等待端口就绪
  console.log('⏳ 等待工具启动...');
  let waitTime;
  try {
    waitTime = await waitForPortReady(PORT, MAX_WAIT_TIME);
  } catch (e) {
    console.error('❌', e.message);
    autoProcess.kill();
    process.exit(1);
  }

  console.log('🔌 连接验证...');

  try {
    // connect 成功 = 工具启动成功
    await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${PORT}`,
      timeout: 5000
    });

    const totalTime = Date.now() - startTime;
    console.log(`✅ 开发者工具启动成功！总耗时: ${totalTime}ms`);
    console.log('   自动化服务: ws://127.0.0.1:9420');
    console.log('\n按 Ctrl+C 关闭');

    // 保持运行
    process.stdin.resume();

  } catch (e) {
    console.error('❌ 连接失败:', e.message);
    autoProcess.kill();
    process.exit(1);
  }
}

run();

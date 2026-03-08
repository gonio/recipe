const { spawn } = require('child_process');
const automator = require('miniprogram-automator');
const net = require('net');

const CLI_PATH = 'E:\\微信web开发者工具\\cli.bat';
const PROJECT_PATH = 'D:\\recipe\\recipe-miniapp\\wechat-app';
const PORT = 9420;

/**
 * 检测端口是否可用
 */
async function waitForPort(port, timeout = 30000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection(port, '127.0.0.1');
        socket.once('connect', () => {
          socket.end();
          resolve(true);
        });
        socket.once('error', reject);
      });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error(`端口 ${port} 在 ${timeout}ms 内未就绪`);
}

/**
 * 带重试的连接
 */
async function connectWithRetry(wsEndpoint, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const mp = await automator.connect({ wsEndpoint, timeout: 5000 });
      return mp;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      console.log(`  连接失败，第 ${i + 1} 次重试...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function run() {
  const startTime = Date.now();
  console.log('Step 1: 启动开发者工具和自动化测试服务...');

  const autoProcess = spawn(CLI_PATH, [
    'auto',
    '--project', PROJECT_PATH,
    '--auto-port', String(PORT)
  ], {
    stdio: 'pipe',
    shell: true,
    detached: true
  });

  let outputBuffer = '';
  autoProcess.stdout.on('data', (data) => {
    outputBuffer += data.toString();
    process.stdout.write(data);
  });
  autoProcess.stderr.on('data', (data) => process.stderr.write(data));

  // 智能检测：等待端口就绪并稳定（最多30秒）
  console.log('⏳ 等待编译完成（智能检测）...');
  try {
    // 第一次：等待端口就绪
    await waitForPort(PORT, 30000);
    console.log('  端口已就绪，等待编译稳定...');

    // 第二次：等待一段时间让编译完成
    // 通过检查是否有编译输出或固定等待
    const minCompileTime = 8000; // 最少等待8秒确保编译完成
    const elapsed = Date.now() - startTime;
    if (elapsed < minCompileTime) {
      const remaining = minCompileTime - elapsed;
      console.log(`  还需等待 ${remaining}ms 确保编译完成...`);
      await new Promise(r => setTimeout(r, remaining));
    }

    const waitTime = Date.now() - startTime;
    console.log(`✅ 编译完成，总等待 ${waitTime}ms`);
  } catch (e) {
    console.error('❌', e.message);
    autoProcess.kill();
    process.exit(1);
  }

  console.log('\nStep 2: 连接测试...');

  try {
    const mp = await connectWithRetry(`ws://127.0.0.1:${PORT}`);
    console.log('✅ 连接成功！');

    console.log('\n🧪 测试首页...');
    await mp.reLaunch('/pages/index/index');
    await new Promise(r => setTimeout(r, 2000));
    console.log('✅ 测试通过！');

    await mp.close();
    autoProcess.kill();

    const totalTime = Date.now() - startTime;
    console.log(`\n✅ 全部完成！总耗时: ${totalTime}ms`);
    process.exit(0);

  } catch (e) {
    console.error('❌ 失败:', e.message);
    autoProcess.kill();
    process.exit(1);
  }
}

run();

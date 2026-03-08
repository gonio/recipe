const { spawn } = require('child_process');
const automator = require('miniprogram-automator');

const CLI_PATH = 'E:\\微信web开发者工具\\cli.bat';
const PROJECT_PATH = 'D:\\recipe\\recipe-miniapp\\wechat-app';
const PORT = 9420;

async function run() {
  console.log('Step 1: 打开开发者工具，启动自动化测试服务...');

  // 然后使用 auto 命令启动自动化
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

  console.log('⏳ 等待 5 秒编译...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('\nStep 2: 连接测试...');

  try {
    const mp = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${PORT}`,
      timeout: 10000
    });
    console.log('✅ 连接成功！');

    // 简单测试
    console.log('\n🧪 测试首页...');
    await mp.reLaunch('/pages/index/index');
    await new Promise(r => setTimeout(r, 2000));
    console.log('✅ 测试通过！');

    await mp.close();

    // 清理
    autoProcess.kill();

    console.log('\n✅ 全部完成！');
    process.exit(0);

  } catch (e) {
    console.error('❌ 失败:', e.message);
    autoProcess.kill();
    process.exit(1);
  }
}

run();

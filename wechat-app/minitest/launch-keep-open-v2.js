const { spawn } = require('child_process');
const automator = require('miniprogram-automator');

const CLI_PATH = 'E:\\微信web开发者工具\\cli.bat';
const PROJECT_PATH = 'D:\\recipe\\recipe-miniapp\\wechat-app';
const PORT = 9420;

async function run() {
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

  autoProcess.stdout.on('data', (data) => process.stdout.write(data));
  autoProcess.stderr.on('data', (data) => process.stderr.write(data));

  console.log('⏳ 等待 10 秒编译...');
  await new Promise(r => setTimeout(r, 10000));

  console.log('\nStep 2: 连接验证...');

  try {
    const mp = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${PORT}`,
      timeout: 10000
    });
    console.log('✅ 连接成功！');

    console.log('\n🧪 测试首页...');
    await mp.reLaunch('/pages/index/index');
    await new Promise(r => setTimeout(r, 2000));
    console.log('✅ 测试通过！');

    console.log('\n✅ 开发者工具已启动并保持打开');
    console.log('自动化服务运行在端口 9420');
    console.log('现在可以用 MCP 连接测试了');

    // 保持进程运行，不关闭开发者工具
    process.stdin.resume();

  } catch (e) {
    console.error('❌ 失败:', e.message);
    autoProcess.kill();
    process.exit(1);
  }
}

run();

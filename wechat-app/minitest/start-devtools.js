const { spawn } = require('child_process');
const automator = require('miniprogram-automator');

const CLI_PATH = 'E:\\微信web开发者工具\\cli.bat';
const PROJECT_PATH = 'D:\\recipe\\recipe-miniapp\\wechat-app';
const PORT = 9420;

async function run() {
  console.log('Step 1: 打开开发者工具并编译...');

  // 先使用 open 命令打开项目（会自动编译）
  const openProcess = spawn(CLI_PATH, ['open', '--project', PROJECT_PATH], {
    stdio: 'pipe',
    shell: true
  });

  openProcess.stdout.on('data', (data) => process.stdout.write(data));
  openProcess.stderr.on('data', (data) => process.stderr.write(data));

  // 等待编译完成
  console.log('⏳ 等待 20 秒让项目编译...');
  await new Promise(r => setTimeout(r, 20000));

  console.log('\nStep 2: 启动自动化测试服务...');

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

  console.log('⏳ 等待 10 秒让服务启动...');
  await new Promise(r => setTimeout(r, 10000));

  console.log('\nStep 3: 连接测试...');

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

    // 不断开连接，保持开发者工具打开
    console.log('\n✅ 开发者工具已启动并保持打开');
    console.log('自动化服务运行在端口 9420');
    console.log('现在可以用 MCP 连接测试了');

    // 保持进程运行
    process.stdin.resume();

  } catch (e) {
    console.error('❌ 失败:', e.message);
    process.exit(1);
  }
}

run();

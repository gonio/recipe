const { spawn } = require('child_process');
const automator = require('miniprogram-automator');

const CLI_PATH = 'E:\\微信web开发者工具\\cli.bat';
const PROJECT_PATH = 'D:\\recipe\\recipe-miniapp\\wechat-app';
const PORT = 9420;

console.log('🚀 启动微信开发者工具...');
console.log('💡 请等待项目编译完成（看到"编译完成"提示后再继续）');
console.log('');

// 启动开发者工具
const child = spawn(CLI_PATH, ['auto', '--project', PROJECT_PATH, '--auto-port', String(PORT)], {
  stdio: 'pipe',
  shell: true,
  detached: true
});

child.stdout.on('data', (data) => process.stdout.write(data));
child.stderr.on('data', (data) => process.stderr.write(data));

console.log('⏳ 等待 15 秒让开发工具启动并编译...');
console.log('   如果看到"编译完成"提示，请按回车继续');

// 等待时间让开发者工具启动和编译
setTimeout(async () => {
  console.log('\n📡 尝试连接...');

  try {
    const mp = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${PORT}`,
      timeout: 10000
    });
    console.log('✅ 连接成功！');

    // 测试页面
    console.log('\n🧪 运行页面测试...');

    console.log('   1. 首页...');
    await mp.reLaunch('/pages/index/index');
    await new Promise(r => setTimeout(r, 2000));
    console.log('      ✅ 首页加载成功');

    console.log('   2. Market...');
    await mp.switchTab('/pages/market/market');
    await new Promise(r => setTimeout(r, 2000));
    console.log('      ✅ Market 加载成功');

    console.log('   3. 收藏...');
    await mp.navigateTo('/pages/favorites/favorites');
    await new Promise(r => setTimeout(r, 2000));
    console.log('      ✅ 收藏页加载成功');

    await mp.close();
    console.log('\n✅ 所有测试通过！');

    child.kill();
    process.exit(0);

  } catch (e) {
    console.error('\n❌ 错误:', e.message);
    console.log('\n💡 如果项目还没编译完成，请等待后再试');
    child.kill();
    process.exit(1);
  }
}, 15000);

// 总超时 60 秒
setTimeout(() => {
  console.error('\n❌ 超时，请检查开发者工具是否正常工作');
  child.kill();
  process.exit(1);
}, 60000);

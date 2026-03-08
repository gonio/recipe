/**
 * 微信小程序 MCP 自动化测试 - Launch 模式
 * 自动启动开发者工具并运行测试
 *
 * 使用方法:
 *   node mcp-test-launch.js
 */

const automator = require('miniprogram-automator');
const { spawn } = require('child_process');
const path = require('path');

const CONFIG = {
  // 项目路径
  projectPath: 'D:\\recipe\\recipe-miniapp\\wechat-app',
  // 开发者工具 CLI 路径
  cliPath: 'E:\\微信web开发者工具\\cli.bat',
  // WebSocket 端口
  port: 9420,
  // 启动等待时间（毫秒）
  launchWaitTime: 15000,
  timeout: 60000
};

const TEST_SUITES = [
  { name: '首页加载', fn: testHomePage },
  { name: '市场页面', fn: testMarketPage },
  { name: '收藏页面', fn: testFavoritesPage },
  { name: '推荐页面', fn: testRecommendPage },
  { name: '个人中心', fn: testProfilePage }
];

async function testHomePage(miniProgram) {
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);
  return { passed: true, message: '首页加载成功' };
}

async function testMarketPage(miniProgram) {
  const page = await miniProgram.switchTab('/pages/market/market');
  await page.waitFor(1500);
  return { passed: true, message: '市场页面加载成功' };
}

async function testFavoritesPage(miniProgram) {
  // 先回到首页，再导航到收藏页
  await miniProgram.reLaunch('/pages/index/index');
  await new Promise(r => setTimeout(r, 1000));
  const page = await miniProgram.navigateTo('/pages/favorites/favorites');
  await page.waitFor(3000);
  return { passed: true, message: '收藏页面加载成功' };
}

async function testRecommendPage(miniProgram) {
  const page = await miniProgram.switchTab('/pages/recommend/recommend');
  await page.waitFor(1500);
  return { passed: true, message: '推荐页面加载成功' };
}

async function testProfilePage(miniProgram) {
  const page = await miniProgram.switchTab('/pages/profile/profile');
  await page.waitFor(1500);
  return { passed: true, message: '个人中心加载成功' };
}

async function runTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 MCP 自动化测试 (Launch 模式)');
  console.log('═══════════════════════════════════════════\n');

  console.log('📡 正在启动微信开发者工具...');
  console.log(`   项目: ${CONFIG.projectPath}`);
  console.log(`   端口: ${CONFIG.port}`);
  console.log('   请等待编译完成...\n');

  let miniProgram = null;
  let childProcess = null;
  const results = [];
  const startTime = Date.now();

  try {
    // Step 1: 使用 spawn 启动开发者工具
    console.log('Step 1: 启动开发者工具...');
    childProcess = spawn(CONFIG.cliPath, [
      'auto',
      '--project', CONFIG.projectPath,
      '--auto-port', String(CONFIG.port)
    ], {
      stdio: 'pipe',
      shell: true,
      detached: true
    });

    childProcess.stdout.on('data', (data) => process.stdout.write(data));
    childProcess.stderr.on('data', (data) => process.stderr.write(data));

    // Step 2: 等待编译完成
    console.log(`Step 2: 等待 ${CONFIG.launchWaitTime/1000} 秒让工具启动和编译...\n`);
    await new Promise(r => setTimeout(r, CONFIG.launchWaitTime));

    // Step 3: 连接 WebSocket
    console.log('Step 3: 连接到自动化服务...');
    miniProgram = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${CONFIG.port}`,
      timeout: 10000
    });
    console.log('✅ 已连接!\n');

    for (const suite of TEST_SUITES) {
      console.log(`🧪 ${suite.name}`);
      try {
        const result = await suite.fn(miniProgram);
        results.push({ name: suite.name, ...result });
        console.log(`  ✅ ${result.message}`);
      } catch (error) {
        console.log(`  ❌ ${error.message}`);
        results.push({ name: suite.name, passed: false, message: error.message });
      }
    }

  } catch (error) {
    console.error('\n❌ 启动失败:', error.message);
    console.error('\n💡 可能原因：');
    console.error('   1. 开发者工具路径不正确');
    console.error('   2. 项目路径不正确');
    console.error('   3. 开发者工具版本过低');
    process.exit(1);
  } finally {
    if (miniProgram) {
      await miniProgram.close();
      console.log('\n📡 已断开连接');
    }
    if (childProcess) {
      childProcess.kill();
      console.log('📡 已关闭开发者工具');
    }
  }

  const duration = Date.now() - startTime;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('\n═══════════════════════════════════════════');
  console.log('  📊 测试报告');
  console.log('═══════════════════════════════════════════');
  console.log(`  总测试数: ${results.length}`);
  console.log(`  ✅ 通过: ${passed}`);
  console.log(`  ❌ 失败: ${failed}`);
  console.log(`  ⏱️ 耗时: ${duration}ms`);
  console.log('═══════════════════════════════════════════');

  if (failed > 0) {
    console.log('\n❌ 失败详情:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  }

  return { passed, failed, total: results.length, duration };
}

// 运行测试
if (require.main === module) {
  runTests().then(report => {
    process.exit(report.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error('测试运行失败:', err);
    process.exit(1);
  });
}

module.exports = { runTests, TEST_SUITES };

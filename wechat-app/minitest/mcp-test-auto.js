/**
 * 微信小程序 MCP 自动化测试 - 自动查找端口
 */

const automator = require('miniprogram-automator');

const PORTS = [9420, 9421, 9422, 9222, 9223, 9229, 9333];

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
  const page = await miniProgram.navigateTo('/pages/favorites/favorites');
  await page.waitFor(1500);
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

async function tryConnect(port) {
  const wsEndpoint = `ws://127.0.0.1:${port}`;
  try {
    const miniProgram = await automator.connect({ wsEndpoint, timeout: 5000 });
    return { success: true, miniProgram, port };
  } catch (error) {
    return { success: false, error: error.message, port };
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 MCP 自动化测试 (自动查找端口)');
  console.log('═══════════════════════════════════════════\n');

  console.log('💡 正在扫描可用端口...');
  console.log(`   尝试端口: ${PORTS.join(', ')}\n`);

  let miniProgram = null;
  let connectedPort = null;

  // 尝试所有端口
  for (const port of PORTS) {
    process.stdout.write(`   尝试端口 ${port}... `);
    const result = await tryConnect(port);
    if (result.success) {
      console.log('✅ 成功!');
      miniProgram = result.miniProgram;
      connectedPort = port;
      break;
    } else {
      console.log('❌');
    }
  }

  if (!miniProgram) {
    console.error('\n❌ 无法连接到任何端口');
    console.error('\n💡 请确保：');
    console.error('   1. 微信开发者工具已打开');
    console.error('   2. 项目已编译完成');
    console.error('   3. 已点击「工具」→「自动化测试」');
    console.error('\n如果开发者工具已经打开，请尝试重启它。');
    process.exit(1);
  }

  console.log(`\n✅ 已连接到 ws://127.0.0.1:${connectedPort}\n`);

  const results = [];
  const startTime = Date.now();

  try {
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
  } finally {
    if (miniProgram) {
      await miniProgram.close();
      console.log('\n📡 已断开连接（开发者工具保持运行）');
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
    console.log('\n═══════════════════════════════════════════');
    if (report.failed === 0) {
      console.log('  🎉 所有测试通过！');
    } else {
      console.log('  ⚠️ 部分测试失败');
    }
    console.log('═══════════════════════════════════════════');
    process.exit(report.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error('测试运行失败:', err);
    process.exit(1);
  });
}

module.exports = { runTests, TEST_SUITES };

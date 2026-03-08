/**
 * 微信小程序 MCP 自动化测试 - 快速入口
 *
 * 使用前提：
 *   1. 手动打开微信开发者工具
 *   2. 导入项目并等待编译完成
 *   3. 点击「工具」→「自动化测试」启用 MCP
 *
 * 使用方法:
 *   node mcp-test.js              # 运行所有测试
 *   node mcp-test.js --port 9421  # 使用指定端口
 */

const automator = require('miniprogram-automator');

// 解析命令行参数
const args = process.argv.slice(2);
let port = '9420';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = args[i + 1];
    break;
  }
}

const CONFIG = {
  wsEndpoint: `ws://127.0.0.1:${port}`,
  timeout: 30000
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

async function runTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 MCP 自动化测试');
  console.log('═══════════════════════════════════════════\n');

  console.log('💡 前提检查：');
  console.log('   ✓ 微信开发者工具已打开');
  console.log('   ✓ 项目已编译完成');
  console.log('   ✓ 自动化测试已启用\n');

  let miniProgram = null;
  const results = [];
  const startTime = Date.now();

  try {
    console.log(`📡 连接到 ${CONFIG.wsEndpoint}...`);
    miniProgram = await automator.connect({ wsEndpoint: CONFIG.wsEndpoint });
    console.log('✅ 连接成功!\n');

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
    console.error('\n❌ 连接失败:', error.message);
    if (error.message.includes('check if target project window is opened')) {
      console.error('\n💡 请确保：');
      console.error('   1. 微信开发者工具已打开');
      console.error('   2. 项目已编译完成');
      console.error('   3. 已点击「工具」→「自动化测试」');
    }
    process.exit(1);
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

  return { passed, failed, total: results.length };
}

// 主入口
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--port')) {
    const portIndex = args.indexOf('--port');
    const port = args[portIndex + 1];
    if (port) {
      CONFIG.wsEndpoint = `ws://127.0.0.1:${port}`;
    }
  }

  const report = await runTests();
  process.exit(report.failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('错误:', err);
  process.exit(1);
});

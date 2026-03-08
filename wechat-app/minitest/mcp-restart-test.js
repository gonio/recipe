/**
 * MCP 自动化测试 - 重启并测试（确保自动编译）
 * 使用 cli quit 优雅关闭，然后重新启动
 *
 * 使用方法:
 *   node mcp-restart-test.js
 */

const { spawn, exec } = require('child_process');
const util = require('util');
const automator = require('miniprogram-automator');

const execAsync = util.promisify(exec);

const CONFIG = {
  projectPath: 'D:\\recipe\\recipe-miniapp\\wechat-app',
  cliPath: 'E:\\微信web开发者工具\\cli.bat',
  port: 9420,
  launchWaitTime: 25000
};

const TEST_SUITES = [
  { name: '首页加载', fn: testHomePage },
  { name: '市场页面', fn: testMarketPage },
  { name: '推荐页面', fn: testRecommendPage },
  { name: '个人中心', fn: testProfilePage }
];

async function testHomePage(mp) {
  const page = await mp.reLaunch('/pages/index/index');
  await page.waitFor(2000);
  return { passed: true, message: '首页加载成功' };
}

async function testMarketPage(mp) {
  const page = await mp.switchTab('/pages/market/market');
  await page.waitFor(1500);
  return { passed: true, message: '市场页面加载成功' };
}

async function testRecommendPage(mp) {
  const page = await mp.switchTab('/pages/recommend/recommend');
  await page.waitFor(1500);
  return { passed: true, message: '推荐页面加载成功' };
}

async function testProfilePage(mp) {
  const page = await mp.switchTab('/pages/profile/profile');
  await page.waitFor(1500);
  return { passed: true, message: '个人中心加载成功' };
}

/**
 * 优雅关闭开发者工具（使用 cli quit）
 */
async function gracefulShutdown() {
  console.log('📡 尝试优雅关闭开发者工具...');
  try {
    await execAsync(`"${CONFIG.cliPath}" quit`);
    console.log('   ✓ 已发送关闭命令');
    await new Promise(r => setTimeout(r, 5000));
  } catch (e) {
    console.log('   ⚠️ 优雅关闭失败，使用强制关闭');
    try {
      await execAsync('taskkill /F /IM wechatdevtools.exe 2>nul');
      await new Promise(r => setTimeout(r, 3000));
    } catch (e2) {
      // ignore
    }
  }
}

async function run() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 MCP 自动化测试（重启并测试）');
  console.log('═══════════════════════════════════════════\n');

  const startTime = Date.now();
  const results = [];
  let miniProgram = null;
  let childProcess = null;

  try {
    // 1. 先关闭已运行的实例
    await gracefulShutdown();

    // 2. 启动新的实例（会自动编译）
    console.log('\n📡 启动开发者工具（将自动编译）...');
    childProcess = spawn(CONFIG.cliPath, [
      'auto',
      '--project', CONFIG.projectPath,
      '--auto-port', String(CONFIG.port)
    ], {
      stdio: 'pipe',
      shell: true
    });

    childProcess.stdout.on('data', (data) => process.stdout.write(data));
    childProcess.stderr.on('data', (data) => process.stderr.write(data));

    // 3. 等待编译
    console.log(`\n⏳ 等待 ${CONFIG.launchWaitTime/1000} 秒让项目编译...`);
    await new Promise(r => setTimeout(r, CONFIG.launchWaitTime));

    // 4. 连接
    console.log('\n📡 连接到自动化服务...');
    miniProgram = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${CONFIG.port}`,
      timeout: 10000
    });
    console.log('✅ 连接成功!\n');

    // 5. 运行测试
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
    console.error('\n❌ 失败:', error.message);
    process.exit(1);

  } finally {
    if (miniProgram) {
      await miniProgram.close();
      console.log('\n📡 已断开连接');
    }
    // 保持开发者工具运行
  }

  // 报告
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

  process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
  run();
}

module.exports = { run };

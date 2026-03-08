/**
 * MCP 自动化测试 - 单次启动自动编译版
 * 只用 cli open 启动，避免重复启动导致不编译
 *
 * 使用方法:
 *   node mcp-single-launch.js
 */

const { spawn, exec } = require('child_process');
const util = require('util');
const automator = require('miniprogram-automator');

const execAsync = util.promisify(exec);

const CONFIG = {
  projectPath: 'D:\\recipe\\recipe-miniapp\\wechat-app',
  cliPath: 'E:\\微信web开发者工具\\cli.bat',
  port: 9420,
  launchWaitTime: 25000  // 等待编译和自动化服务就绪
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

async function run() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 MCP 自动化测试 (单次启动版)');
  console.log('═══════════════════════════════════════════\n');

  // 先关闭已运行的开发者工具，确保能自动编译
  console.log('📡 关闭已运行的开发者工具...');
  try {
    await execAsync('taskkill /F /IM wechatdevtools.exe 2>nul');
    console.log('   ✓ 已关闭旧实例');
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    console.log('   ✓ 没有已运行的实例');
  }

  let childProcess = null;
  let miniProgram = null;
  const startTime = Date.now();
  const results = [];

  try {
    // 只用 cli auto 一次性启动（带 --auto-port）
    console.log('📡 启动开发者工具并启用自动化...');
    console.log('   这将自动编译项目并开启调试端口\n');

    childProcess = spawn(CONFIG.cliPath, [
      'auto',
      '--project', CONFIG.projectPath,
      '--auto-port', String(CONFIG.port)
    ], {
      stdio: 'pipe',
      shell: true
    });

    let hasCompiled = false;
    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(data);
      // 检测编译完成的标志
      if (output.includes('Compiled') || output.includes('编译')) {
        hasCompiled = true;
      }
    });
    childProcess.stderr.on('data', (data) => process.stderr.write(data));

    // 等待编译和自动化服务就绪
    console.log(`⏳ 等待 ${CONFIG.launchWaitTime/1000} 秒...`);
    console.log('   (等待项目编译和自动化服务启动)\n');
    await new Promise(r => setTimeout(r, CONFIG.launchWaitTime));

    // 连接测试
    console.log('📡 连接到自动化服务...');
    miniProgram = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${CONFIG.port}`,
      timeout: 10000
    });
    console.log('✅ 连接成功!\n');

    // 运行测试
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
    if (error.message.includes('WebSocket')) {
      console.error('\n💡 可能原因：');
      console.error('   1. 自动化服务尚未就绪，请增加等待时间');
      console.error('   2. 端口被占用');
    }
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

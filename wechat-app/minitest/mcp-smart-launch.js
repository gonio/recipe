/**
 * MCP 自动化测试 - 智能启动版
 * 检测现有实例，避免重复启动导致不编译
 *
 * 使用方法:
 *   node mcp-smart-launch.js
 */

const { spawn, exec } = require('child_process');
const util = require('util');
const automator = require('miniprogram-automator');

const execAsync = util.promisify(exec);

const CONFIG = {
  projectPath: 'D:\\recipe\\recipe-miniapp\\wechat-app',
  cliPath: 'E:\\微信web开发者工具\\cli.bat',
  port: 9420,
  launchWaitTime: 20000
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
 * 检查开发者工具是否已运行
 */
async function isDevToolsRunning() {
  try {
    const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq wechatdevtools.exe" /NH');
    return stdout.toLowerCase().includes('wechatdevtools.exe');
  } catch (e) {
    return false;
  }
}

/**
 * 尝试连接现有实例
 */
async function tryConnect() {
  try {
    const mp = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${CONFIG.port}`,
      timeout: 5000
    });
    return { success: true, miniProgram: mp };
  } catch (e) {
    return { success: false, error: e };
  }
}

async function run() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 MCP 自动化测试 (智能启动版)');
  console.log('═══════════════════════════════════════════\n');

  const startTime = Date.now();
  const results = [];
  let miniProgram = null;
  let childProcess = null;

  try {
    // 1. 先尝试连接现有实例
    console.log('📡 检查现有自动化服务...');
    const connectResult = await tryConnect();

    if (connectResult.success) {
      console.log('   ✅ 已连接到现有实例\n');
      miniProgram = connectResult.miniProgram;
    } else {
      // 2. 检查开发者工具是否已运行
      const isRunning = await isDevToolsRunning();

      if (isRunning) {
        console.log('   ⚠️ 开发者工具已在运行但未开启自动化');
        console.log('   💡 请手动点击「工具」→「自动化测试」启用');
        console.log('   或者关闭开发者工具后重新运行此脚本\n');
        process.exit(1);
      }

      // 3. 启动新的开发者工具实例
      console.log('   启动新的开发者工具...\n');

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

      // 等待编译和服务就绪
      console.log(`⏳ 等待 ${CONFIG.launchWaitTime/1000} 秒让项目编译...\n`);
      await new Promise(r => setTimeout(r, CONFIG.launchWaitTime));

      // 4. 连接
      console.log('📡 连接到自动化服务...');
      miniProgram = await automator.connect({
        wsEndpoint: `ws://127.0.0.1:${CONFIG.port}`,
        timeout: 10000
      });
      console.log('   ✅ 连接成功!\n');
    }

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
    if (error.message.includes('check if target project window is opened')) {
      console.error('\n💡 项目尚未编译完成，请增加等待时间');
    }
    process.exit(1);

  } finally {
    if (miniProgram) {
      await miniProgram.close();
      console.log('\n📡 已断开连接（开发者工具保持运行）');
    }
    // 不关闭 childProcess，让开发者工具保持运行
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

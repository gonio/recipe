/**
 * MCP 自动化测试 - 自动编译启动脚本
 * 确保每次都能自动编译：先关闭旧实例，再重新打开
 *
 * 使用方法:
 *   node mcp-auto-launch.js
 */

const { spawn, exec } = require('child_process');
const util = require('util');
const automator = require('miniprogram-automator');

const execAsync = util.promisify(exec);

const CONFIG = {
  projectPath: 'D:\\recipe\\recipe-miniapp\\wechat-app',
  cliPath: 'E:\\微信web开发者工具\\cli.bat',
  port: 9420,
  launchWaitTime: 20000,  // 等待编译时间
  autoWaitTime: 10000     // 等待自动化服务启动时间
};

const TEST_SUITES = [
  { name: '首页加载', fn: testHomePage },
  { name: '市场页面', fn: testMarketPage },
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

/**
 * 关闭已运行的微信开发者工具
 */
async function closeDevTools() {
  console.log('📡 检查并关闭已运行的开发者工具...');
  try {
    // Windows: 查找并关闭微信开发者工具进程
    await execAsync('taskkill /F /IM wechatdevtools.exe 2>nul');
    console.log('   ✓ 已关闭旧实例');
    // 等待进程完全退出
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    // 如果没有运行，会报错，这是正常的
    console.log('   ✓ 没有已运行的实例');
  }
}

/**
 * 使用 cli open 打开项目（会自动编译）
 */
async function openProject() {
  console.log('\n📡 Step 1: 打开项目并自动编译...');

  return new Promise((resolve, reject) => {
    const process = spawn(CONFIG.cliPath, [
      'open',
      '--project', CONFIG.projectPath
    ], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    process.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });
    process.stderr.on('data', (data) => process.stderr.write(data));

    // 5秒后认为启动命令已发送
    setTimeout(() => {
      console.log(`   ✓ 启动命令已发送`);
      resolve({ process, output });
    }, 5000);
  });
}

/**
 * 等待编译完成
 */
async function waitForCompilation() {
  console.log(`\n⏳ Step 2: 等待 ${CONFIG.launchWaitTime/1000} 秒让项目编译...`);
  await new Promise(r => setTimeout(r, CONFIG.launchWaitTime));
  console.log('   ✓ 编译应该已完成');
}

/**
 * 启动自动化服务
 */
async function startAutoService() {
  console.log('\n📡 Step 3: 启动自动化测试服务...');

  return new Promise((resolve, reject) => {
    const process = spawn(CONFIG.cliPath, [
      'auto',
      '--project', CONFIG.projectPath,
      '--auto-port', String(CONFIG.port)
    ], {
      stdio: 'pipe',
      shell: true,
      detached: true
    });

    process.stdout.on('data', (data) => process.stdout.write(data));
    process.stderr.on('data', (data) => process.stderr.write(data));

    // 5秒后认为启动命令已发送
    setTimeout(() => {
      console.log(`   ✓ 自动化服务启动命令已发送`);
      resolve(process);
    }, 5000);
  });
}

/**
 * 等待自动化服务就绪
 */
async function waitForAutoService() {
  console.log(`\n⏳ Step 4: 等待 ${CONFIG.autoWaitTime/1000} 秒让服务就绪...`);
  await new Promise(r => setTimeout(r, CONFIG.autoWaitTime));
}

/**
 * 连接并运行测试
 */
async function connectAndTest() {
  console.log('\n📡 Step 5: 连接到自动化服务...');

  let miniProgram = null;
  const results = [];

  try {
    miniProgram = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${CONFIG.port}`,
      timeout: 10000
    });
    console.log('   ✅ 连接成功!\n');

    // 运行测试
    for (const suite of TEST_SUITES) {
      console.log(`🧪 ${suite.name}`);
      try {
        const result = await suite.fn(miniProgram);
        results.push({ name: suite.name, ...result });
        console.log(`   ✅ ${result.message}`);
      } catch (error) {
        console.log(`   ❌ ${error.message}`);
        results.push({ name: suite.name, passed: false, message: error.message });
      }
    }

    return { success: true, results, miniProgram };

  } catch (error) {
    return { success: false, error, results, miniProgram };
  }
}

/**
 * 主流程
 */
async function run() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 MCP 自动化测试 (自动编译版)');
  console.log('═══════════════════════════════════════════\n');

  const startTime = Date.now();
  let openProcess = null;
  let autoProcess = null;
  let miniProgram = null;

  try {
    // 1. 关闭已运行的实例
    await closeDevTools();

    // 2. 打开项目（会自动编译）
    const { process } = await openProject();
    openProcess = process;

    // 3. 等待编译
    await waitForCompilation();

    // 4. 启动自动化服务
    autoProcess = await startAutoService();

    // 5. 等待服务就绪
    await waitForAutoService();

    // 6. 连接并测试
    const testResult = await connectAndTest();
    miniProgram = testResult.miniProgram;

    if (!testResult.success) {
      throw testResult.error;
    }

    // 打印报告
    const duration = Date.now() - startTime;
    const passed = testResult.results.filter(r => r.passed).length;
    const failed = testResult.results.filter(r => !r.passed).length;

    console.log('\n═══════════════════════════════════════════');
    console.log('  📊 测试报告');
    console.log('═══════════════════════════════════════════');
    console.log(`  总测试数: ${testResult.results.length}`);
    console.log(`  ✅ 通过: ${passed}`);
    console.log(`  ❌ 失败: ${failed}`);
    console.log(`  ⏱️ 耗时: ${duration}ms`);
    console.log('═══════════════════════════════════════════');

    if (failed === 0) {
      console.log('\n🎉 所有测试通过！');
    }

  } catch (error) {
    console.error('\n❌ 失败:', error.message);
    process.exit(1);

  } finally {
    // 清理
    if (miniProgram) {
      await miniProgram.close();
      console.log('\n📡 已断开连接');
    }
    if (autoProcess) {
      autoProcess.kill();
    }
    // 注意：不关闭 openProcess，让开发者工具保持运行
  }
}

// 运行
if (require.main === module) {
  run().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('运行失败:', err);
    process.exit(1);
  });
}

module.exports = { run };

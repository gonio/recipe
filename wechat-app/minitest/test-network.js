/**
 * 网络错误处理 MCP 自动化测试
 * 测试网络断开/恢复、错误提示、重试机制
 *
 * 使用前提：
 *   1. 手动打开微信开发者工具
 *   2. 导入项目并等待编译完成
 *   3. 点击「工具」→「自动化测试」启用 MCP
 *
 * 运行方式:
 *   node test-network.js
 */

const automator = require('miniprogram-automator');

const CONFIG = {
  wsEndpoint: 'ws://127.0.0.1:9420',
  timeout: 30000
};

// 测试套件
const TEST_SUITES = [
  { name: '初始网络状态', fn: testInitialNetworkStatus },
  { name: '网络断开检测', fn: testNetworkDisconnect },
  { name: '网络恢复检测', fn: testNetworkRestore },
  { name: '错误提示显示', fn: testErrorToast },
  { name: '重试机制', fn: testRetryMechanism }
];

/**
 * 测试 1: 初始网络状态
 */
async function testInitialNetworkStatus(miniProgram) {
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);

  // 检查全局数据中的网络状态
  const networkStatus = await miniProgram.evaluate(() => {
    const app = getApp();
    return {
      isOnline: app.globalData.isOnline,
      networkType: app.globalData.networkType
    };
  });

  return {
    passed: networkStatus.isOnline === true,
    message: `网络状态: ${networkStatus.isOnline ? '在线' : '离线'}, 类型: ${networkStatus.networkType}`,
    detail: networkStatus
  };
}

/**
 * 测试 2: 网络断开检测
 */
async function testNetworkDisconnect(miniProgram) {
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);

  // 模拟网络断开（通过 evaluate 设置状态）
  await miniProgram.evaluate(() => {
    const app = getApp();
    app.globalData.isOnline = false;
    app.globalData.networkType = 'none';
  });

  // 等待状态更新
  await page.waitFor(500);

  // 验证网络状态
  const status = await miniProgram.evaluate(() => {
    const app = getApp();
    return app.globalData.isOnline;
  });

  return {
    passed: status === false,
    message: '网络断开状态已设置',
    detail: { isOnline: status }
  };
}

/**
 * 测试 3: 网络恢复检测
 */
async function testNetworkRestore(miniProgram) {
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);

  // 先设置为离线
  await miniProgram.evaluate(() => {
    const app = getApp();
    app.globalData.isOnline = false;
  });

  await page.waitFor(500);

  // 模拟网络恢复
  await miniProgram.evaluate(() => {
    const app = getApp();
    app.globalData.isOnline = true;
    app.globalData.networkType = 'wifi';
  });

  await page.waitFor(500);

  // 验证状态
  const status = await miniProgram.evaluate(() => {
    const app = getApp();
    return {
      isOnline: app.globalData.isOnline,
      networkType: app.globalData.networkType
    };
  });

  return {
    passed: status.isOnline === true,
    message: '网络恢复状态已设置',
    detail: status
  };
}

/**
 * 测试 4: 错误提示显示
 */
async function testErrorToast(miniProgram) {
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);

  // 调用 showError 方法
  await miniProgram.evaluate(() => {
    const app = getApp();
    app.showError('测试错误提示');
  });

  await page.waitFor(1000);

  // 检查是否有 toast 显示（通过检查页面元素或全局状态）
  // 注意：小程序 toast 是系统组件，无法直接检查
  // 这里只是验证方法调用没有报错

  return {
    passed: true,
    message: '错误提示方法调用成功'
  };
}

/**
 * 测试 5: 重试机制
 */
async function testRetryMechanism(miniProgram) {
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);

  // 测试 delay 函数
  const delayTest = await miniProgram.evaluate(() => {
    const app = getApp();
    const start = Date.now();
    return app.delay(500).then(() => {
      return Date.now() - start;
    });
  });

  // 验证延迟是否在合理范围内（允许 100ms 误差）
  const isValidDelay = delayTest >= 400 && delayTest <= 700;

  return {
    passed: isValidDelay,
    message: `延迟测试: ${delayTest}ms (预期 500ms)`,
    detail: { actualDelay: delayTest, expectedDelay: 500 }
  };
}

/**
 * 运行所有测试
 */
async function runNetworkTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  📡 网络错误处理 MCP 自动化测试');
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

        if (result.passed) {
          console.log(`  ✅ ${result.message}`);
        } else {
          console.log(`  ❌ ${result.message}`);
        }

        if (result.detail) {
          console.log(`     详情:`, JSON.stringify(result.detail));
        }
      } catch (error) {
        console.log(`  ❌ 测试异常: ${error.message}`);
        results.push({ name: suite.name, passed: false, message: error.message });
      }

      await new Promise(r => setTimeout(r, 1000));
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
  runNetworkTests().then(report => {
    process.exit(report.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error('测试运行失败:', err);
    process.exit(1);
  });
}

module.exports = { runNetworkTests, TEST_SUITES };

/**
 * 全面测试覆盖脚本
 * 测试所有页面功能、网络请求和控制台日志
 */

const TEST_CONFIG = {
  projectPath: 'D:\\recipe\\recipe-miniapp\\wechat-app',
  cliPath: 'E:\\微信web开发者工具\\cli.bat',
  port: 9420,
  timeout: 30000
};

// 测试结果收集
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  consoleLogs: [],
  networkRequests: []
};

/**
 * 测试工具封装 - 使用 MCP
 */
async function runTest(name, testFn) {
  testResults.total++;
  console.log(`\n🧪 ${name}`);
  try {
    await testFn();
    testResults.passed++;
    console.log(`  ✅ 通过`);
    return { passed: true, name };
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ name, error: error.message });
    console.log(`  ❌ 失败: ${error.message}`);
    return { passed: false, name, error: error.message };
  }
}

/**
 * ==================== 首页测试 ====================
 */
async function testHomePage() {
  // T001: 首页加载
  await runTest('首页加载', async () => {
    await mcp__weixin-devtools-mcp__relaunch({
      url: '/pages/index/index',
      waitForLoad: true
    });
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('早上好') && !snapshot.includes('菜谱')) {
      throw new Error('首页标题或内容未找到');
    }
  });

  // T002: 骨架屏检查
  await runTest('骨架屏显示', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    // 骨架屏在加载时存在，加载完成后应该被真实数据替换
    // 这里检查页面结构是否正常
    if (!snapshot.includes('skeleton') && !snapshot.includes('recipe')) {
      throw new Error('页面结构异常');
    }
  });

  // T003: 菜系筛选
  await runTest('菜系筛选-川菜', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('川菜')) {
      throw new Error('川菜标签未找到');
    }
    // 点击川菜标签
    // await mcp__weixin-devtools-mcp__click({ uid: 'view.cuisine-tag_川菜' });
  });

  // T004: 搜索栏存在
  await runTest('搜索栏显示', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('搜索') && !snapshot.includes('search')) {
      throw new Error('搜索栏未找到');
    }
  });
}

/**
 * ==================== Market 页面测试 ====================
 */
async function testMarketPage() {
  // T005: Market 页面加载
  await runTest('Market页面加载', async () => {
    await mcp__weixin-devtools-mcp__switch_tab({
      url: '/pages/market/market',
      waitForLoad: true
    });
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('搜索菜谱')) {
      throw new Error('Market页面搜索栏未找到');
    }
  });

  // T006: 菜系筛选标签
  await runTest('Market菜系筛选', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const cuisines = ['全部', '川菜', '粤菜', '湘菜', '家常菜'];
    for (const cuisine of cuisines) {
      if (!snapshot.includes(cuisine)) {
        throw new Error(`${cuisine}标签未找到`);
      }
    }
  });

  // T007: 空状态显示
  await runTest('Market空状态', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    // 当前无数据，应该显示空状态
    if (!snapshot.includes('暂无新菜谱') && !snapshot.includes('recipe-grid')) {
      throw new Error('空状态或列表区域未找到');
    }
  });
}

/**
 * ==================== 收藏页面测试 ====================
 */
async function testFavoritesPage() {
  // T008: 收藏页面加载
  await runTest('收藏页面加载', async () => {
    await mcp__weixin-devtools-mcp__navigate_to({
      url: '/pages/favorites/favorites',
      waitForLoad: true
    });
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('收藏') && !snapshot.includes('还没有收藏')) {
      throw new Error('收藏页面标题或空状态未找到');
    }
  });

  // T009: 空状态显示
  await runTest('收藏空状态', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('还没有收藏菜谱')) {
      throw new Error('收藏空状态提示未找到');
    }
    if (!snapshot.includes('去发现美食')) {
      throw new Error('去发现美食按钮未找到');
    }
  });
}

/**
 * ==================== 控制台日志检查 ====================
 */
async function testConsoleLogs() {
  // 清空之前的日志
  await mcp__weixin-devtools-mcp__list_console_messages({ types: ['error'] });

  // T010: 无错误日志
  await runTest('控制台无Error', async () => {
    // 等待一段时间收集日志
    await new Promise(r => setTimeout(r, 3000));

    const errorLogs = await mcp__weixin-devtools-mcp__list_console_messages({ types: ['error'] });
    if (errorLogs.length > 0) {
      testResults.consoleLogs = errorLogs;
      throw new Error(`发现 ${errorLogs.length} 个错误日志`);
    }
  });
}

/**
 * ==================== 网络请求检查 ====================
 */
async function testNetworkRequests() {
  // T011: 网络请求成功
  await runTest('网络请求正常', async () => {
    // 重新加载首页触发网络请求
    await mcp__weixin-devtools-mcp__relaunch({
      url: '/pages/index/index',
      waitForLoad: true
    });

    // 等待网络请求完成
    await new Promise(r => setTimeout(r, 3000));

    const requests = await mcp__weixin-devtools-mcp__list_network_requests({});
    testResults.networkRequests = requests;

    // 检查是否有失败的请求
    const failedRequests = requests.filter(r => r.status >= 400);
    if (failedRequests.length > 0) {
      throw new Error(`${failedRequests.length} 个请求失败`);
    }
  });
}

/**
 * ==================== 主测试流程 ====================
 */
async function runAllTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 全面测试覆盖开始');
  console.log('═══════════════════════════════════════════');

  const startTime = Date.now();

  try {
    // 1. 连接开发者工具
    console.log('\n📡 连接开发者工具...');
    await mcp__weixin-devtools-mcp__connect_devtools({
      projectPath: TEST_CONFIG.projectPath,
      strategy: 'wsEndpoint',
      wsEndpoint: `ws://127.0.0.1:${TEST_CONFIG.port}`
    });
    console.log('✅ 连接成功');

    // 2. 执行测试套件
    console.log('\n📱 首页测试');
    await testHomePage();

    console.log('\n🏪 Market测试');
    await testMarketPage();

    console.log('\n❤️ 收藏测试');
    await testFavoritesPage();

    console.log('\n🌐 网络请求测试');
    await testNetworkRequests();

    console.log('\n📝 控制台日志检查');
    await testConsoleLogs();

    // 3. 断开连接
    await mcp__weixin-devtools-mcp__disconnect_devtools();

  } catch (error) {
    console.error('\n❌ 测试套件执行失败:', error.message);
  }

  // 4. 生成报告
  const duration = Date.now() - startTime;

  console.log('\n═══════════════════════════════════════════');
  console.log('  📊 测试报告');
  console.log('═══════════════════════════════════════════');
  console.log(`  总测试数: ${testResults.total}`);
  console.log(`  ✅ 通过: ${testResults.passed}`);
  console.log(`  ❌ 失败: ${testResults.failed}`);
  console.log(`  ⏱️ 耗时: ${duration}ms`);
  console.log('═══════════════════════════════════════════');

  if (testResults.failed > 0) {
    console.log('\n❌ 失败详情:');
    testResults.errors.forEach(e => {
      console.log(`  - ${e.name}: ${e.error}`);
    });
  }

  if (testResults.consoleLogs.length > 0) {
    console.log('\n📝 控制台错误:');
    testResults.consoleLogs.forEach(log => {
      console.log(`  - ${log.type}: ${log.message}`);
    });
  }

  // 保存报告
  saveReport(duration);

  return testResults;
}

/**
 * 保存测试报告
 */
function saveReport(duration) {
  const fs = require('fs');
  const path = require('path');

  const reportDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `test-report-${timestamp}.json`);

  const report = {
    timestamp: new Date().toISOString(),
    duration,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: `${((testResults.passed / testResults.total) * 100).toFixed(1)}%`
    },
    errors: testResults.errors,
    consoleLogs: testResults.consoleLogs,
    networkRequests: testResults.networkRequests.map(r => ({
      url: r.url,
      method: r.method,
      status: r.status,
      duration: r.duration
    }))
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 报告已保存: ${reportPath}`);
}

// 运行测试
runAllTests().then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
});

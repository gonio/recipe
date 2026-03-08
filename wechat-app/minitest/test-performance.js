/**
 * 性能测试 MCP 自动化测试
 * 测试页面加载时间 < 2s 目标
 *
 * 使用前提：
 *   1. 手动打开微信开发者工具
 *   2. 导入项目并等待编译完成
 *   3. 点击「工具」→「自动化测试」启用 MCP
 *
 * 运行方式:
 *   node test-performance.js
 */

const automator = require('miniprogram-automator');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  wsEndpoint: 'ws://127.0.0.1:9420',
  reportDir: path.join(__dirname, '../reports'),
  // 性能目标：< 2s
  maxLoadTime: 2000,
  maxActionTime: 300
};

// 测试页面列表
const TEST_PAGES = [
  { name: '首页', path: '/pages/index/index', type: 'reLaunch' },
  { name: '市场页面', path: '/pages/market/market', type: 'switchTab' },
  { name: '收藏页面', path: '/pages/favorites/favorites', type: 'navigateTo' },
  { name: '推荐页面', path: '/pages/recommend/recommend', type: 'switchTab' },
  { name: '个人中心', path: '/pages/profile/profile', type: 'switchTab' },
  { name: '搜索页面', path: '/pages/search/search', type: 'navigateTo' }
];

/**
 * 测试单个页面加载性能
 */
async function testPageLoad(miniProgram, pageConfig) {
  const startTime = Date.now();

  // 根据页面类型选择导航方式
  if (pageConfig.type === 'reLaunch') {
    await miniProgram.reLaunch(pageConfig.path);
  } else if (pageConfig.type === 'switchTab') {
    await miniProgram.switchTab(pageConfig.path);
  } else {
    await miniProgram.navigateTo(pageConfig.path);
  }

  // 等待页面基本渲染
  const page = await miniProgram.currentPage();
  await page.waitFor(500);

  const loadTime = Date.now() - startTime;
  const passed = loadTime < CONFIG.maxLoadTime;

  return {
    name: pageConfig.name,
    path: pageConfig.path,
    loadTime,
    passed,
    target: CONFIG.maxLoadTime
  };
}

/**
 * 测试数据加载性能
 */
async function testDataLoad(miniProgram) {
  await miniProgram.reLaunch('/pages/index/index');

  // 记录开始时间
  const startTime = Date.now();

  // 等待数据加载完成（通过检查页面数据）
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    // 使用 miniProgram.evaluate 执行小程序代码
    const hasData = await miniProgram.evaluate(() => {
      const pages = getCurrentPages();
      if (pages.length === 0) return false;
      const currentPage = pages[0];
      const data = currentPage.data;
      // 检查是否有菜谱数据或加载完成标志
      return (data.recipes && data.recipes.length > 0) || data.loading === false;
    });

    if (hasData) {
      break;
    }

    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }

  const dataLoadTime = Date.now() - startTime;
  const passed = dataLoadTime < CONFIG.maxLoadTime;

  return {
    name: '数据加载',
    loadTime: dataLoadTime,
    passed,
    target: CONFIG.maxLoadTime,
    attempts
  };
}

/**
 * 测试页面切换性能
 */
async function testPageSwitch(miniProgram) {
  const results = [];

  // 测试 Tab 切换性能
  const tabPages = [
    { name: '市场Tab', path: '/pages/market/market' },
    { name: '推荐Tab', path: '/pages/recommend/recommend' },
    { name: '个人Tab', path: '/pages/profile/profile' }
  ];

  // 先回到首页
  await miniProgram.reLaunch('/pages/index/index');
  await new Promise(r => setTimeout(r, 1000));

  for (const tab of tabPages) {
    const startTime = Date.now();
    await miniProgram.switchTab(tab.path);
    await new Promise(r => setTimeout(r, 200)); // 基本渲染时间

    const switchTime = Date.now() - startTime;
    const passed = switchTime < CONFIG.maxActionTime;

    results.push({
      name: `${tab.name}切换`,
      loadTime: switchTime,
      passed,
      target: CONFIG.maxActionTime
    });

    await new Promise(r => setTimeout(r, 500));
  }

  return results;
}

/**
 * 测试内存使用（近似）
 */
async function testMemoryUsage(miniProgram) {
  // 获取页面栈信息
  const pageStack = await miniProgram.evaluate(() => {
    return getCurrentPages().length;
  });

  return {
    name: '页面栈深度',
    value: pageStack,
    passed: pageStack <= 5, // 页面栈不应过深
    target: '<= 5'
  };
}

/**
 * 生成性能报告
 */
function generateReport(results) {
  const duration = results.reduce((sum, r) => sum + (r.loadTime || 0), 0);
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  // 找出最慢的页面
  const sortedByTime = [...results]
    .filter(r => r.loadTime)
    .sort((a, b) => b.loadTime - a.loadTime);

  const slowest = sortedByTime[0];
  const fastest = sortedByTime[sortedByTime.length - 1];

  return {
    summary: {
      total: results.length,
      passed,
      failed,
      duration,
      averageTime: Math.round(duration / results.filter(r => r.loadTime).length)
    },
    slowest,
    fastest,
    allResults: results
  };
}

/**
 * 保存报告
 */
function saveReport(report) {
  if (!fs.existsSync(CONFIG.reportDir)) {
    fs.mkdirSync(CONFIG.reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(CONFIG.reportDir, `performance-report-${timestamp}.json`);

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return reportPath;
}

/**
 * 运行所有性能测试
 */
async function runPerformanceTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  ⚡ 性能测试 (<2s 加载目标)');
  console.log('═══════════════════════════════════════════\n');

  console.log('💡 前提检查：');
  console.log('   ✓ 微信开发者工具已打开');
  console.log('   ✓ 项目已编译完成');
  console.log('   ✓ 自动化测试已启用\n');

  console.log(`🎯 性能目标：页面加载 < ${CONFIG.maxLoadTime}ms\n`);

  let miniProgram = null;
  const allResults = [];
  const startTime = Date.now();

  try {
    console.log(`📡 连接到 ${CONFIG.wsEndpoint}...`);
    miniProgram = await automator.connect({ wsEndpoint: CONFIG.wsEndpoint });
    console.log('✅ 连接成功!\n');

    // 测试 1: 各页面加载时间
    console.log('🧪 测试页面加载时间...');
    for (const pageConfig of TEST_PAGES) {
      process.stdout.write(`   ${pageConfig.name}... `);
      try {
        const result = await testPageLoad(miniProgram, pageConfig);
        allResults.push(result);

        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.loadTime}ms`);
      } catch (error) {
        console.log(`❌ 错误: ${error.message}`);
        allResults.push({
          name: pageConfig.name,
          passed: false,
          error: error.message
        });
      }
    }

    // 测试 2: 数据加载性能
    console.log('\n🧪 测试数据加载性能...');
    process.stdout.write('   首页数据加载... ');
    const dataResult = await testDataLoad(miniProgram);
    allResults.push(dataResult);
    const dataStatus = dataResult.passed ? '✅' : '❌';
    console.log(`${dataStatus} ${dataResult.loadTime}ms (${dataResult.attempts} 次检查)`);

    // 测试 3: 页面切换性能
    console.log('\n🧪 测试页面切换性能...');
    const switchResults = await testPageSwitch(miniProgram);
    for (const result of switchResults) {
      allResults.push(result);
      const status = result.passed ? '✅' : '❌';
      console.log(`   ${result.name}... ${status} ${result.loadTime}ms`);
    }

    // 测试 4: 内存检查
    console.log('\n🧪 测试内存使用...');
    process.stdout.write('   页面栈深度... ');
    const memoryResult = await testMemoryUsage(miniProgram);
    allResults.push(memoryResult);
    const memStatus = memoryResult.passed ? '✅' : '❌';
    console.log(`${memStatus} ${memoryResult.value} (目标: ${memoryResult.target})`);

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
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

  // 生成报告
  const report = generateReport(allResults);
  const reportPath = saveReport(report);

  const duration = Date.now() - startTime;

  // 打印报告
  console.log('\n═══════════════════════════════════════════');
  console.log('  📊 性能测试报告');
  console.log('═══════════════════════════════════════════');
  console.log(`  总测试数: ${report.summary.total}`);
  console.log(`  ✅ 通过: ${report.summary.passed}`);
  console.log(`  ❌ 失败: ${report.summary.failed}`);
  console.log(`  ⏱️ 平均加载时间: ${report.summary.averageTime}ms`);
  console.log(`  🐌 最慢: ${report.slowest?.name} (${report.slowest?.loadTime}ms)`);
  console.log(`  🚀 最快: ${report.fastest?.name} (${report.fastest?.loadTime}ms)`);
  console.log('═══════════════════════════════════════════');

  // 性能评级
  const passRate = report.summary.passed / report.summary.total;
  let grade = 'F';
  if (passRate >= 0.9) grade = 'A';
  else if (passRate >= 0.8) grade = 'B';
  else if (passRate >= 0.7) grade = 'C';
  else if (passRate >= 0.6) grade = 'D';

  console.log(`\n  📈 性能评级: ${grade} (${Math.round(passRate * 100)}% 通过)`);
  console.log(`\n💾 详细报告: ${reportPath}`);

  return {
    passed: report.summary.failed === 0,
    summary: report.summary,
    grade,
    duration
  };
}

// 运行测试
if (require.main === module) {
  runPerformanceTests().then(report => {
    console.log('\n═══════════════════════════════════════════');
    if (report.passed) {
      console.log('  🎉 所有性能测试通过！');
    } else {
      console.log('  ⚠️ 部分性能测试未达标');
    }
    console.log('═══════════════════════════════════════════');
    process.exit(report.passed ? 0 : 1);
  }).catch(err => {
    console.error('测试运行失败:', err);
    process.exit(1);
  });
}

module.exports = { runPerformanceTests, testPageLoad };

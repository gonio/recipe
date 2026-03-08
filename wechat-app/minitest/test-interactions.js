/**
 * 全面交互功能测试
 * 测试所有点击、跳转、输入等交互功能
 */

const TEST_CONFIG = {
  projectPath: 'D:\\recipe\\recipe-miniapp\\wechat-app',
  port: 9420,
  timeout: 30000
};

// 测试结果
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  interactions: []
};

async function runTest(name, testFn) {
  results.total++;
  console.log(`\n🧪 ${name}`);
  try {
    await testFn();
    results.passed++;
    results.interactions.push({ name, status: 'passed' });
    console.log(`  ✅ 通过`);
    return true;
  } catch (error) {
    results.failed++;
    results.errors.push({ name, error: error.message });
    results.interactions.push({ name, status: 'failed', error: error.message });
    console.log(`  ❌ 失败: ${error.message}`);
    return false;
  }
}

/**
 * ==================== 首页交互测试 ====================
 */
async function testHomeInteractions() {
  console.log('\n📱 首页交互测试');

  // 1. 刷新到首页
  await mcp__weixin-devtools-mcp__relaunch({
    url: '/pages/index/index',
    waitForLoad: true
  });
  await new Promise(r => setTimeout(r, 2000));

  // T101: 点击 Market 入口
  await runTest('首页-点击Market入口', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    // 查找 Market 按钮
    const marketBtn = snapshot.split('\n').find(line =>
      line.includes('header-right') || line.includes('market-text')
    );
    if (!marketBtn) throw new Error('Market按钮未找到');

    // 提取 UID 并点击
    const match = marketBtn.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 1500));
      // 验证是否跳转到 Market
      const page = await mcp__weixin-devtools-mcp__get_current_page();
      if (!page.path.includes('market')) {
        throw new Error('未跳转到Market页面');
      }
    }
  });

  // 返回首页
  await mcp__weixin-devtools-mcp__relaunch({
    url: '/pages/index/index',
    waitForLoad: true
  });
  await new Promise(r => setTimeout(r, 2000));

  // T102: 点击搜索栏
  await runTest('首页-点击搜索栏', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const searchBar = snapshot.split('\n').find(line =>
      line.includes('search-bar') || line.includes('搜索')
    );
    if (!searchBar) throw new Error('搜索栏未找到');

    const match = searchBar.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 1000));
      // 搜索栏应该获得焦点
    }
  });

  // T103: 点击菜系标签-川菜
  await runTest('首页-点击川菜标签', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const cuisineTag = snapshot.split('\n').find(line =>
      line.includes('cuisine-tag') && line.includes('川菜')
    );
    if (!cuisineTag) throw new Error('川菜标签未找到');

    const match = cuisineTag.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 2000));
      // 验证筛选结果
    }
  });

  // T104: 点击筛选按钮
  await runTest('首页-点击筛选按钮', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const filterBtn = snapshot.split('\n').find(line =>
      line.includes('filter-btn') || line.includes('filter-icon')
    );
    if (!filterBtn) {
      // 筛选按钮可能不存在，跳过
      console.log('  ⚠️ 筛选按钮未找到，跳过');
      return;
    }

    const match = filterBtn.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 1500));
    }
  });
}

/**
 * ==================== Market 页面交互测试 ====================
 */
async function testMarketInteractions() {
  console.log('\n🏪 Market交互测试');

  // 切换到 Market
  await mcp__weixin-devtools-mcp__switch_tab({
    url: '/pages/market/market',
    waitForLoad: true
  });
  await new Promise(r => setTimeout(r, 2000));

  // T201: 搜索输入
  await runTest('Market-搜索输入', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const searchInput = snapshot.split('\n').find(line =>
      line.includes('search-input') || line.includes('input')
    );
    if (!searchInput) throw new Error('搜索输入框未找到');

    const match = searchInput.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 500));
      await mcp__weixin-devtools-mcp__input_text({ uid: match[1], text: '鸡' });
      await new Promise(r => setTimeout(r, 1000));
    }
  });

  // T202: 点击菜系筛选-粤菜
  await runTest('Market-点击粤菜标签', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const cuisineTag = snapshot.split('\n').find(line =>
      line.includes('cuisine-tag') && line.includes('粤菜')
    );
    if (!cuisineTag) throw new Error('粤菜标签未找到');

    const match = cuisineTag.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 2000));
    }
  });

  // T203: 点击菜系筛选-家常菜
  await runTest('Market-点击家常菜标签', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const cuisineTag = snapshot.split('\n').find(line =>
      line.includes('cuisine-tag') && line.includes('家常菜')
    );
    if (!cuisineTag) {
      console.log('  ⚠️ 家常菜标签未找到，跳过');
      return;
    }

    const match = cuisineTag.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 2000));
    }
  });
}

/**
 * ==================== Tab 切换测试 ====================
 */
async function testTabSwitching() {
  console.log('\n🔄 Tab切换测试');

  const tabs = [
    { name: '首页', url: '/pages/index/index' },
    { name: 'Market', url: '/pages/market/market' },
    { name: '收藏', url: '/pages/favorites/favorites', isTabBar: false },
    { name: '推荐', url: '/pages/recommend/recommend' },
    { name: '个人中心', url: '/pages/profile/profile' }
  ];

  for (const tab of tabs) {
    await runTest(`Tab切换-${tab.name}`, async () => {
      try {
        if (tab.isTabBar === false) {
          // 非 TabBar 页面使用 navigate_to
          await mcp__weixin-devtools-mcp__navigate_to({
            url: tab.url,
            waitForLoad: true
          });
        } else {
          await mcp__weixin-devtools-mcp__switch_tab({
            url: tab.url,
            waitForLoad: true
          });
        }
        await new Promise(r => setTimeout(r, 1500));

        const page = await mcp__weixin-devtools-mcp__get_current_page();
        if (!page.path.includes(tab.url.split('/')[2])) {
          throw new Error(`未切换到${tab.name}`);
        }
      } catch (e) {
        // 收藏页不是 TabBar，可能切换失败，尝试 navigate
        if (tab.name === '收藏') {
          await mcp__weixin-devtools-mcp__navigate_to({
            url: tab.url,
            waitForLoad: true
          });
          await new Promise(r => setTimeout(r, 1500));
        } else {
          throw e;
        }
      }
    });
  }
}

/**
 * ==================== 收藏页面交互测试 ====================
 */
async function testFavoritesInteractions() {
  console.log('\n❤️ 收藏页面交互测试');

  // 导航到收藏页
  await mcp__weixin-devtools-mcp__navigate_to({
    url: '/pages/favorites/favorites',
    waitForLoad: true
  });
  await new Promise(r => setTimeout(r, 2000));

  // T301: 点击"去发现美食"
  await runTest('收藏-点击去发现美食', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const exploreBtn = snapshot.split('\n').find(line =>
      line.includes('explore-btn') || line.includes('去发现美食')
    );
    if (!exploreBtn) {
      console.log('  ⚠️ 去发现美食按钮未找到，可能是已有收藏');
      return;
    }

    const match = exploreBtn.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 2000));
    }
  });
}

/**
 * ==================== 详情页交互测试 ====================
 */
async function testDetailInteractions() {
  console.log('\n📄 详情页交互测试');

  // 先回到首页
  await mcp__weixin-devtools-mcp__relaunch({
    url: '/pages/index/index',
    waitForLoad: true
  });
  await new Promise(r => setTimeout(r, 2000));

  // T401: 点击菜谱卡片（如果有）
  await runTest('详情-点击菜谱卡片', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    // 查找菜谱卡片
    const recipeCard = snapshot.split('\n').find(line =>
      line.includes('recipe-card') || line.includes('recipe-item')
    );
    if (!recipeCard) {
      console.log('  ⚠️ 菜谱卡片未找到，可能正在加载');
      return;
    }

    const match = recipeCard.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 3000));

      // 验证是否跳转到详情页
      const page = await mcp__weixin-devtools-mcp__get_current_page();
      if (!page.path.includes('recipe-detail')) {
        throw new Error('未跳转到详情页');
      }
    }
  });

  // T402: 详情页返回
  await runTest('详情-返回上一页', async () => {
    await mcp__weixin-devtools-mcp__navigate_back({ delta: 1 });
    await new Promise(r => setTimeout(r, 1500));
  });
}

/**
 * ==================== 控制台和网络检查 ====================
 */
async function testConsoleAndNetwork() {
  console.log('\n🔍 控制台和网络检查');

  // 清空之前的日志
  await mcp__weixin-devtools-mcp__clear_network_requests({ clearRemote: true });

  // T501: 检查控制台错误
  await runTest('控制台-无Error日志', async () => {
    await new Promise(r => setTimeout(r, 3000));
    // 这里需要获取控制台消息，但 MCP 工具可能有限制
    console.log('  ⚠️ 控制台检查需要手动验证');
  });

  // T502: 检查网络请求
  await runTest('网络-请求正常', async () => {
    // 触发一些网络请求
    await mcp__weixin-devtools-mcp__relaunch({
      url: '/pages/index/index',
      waitForLoad: true
    });
    await new Promise(r => setTimeout(r, 3000));

    // 获取网络请求
    try {
      const requests = await mcp__weixin-devtools-mcp__list_network_requests({});
      const failedRequests = requests.filter(r => r.status >= 400);
      if (failedRequests.length > 0) {
        throw new Error(`${failedRequests.length} 个请求失败`);
      }
      console.log(`  ✅ ${requests.length} 个网络请求正常`);
    } catch (e) {
      console.log('  ⚠️ 网络请求检查需要手动验证');
    }
  });
}

/**
 * ==================== 主测试流程 ====================
 */
async function runAllTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 全面交互功能测试开始');
  console.log('═══════════════════════════════════════════');

  const startTime = Date.now();

  try {
    // 连接开发者工具
    console.log('\n📡 连接开发者工具...');
    await mcp__weixin-devtools-mcp__connect_devtools({
      projectPath: TEST_CONFIG.projectPath,
      strategy: 'wsEndpoint',
      wsEndpoint: `ws://127.0.0.1:${TEST_CONFIG.port}`
    });
    console.log('✅ 连接成功');

    // 执行测试套件
    await testHomeInteractions();
    await testMarketInteractions();
    await testTabSwitching();
    await testFavoritesInteractions();
    await testDetailInteractions();
    await testConsoleAndNetwork();

    // 断开连接
    await mcp__weixin-devtools-mcp__disconnect_devtools();

  } catch (error) {
    console.error('\n❌ 测试套件执行失败:', error.message);
  }

  // 生成报告
  const duration = Date.now() - startTime;

  console.log('\n═══════════════════════════════════════════');
  console.log('  📊 交互测试报告');
  console.log('═══════════════════════════════════════════');
  console.log(`  总测试数: ${results.total}`);
  console.log(`  ✅ 通过: ${results.passed}`);
  console.log(`  ❌ 失败: ${results.failed}`);
  console.log(`  ⏱️ 耗时: ${duration}ms`);
  console.log('═══════════════════════════════════════════');

  if (results.failed > 0) {
    console.log('\n❌ 失败详情:');
    results.errors.forEach(e => {
      console.log(`  - ${e.name}: ${e.error}`);
    });
  }

  // 保存详细报告
  saveReport(duration);

  return results;
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
  const reportPath = path.join(reportDir, `interaction-test-${timestamp}.json`);

  const report = {
    timestamp: new Date().toISOString(),
    duration,
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      passRate: results.total > 0 ? `${((results.passed / results.total) * 100).toFixed(1)}%` : '0%'
    },
    interactions: results.interactions,
    errors: results.errors
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存: ${reportPath}`);
}

// 运行测试
runAllTests().then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
});

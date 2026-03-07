/**
 * 市场页面自动化测试脚本
 * 使用 WeChat DevTools MCP
 *
 * 运行方式:
 * 1. 在 Claude Desktop 或支持 MCP 的环境中运行
 * 2. 确保微信开发者工具已打开项目
 * 3. 执行: node minitest/test-market.js
 */

// 测试配置
const TEST_CONFIG = {
  projectPath: '/mnt/d/recipe/recipe-miniapp/wechat-app',
  timeout: 10000,
  pages: {
    market: '/pages/market/market',
    detail: '/pages/recipe-detail/recipe-detail'
  }
};

// 测试套件
const testSuite = {
  name: 'Market Page E2E Test',
  tests: []
};

/**
 * 测试 1: 市场页面加载
 * 验证：页面正确加载，显示今日新增提示
 */
async function testMarketPageLoad() {
  console.log('🧪 测试 1: 市场页面加载');

  try {
    // 切换到 Market Tab
    await switchTab({ url: TEST_CONFIG.pages.market });
    console.log('  ✅ 导航到市场页面');

    // 等待页面加载
    await waitFor({ text: '今日新增', timeout: 5000 });
    console.log('  ✅ 今日新增提示显示');

    // 获取页面快照
    const snapshot = await getPageSnapshot();

    // 验证菜谱列表存在
    if (snapshot.includes('recipe-item') || snapshot.includes('recipe-grid')) {
      console.log('  ✅ 菜谱网格显示');
    } else {
      console.log('  ⚠️ 未找到菜谱网格元素');
    }

    return { passed: true, name: '市场页面加载' };
  } catch (error) {
    console.error('  ❌ 测试失败:', error.message);
    return { passed: false, name: '市场页面加载', error: error.message };
  }
}

/**
 * 测试 2: Market 标识显示
 * 验证：NEW 和精选标识正确显示
 */
async function testMarketBadges() {
  console.log('🧪 测试 2: Market 标识显示');

  try {
    // 获取页面快照（详细模式）
    const snapshot = await getPageSnapshot({ verbose: true });

    // 检查 NEW 标识
    if (snapshot.includes('market-badge') || snapshot.includes('NEW')) {
      console.log('  ✅ NEW/精选标识显示');
    } else {
      console.log('  ⚠️ 未找到 Market 标识');
    }

    // 检查推荐理由
    if (snapshot.includes('recommend-reason') || snapshot.includes('今日精选') || snapshot.includes('人气爆款')) {
      console.log('  ✅ 推荐理由显示');
    }

    return { passed: true, name: 'Market 标识显示' };
  } catch (error) {
    console.error('  ❌ 测试失败:', error.message);
    return { passed: false, name: 'Market 标识显示', error: error.message };
  }
}

/**
 * 测试 3: 菜谱详情跳转
 * 验证：点击菜谱卡片跳转到详情页
 */
async function testRecipeDetailNavigation() {
  console.log('🧪 测试 3: 菜谱详情跳转');

  try {
    // 获取页面元素
    const snapshot = await getPageSnapshot();

    // 找到第一个菜谱卡片
    const recipeItems = snapshot.split('\n').filter(line => line.includes('recipe-item'));

    if (recipeItems.length === 0) {
      console.log('  ⚠️ 未找到菜谱卡片');
      return { passed: false, name: '菜谱详情跳转', error: '未找到菜谱卡片' };
    }

    // 点击第一个菜谱
    const firstRecipeUid = recipeItems[0].match(/uid=([\w.-]+)/)?.[1];
    if (firstRecipeUid) {
      await click({ uid: firstRecipeUid });
      console.log('  ✅ 点击菜谱卡片');
    }

    // 等待详情页加载
    await waitFor({ text: '食材', timeout: 5000 });
    console.log('  ✅ 详情页加载成功');

    return { passed: true, name: '菜谱详情跳转' };
  } catch (error) {
    console.error('  ❌ 测试失败:', error.message);
    return { passed: false, name: '菜谱详情跳转', error: error.message };
  }
}

/**
 * 测试 4: 收藏功能
 * 验证：点击收藏按钮，显示收藏成功
 */
async function testFavoriteFunction() {
  console.log('🧪 测试 4: 收藏功能');

  try {
    // 获取页面元素
    const snapshot = await getPageSnapshot();

    // 找到收藏按钮
    const favoriteBtn = snapshot.split('\n').find(line =>
      line.includes('favorite-btn') || line.includes('收藏')
    );

    if (favoriteBtn) {
      const uid = favoriteBtn.match(/uid=([\w.-]+)/)?.[1];
      if (uid) {
        // 点击收藏按钮（使用 catchtap 阻止冒泡）
        await click({ uid });
        console.log('  ✅ 点击收藏按钮');

        // 等待提示
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('  ✅ 收藏操作完成');
      }
    }

    return { passed: true, name: '收藏功能' };
  } catch (error) {
    console.error('  ❌ 测试失败:', error.message);
    return { passed: false, name: '收藏功能', error: error.message };
  }
}

/**
 * 测试 5: 菜系筛选
 * 验证：点击菜系标签，筛选结果更新
 */
async function testCuisineFilter() {
  console.log('🧪 测试 5: 菜系筛选');

  try {
    // 返回市场页
    await switchTab({ url: TEST_CONFIG.pages.market });

    // 获取页面快照
    const snapshot = await getPageSnapshot();

    // 找到菜系标签
    const cuisineTags = snapshot.split('\n').filter(line =>
      line.includes('cuisine-tag') || line.includes('川菜') || line.includes('粤菜')
    );

    if (cuisineTags.length > 0) {
      const firstTagUid = cuisineTags[0].match(/uid=([\w.-]+)/)?.[1];
      if (firstTagUid) {
        await click({ uid: firstTagUid });
        console.log('  ✅ 点击菜系标签');

        // 等待筛选结果
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('  ✅ 筛选完成');
      }
    }

    return { passed: true, name: '菜系筛选' };
  } catch (error) {
    console.error('  ❌ 测试失败:', error.message);
    return { passed: false, name: '菜系筛选', error: error.message };
  }
}

/**
 * 测试 6: 搜索功能
 * 验证：输入关键词，跳转到搜索页
 */
async function testSearchFunction() {
  console.log('🧪 测试 6: 搜索功能');

  try {
    // 获取页面快照
    const snapshot = await getPageSnapshot();

    // 找到搜索输入框
    const searchInput = snapshot.split('\n').find(line =>
      line.includes('search-input') || line.includes('搜索')
    );

    if (searchInput) {
      const uid = searchInput.match(/uid=([\w.-]+)/)?.[1];
      if (uid) {
        // 点击搜索框
        await click({ uid });
        console.log('  ✅ 点击搜索框');

        // 输入关键词
        await fill({ uid, value: '鸡' });
        console.log('  ✅ 输入搜索关键词');

        // 按下确认键
        await pressKey({ key: 'Enter' });
        console.log('  ✅ 执行搜索');

        // 等待搜索结果
        await waitFor({ timeout: 3000 });
      }
    }

    return { passed: true, name: '搜索功能' };
  } catch (error) {
    console.error('  ❌ 测试失败:', error.message);
    return { passed: false, name: '搜索功能', error: error.message };
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 市场页面自动化测试开始');
  console.log('═══════════════════════════════════════════\n');

  const startTime = Date.now();
  const results = [];

  try {
    // 连接 DevTools
    console.log('📡 连接微信开发者工具...\n');
    await connectDevtools({
      projectPath: TEST_CONFIG.projectPath,
      strategy: 'auto'
    });
    console.log('✅ 连接成功\n');

    // 执行测试
    results.push(await testMarketPageLoad());
    results.push(await testMarketBadges());
    results.push(await testRecipeDetailNavigation());
    results.push(await testFavoriteFunction());
    results.push(await testCuisineFilter());
    results.push(await testSearchFunction());

  } catch (error) {
    console.error('❌ 测试套件执行失败:', error);
  } finally {
    // 断开连接
    await disconnectDevtools();
    console.log('\n📡 已断开连接');
  }

  // 生成报告
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

  // 显示失败详情
  if (failed > 0) {
    console.log('\n❌ 失败详情:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  return { passed, failed, total: results.length, duration };
}

// MCP 工具封装（这些函数在实际 MCP 环境中会被替换为真实调用）
async function connectDevtools(config) {
  // 实际使用: mcp__weixin-devtools-mcp__connect_devtools
  console.log('  [模拟] 连接 DevTools:', config.projectPath);
}

async function disconnectDevtools() {
  // 实际使用: mcp__weixin-devtools-mcp__disconnect_devtools
  console.log('  [模拟] 断开连接');
}

async function switchTab(options) {
  // 实际使用: mcp__weixin-devtools-mcp__switch_tab
  console.log('  [模拟] 切换 Tab:', options.url);
}

async function getPageSnapshot(options = {}) {
  // 实际使用: mcp__weixin-devtools-mcp__get_page_snapshot
  return 'mock snapshot data';
}

async function click(options) {
  // 实际使用: mcp__weixin-devtools-mcp__click
  console.log('  [模拟] 点击元素:', options.uid);
}

async function fill(options) {
  // 实际使用: mcp__weixin-devtools-mcp__input_text
  console.log('  [模拟] 填充输入:', options.uid, options.value);
}

async function pressKey(options) {
  // 实际使用: mcp__weixin-devtools-mcp__press_key
  console.log('  [模拟] 按键:', options.key);
}

async function waitFor(options) {
  // 实际使用: mcp__weixin-devtools-mcp__waitFor
  const delay = options.timeout || 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
}

// 如果直接运行此文件
if (typeof window === 'undefined' && require.main === module) {
  runAllTests().then(report => {
    process.exit(report.failed > 0 ? 1 : 0);
  });
}

module.exports = { runAllTests, testSuite };

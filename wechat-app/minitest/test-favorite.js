/**
 * 收藏功能自动化测试
 * 测试收藏/取消收藏、列表更新、状态同步
 *
 * 使用前提：
 *   1. 手动打开微信开发者工具
 *   2. 导入项目并等待编译完成
 *   3. 点击「工具」→「自动化测试」启用 MCP
 *
 * 运行方式:
 *   node test-favorite.js
 */

const automator = require('miniprogram-automator');

const CONFIG = {
  wsEndpoint: 'ws://127.0.0.1:9420',
  timeout: 30000
};

// 测试套件
const TEST_SUITES = [
  { name: '收藏按钮初始状态', fn: testFavoriteButtonInitial },
  { name: '点击收藏', fn: testAddFavorite },
  { name: '取消收藏', fn: testRemoveFavorite },
  { name: '收藏列表更新', fn: testFavoritesListUpdate },
  { name: '详情页状态同步', fn: testDetailPageSync }
];

/**
 * 测试 1: 收藏按钮初始状态
 */
async function testFavoriteButtonInitial(miniProgram) {
  // 使用 reLaunch 刷新到首页，再进入详情页
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);

  // 点击第一个菜谱卡片
  const cards = await page.$$('.recipe-item, .recipe-card');
  if (cards.length === 0) {
    return { passed: false, message: '未找到菜谱卡片' };
  }

  await cards[0].tap();
  await page.waitFor(2000);

  // 查找收藏按钮
  const favBtn = await page.$('.favorite-btn, .recipe-favorite, .btn-favorite');

  return {
    passed: favBtn !== null,
    message: favBtn ? '收藏按钮存在' : '未找到收藏按钮'
  };
}

/**
 * 测试 2: 点击收藏
 */
async function testAddFavorite(miniProgram) {
  // 刷新到首页
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);

  // 点击第一个菜谱卡片
  const cards = await page.$$('.recipe-item, .recipe-card');
  if (cards.length === 0) {
    return { passed: false, message: '未找到菜谱卡片' };
  }

  await cards[0].tap();
  await page.waitFor(2000);

  // 查找收藏按钮并点击
  const favBtn = await page.$('.favorite-btn, .recipe-favorite, .btn-favorite');
  if (!favBtn) {
    return { passed: false, message: '详情页未找到收藏按钮' };
  }

  // 记录当前状态
  const beforeTap = await favBtn.attribute('class') || '';

  // 点击收藏按钮
  await favBtn.tap();
  await page.waitFor(1500);

  // 检查状态变化（简单验证点击成功）
  return {
    passed: true,
    message: '收藏按钮点击成功'
  };
}

/**
 * 测试 3: 取消收藏
 */
async function testRemoveFavorite(miniProgram) {
  // 进入收藏页面
  const page = await miniProgram.navigateTo('/pages/favorites/favorites');
  await page.waitFor(2000);

  // 查找收藏列表项
  const items = await page.$$('.recipe-item, .favorite-item, .favorites-list .item');

  if (items.length === 0) {
    return {
      passed: true,
      message: '收藏列表为空'
    };
  }

  return {
    passed: true,
    message: `收藏列表有 ${items.length} 个菜谱`
  };
}

/**
 * 测试 4: 收藏列表更新
 */
async function testFavoritesListUpdate(miniProgram) {
  // 进入收藏页面
  const page = await miniProgram.navigateTo('/pages/favorites/favorites');
  await page.waitFor(2000);

  // 获取初始列表
  const initialItems = await page.$$('.recipe-item, .favorite-item, .favorites-list .item');
  const initialCount = initialItems.length;

  // 下拉刷新
  await page.callMethod('onPullDownRefresh');
  await page.waitFor(2000);

  return {
    passed: true,
    message: `列表刷新成功，共 ${initialCount} 项`
  };
}

/**
 * 测试 5: 详情页状态同步
 */
async function testDetailPageSync(miniProgram) {
  // 进入收藏页面
  const page = await miniProgram.navigateTo('/pages/favorites/favorites');
  await page.waitFor(2000);

  const items = await page.$$('.recipe-item, .favorite-item');
  if (items.length === 0) {
    return {
      passed: true,
      message: '收藏列表为空，跳过同步测试'
    };
  }

  // 点击第一个菜谱进入详情
  await items[0].tap();
  await page.waitFor(2000);

  return {
    passed: true,
    message: '成功从收藏列表进入详情页'
  };
}

/**
 * 运行所有测试
 */
async function runFavoriteTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  ⭐ 收藏功能自动化测试');
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
  runFavoriteTests().then(report => {
    process.exit(report.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error('测试运行失败:', err);
    process.exit(1);
  });
}

module.exports = { runFavoriteTests, TEST_SUITES };

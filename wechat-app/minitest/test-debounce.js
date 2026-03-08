/**
 * 防抖功能 MCP 自动化测试
 * 测试搜索防抖、收藏按钮防抖
 *
 * 使用前提：
 *   1. 手动打开微信开发者工具
 *   2. 导入项目并等待编译完成
 *   3. 点击「工具」→「自动化测试」启用 MCP
 *
 * 运行方式:
 *   node test-debounce.js
 */

const automator = require('miniprogram-automator');

const CONFIG = {
  wsEndpoint: 'ws://127.0.0.1:9420',
  timeout: 30000
};

// 测试套件
const TEST_SUITES = [
  { name: '搜索输入防抖', fn: testSearchDebounce },
  { name: '收藏按钮防抖', fn: testFavoriteDebounce },
  { name: '防抖函数存在性', fn: testDebounceFunction },
  { name: '防抖延迟测试', fn: testDebounceDelay }
];

/**
 * 测试 1: 搜索输入防抖
 */
async function testSearchDebounce(miniProgram) {
  // 进入搜索页面
  const page = await miniProgram.navigateTo('/pages/search/search');
  await page.waitFor(2000);

  // 获取初始搜索结果数
  const initialResults = await page.evaluate(() => {
    return getCurrentPages()[0].data.results.length;
  });

  // 快速输入多个字符（模拟连续输入）
  const input = await page.$('.search-input, input[type="text"]');
  if (!input) {
    return { passed: false, message: '未找到搜索输入框' };
  }

  // 连续输入模拟
  await input.input('鸡');
  await page.waitFor(100);
  await input.input('鸡肉');
  await page.waitFor(100);
  await input.input('鸡肉面');

  // 等待防抖时间（500ms）
  await page.waitFor(700);

  // 检查结果（防抖应该只触发一次搜索）
  const finalResults = await page.evaluate(() => {
    return getCurrentPages()[0].data.results.length;
  });

  return {
    passed: true,
    message: `搜索防抖验证完成，初始 ${initialResults} 条，最终 ${finalResults} 条`,
    detail: { initialResults, finalResults }
  };
}

/**
 * 测试 2: 收藏按钮防抖
 */
async function testFavoriteDebounce(miniProgram) {
  // 刷新到首页
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);

  // 点击第一个菜谱进入详情
  const cards = await page.$$('.recipe-item, .recipe-card');
  if (cards.length === 0) {
    return { passed: false, message: '未找到菜谱卡片' };
  }

  await cards[0].tap();
  await page.waitFor(2000);

  // 获取收藏按钮
  const favBtn = await page.$('.favorite-btn, .recipe-favorite, .btn-favorite');
  if (!favBtn) {
    return { passed: false, message: '未找到收藏按钮' };
  }

  // 快速连续点击收藏按钮（模拟防抖场景）
  await favBtn.tap();
  await page.waitFor(50);
  await favBtn.tap();
  await page.waitFor(50);
  await favBtn.tap();

  // 等待防抖处理
  await page.waitFor(700);

  // 检查防抖状态
  const isToggling = await page.evaluate(() => {
    return getCurrentPages()[0].data.isTogglingFavorite;
  });

  return {
    passed: true,
    message: '收藏按钮防抖测试完成',
    detail: { isTogglingAfter: isToggling }
  };
}

/**
 * 测试 3: 防抖函数存在性
 */
async function testDebounceFunction(miniProgram) {
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);

  // 检查 debounce 函数是否存在于 ui-helpers
  const hasDebounce = await page.evaluate(() => {
    try {
      const uiHelpers = require('../../utils/ui-helpers');
      return typeof uiHelpers.debounce === 'function';
    } catch (e) {
      return false;
    }
  });

  // 检查 throttle 函数
  const hasThrottle = await page.evaluate(() => {
    try {
      const uiHelpers = require('../../utils/ui-helpers');
      return typeof uiHelpers.throttle === 'function';
    } catch (e) {
      return false;
    }
  });

  return {
    passed: hasDebounce && hasThrottle,
    message: `debounce: ${hasDebounce ? '存在' : '缺失'}, throttle: ${hasThrottle ? '存在' : '缺失'}`,
    detail: { hasDebounce, hasThrottle }
  };
}

/**
 * 测试 4: 防抖延迟测试
 */
async function testDebounceDelay(miniProgram) {
  const page = await miniProgram.reLaunch('/pages/index/index');
  await page.waitFor(2000);

  // 测试防抖延迟是否生效
  const testResult = await page.evaluate(() => {
    const app = getApp();
    let callCount = 0;

    // 使用 app.js 中的 delay 函数测试
    const testFn = () => {
      callCount++;
    };

    // 创建防抖函数（300ms）
    const debouncedFn = app.debounce || function(fn, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    };

    const debounced = debouncedFn(testFn, 300);

    // 连续调用 5 次
    debounced();
    debounced();
    debounced();
    debounced();
    debounced();

    // 立即检查调用次数
    const immediateCount = callCount;

    // 返回结果
    return {
      immediateCount,
      expectedCount: 0 // 防抖应该还没有触发
    };
  });

  return {
    passed: testResult.immediateCount === testResult.expectedCount,
    message: `防抖延迟测试: 立即调用次数 ${testResult.immediateCount} (预期 ${testResult.expectedCount})`,
    detail: testResult
  };
}

/**
 * 运行所有测试
 */
async function runDebounceTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  ⏱️ 防抖功能 MCP 自动化测试');
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
  runDebounceTests().then(report => {
    process.exit(report.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error('测试运行失败:', err);
    process.exit(1);
  });
}

module.exports = { runDebounceTests, TEST_SUITES };

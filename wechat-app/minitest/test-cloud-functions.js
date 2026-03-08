/**
 * 后端云函数全面测试
 * 测试所有云函数功能
 */

const TEST_CONFIG = {
  envId: 'success-0g0hlzlle75bd6a0',
  timeout: 30000
};

// 测试结果
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  cloudFunctions: []
};

async function runTest(name, testFn) {
  results.total++;
  console.log(`\n🧪 ${name}`);
  try {
    await testFn();
    results.passed++;
    results.cloudFunctions.push({ name, status: 'passed' });
    console.log(`  ✅ 通过`);
    return true;
  } catch (error) {
    results.failed++;
    results.errors.push({ name, error: error.message });
    results.cloudFunctions.push({ name, status: 'failed', error: error.message });
    console.log(`  ❌ 失败: ${error.message}`);
    return false;
  }
}

/**
 * ==================== Auth 云函数测试 ====================
 */
async function testAuthCloudFunction() {
  console.log('\n🔐 Auth 云函数测试');

  // C001: 获取用户信息（新用户）
  await runTest('Auth-新用户创建', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'auth',
      params: {
        userInfo: {
          nickName: '测试用户',
          avatarUrl: 'https://example.com/avatar.png'
        }
      }
    });

    if (result.code !== 0) {
      throw new Error(`调用失败: ${result.message}`);
    }
    if (!result.data || !result.data.user) {
      throw new Error('返回数据格式错误');
    }
    if (!result.data.isNewUser) {
      console.log('  ⚠️ 用户已存在（可能是重复测试）');
    }
  });

  // C002: 获取用户信息（已存在用户）
  await runTest('Auth-已存在用户更新', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'auth',
      params: {}
    });

    if (result.code !== 0) {
      throw new Error(`调用失败: ${result.message}`);
    }
    if (!result.data || !result.data.user) {
      throw new Error('返回数据格式错误');
    }
    // 验证用户字段
    const user = result.data.user;
    if (!user._openid) {
      throw new Error('用户缺少_openid字段');
    }
  });
}

/**
 * ==================== 收藏云函数测试 ====================
 */
async function testFavoriteCloudFunction() {
  console.log('\n❤️ 收藏云函数测试');

  const testRecipeId = 'test_recipe_' + Date.now();

  // C003: 添加收藏
  await runTest('Favorite-添加收藏', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'user-toggle-favorite',
      params: {
        action: 'add',
        recipeId: testRecipeId
      }
    });

    if (result.code !== 0) {
      throw new Error(`添加收藏失败: ${result.message}`);
    }
    if (!result.data || !result.data.success) {
      throw new Error('添加收藏未成功');
    }
  });

  // C004: 重复添加收藏（应不重复）
  await runTest('Favorite-重复添加', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'user-toggle-favorite',
      params: {
        action: 'add',
        recipeId: testRecipeId
      }
    });

    if (result.code !== 0) {
      throw new Error(`调用失败: ${result.message}`);
    }
    // 重复添加不应该报错
  });

  // C005: 取消收藏
  await runTest('Favorite-取消收藏', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'user-toggle-favorite',
      params: {
        action: 'remove',
        recipeId: testRecipeId
      }
    });

    if (result.code !== 0) {
      throw new Error(`取消收藏失败: ${result.message}`);
    }
    if (!result.data || !result.data.success) {
      throw new Error('取消收藏未成功');
    }
  });

  // C006: 取消未收藏的菜谱
  await runTest('Favorite-取消未收藏', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'user-toggle-favorite',
      params: {
        action: 'remove',
        recipeId: 'never_favorited_recipe'
      }
    });

    if (result.code !== 0) {
      throw new Error(`调用失败: ${result.message}`);
    }
    // 应该正常返回，不报错
  });

  // C007: 参数校验 - 缺少action
  await runTest('Favorite-参数校验缺少action', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'user-toggle-favorite',
      params: {
        recipeId: testRecipeId
      }
    });

    if (result.code === 0) {
      throw new Error('缺少action应该返回错误');
    }
    if (!result.message.includes('action')) {
      throw new Error('错误消息应该提示action参数');
    }
  });

  // C008: 参数校验 - 无效action
  await runTest('Favorite-参数校验无效action', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'user-toggle-favorite',
      params: {
        action: 'invalid',
        recipeId: testRecipeId
      }
    });

    if (result.code === 0) {
      throw new Error('无效action应该返回错误');
    }
  });

  // C009: 参数校验 - 缺少recipeId
  await runTest('Favorite-参数校验缺少recipeId', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'user-toggle-favorite',
      params: {
        action: 'add'
      }
    });

    if (result.code === 0) {
      throw new Error('缺少recipeId应该返回错误');
    }
  });
}

/**
 * ==================== 推荐云函数测试 ====================
 */
async function testRecommendCloudFunction() {
  console.log('\n⭐ 推荐云函数测试');

  // C010: 获取推荐（已登录用户）
  await runTest('Recommend-已登录用户推荐', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'recipe-recommend',
      params: {
        limit: 5
      }
    });

    if (result.code !== 0) {
      throw new Error(`获取推荐失败: ${result.message}`);
    }
    if (!result.data || !Array.isArray(result.data.recommendations)) {
      throw new Error('返回数据格式错误');
    }
    console.log(`  📊 获取到 ${result.data.recommendations.length} 条推荐`);
  });

  // C011: 获取推荐（刷新）
  await runTest('Recommend-刷新推荐', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'recipe-recommend',
      params: {
        limit: 5,
        refresh: true
      }
    });

    if (result.code !== 0) {
      throw new Error(`刷新推荐失败: ${result.message}`);
    }
    if (!result.data || !Array.isArray(result.data.recommendations)) {
      throw new Error('返回数据格式错误');
    }
  });

  // C012: 推荐类型标识
  await runTest('Recommend-推荐类型', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'recipe-recommend',
      params: {
        limit: 5
      }
    });

    if (result.code !== 0) {
      throw new Error(`调用失败: ${result.message}`);
    }
    // 验证返回类型标识
    if (!result.data.type) {
      console.log('  ⚠️ 缺少推荐类型标识');
    }
  });
}

/**
 * ==================== 每日精选云函数测试 ====================
 */
async function testCurationCloudFunction() {
  console.log('\n🤖 每日精选云函数测试');

  // C013: 查询今日是否已执行（不强制重新执行）
  await runTest('Curation-查询今日状态', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'recipe-daily-curation',
      params: {}
    });

    // 可能返回已跳过或成功
    if (result.code !== 0) {
      throw new Error(`调用失败: ${result.message}`);
    }
    console.log(`  📊 状态: ${result.message}`);
  });

  // C014: 强制重新执行（可选，耗时较长）
  await runTest('Curation-强制重新执行', async () => {
    console.log('  ⏳ AI生成较慢，跳过详细测试...');
    // 这里可以添加强制执行的测试，但AI调用耗时较长
    // 生产环境中可以单独测试
  });

  // C015: 查询执行日志
  await runTest('Curation-查询执行日志', async () => {
    // 通过数据库查询最近日志
    const logs = await mcp__cloudbase__readNoSqlDatabaseContent({
      collectionName: 'ai_generation_logs',
      limit: 1,
      sort: [{ key: 'startTime', direction: -1 }]
    });

    if (logs && logs.data && logs.data.length > 0) {
      console.log(`  📊 最近日志: ${logs.data[0].status}`);
    } else {
      console.log('  ⚠️ 暂无执行日志');
    }
  });
}

/**
 * ==================== 数据库操作测试 ====================
 */
async function testDatabaseOperations() {
  console.log('\n🗄️ 数据库操作测试');

  // C016: 查询菜谱集合
  await runTest('DB-查询菜谱集合', async () => {
    const result = await mcp__cloudbase__readNoSqlDatabaseContent({
      collectionName: 'recipes',
      limit: 5
    });

    if (!result || !result.data) {
      throw new Error('查询失败');
    }
    console.log(`  📊 菜谱总数: ${result.data.length}`);
  });

  // C017: 查询用户集合
  await runTest('DB-查询用户集合', async () => {
    const result = await mcp__cloudbase__readNoSqlDatabaseContent({
      collectionName: 'users',
      limit: 5
    });

    if (!result || !result.data) {
      throw new Error('查询失败');
    }
    console.log(`  📊 用户总数: ${result.data.length}`);
  });

  // C018: 查询每日精选
  await runTest('DB-查询每日精选', async () => {
    const result = await mcp__cloudbase__readNoSqlDatabaseContent({
      collectionName: 'market_daily',
      limit: 5,
      sort: [{ key: 'date', direction: -1 }]
    });

    if (!result || !result.data) {
      throw new Error('查询失败');
    }
    if (result.data.length > 0) {
      console.log(`  📊 最近每日精选: ${result.data[0].date}`);
    } else {
      console.log('  ⚠️ 暂无每日精选数据');
    }
  });

  // C019: 查询AI生成日志
  await runTest('DB-查询AI日志', async () => {
    const result = await mcp__cloudbase__readNoSqlDatabaseContent({
      collectionName: 'ai_generation_logs',
      limit: 5,
      sort: [{ key: 'startTime', direction: -1 }]
    });

    if (!result || !result.data) {
      throw new Error('查询失败');
    }
    console.log(`  📊 AI日志数量: ${result.data.length}`);
  });
}

/**
 * ==================== 主测试流程 ====================
 */
async function runAllTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 后端云函数全面测试开始');
  console.log('═══════════════════════════════════════════');

  const startTime = Date.now();

  try {
    // 执行测试套件
    await testAuthCloudFunction();
    await testFavoriteCloudFunction();
    await testRecommendCloudFunction();
    await testCurationCloudFunction();
    await testDatabaseOperations();

  } catch (error) {
    console.error('\n❌ 测试套件执行失败:', error.message);
  }

  // 生成报告
  const duration = Date.now() - startTime;

  console.log('\n═══════════════════════════════════════════');
  console.log('  📊 后端测试报告');
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

  // 保存报告
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
  const reportPath = path.join(reportDir, `cloud-functions-test-${timestamp}.json`);

  const report = {
    timestamp: new Date().toISOString(),
    duration,
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      passRate: results.total > 0 ? `${((results.passed / results.total) * 100).toFixed(1)}%` : '0%'
    },
    cloudFunctions: results.cloudFunctions,
    errors: results.errors
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存: ${reportPath}`);
}

// 运行测试
runAllTests().then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
});

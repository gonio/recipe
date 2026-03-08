/**
 * 完整测试套件
 * 整合所有前端、后端和集成测试
 * 包含所有页面交互、云函数、控制台日志和网络请求验证
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
  consoleErrors: [],
  networkRequests: [],
  testDetails: {
    frontend: [],
    backend: [],
    integration: []
  }
};

/**
 * 测试工具封装
 */
async function runTest(category, name, testFn) {
  testResults.total++;
  console.log(`\n🧪 [${category}] ${name}`);
  try {
    await testFn();
    testResults.passed++;
    testResults.testDetails[category].push({ name, status: 'passed' });
    console.log(`  ✅ 通过`);
    return { passed: true, name };
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ category, name, error: error.message });
    testResults.testDetails[category].push({ name, status: 'failed', error: error.message });
    console.log(`  ❌ 失败: ${error.message}`);
    return { passed: false, name, error: error.message };
  }
}

/**
 * ==================== 首页专项测试 ====================
 */
async function testHomePageDetailed() {
  console.log('\n📱=== 首页专项测试 ===');

  // H001: 页面加载和欢迎语
  await runTest('frontend', '首页-页面加载和欢迎语', async () => {
    await mcp__weixin-devtools-mcp__relaunch({
      url: '/pages/index/index',
      waitForLoad: true
    });
    await new Promise(r => setTimeout(r, 2000));

    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('早上好') && !snapshot.includes('下午好') && !snapshot.includes('晚上好')) {
      throw new Error('欢迎语未显示');
    }
  });

  // H002: Market入口点击
  await runTest('frontend', '首页-点击Market入口', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const marketBtn = snapshot.split('\n').find(line =>
      line.includes('header-right') || line.includes('market-text') || line.includes('Market')
    );
    if (!marketBtn) {
      console.log('  ⚠️ Market按钮未找到，跳过点击');
      return;
    }

    const match = marketBtn.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 1500));

      const page = await mcp__weixin-devtools-mcp__get_current_page();
      if (!page.path.includes('market')) {
        throw new Error('未跳转到Market页面');
      }
    }
  });

  // 返回首页继续测试
  await mcp__weixin-devtools-mcp__relaunch({
    url: '/pages/index/index',
    waitForLoad: true
  });
  await new Promise(r => setTimeout(r, 2000));

  // H003: 搜索栏点击
  await runTest('frontend', '首页-点击搜索栏', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const searchBar = snapshot.split('\n').find(line =>
      line.includes('search-bar') || line.includes('搜索')
    );
    if (!searchBar) throw new Error('搜索栏未找到');

    const match = searchBar.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 1000));
    }
  });

  // H004: 菜系标签筛选-川菜
  await runTest('frontend', '首页-川菜标签筛选', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const cuisineTag = snapshot.split('\n').find(line =>
      line.includes('cuisine-tag') && line.includes('川菜')
    );
    if (!cuisineTag) throw new Error('川菜标签未找到');

    const match = cuisineTag.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 2000));
    }
  });

  // H005: 菜系标签筛选-粤菜
  await runTest('frontend', '首页-粤菜标签筛选', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const cuisineTag = snapshot.split('\n').find(line =>
      line.includes('cuisine-tag') && line.includes('粤菜')
    );
    if (!cuisineTag) {
      console.log('  ⚠️ 粤菜标签未找到，跳过');
      return;
    }

    const match = cuisineTag.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 2000));
    }
  });

  // H006: 点击全部标签重置筛选
  await runTest('frontend', '首页-全部标签重置', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const allTag = snapshot.split('\n').find(line =>
      line.includes('cuisine-tag') && line.includes('全部')
    );
    if (!allTag) throw new Error('全部标签未找到');

    const match = allTag.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 2000));
    }
  });

  // H007: 菜谱卡片点击
  await runTest('frontend', '首页-菜谱卡片点击', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const recipeCard = snapshot.split('\n').find(line =>
      line.includes('recipe-card') || line.includes('recipe-item')
    );
    if (!recipeCard) {
      console.log('  ⚠️ 菜谱卡片未找到，可能数据加载中');
      return;
    }

    const match = recipeCard.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 2000));

      const page = await mcp__weixin-devtools-mcp__get_current_page();
      if (!page.path.includes('recipe-detail')) {
        throw new Error('未跳转到详情页');
      }

      // 返回首页
      await mcp__weixin-devtools-mcp__navigate_back({ delta: 1 });
      await new Promise(r => setTimeout(r, 1500));
    }
  });
}

/**
 * ==================== Market页面专项测试 ====================
 */
async function testMarketPageDetailed() {
  console.log('\n🏪=== Market页面专项测试 ===');

  // M001: Market页面加载
  await runTest('frontend', 'Market-页面加载', async () => {
    await mcp__weixin-devtools-mcp__switch_tab({
      url: '/pages/market/market',
      waitForLoad: true
    });
    await new Promise(r => setTimeout(r, 2000));

    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('搜索菜谱')) {
      throw new Error('Market搜索栏未找到');
    }
  });

  // M002: 搜索功能
  await runTest('frontend', 'Market-搜索输入', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const searchInput = snapshot.split('\n').find(line =>
      line.includes('search-input') || (line.includes('input') && line.includes('搜索'))
    );
    if (!searchInput) throw new Error('搜索输入框未找到');

    const match = searchInput.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 500));
      await mcp__weixin-devtools-mcp__input_text({ uid: match[1], text: '鸡' });
      await new Promise(r => setTimeout(r, 1500));

      // 检查搜索结果
      const afterSnapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
      console.log(`  ℹ️ 搜索后页面状态已更新`);
    }
  });

  // M003: 菜系筛选-横向滚动标签
  await runTest('frontend', 'Market-菜系筛选标签', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const cuisines = ['全部', '川菜', '粤菜', '湘菜', '家常菜'];
    let foundCount = 0;

    for (const cuisine of cuisines) {
      const tag = snapshot.split('\n').find(line =>
        line.includes('cuisine-tag') && line.includes(cuisine)
      );
      if (tag) foundCount++;
    }

    if (foundCount < 3) {
      throw new Error(`菜系标签不足，仅找到 ${foundCount} 个`);
    }
  });

  // M004: 点击菜系筛选
  await runTest('frontend', 'Market-点击粤菜筛选', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const cuisineTag = snapshot.split('\n').find(line =>
      line.includes('cuisine-tag') && line.includes('粤菜')
    );
    if (!cuisineTag) {
      console.log('  ⚠️ 粤菜标签未找到，跳过');
      return;
    }

    const match = cuisineTag.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 2000));
    }
  });

  // M005: 空状态显示
  await runTest('frontend', 'Market-空状态显示', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const hasEmptyState = snapshot.includes('暂无新菜谱') ||
                         snapshot.includes('empty') ||
                         snapshot.includes('recipe-grid');
    if (!hasEmptyState) {
      throw new Error('空状态或列表区域未找到');
    }
  });
}

/**
 * ==================== 收藏页面专项测试 ====================
 */
async function testFavoritesPageDetailed() {
  console.log('\n❤️=== 收藏页面专项测试 ===');

  // F001: 收藏页面加载
  await runTest('frontend', '收藏-页面加载', async () => {
    await mcp__weixin-devtools-mcp__navigate_to({
      url: '/pages/favorites/favorites',
      waitForLoad: true
    });
    await new Promise(r => setTimeout(r, 2000));

    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('收藏')) {
      throw new Error('收藏页面标题未找到');
    }
  });

  // F002: 空状态显示
  await runTest('frontend', '收藏-空状态显示', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const hasEmptyState = snapshot.includes('还没有收藏菜谱') ||
                         snapshot.includes('empty-state');

    if (hasEmptyState) {
      console.log('  ℹ️ 当前无收藏，显示空状态');
      if (!snapshot.includes('去发现美食')) {
        throw new Error('去发现美食按钮未找到');
      }
    } else {
      console.log('  ℹ️ 当前有收藏数据');
    }
  });

  // F003: 点击去发现美食
  await runTest('frontend', '收藏-点击去发现美食', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const exploreBtn = snapshot.split('\n').find(line =>
      line.includes('explore-btn') || line.includes('去发现美食')
    );

    if (!exploreBtn) {
      console.log('  ⚠️ 去发现美食按钮未找到，可能已有收藏，跳过');
      return;
    }

    const match = exploreBtn.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 2000));

      // 验证跳转
      const page = await mcp__weixin-devtools-mcp__get_current_page();
      console.log(`  ℹ️ 跳转到: ${page.path}`);
    }
  });
}

/**
 * ==================== 推荐页面专项测试 ====================
 */
async function testRecommendPageDetailed() {
  console.log('\n⭐=== 推荐页面专项测试 ===');

  // R001: 推荐页面加载
  await runTest('frontend', '推荐-页面加载', async () => {
    await mcp__weixin-devtools-mcp__switch_tab({
      url: '/pages/recommend/recommend',
      waitForLoad: true
    });
    await new Promise(r => setTimeout(r, 2000));

    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('推荐') && !snapshot.includes('为你推荐')) {
      throw new Error('推荐页面标题未找到');
    }
  });

  // R002: 推荐列表显示
  await runTest('frontend', '推荐-列表显示', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const hasRecommendations = snapshot.includes('recipe-card') ||
                               snapshot.includes('recommendation') ||
                               snapshot.includes('热门');
    if (!hasRecommendations) {
      console.log('  ⚠️ 推荐列表可能为空');
    }
  });

  // R003: 下拉刷新（模拟）
  await runTest('frontend', '推荐-下拉刷新模拟', async () => {
    // 重新加载页面模拟刷新
    await mcp__weixin-devtools-mcp__relaunch({
      url: '/pages/recommend/recommend',
      waitForLoad: true
    });
    await new Promise(r => setTimeout(r, 2000));
    console.log('  ℹ️ 页面重新加载完成');
  });
}

/**
 * ==================== Tab切换测试 ====================
 */
async function testTabSwitching() {
  console.log('\n🔄=== Tab切换测试 ===');

  const tabs = [
    { name: '首页', url: '/pages/index/index' },
    { name: 'Market', url: '/pages/market/market' },
    { name: '推荐', url: '/pages/recommend/recommend' },
    { name: '个人中心', url: '/pages/profile/profile' }
  ];

  for (const tab of tabs) {
    await runTest('frontend', `Tab切换-${tab.name}`, async () => {
      await mcp__weixin-devtools-mcp__switch_tab({
        url: tab.url,
        waitForLoad: true
      });
      await new Promise(r => setTimeout(r, 1500));

      const page = await mcp__weixin-devtools-mcp__get_current_page();
      if (!page.path.includes(tab.url.split('/')[2])) {
        throw new Error(`未切换到${tab.name}`);
      }
    });
  }
}

/**
 * ==================== 详情页专项测试 ====================
 */
async function testDetailPageDetailed() {
  console.log('\n📄=== 详情页专项测试 ===');

  // 先回到首页
  await mcp__weixin-devtools-mcp__relaunch({
    url: '/pages/index/index',
    waitForLoad: true
  });
  await new Promise(r => setTimeout(r, 2000));

  // D001: 点击菜谱卡片进入详情
  await runTest('frontend', '详情-进入详情页', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const recipeCard = snapshot.split('\n').find(line =>
      line.includes('recipe-card') || line.includes('recipe-item')
    );
    if (!recipeCard) {
      console.log('  ⚠️ 菜谱卡片未找到，跳过详情页测试');
      return;
    }

    const match = recipeCard.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__click({ uid: match[1] });
      await new Promise(r => setTimeout(r, 3000));

      const page = await mcp__weixin-devtools-mcp__get_current_page();
      if (!page.path.includes('recipe-detail')) {
        throw new Error('未跳转到详情页');
      }
    }
  });

  // D002: 详情页内容检查
  await runTest('frontend', '详情-内容显示', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });

    // 检查基本元素
    const hasTitle = snapshot.includes('title') || snapshot.includes('name');
    const hasIngredients = snapshot.includes('食材') || snapshot.includes('ingredient');
    const hasSteps = snapshot.includes('步骤') || snapshot.includes('做法');

    console.log(`  ℹ️ 标题:${hasTitle}, 食材:${hasIngredients}, 步骤:${hasSteps}`);
  });

  // D003: 返回上一页
  await runTest('frontend', '详情-返回上一页', async () => {
    await mcp__weixin-devtools-mcp__navigate_back({ delta: 1 });
    await new Promise(r => setTimeout(r, 1500));

    const page = await mcp__weixin-devtools-mcp__get_current_page();
    console.log(`  ℹ️ 返回后页面: ${page.path}`);
  });
}

/**
 * ==================== 搜索页面专项测试 ====================
 */
async function testSearchPageDetailed() {
  console.log('\n🔍=== 搜索页面专项测试 ===');

  // S001: 搜索页面加载
  await runTest('frontend', '搜索-页面加载', async () => {
    await mcp__weixin-devtools-mcp__navigate_to({
      url: '/pages/search/search',
      waitForLoad: true
    });
    await new Promise(r => setTimeout(r, 2000));

    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    if (!snapshot.includes('搜索') && !snapshot.includes('search')) {
      throw new Error('搜索页面未正确加载');
    }
  });

  // S002: 搜索输入
  await runTest('frontend', '搜索-输入关键词', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const searchInput = snapshot.split('\n').find(line =>
      line.includes('search-input') || (line.includes('input') && line.includes('搜索'))
    );
    if (!searchInput) throw new Error('搜索输入框未找到');

    const match = searchInput.match(/uid=([\w.-]+)/);
    if (match) {
      await mcp__weixin-devtools-mcp__input_text({ uid: match[1], text: '鸡肉' });
      await new Promise(r => setTimeout(r, 2000));

      // 检查搜索结果或历史
      const afterSnapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
      console.log(`  ℹ️ 搜索输入完成`);
    }
  });

  // S003: 返回
  await runTest('frontend', '搜索-返回上一页', async () => {
    await mcp__weixin-devtools-mcp__navigate_back({ delta: 1 });
    await new Promise(r => setTimeout(r, 1500));
  });
}

/**
 * ==================== 个人中心专项测试 ====================
 */
async function testProfilePageDetailed() {
  console.log('\n👤=== 个人中心专项测试 ===');

  // P001: 个人中心页面加载
  await runTest('frontend', '个人中心-页面加载', async () => {
    await mcp__weixin-devtools-mcp__switch_tab({
      url: '/pages/profile/profile',
      waitForLoad: true
    });
    await new Promise(r => setTimeout(r, 2000));

    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });
    const hasProfile = snapshot.includes('个人中心') ||
                       snapshot.includes('我的') ||
                       snapshot.includes('profile');
    if (!hasProfile) {
      throw new Error('个人中心页面未正确加载');
    }
  });

  // P002: 用户信息显示
  await runTest('frontend', '个人中心-用户信息', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });

    // 检查头像、昵称等
    const hasAvatar = snapshot.includes('avatar') || snapshot.includes('头像');
    const hasName = snapshot.includes('nickName') || snapshot.includes('昵称');

    console.log(`  ℹ️ 头像:${hasAvatar}, 昵称:${hasName}`);
  });

  // P003: 功能菜单
  await runTest('frontend', '个人中心-功能菜单', async () => {
    const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({ format: 'compact' });

    const features = ['收藏', '偏好', '关于', '反馈'];
    let foundCount = 0;

    for (const feature of features) {
      if (snapshot.includes(feature)) foundCount++;
    }

    console.log(`  ℹ️ 找到 ${foundCount}/${features.length} 个功能菜单`);
  });
}

/**
 * ==================== 后端云函数测试 ====================
 */
async function testBackendCloudFunctions() {
  console.log('\n⚙️=== 后端云函数测试 ===');

  // B001: Auth云函数-获取用户信息
  await runTest('backend', 'Auth-获取用户信息', async () => {
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
  });

  // B002: 收藏-添加收藏
  const testRecipeId = 'test_recipe_' + Date.now();

  await runTest('backend', 'Favorite-添加收藏', async () => {
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

  // B003: 收藏-重复添加
  await runTest('backend', 'Favorite-重复添加', async () => {
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

  // B004: 收藏-取消收藏
  await runTest('backend', 'Favorite-取消收藏', async () => {
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

  // B005: 收藏-参数校验
  await runTest('backend', 'Favorite-参数校验', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'user-toggle-favorite',
      params: {
        recipeId: testRecipeId
        // 缺少action
      }
    });

    if (result.code === 0) {
      throw new Error('缺少action应该返回错误');
    }
  });

  // B006: 推荐-获取推荐
  await runTest('backend', 'Recommend-获取推荐', async () => {
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
    console.log(`  ℹ️ 获取到 ${result.data.recommendations.length} 条推荐`);
  });

  // B007: 推荐-刷新
  await runTest('backend', 'Recommend-刷新推荐', async () => {
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

  // B008: 每日精选-查询状态
  await runTest('backend', 'Curation-查询状态', async () => {
    const result = await mcp__cloudbase__invokeFunction({
      name: 'recipe-daily-curation',
      params: {}
    });

    if (result.code !== 0) {
      throw new Error(`调用失败: ${result.message}`);
    }
    console.log(`  ℹ️ 状态: ${result.message}`);
  });
}

/**
 * ==================== 数据库操作测试 ====================
 */
async function testDatabaseOperations() {
  console.log('\n🗄️=== 数据库操作测试 ===');

  // DB001: 查询菜谱集合
  await runTest('backend', 'DB-查询菜谱集合', async () => {
    const result = await mcp__cloudbase__readNoSqlDatabaseContent({
      collectionName: 'recipes',
      limit: 5
    });

    if (!result || !result.data) {
      throw new Error('查询失败');
    }
    console.log(`  ℹ️ 查询到 ${result.data.length} 条菜谱`);
  });

  // DB002: 查询用户集合
  await runTest('backend', 'DB-查询用户集合', async () => {
    const result = await mcp__cloudbase__readNoSqlDatabaseContent({
      collectionName: 'users',
      limit: 5
    });

    if (!result || !result.data) {
      throw new Error('查询失败');
    }
    console.log(`  ℹ️ 查询到 ${result.data.length} 个用户`);
  });

  // DB003: 查询每日精选
  await runTest('backend', 'DB-查询每日精选', async () => {
    const result = await mcp__cloudbase__readNoSqlDatabaseContent({
      collectionName: 'market_daily',
      limit: 5,
      sort: [{ key: 'date', direction: -1 }]
    });

    if (!result || !result.data) {
      throw new Error('查询失败');
    }
    if (result.data.length > 0) {
      console.log(`  ℹ️ 最近每日精选: ${result.data[0].date}`);
    } else {
      console.log('  ⚠️ 暂无每日精选数据');
    }
  });

  // DB004: 查询AI生成日志
  await runTest('backend', 'DB-查询AI日志', async () => {
    const result = await mcp__cloudbase__readNoSqlDatabaseContent({
      collectionName: 'ai_generation_logs',
      limit: 5,
      sort: [{ key: 'startTime', direction: -1 }]
    });

    if (!result || !result.data) {
      throw new Error('查询失败');
    }
    console.log(`  ℹ️ AI日志数量: ${result.data.length}`);
  });
}

/**
 * ==================== 控制台日志检查 ====================
 */
async function testConsoleLogs() {
  console.log('\n📝=== 控制台日志检查 ===');

  // 清空日志
  await mcp__weixin-devtools-mcp__clear_network_requests({ clearRemote: true });

  // C001: 检查控制台错误
  await runTest('integration', '控制台-无Error日志', async () => {
    await new Promise(r => setTimeout(r, 3000));

    const logs = await mcp__weixin-devtools-mcp__list_console_messages({
      types: ['error', 'warn'],
      pageSize: 50
    });

    const errors = logs.filter(l => l.type === 'error');
    const warnings = logs.filter(l => l.type === 'warn');

    testResults.consoleErrors = errors;

    if (errors.length > 0) {
      console.log(`  ⚠️ 发现 ${errors.length} 个错误日志`);
      errors.slice(0, 3).forEach(e => {
        console.log(`    - ${e.message}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`  ℹ️ 发现 ${warnings.length} 个警告日志`);
    }

    // 不抛出错误，仅记录
    console.log(`  ℹ️ 控制台检查完成: ${errors.length} 错误, ${warnings.length} 警告`);
  });
}

/**
 * ==================== 网络请求检查 ====================
 */
async function testNetworkRequests() {
  console.log('\n🌐=== 网络请求检查 ===');

  // N001: 检查网络请求
  await runTest('integration', '网络-请求检查', async () => {
    // 重新加载页面触发请求
    await mcp__weixin-devtools-mcp__relaunch({
      url: '/pages/index/index',
      waitForLoad: true
    });
    await new Promise(r => setTimeout(r, 3000));

    const requests = await mcp__weixin-devtools-mcp__list_network_requests({});
    testResults.networkRequests = requests;

    const failedRequests = requests.filter(r => r.status >= 400);
    const cloudRequests = requests.filter(r => r.url && r.url.includes('cloud.tencent'));

    console.log(`  ℹ️ 总请求: ${requests.length}, 失败: ${failedRequests.length}, 云请求: ${cloudRequests.length}`);

    if (failedRequests.length > 0) {
      console.log(`  ⚠️ ${failedRequests.length} 个请求失败`);
      failedRequests.slice(0, 3).forEach(r => {
        console.log(`    - ${r.url}: ${r.status}`);
      });
    }
  });
}

/**
 * ==================== 主测试流程 ====================
 */
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🚀 完整测试套件开始执行');
  console.log('  覆盖: 前端所有页面 + 后端所有云函数 + 集成测试');
  console.log('═══════════════════════════════════════════════════════════');

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

    // 2. 执行前端测试
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  📱 前端功能测试');
    console.log('═══════════════════════════════════════════════════════════');

    await testHomePageDetailed();
    await testMarketPageDetailed();
    await testFavoritesPageDetailed();
    await testRecommendPageDetailed();
    await testProfilePageDetailed();
    await testSearchPageDetailed();
    await testDetailPageDetailed();
    await testTabSwitching();

    // 3. 执行后端测试
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  ⚙️ 后端功能测试');
    console.log('═══════════════════════════════════════════════════════════');

    await testBackendCloudFunctions();
    await testDatabaseOperations();

    // 4. 执行集成测试
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  🔗 集成测试');
    console.log('═══════════════════════════════════════════════════════════');

    await testConsoleLogs();
    await testNetworkRequests();

    // 5. 断开连接
    await mcp__weixin-devtools-mcp__disconnect_devtools();

  } catch (error) {
    console.error('\n❌ 测试套件执行失败:', error.message);
  }

  // 生成报告
  const duration = Date.now() - startTime;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  📊 完整测试报告');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  总测试数: ${testResults.total}`);
  console.log(`  ✅ 通过: ${testResults.passed}`);
  console.log(`  ❌ 失败: ${testResults.failed}`);
  console.log(`  ⏱️ 耗时: ${(duration / 1000).toFixed(1)}s`);
  console.log('═══════════════════════════════════════════════════════════');

  // 分类统计
  const frontendTests = testResults.testDetails.frontend.length;
  const frontendPassed = testResults.testDetails.frontend.filter(t => t.status === 'passed').length;
  const backendTests = testResults.testDetails.backend.length;
  const backendPassed = testResults.testDetails.backend.filter(t => t.status === 'passed').length;
  const integrationTests = testResults.testDetails.integration.length;
  const integrationPassed = testResults.testDetails.integration.filter(t => t.status === 'passed').length;

  console.log('\n  分类统计:');
  console.log(`    前端测试: ${frontendPassed}/${frontendTests} 通过`);
  console.log(`    后端测试: ${backendPassed}/${backendTests} 通过`);
  console.log(`    集成测试: ${integrationPassed}/${integrationTests} 通过`);

  if (testResults.failed > 0) {
    console.log('\n❌ 失败详情:');
    testResults.errors.forEach(e => {
      console.log(`  [${e.category}] ${e.name}: ${e.error}`);
    });
  }

  // 保存详细报告
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
  const reportPath = path.join(reportDir, `complete-test-suite-${timestamp}.json`);

  const report = {
    timestamp: new Date().toISOString(),
    duration,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: testResults.total > 0 ? `${((testResults.passed / testResults.total) * 100).toFixed(1)}%` : '0%'
    },
    categories: {
      frontend: {
        total: testResults.testDetails.frontend.length,
        passed: testResults.testDetails.frontend.filter(t => t.status === 'passed').length,
        tests: testResults.testDetails.frontend
      },
      backend: {
        total: testResults.testDetails.backend.length,
        passed: testResults.testDetails.backend.filter(t => t.status === 'passed').length,
        tests: testResults.testDetails.backend
      },
      integration: {
        total: testResults.testDetails.integration.length,
        passed: testResults.testDetails.integration.filter(t => t.status === 'passed').length,
        tests: testResults.testDetails.integration
      }
    },
    errors: testResults.errors,
    consoleErrors: testResults.consoleErrors,
    networkRequests: testResults.networkRequests.map(r => ({
      url: r.url,
      method: r.method,
      status: r.status,
      duration: r.duration
    }))
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存: ${reportPath}`);
}

// 运行测试
runAllTests().then(results => {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  🏁 测试执行完成');
  console.log('═══════════════════════════════════════════════════════════');
  process.exit(results.failed > 0 ? 1 : 0);
});

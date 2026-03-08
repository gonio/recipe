/**
 * 快速验证测试 - 使用 miniprogram-automator
 */

const automator = require('miniprogram-automator');

async function quickTest() {
  console.log('🚀 快速验证测试开始\n');

  try {
    // 连接开发者工具
    console.log('📡 连接到 ws://127.0.0.1:9420');
    const miniProgram = await automator.connect({
      wsEndpoint: 'ws://127.0.0.1:9420'
    });
    console.log('✅ 连接成功!\n');

    // 简单测试：重新加载首页
    console.log('🧪 测试: 重新加载首页');
    const page = await miniProgram.reLaunch('/pages/index/index');
    console.log('  ✅ 首页重新加载成功');

    // 等待页面稳定
    await page.waitFor(3000);

    // 截图
    console.log('📸 截图保存中...');
    await page.screenshot({
      path: 'minitest/reports/quick-test-index.png'
    });
    console.log('  ✅ 截图已保存到 minitest/reports/quick-test-index.png');

    // 切换到市场页面
    console.log('\n🧪 测试: 切换到市场页面');
    const marketPage = await miniProgram.switchTab('/pages/market/market');
    await marketPage.waitFor(2000);
    console.log('  ✅ 市场页面加载成功');

    // 截图
    await marketPage.screenshot({
      path: 'minitest/reports/quick-test-market.png'
    });
    console.log('  ✅ 截图已保存');

    // 关闭连接
    await miniProgram.close();
    console.log('\n📡 已断开连接');

    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ 所有测试通过！');
    console.log('═══════════════════════════════════════════');

    return true;
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    return false;
  }
}

// 确保目录存在
const fs = require('fs');
const path = require('path');
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

quickTest().then(success => {
  process.exit(success ? 0 : 1);
});

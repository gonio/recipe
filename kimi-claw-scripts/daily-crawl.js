/**
 * 每日定时爬取脚本
 * 
 * 这个脚本通过 node-cron 设置定时任务，每天自动执行菜谱爬取
 * 适用于 Kimi Claw 的云服务环境
 * 
 * 在 Kimi Claw 中设置定时任务：
 * "每天早上 9 点，执行 npm run daily，然后如果有新增菜谱，
 *  推送通知给所有用户"
 */

require('dotenv').config();
const cron = require('node-cron');
const { crawlRecipes, setDailyRecommend } = require('./crawler');

// 每日任务配置
const DAILY_CONFIG = {
  // 定时规则：每天早上 9 点执行
  // 格式: 秒(可选) 分 时 日 月 周
  schedule: '0 9 * * *',
  
  // 每个菜系爬取数量
  recipesPerCuisine: 3,
  
  // 是否启用推送通知（需要额外配置推送服务）
  enablePush: false
};

console.log('🤖 Kimi Claw 菜谱爬虫服务已启动');
console.log(`⏰ 定时规则: 每天 ${DAILY_CONFIG.schedule}`);

// 执行每日爬取任务
async function runDailyTask() {
  const now = new Date().toLocaleString('zh-CN');
  console.log(`\n🕘 [${now}] 开始执行每日爬取任务...`);
  
  try {
    // 1. 爬取新菜谱
    const count = await crawlRecipes();
    
    // 2. 设置今日推荐
    await setDailyRecommend();
    
    // 3. 发送通知（可选）
    if (count > 0 && DAILY_CONFIG.enablePush) {
      await sendNotification(count);
    }
    
    console.log(`✅ [${now}] 任务完成，新增 ${count} 个菜谱`);
  } catch (error) {
    console.error(`❌ [${now}] 任务失败:`, error);
  }
}

// 发送推送通知（示例）
async function sendNotification(newCount) {
  console.log(`📢 发送推送: 今日新增 ${newCount} 道菜谱`);
  
  // 这里可以集成微信订阅消息、推送服务等
  // 需要额外的配置和实现
}

// 设置定时任务
const task = cron.schedule(DAILY_CONFIG.schedule, runDailyTask, {
  scheduled: true,
  timezone: 'Asia/Shanghai'
});

// 立即执行一次（测试用）
if (process.argv.includes('--now')) {
  console.log('⚡ 立即执行模式');
  runDailyTask().then(() => {
    console.log('🏁 测试执行完成');
    process.exit(0);
  });
} else {
  // 启动定时任务
  task.start();
  console.log('✅ 定时任务已启动，等待执行...');
  console.log('💡 按 Ctrl+C 停止服务');
}

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务...');
  task.stop();
  process.exit(0);
});

module.exports = { runDailyTask };

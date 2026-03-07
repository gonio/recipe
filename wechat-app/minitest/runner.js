/**
 * MCP 自动化测试运行器
 * 批量执行所有测试脚本
 *
 * 使用方法:
 *   node runner.js              # 运行所有测试
 *   node runner.js --test market # 只运行市场页面测试
 *   node runner.js --report     # 生成 HTML 报告
 */

const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  projectPath: '/mnt/d/recipe/recipe-miniapp/wechat-app',
  timeout: 30000,
  testDir: __dirname,
  outputDir: path.join(__dirname, 'reports')
};

// 测试套件列表
const TEST_SUITES = [
  { name: 'market', file: 'test-market.js', description: '市场页面测试' },
  { name: 'home', file: 'test-home.js', description: '首页测试', optional: true },
  { name: 'favorite', file: 'test-favorite.js', description: '收藏功能测试', optional: true },
  { name: 'search', file: 'test-search.js', description: '搜索功能测试', optional: true },
  { name: 'perf', file: 'test-performance.js', description: '性能测试', optional: true }
];

/**
 * 运行单个测试套件
 */
async function runTestSuite(suite) {
  const suitePath = path.join(CONFIG.testDir, suite.file);

  // 检查文件是否存在
  if (!fs.existsSync(suitePath)) {
    if (suite.optional) {
      console.log(`⚠️ 跳过可选测试套件: ${suite.name} (文件不存在)`);
      return { name: suite.name, skipped: true };
    }
    throw new Error(`测试文件不存在: ${suitePath}`);
  }

  console.log(`\n📦 运行测试套件: ${suite.description || suite.name}`);
  console.log('─'.repeat(50));

  try {
    // 动态加载测试模块
    const testModule = require(suitePath);

    if (typeof testModule.runAllTests === 'function') {
      const result = await testModule.runAllTests();
      return { name: suite.name, ...result };
    } else {
      console.log(`⚠️ 测试套件 ${suite.name} 没有 runAllTests 方法`);
      return { name: suite.name, skipped: true };
    }
  } catch (error) {
    console.error(`❌ 测试套件 ${suite.name} 执行失败:`, error.message);
    return {
      name: suite.name,
      passed: 0,
      failed: 1,
      total: 1,
      error: error.message
    };
  }
}

/**
 * 生成测试报告
 */
function generateReport(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(CONFIG.outputDir, `report-${timestamp}.html`);

  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const totalPassed = results.reduce((sum, r) => sum + (r.passed || 0), 0);
  const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);
  const totalSkipped = results.filter(r => r.skipped).length;

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>菜谱小程序测试报告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #42A5F5; padding-bottom: 15px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .stat { text-align: center; padding: 20px; border-radius: 8px; }
    .stat.total { background: #E3F2FD; }
    .stat.passed { background: #E8F5E9; color: #2E7D32; }
    .stat.failed { background: #FFEBEE; color: #C62828; }
    .stat.skipped { background: #FFF8E1; color: #F57C00; }
    .stat-number { font-size: 36px; font-weight: bold; margin-bottom: 5px; }
    .stat-label { font-size: 14px; opacity: 0.8; }
    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    th { background: #f5f5f5; font-weight: 600; }
    .status { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
    .status.pass { background: #C8E6C9; color: #2E7D32; }
    .status.fail { background: #FFCDD2; color: #C62828; }
    .status.skip { background: #FFE082; color: #F57C00; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 菜谱小程序 MCP 自动化测试报告</h1>
    <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>

    <div class="summary">
      <div class="stat total">
        <div class="stat-number">${results.length}</div>
        <div class="stat-label">测试套件</div>
      </div>
      <div class="stat passed">
        <div class="stat-number">${totalPassed}</div>
        <div class="stat-label">通过</div>
      </div>
      <div class="stat failed">
        <div class="stat-number">${totalFailed}</div>
        <div class="stat-label">失败</div>
      </div>
      <div class="stat skipped">
        <div class="stat-number">${totalSkipped}</div>
        <div class="stat-label">跳过</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>测试套件</th>
          <th>描述</th>
          <th>通过</th>
          <th>失败</th>
          <th>耗时</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => `
        <tr>
          <td>${r.name}</td>
          <td>${TEST_SUITES.find(s => s.name === r.name)?.description || '-'}</td>
          <td>${r.passed || 0}</td>
          <td>${r.failed || 0}</td>
          <td>${r.duration ? r.duration + 'ms' : '-'}</td>
          <td>
            ${r.skipped
              ? '<span class="status skip">跳过</span>'
              : (r.failed === 0
                ? '<span class="status pass">通过</span>'
                : '<span class="status fail">失败</span>')
            }
          </td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(reportPath, html);
  console.log(`\n📄 测试报告已生成: ${reportPath}`);

  return reportPath;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const targetTest = args.find(arg => arg.startsWith('--test='))?.split('=')[1];
  const generateReportFlag = args.includes('--report');

  console.log('═══════════════════════════════════════════');
  console.log('  🚀 MCP 自动化测试运行器');
  console.log('═══════════════════════════════════════════');
  console.log(`项目路径: ${CONFIG.projectPath}\n`);

  const results = [];

  if (targetTest) {
    // 运行指定测试
    const suite = TEST_SUITES.find(s => s.name === targetTest);
    if (suite) {
      results.push(await runTestSuite(suite));
    } else {
      console.error(`❌ 未知测试套件: ${targetTest}`);
      console.log('可用测试:', TEST_SUITES.map(s => s.name).join(', '));
      process.exit(1);
    }
  } else {
    // 运行所有测试
    for (const suite of TEST_SUITES) {
      results.push(await runTestSuite(suite));
    }
  }

  // 生成报告
  if (generateReportFlag) {
    await generateReport(results);
  }

  // 总结
  const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);

  console.log('\n═══════════════════════════════════════════');
  console.log('  🏁 测试完成');
  console.log('═══════════════════════════════════════════');

  process.exit(totalFailed > 0 ? 1 : 0);
}

// 运行
main().catch(error => {
  console.error('❌ 运行器错误:', error);
  process.exit(1);
});

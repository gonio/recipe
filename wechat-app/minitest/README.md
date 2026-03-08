# 🧪 MCP 自动化测试

使用 WeChat Developer Tools MCP 进行小程序端到端自动化测试。

## 快速开始

### 1. 启动开发者工具

使用智能轮询脚本自动启动：

```bash
cd wechat-app/minitest

# 启动开发者工具（自动轮询检测就绪）
node launch-devtools.js
```

脚本会自动：
- 启动微信开发者工具
- 轮询检测端口 9420 就绪
- 连接验证成功即表示启动完成
- 保持开发者工具运行

### 2. 运行 MCP 测试

开发者工具启动后，运行测试：

```bash
# 方式一：使用 Claude MCP 工具直接测试
# （Claude 会自动连接并执行测试）

# 方式二：使用测试运行器
node runner.js

# 方式三：运行单个测试
node test-market.js
```

## 测试流程

### 完整流程示例

```javascript
// 1. 启动开发者工具（launch-devtools.js）
// 2. 使用 MCP 运行测试

// 连接开发者工具
await mcp__weixin-devtools-mcp__connect_devtools({
  projectPath: 'D:\\recipe\\recipe-miniapp\\wechat-app',
  strategy: 'wsEndpoint',
  wsEndpoint: 'ws://127.0.0.1:9420'
});

// 刷新页面开始测试
await mcp__weixin-devtools-mcp__relaunch({
  url: '/pages/index/index',
  waitForLoad: true
});

// 获取页面快照
const snapshot = await mcp__weixin-devtools-mcp__get_page_snapshot({
  format: 'compact'
});

// 点击元素
await mcp__weixin-devtools-mcp__click({ uid: 'view.cuisine-tag_川菜' });

// 截图保存
await mcp__weixin-devtools-mcp__screenshot({
  path: 'reports/test-result.png'
});
```

### 2. 测试脚本说明

| 脚本 | 功能 | 状态 |
|------|------|------|
| `test-market.js` | 市场页面测试（US3） | ✅ 可用 |
| `test-home.js` | 首页测试（US1） | ⏳ 待创建 |
| `test-favorite.js` | 收藏功能测试（US2） | ⏳ 待创建 |
| `test-search.js` | 搜索功能测试（US1） | ⏳ 待创建 |
| `test-performance.js` | 性能测试（US4） | ⏳ 待创建 |
| `runner.js` | 批量测试运行器 | ✅ 可用 |

### 3. 运行测试

#### 方式一：使用 Claude MCP 直接执行

在 Claude 中直接调用 MCP 工具：

```javascript
// 1. 连接 DevTools
await connect_devtools({
  projectPath: '/mnt/d/recipe/recipe-miniapp/wechat-app',
  strategy: 'auto'
});

// 2. 运行测试
await switch_tab({ url: '/pages/market/market' });
const snapshot = await get_page_snapshot();
console.log(snapshot);

// 3. 断开连接
await disconnect_devtools();
```

#### 方式二：使用测试运行器

```bash
cd /mnt/d/recipe/recipe-miniapp/wechat-app/minitest

# 运行所有测试
node runner.js

# 运行指定测试
node runner.js --test=market

# 生成 HTML 报告
node runner.js --report
```

#### 方式三：直接运行单个测试

```bash
node test-market.js
```

---

## 🧪 测试覆盖范围

### US3 - 市场页面测试 (test-market.js)

| 测试项 | 描述 | MCP 命令 |
|--------|------|----------|
| 页面加载 | 验证市场页面正确加载 | `switch_tab` → `wait_for` |
| Market 标识 | 验证 NEW/精选标识显示 | `get_page_snapshot` |
| 详情跳转 | 点击菜谱跳转详情页 | `click` → `wait_for` |
| 收藏功能 | 点击收藏按钮 | `click` |
| 菜系筛选 | 点击菜系标签筛选 | `click` → `assert_state` |
| 搜索功能 | 输入关键词搜索 | `fill` → `press_key` |

---

## 🛠️ MCP 命令参考

### 连接与导航

```javascript
// 连接 DevTools
await connect_devtools({
  projectPath: '/path/to/wechat-app',
  strategy: 'auto'  // auto/launch/connect
});

// 切换 Tab
await switch_tab({ url: '/pages/market/market' });

// 页面导航
await navigate_to({ url: '/pages/recipe-detail/recipe-detail' });

// 返回上一页
await navigate_back();
```

### 元素操作

```javascript
// 获取页面快照
const snapshot = await get_page_snapshot();
const detailedSnapshot = await get_page_snapshot({ verbose: true });

// 点击元素
await click({ uid: 'element-uid' });

// 双击
await click({ uid: 'element-uid', dblClick: true });

// 输入文本
await input_text({ uid: 'input-uid', text: '搜索关键词' });

// 获取元素值
const value = await get_value({ uid: 'element-uid' });
```

### 断言验证

```javascript
// 验证文本
await assert_text({ uid: 'element-uid', text: '宫保鸡丁' });
await assert_text({ uid: 'element-uid', textContains: '新增' });

// 验证状态
await assert_state({ uid: 'element-uid', visible: true });
await assert_state({ uid: 'checkbox', checked: true });
await assert_state({ uid: 'button', enabled: true });

// 验证属性
await assert_attribute({ uid: 'image', attributeKey: 'src', attributeValue: '/images/food.png' });
```

### 等待与同步

```javascript
// 等待文本出现
await waitFor({ text: '加载完成', timeout: 5000 });

// 等待元素出现
await waitFor({ selector: '.recipe-card', timeout: 3000 });

// 固定延时
await new Promise(resolve => setTimeout(resolve, 1000));
```

### 网络与性能

```javascript
// 清空网络请求记录
await clear_network_requests();

// 获取网络请求
const requests = await get_network_requests();

// 模拟网络环境
await emulate({ networkConditions: 'Slow 3G' });
await emulate({ networkConditions: 'Offline' });

// 恢复网络
await emulate({ networkConditions: null });
```

### 调试

```javascript
// 获取控制台消息
const logs = await list_console_messages();
const errors = await list_console_messages({ types: ['error'] });

// 截图
await screenshot({ path: 'error-screenshot.png' });
```

---

## 📝 编写新测试

创建一个新的测试文件 `test-xxx.js`：

```javascript
/**
 * XXX 功能测试
 */

const TEST_CONFIG = {
  projectPath: '/mnt/d/recipe/recipe-miniapp/wechat-app',
  timeout: 10000
};

async function testXXX() {
  console.log('🧪 测试: XXX 功能');

  try {
    // 1. 导航到页面
    await switch_tab({ url: '/pages/xxx/xxx' });

    // 2. 获取页面快照
    const snapshot = await get_page_snapshot();

    // 3. 执行操作
    await click({ uid: 'button-uid' });

    // 4. 验证结果
    await assert_text({ uid: 'result', text: '成功' });

    console.log('  ✅ 测试通过');
    return { passed: true, name: 'XXX 功能' };
  } catch (error) {
    console.error('  ❌ 测试失败:', error.message);
    return { passed: false, name: 'XXX 功能', error: error.message };
  }
}

async function runAllTests() {
  // 连接 DevTools
  await connect_devtools({ projectPath: TEST_CONFIG.projectPath });

  // 运行测试
  const results = [];
  results.push(await testXXX());

  // 断开连接
  await disconnect_devtools();

  // 返回结果
  return results;
}

module.exports = { runAllTests };
```

然后在 `runner.js` 的 `TEST_SUITES` 中添加：

```javascript
const TEST_SUITES = [
  { name: 'market', file: 'test-market.js', description: '市场页面测试' },
  { name: 'xxx', file: 'test-xxx.js', description: 'XXX 功能测试' },
  // ...
];
```

---

## 🐛 故障排除

### MCP 连接失败

```bash
# 检查微信开发者工具是否运行
# 检查项目路径是否正确
# 尝试重新连接

await reconnect_devtools({
  projectPath: '/mnt/d/recipe/recipe-miniapp/wechat-app'
});
```

### 元素找不到

```javascript
// 使用文本匹配代替 UID
await click({ text: '宫保鸡丁' });

// 或使用 CSS 选择器
await click({ selector: 'view.recipe-card' });
```

### 页面加载超时

```javascript
// 增加等待时间
await waitFor({ text: '目标文本', timeout: 10000 });

// 或使用轮询
await waitFor({ selector: '.loaded', timeout: 15000 });
```

---

## 📊 测试报告

运行测试时添加 `--report` 参数生成 HTML 报告：

```bash
node runner.js --report
```

报告包含：
- 测试套件汇总
- 通过/失败/跳过统计
- 每个测试套件的详细结果
- 失败原因分析

---

## 🔗 相关文档

- [TESTING.md](../TESTING.md) - 完整测试指南
- [spec.md](../../specs/001-cloudbase-migration/spec.md) - 功能规格说明
- [tasks.md](../../specs/001-cloudbase-migration/tasks.md) - 测试任务清单

# 🧪 前端测试指南

## 测试方式概览

本项目支持两种测试方式：

| 方式 | 适用场景 | 速度 | 工具 |
|------|---------|------|------|
| **自动化 MCP 测试** ⭐推荐 | 回归测试、性能测试、CI/CD | 快（分钟级） | WeChat DevTools MCP |
| **手动测试** | 探索性测试、UI 微调 | 慢（小时级） | 微信开发者工具 |

---

## 🤖 自动化 MCP 测试（推荐）

通过 **WeChat Developer Tools MCP** 实现端到端自动化测试。

### MCP 能力

- **页面快照** (`get_page_snapshot`): 获取页面元素结构
- **元素操作** (`click`, `fill`, `scroll`): 模拟用户交互
- **页面导航** (`navigate_to`, `switch_tab`): 在页面间跳转
- **断言验证** (`assert_text`, `assert_state`): 验证预期结果
- **网络模拟** (`emulate`): 模拟离线/慢网环境
- **控制台监控** (`list_console_messages`): 捕获运行时日志

### 快速开始

```bash
# 1. 确保微信开发者工具已打开项目
cd /mnt/d/recipe/recipe-miniapp/wechat-app

# 2. 运行自动化测试
# MCP 将自动连接 DevTools 并执行测试
```

### 测试脚本示例

```javascript
// test-market.js - 测试市场页面
async function testMarketPage() {
  // 连接 DevTools
  await connect_devtools({ projectPath: '/mnt/d/recipe/recipe-miniapp/wechat-app' });

  // 切换到 Market Tab
  await switch_tab({ url: '/pages/market/market' });

  // 获取页面快照
  const snapshot = await get_page_snapshot();

  // 验证今日新增提示存在
  const hasNotice = snapshot.includes('今日新增');
  assert(hasNotice, '应显示今日新增提示');

  // 点击第一个菜谱
  await click({ uid: 'recipe-item-0' });

  // 验证跳转到详情页
  await wait_for({ text: '食材' });

  console.log('✅ Market 页面测试通过');
}
```

### 测试覆盖范围

| 功能 | 测试脚本 | MCP 命令组合 |
|------|---------|-------------|
| 菜谱浏览 | `test-browse.js` | `navigate_to` → `get_page_snapshot` → `click` → `assert_text` |
| 搜索功能 | `test-search.js` | `fill` → `press_key(Enter)` → `wait_for` → `assert_state` |
| 收藏/取消 | `test-favorite.js` | `click` → `wait_for` → `switch_tab` → `assert_text` |
| 网络错误 | `test-network.js` | `emulate(offline)` → `click` → `assert_text(error-msg)` |
| 性能测试 | `test-perf.js` | `navigate_page` → measure time → `assert < 2000ms` |

### 批量运行测试

```bash
# 运行所有自动化测试
npm run test:mcp

# 运行指定测试
npm run test:mcp -- --test test-market.js

# 生成测试报告
npm run test:mcp -- --report
```

---

## 🖐️ 手动测试

当自动化测试无法满足需求时使用（如 UI 微调、探索性测试）。

### 1. 启动测试服务器
```bash
cd /mnt/d/recipe/recipe-miniapp

# 确保安装了依赖
npm install express cors

# 启动测试服务器
node test-server.js
```

看到以下输出表示启动成功：
```
🧪 菜谱小程序前端测试服务器已启动
地址: http://localhost:3999/api
```

### 2. 配置微信小程序

编辑 `wechat-app/app.js`，修改 `apiBaseUrl`：
```javascript
globalData: {
  apiBaseUrl: 'http://localhost:3999/api',  // 改成测试服务器地址
  // ...
}
```

### 3. 微信开发者工具设置

1. 打开微信开发者工具
2. 导入 `wechat-app` 项目
3. 点击「详情」→「本地设置」
4. ✅ 勾选「不校验合法域名、web-view...」

### 4. 开始测试

点击「编译」，即可看到小程序运行！

---

## 📱 真机测试（手机预览）

### 方法一：内网访问（推荐）

1. **获取电脑IP地址**
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
   找到类似 `192.168.1.xxx` 的地址

2. **修改测试服务器监听地址**
   编辑 `test-server.js`，把最后一行改为：
   ```javascript
   app.listen(PORT, '0.0.0.0', () => { ... })
   ```

3. **修改小程序 API 地址**
   ```javascript
   apiBaseUrl: 'http://192.168.1.xxx:3999/api'
   ```

4. **手机连接同一 WiFi**，然后扫码预览

### 方法二：内网穿透

使用 ngrok 或花生壳等工具：
```bash
# 安装 ngrok
npm install -g ngrok

# 启动穿透（将本地 3999 端口暴露到公网）
ngrok http 3999
```

然后把生成的公网地址填入小程序配置。

---

## ✅ 测试 Checklist

### 🤖 MCP 自动化测试

```javascript
// 测试套件配置
const testSuite = {
  // 首页测试
  home: [
    { name: '显示问候语', cmd: 'assert_text', selector: '.greeting', expect: '包含"你好"' },
    { name: '新菜谱徽章', cmd: 'assert_state', selector: '.badge', visible: true },
    { name: '搜索跳转', cmd: 'click', selector: '.search-bar', then: 'navigate_to /pages/search/search' },
    { name: '菜系筛选', cmd: 'click', selector: '.cuisine-tag', then: 'assert_active' },
    { name: '菜谱列表', cmd: 'assert_state', selector: '.recipe-card', count: '>0' },
    { name: '跳转详情', cmd: 'click', selector: '.recipe-card', then: 'wait_for 食材' },
    { name: '取消收藏', cmd: 'click', selector: '.heart-btn', then: 'assert_text 已取消' }
  ],

  // 市场页测试
  market: [
    { name: '今日新增提示', cmd: 'assert_text', selector: '.new-notice', expect: '包含"今日新增"' },
    { name: '菜谱网格', cmd: 'assert_state', selector: '.recipe-grid', visible: true },
    { name: 'NEW标识', cmd: 'assert_state', selector: '.market-badge.new', visible: true },
    { name: '精选标识', cmd: 'assert_state', selector: '.market-badge.recommended', visible: true },
    { name: '推荐理由', cmd: 'assert_text', selector: '.recommend-reason', expect: '非空' }
  ],

  // 性能测试
  performance: [
    { name: '首页加载<2s', cmd: 'measure_load', page: 'index', max: 2000 },
    { name: '详情页加载<2s', cmd: 'measure_load', page: 'recipe-detail', max: 2000 },
    { name: '收藏响应<300ms', cmd: 'measure_action', action: 'favorite', max: 300 }
  ]
};
```

### 🖐️ 手动测试（UI 微调时使用）

#### 首页
- [ ] 正常显示问候语和用户名
- [ ] 显示"3道新菜谱"徽章
- [ ] 点击搜索栏跳转搜索页
- [ ] 菜系筛选标签可点击切换
- [ ] 收藏的菜谱列表正常显示
- [ ] 点击菜谱卡片跳转详情页
- [ ] 点击心形取消收藏

#### 市场页
- [ ] 显示"今日新增X道菜谱"提示
- [ ] NEW/精选标识正确显示
- [ ] 推荐理由显示完整
- [ ] 菜谱网格布局正确
- [ ] 点击菜谱跳转详情
- [ ] 点击收藏按钮收藏成功

#### 推荐页
- [ ] 显示今日日期
- [ ] 显示推荐菜谱
- [ ] 收藏/取消收藏功能正常

#### 个人中心
- [ ] 用户头像和昵称显示正确
- [ ] 统计数字正确
- [ ] 偏好设置可点击

#### 偏好设置
- [ ] 显示当前已选择的菜系
- [ ] 点击菜系可选中/取消
- [ ] 保存设置成功提示

#### 搜索页
- [ ] 输入关键词实时搜索
- [ ] 搜索结果正确显示
- [ ] 点击结果跳转详情

#### 菜谱详情
- [ ] 大图展示正常
- [ ] 食材清单完整显示
- [ ] 步骤列表带序号显示
- [ ] 收藏按钮可点击

---

## 🔧 常见问题

### MCP 连接失败
```bash
# 检查微信开发者工具是否运行
# 检查项目路径是否正确
# 尝试重新连接
await reconnect_devtools({ projectPath: '/正确/路径/wechat-app' });
```

### 页面元素找不到
```javascript
// 使用更通用的选择器
await click({ selector: 'view.recipe-card' });  // 使用 CSS 选择器
await click({ text: '宫保鸡丁' });              // 使用文本匹配
```

### 数据显示异常
```javascript
// 通过 MCP 捕获控制台日志
const logs = await list_console_messages({ types: ['error', 'warn'] });
console.log('错误日志:', logs);
```

---

## 📝 测试数据说明

CloudBase 数据库已预置 5 道示例菜谱：
- 🌶️ 宫保鸡丁（川菜，热度 85）
- 🐟 清蒸鲈鱼（粤菜，热度 78）
- 🌶️ 麻婆豆腐（川菜，热度 92）
- 🍖 糖醋排骨（家常菜，热度 88）
- 🥚 番茄炒蛋（家常菜，热度 95）

测试用户 OpenID: `test_user_openid_001`
默认收藏：宫保鸡丁、清蒸鲈鱼

---

## 🐛 MCP 调试技巧

### 1. 页面快照分析
```javascript
// 获取完整页面结构
const snapshot = await get_page_snapshot({ verbose: true });
console.log(snapshot);
```

### 2. 网络请求监控
```javascript
// 捕获网络请求
await clear_network_requests();
await click({ selector: '.favorite-btn' });
const requests = await get_network_requests({ type: 'request' });
console.log('收藏接口请求:', requests);
```

### 3. 模拟不同网络环境
```javascript
// 模拟慢网
await emulate({ networkConditions: 'Slow 3G' });

// 模拟离线
await emulate({ networkConditions: 'Offline' });

// 恢复
await emulate({ networkConditions: null });
```

### 4. 性能分析
```javascript
// 测量页面加载时间
const start = Date.now();
await navigate_to({ url: '/pages/recipe-detail/recipe-detail' });
await wait_for({ selector: '.recipe-name' });
const loadTime = Date.now() - start;
console.log(`页面加载时间: ${loadTime}ms`);
assert(loadTime < 2000, '加载时间应小于2秒');
```

---

## 🎉 测试通过标准

### MCP 自动化测试通过标准
```javascript
const passCriteria = {
  // 功能测试
  functional: {
    '首页浏览': true,      // 菜谱列表加载
    '搜索功能': true,      // 关键词搜索
    '收藏/取消': true,     // 收藏状态切换
    '详情页': true,        // 菜谱详情展示
    '市场页': true,        // 每日精选
  },

  // 性能指标
  performance: {
    '首页加载': '< 2000ms',
    '详情页加载': '< 2000ms',
    '收藏响应': '< 300ms',
    '搜索响应': '< 1000ms'
  },

  // 错误处理
  errorHandling: {
    '网络错误提示': true,
    '离线状态检测': true,
    '空状态显示': true
  }
};
```

### 手动测试补充检查
- ✅ UI 视觉效果符合设计稿
- ✅ 动画过渡流畅自然
- ✅ 不同屏幕尺寸适配良好
- ✅ 无明显样式问题

### 测试完成清单
- [ ] MCP 自动化测试全部通过
- [ ] 手动探索性测试完成
- [ ] 性能指标达标
- [ ] 错误处理验证完成
- [ ] 测试报告已生成

测试完成后：
1. ✅ 提交代码
2. ✅ 更新文档
3. ✅ 部署到生产环境

# 🍳 美味食谱小程序

一个基于 CloudBase 云开发的智能菜谱微信小程序，使用 AI 每日自动发现美食菜谱，让你每天都能品尝新美味。

## ✨ 功能特性

### 用户端功能
- 📚 **首页** - 浏览所有菜谱，支持按菜系筛选
- 🏪 **Market** - 每日 AI 精选新菜谱，智能去重推荐
- ⭐ **今日推荐** - 基于用户偏好的智能推荐
- 🔍 **智能搜索** - 支持按菜名、食材搜索（带防抖优化）
- ❤️ **收藏管理** - 收藏喜爱的菜谱，长按卡片取消收藏，收藏按钮带防抖保护
- 👤 **个人中心** - 查看收藏统计、偏好设置
- 🌐 **网络状态提示** - 离线时自动提示，恢复后自动刷新

### AI 能力（CloudBase AI）
- 🤖 **每日菜谱精选** - 使用混元大模型自动发现新菜谱
- 📝 **智能去重** - AI 识别相似菜谱，避免重复
- 🔥 **热度评分** - 基于难度、时间、食材计算热度
- ⏱️ **超时保护** - AI 调用 30 秒超时 + 3 次重试机制
- 📉 **降级策略** - AI 失败时自动使用现有菜谱推荐

## 🏗️ 项目架构

```
recipe-miniapp/
├── cloudfunctions/          # CloudBase 云函数
│   ├── recipe-daily-curation/   # 每日菜谱精选（AI 生成）
│   │   ├── index.js             # 主入口：定时触发 AI 生成菜谱
│   │   ├── prompts.js           # AI 提示词模板
│   │   └── utils.js             # 相似度计算工具
│   ├── auth/                    # 用户认证相关
│   └── ...
│
├── wechat-app/              # 微信小程序前端
│   ├── pages/                   # 页面文件
│   │   ├── index/               # 首页 - 菜谱列表
│   │   ├── market/              # Market - 每日精选
│   │   ├── recommend/           # 今日推荐
│   │   ├── favorites/           # 我的收藏
│   │   ├── search/              # 搜索页面
│   │   ├── recipe-detail/       # 菜谱详情
│   │   ├── profile/             # 个人中心
│   │   └── preferences/         # 偏好设置
│   │
│   ├── components/              # 组件
│   │   ├── recipe-card/         # 菜谱卡片
│   │   ├── search-bar/          # 搜索栏
│   │   ├── filter-modal/        # 筛选弹窗
│   │   ├── loading-skeleton/    # 骨架屏
│   │   └── network-status/      # 网络状态提示
│   │
│   ├── utils/                   # 工具函数
│   │   ├── recipe-api.js        # 菜谱相关 API
│   │   ├── user-api.js          # 用户相关 API
│   │   └── ui-helpers.js        # UI 辅助函数（防抖/节流）
│   │
│   ├── images/                  # 图片资源
│   ├── app.js                   # 小程序入口
│   ├── app.json                 # 全局配置
│   └── app.wxss                 # 全局样式
│
├── minitest/                # MCP 自动化测试
│   ├── mcp-test.js              # 基础页面加载测试
│   ├── test-favorite.js         # 收藏功能测试
│   ├── test-network.js          # 网络错误处理测试
│   ├── test-debounce.js         # 防抖功能测试
│   └── test-performance.js      # 性能测试
│
├── PROJECT_STATUS.md        # 项目状态记录
└── README.md                # 本文件
```

## 🚀 快速开始

### 前置要求
- 微信开发者工具（最新版）
- Node.js 18+（用于云函数开发）
- CloudBase 环境（腾讯云开发）

### 1. 配置 CloudBase 环境

```bash
# 登录云开发
npx @cloudbase/cli login

# 初始化项目（已有环境可跳过）
npx @cloudbase/cli init
```

### 2. 部署云函数

```bash
# 部署每日菜谱精选云函数
cd cloudfunctions/recipe-daily-curation
npm install

# 在微信开发者工具中右键点击云函数目录，选择"创建并部署：云端安装依赖"
```

### 3. 配置定时触发器

在微信开发者工具中：
1. 右键 `recipe-daily-curation` 云函数
2. 选择"上传触发器"
3. 触发器配置（已包含在 `config.json`）：
```json
{
  "triggers": [{
    "name": "daily-curation",
    "type": "timer",
    "config": "0 0 9 * * * *"
  }]
}
```

### 4. 运行微信小程序

1. 打开微信开发者工具
2. 导入 `wechat-app` 目录
3. 在 `app.js` 中确认 `envId` 为你的 CloudBase 环境 ID
4. 点击"编译"

## 🧪 自动化测试

项目集成了 MCP 自动化测试框架：

```bash
# 确保微信开发者工具已打开并启用自动化测试
# 工具 → 自动化测试 → 启用

cd minitest

# 运行基础测试
node mcp-test.js

# 运行性能测试（目标 < 2s 加载时间）
node test-performance.js

# 运行防抖测试
node test-debounce.js

# 运行网络测试
node test-network.js

# 运行收藏功能测试
node test-favorite.js
```

### 测试环境要求
- 微信开发者工具已打开
- 项目已编译完成
- 自动化测试已启用（端口 9420）

## 📱 页面说明

| 页面 | 路径 | 说明 | 骨架屏 |
|-----|------|------|--------|
| 首页 | `/pages/index/index` | 菜谱列表，支持筛选 | ✅ |
| Market | `/pages/market/market` | 每日 AI 精选，带日期缓存 | ✅ |
| 今日推荐 | `/pages/recommend/recommend` | 智能推荐 | ✅ |
| 收藏 | `/pages/favorites/favorites` | 我的收藏 | ✅ |
| 搜索 | `/pages/search/search` | 智能搜索（防抖 500ms） | ✅ |
| 详情 | `/pages/recipe-detail/recipe-detail` | 菜谱详情（收藏防抖 500ms） | ✅ |
| 我的 | `/pages/profile/profile` | 个人中心 | ✅ |

## 🎨 技术特性

### 性能优化
- ⚡ **骨架屏** - 所有列表/详情页面都有骨架屏
- 💾 **日期缓存** - Market 页面同一天内使用缓存
- 🔍 **搜索防抖** - 500ms 防抖避免频繁请求
- ❤️ **收藏防抖** - 防止重复点击导致的重复请求
- 🔄 **网络重试** - 请求失败自动重试 3 次

### 错误处理
- 📡 **网络状态监听** - 实时检测在线/离线状态
- 🔄 **请求重试机制** - 带指数退避的重试策略
- 💥 **降级策略** - AI 失败时自动使用现有数据
- 📝 **错误日志** - 完整的错误收集和上报

### AI 集成
- 🧠 **混元大模型** - `hunyuan-2.0-instruct-20251111`
- ⏱️ **超时控制** - 30 秒超时保护
- 🔄 **重试机制** - 3 次重试 + 指数退避
- 📊 **智能去重** - 基于名称相似度的去重算法

## 🗄️ 数据库集合

| 集合名 | 用途 |
|--------|------|
| `recipes` | 菜谱数据 |
| `market_daily` | 每日精选记录 |
| `user_favorites` | 用户收藏 |
| `user_views` | 用户浏览记录 |
| `ai_generation_logs` | AI 生成日志 |

## 🔧 关键配置

### 云函数配置
```javascript
// cloudfunctions/recipe-daily-curation/index.js
const AI_CONFIG = {
  timeout: 30000,        // 30 秒超时
  maxRetries: 3,         // 最大重试 3 次
  retryDelayBase: 1000,  // 重试延迟基数
  model: 'hunyuan-2.0-instruct-20251111'
};
```

### 小程序配置
```javascript
// wechat-app/app.js
App({
  globalData: {
    isOnline: true,      // 网络状态
    networkType: 'unknown'
  },
  // 网络状态监听
  initNetworkStatus() { ... },
  // 请求重试
  requestWithRetry(options, maxRetries = 3) { ... }
});
```

## 📋 项目状态

详见 [PROJECT_STATUS.md](./PROJECT_STATUS.md) 了解：
- 当前完成进度
- 待办任务列表
- 已知问题
- 下一步计划

## 🔗 CloudBase 控制台

- [云开发控制台](https://tcb.cloud.tencent.com/dev)
- [云函数管理](https://tcb.cloud.tencent.com/dev#/scf)
- [数据库管理](https://tcb.cloud.tencent.com/dev#/db/doc)

## 📝 更新日志

### v2.0.0 - CloudBase 迁移完成
- ✅ 迁移到 CloudBase 云开发
- ✅ AI 每日菜谱精选（混元大模型）
- ✅ 智能去重算法
- ✅ 网络状态监听和重试
- ✅ 骨架屏全局覆盖
- ✅ MCP 自动化测试框架
- ✅ 防抖/节流优化
- ✅ 日期缓存机制

### v1.0.0 - 基础版本
- ✅ 基础功能：收藏、市场、推荐、搜索
- ✅ 用户偏好设置
- ✅ 淡蓝清新 UI 风格

## 📄 许可证

MIT License

# Quick Start: 修复UI视觉布局问题

## 问题概述

当前微信小程序存在以下UI视觉问题需要修复：
1. 图标显示不全或截断
2. 图片显示不全或变形
3. 按钮位置错位
4. 按钮出现在不应该出现的位置

## 环境准备

### 前置条件

- Windows/macOS 操作系统（微信开发者工具不支持Linux）
- 微信开发者工具已安装
- Node.js 已安装

### 项目路径

```bash
cd D:\recipe\recipe-miniapp\wechat-app
```

## 快速开始

### 步骤1: 启动微信开发者工具

```bash
cd minitest
node launch-devtools.js
```

等待输出：`✅ 开发者工具启动成功！`

### 步骤2: 生成基线截图

使用MCP测试工具生成当前UI状态的截图：

```javascript
// 使用 wechat-miniprogram-mcp-testing skill
// 1. 连接开发者工具
// 2. 遍历所有页面并截图
// 3. 保存到 minitest/reports/
```

### 步骤3: 识别UI问题

将截图提供给大模型进行视觉检查：
- 检查图标是否完整显示
- 检查图片是否有截断或变形
- 检查按钮位置是否正确
- 检查是否有不应出现的按钮

### 步骤4: 修复UI问题

根据问题清单修复对应文件：

**常见问题修复示例**:

```css
/* 图标显示不全 - 调整大小和overflow */
.icon {
  width: 44rpx;
  height: 44rpx;
  overflow: visible; /* 改为visible确保不截断 */
}

/* 图片变形 - 调整object-fit */
.recipe-image {
  width: 100%;
  height: 400rpx;
  object-fit: cover; /* 保持比例 */
}

/* 按钮错位 - 调整position */
.favorite-btn {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  /* 确保z-index正确 */
  z-index: 10;
}
```

### 步骤5: 验证修复

重新运行MCP测试生成修复后截图，使用大模型对比验证。

## 文件映射

| 问题类型 | 可能涉及的文件 |
|----------|----------------|
| 首页图标问题 | `pages/index/index.wxss` |
| 首页图片问题 | `components/recipe-card/recipe-card.wxss` |
| 收藏按钮位置 | `components/recipe-card/recipe-card.wxss` |
| 搜索按钮对齐 | `components/search-bar/search-bar.wxss` |
| Market按钮 | `pages/market/market.wxss` |
| 详情页按钮 | `pages/recipe-detail/recipe-detail.wxss` |
| 收藏页菜单 | `pages/favorites/favorites.wxss` |

## 成功标准验证

修复完成后验证以下标准：

- [ ] SC-001: 所有图标和图片显示完整度100%
- [ ] SC-002: 按钮间距符合规范（最小20rpx）
- [ ] SC-003: 无错误位置按钮
- [ ] SC-004: 适配所有屏幕尺寸
- [ ] SC-005: MCP测试元素可识别
- [ ] SC-006: 大模型视觉检查通过
- [ ] SC-007: 视觉检查通过率100%

## 注意事项

1. **不要修改功能逻辑** - 仅修复UI布局
2. **保持设计一致性** - 参考`app.wxss`中的变量
3. **测试多屏幕尺寸** - iPhone SE到iPhone 14 Pro Max
4. **图片加载失败处理** - 确保有占位图

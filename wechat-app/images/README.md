# 图片资源说明

所有图标已自动生成，来源于 [Heroicons](https://heroicons.com/)（MIT 开源协议）。

## TabBar 图标 (81x81px)

| 图标 | 文件名 | 说明 |
|-----|-------|------|
| 🏠 | `home.png` / `home-active.png` | 首页 - 灰色轮廓 / 蓝色填充 |
| 🛍️ | `market.png` / `market-active.png` | 市场 - 灰色轮廓 / 蓝色填充 |
| ⭐ | `recommend.png` / `recommend-active.png` | 推荐 - 灰色轮廓 / 蓝色填充 |
| 👤 | `profile.png` / `profile-active.png` | 我的 - 灰色轮廓 / 蓝色填充 |

## 功能图标 (48x48px)

| 图标 | 文件名 | 用途 |
|-----|-------|------|
| 🔍 | `search.png` | 搜索 |
| ⏱️ | `time.png` | 烹饪时间 |
| 🔥 | `fire.png` | 热度/收藏数 |
| ❤️ | `heart.png` / `heart-filled.png` | 收藏/已收藏 |
| ← | `back.png` | 返回 |
| → | `arrow-right.png` | 右箭头 |
| ✏️ | `edit.png` | 编辑 |
| 🌟 | `star.png` | 推荐标记 |
| 🔄 | `refresh.png` | 刷新 |
| 📤 | `share.png` | 分享 |
| ✓ | `check.png` | 勾选 |
| ✕ | `close.png` | 关闭 |
| 🍳 | `cuisine.png` | 菜系 |
| 📁 | `category.png` | 分类 |
| ℹ️ | `about.png` | 关于 |
| 💬 | `feedback.png` | 反馈 |
| 🔔 | `notice.png` | 通知 |
| 📊 | `difficulty.png` | 难度 |

## 占位图片

| 图片 | 文件名 | 用途 |
|-----|-------|------|
| 🍲 | `default-food.png` (200x200) | 菜谱默认图 |
| 👤 | `default-avatar.png` (120x120) | 用户默认头像 |
| 📭 | `empty-favorites.png` (200x200) | 空收藏状态 |
| 📭 | `empty-market.png` (200x200) | 空市场状态 |
| 📭 | `empty-recommend.png` (200x200) | 空推荐状态 |
| 🔍 | `no-result.png` (200x200) | 搜索无结果 |

## 颜色规范

- **未选中状态**: `#90A4AE` (灰色)
- **选中状态**: `#42A5F5` (淡蓝色)
- **功能图标**: `#607D8B` (深灰色)

## 图标来源

所有图标文件已预置在项目中。如需新增图标，请从 [Heroicons](https://heroicons.com/) 下载并转换为 PNG 格式。

> 注：原图标生成脚本（backend/scripts/）已随旧后端服务一起移除。现在所有图标都直接存放在本目录中。

## 注意事项

1. 所有图标尺寸已按微信小程序要求优化
2. TabBar 图标为 81x81 像素 PNG 格式
3. 功能图标为 48x48 像素 PNG 格式
4. 文件大小均小于 40KB，符合小程序要求

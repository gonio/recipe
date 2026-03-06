# 云开发部署指南

## 架构概述

本项目使用腾讯云开发 (CloudBase) 作为后端服务，包括：
- **云数据库**: NoSQL 数据库存储菜谱、用户数据
- **云函数**: Serverless 后端逻辑
- **静态托管**: 可选用于 Web 端

## 已完成的功能

### US2: Personalized Recipe Collection（个性化菜谱收藏）

#### 1. 前端更新
- `app.js` - 重构为 CloudBase SDK 认证，移除 Express 后端依赖
- `pages/favorites/` - 收藏列表页面（新建）
- `pages/preferences/` - 偏好设置页面（新建）
- `pages/recommend/` - 今日推荐页面（更新为 CloudBase）
- `pages/profile/` - 个人中心页面（更新为 CloudBase）
- `pages/market/` - 市场页面（更新为 CloudBase）
- `pages/search/` - 搜索页面（更新为 CloudBase）
- `pages/index/` - 首页（更新收藏功能）
- `utils/user-api.js` - 用户数据 API（更新分页支持）

#### 2. 云函数
- `cloudfunctions/auth/index.js` - 认证云函数（新增 updateUserInfo 操作）
- `cloudfunctions/user-toggle-favorite/index.js` - 收藏/取消收藏云函数（新建）
- `cloudfunctions/recipe-recommend/index.js` - 推荐云函数（新建）

## 部署步骤

### 1. 准备工作

确保已在微信开发者工具中：
1. 开通云开发环境
2. 记录环境 ID（如 `prod-8gcm2k4c7068a0e9`）
3. 更新 `app.js` 中的环境 ID

### 2. 创建数据库集合

在云开发控制台 - 数据库中创建以下集合：
- `recipes` - 菜谱数据
- `users` - 用户数据
- `market_daily` - 每日精选
- `ai_generation_logs` - AI 生成日志（US3 使用）

### 3. 配置数据库权限

设置各集合的安全规则：

**recipes 集合**:
```json
{
  "read": true,
  "write": false
}
```

**users 集合**:
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

**market_daily 集合**:
```json
{
  "read": true,
  "write": false
}
```

### 4. 部署云函数

在微信开发者工具中：

#### 部署 auth 云函数
```
cloudfunctions/auth
```
- 右键点击 `auth` 文件夹
- 选择 "创建并部署：云端安装依赖"

#### 部署 user-toggle-favorite 云函数
```
cloudfunctions/user-toggle-favorite
```
- 右键点击 `user-toggle-favorite` 文件夹
- 选择 "创建并部署：云端安装依赖"

#### 部署 recipe-recommend 云函数
```
cloudfunctions/recipe-recommend
```
- 右键点击 `recipe-recommend` 文件夹
- 选择 "创建并部署：云端安装依赖"

### 5. 创建数据库索引

在云开发控制台，为 `recipes` 集合创建以下索引：
- `cuisine` (升序)
- `heatScore` (降序)
- `isDailyRecommended` + `createdAt` (复合索引)

## 测试验证

部署完成后，测试以下功能：

### 首页
- [ ] 浏览菜谱列表
- [ ] 点击收藏按钮
- [ ] 搜索菜谱

### 收藏页面
- [ ] 查看收藏列表
- [ ] 取消收藏
- [ ] 点击进入详情

### 推荐页面
- [ ] 查看个性化推荐
- [ ] 收藏推荐菜谱

### 个人中心
- [ ] 查看用户信息
- [ ] 进入偏好设置
- [ ] 设置喜欢的菜系

### 偏好设置
- [ ] 选择/取消菜系
- [ ] 保存设置
- [ ] 返回后推荐更新

## 注意事项

1. **首次部署**
   - 确保 CloudBase 环境已初始化
   - 确认数据库集合已创建
   - 检查安全规则配置

2. **云函数依赖**
   - 所有云函数依赖 `@cloudbase/node-sdk`
   - 部署时会自动安装依赖

3. **调试**
   - 使用微信开发者工具的 "云开发" 面板查看日志
   - 检查数据库中的数据是否正确写入

## 旧版 Express 后端

如需查看旧版部署文档，请参考 `DEPLOY-legacy.md`。

## 下一步

继续 US3: Smart Daily Recipe Curation（智能每日菜谱精选）
- 实现 AI 菜谱生成
- 创建每日精选云函数
- 配置定时触发器

# JWT 认证集成说明

## 概述
后端已修改为使用 JWT Token 进行用户认证，前端已配合完成相应修改。

## 主要改动

### 1. app.js - 核心认证模块

#### 新增功能：
- **Token 自动刷新**：支持使用 refresh token 刷新 access token
- **请求队列**：登录过程中将新请求加入队列，登录成功后自动重试
- **自动重试机制**：401 错误时自动刷新 token 或重新登录，然后重试原请求
- **并发登录控制**：防止多个请求同时触发登录流程

#### 关键方法：
```javascript
// 封装的请求方法（自动携带 JWT Token）
app.request(options)

// 登录（支持并发控制）
app.login()

// 刷新 Token
app.refreshToken()

// 退出登录
app.logout()

// 清除认证数据
app.clearAuthData()
```

#### 请求流程：
1. 调用 `app.request({ url: '/api/xxx' })`
2. 自动添加 `Authorization: Bearer <token>` header
3. 如果返回 401，自动尝试刷新 token 或重新登录
4. 登录成功后自动重试原请求
5. 如果正在登录中，新请求会进入队列等待

### 2. 登录流程

```
wx.login() 获取微信 code
    ↓
POST /auth/wechat-login (携带 code 和 userInfo)
    ↓
后端返回 { token, refreshToken, user }
    ↓
保存 token 到本地存储和 globalData
```

### 3. API 请求规范

所有需要认证的请求都使用 `app.request`：

```javascript
// GET 请求
const res = await app.request({ url: '/auth/user' });

// POST 请求
const res = await app.request({
  url: '/recipes/favorite',
  method: 'POST',
  data: { recipeId: 'xxx' }
});

// 带参数的 GET 请求
const res = await app.request({
  url: '/recipes/favorites',
  data: { page: 1, limit: 20 }
});
```

### 4. Token 存储

- **access token**: `wx.getStorageSync('token')`
- **refresh token**: `wx.getStorageSync('refreshToken')`
- **内存存储**: `app.globalData.token`, `app.globalData.refreshToken`

### 5. 退出登录

在 "我的" 页面添加了退出登录按钮，点击后：
1. 清除本地 token
2. 清除内存中的 token
3. 提示退出成功
4. 返回首页

## 后端 API 要求

### 登录接口
```
POST /auth/wechat-login
Request: { code: string, userInfo: object }
Response: { success: true, data: { token, refreshToken, user } }
```

### 刷新 Token 接口（可选）
```
POST /auth/refresh
Header: Authorization: Bearer <refreshToken>
Response: { success: true, data: { token, refreshToken } }
```

### 其他需要认证的接口
所有需要认证的接口都应在请求头中携带：
```
Authorization: Bearer <accessToken>
```

当 token 过期时返回 401 状态码。

## 错误处理

- **401 未授权**：自动尝试刷新 token 或重新登录
- **登录失败**：显示提示，保留当前页面状态
- **网络错误**：显示错误提示

## 文件修改清单

1. `app.js` - 核心认证逻辑
2. `pages/profile/profile.js` - 添加退出登录功能
3. `pages/profile/profile.wxml` - 添加退出登录按钮
4. `pages/profile/profile.wxss` - 退出登录按钮样式

## 注意事项

1. 如果后端不支持 refresh token，登录接口可以不返回 refreshToken，系统会自动使用重新登录的方式处理 401
2. 所有 API 请求都应使用 `app.request`，不要直接使用 `wx.request`
3. 登录接口 (`/auth/wechat-login`) 本身不需要携带 token

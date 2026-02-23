# 🚀 部署指南

## 部署前准备

### 1. 服务器环境
- Node.js 16+ 
- MongoDB 4.4+
- Nginx（可选，用于反向代理）

### 2. 微信小程序
- 注册微信小程序账号
- 获取 AppID 和 AppSecret
- 配置服务器域名（后端 API 地址）

## 部署步骤

### 第一步：部署后端服务

```bash
# 1. 上传代码到服务器
cd /path/to/recipe-miniapp/backend

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
nano .env

# 4. 填写以下配置
MONGODB_URI=mongodb://localhost:27017/recipe_miniapp
JWT_SECRET=your-random-secret-key
WECHAT_APPID=your-wechat-appid
WECHAT_SECRET=your-wechat-secret
API_KEY=your-secure-api-key-for-claw
PORT=3000

# 5. 启动服务（开发模式）
npm start

# 或使用 PM2 部署（生产环境）
npm install -g pm2
pm2 start server.js --name recipe-api
pm2 startup
pm2 save
```

### 第二步：初始化数据库

```bash
cd /path/to/recipe-miniapp/backend

# 导入示例菜谱数据
npm run seed
```

### 第三步：部署微信小程序

1. 打开微信开发者工具
2. 选择 `wechat-app` 目录
3. 修改 `app.js` 中的 API 地址：
   ```javascript
   apiBaseUrl: 'https://your-domain.com/api'
   ```
4. 在小程序后台配置服务器域名
5. 上传代码并提交审核

### 第四步：配置 Kimi Claw

```bash
# 1. 在 Kimi Claw 云环境中上传爬虫脚本
cd kimi-claw-scripts

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 API 地址和密钥

# 4. 测试运行
npm start
```

在 Kimi Claw 中设置定时任务：
```
每天早上 9 点执行：
1. cd /path/to/kimi-claw-scripts
2. npm run daily
```

## 检查清单

### 后端部署
- [ ] MongoDB 已启动
- [ ] 环境变量已配置
- [ ] API 可以通过外网访问
- [ ] 防火墙已开放对应端口
- [ ] 数据库种子已导入

### 小程序部署
- [ ] 已注册小程序账号
- [ ] 已获取 AppID 和 AppSecret
- [ ] 服务器域名已配置
- [ ] API 地址已修改为生产环境
- [ ] 已上传并提交审核

### Kimi Claw 配置
- [ ] 脚本已上传到云端
- [ ] 环境变量已配置
- [ ] API Key 可以正常调用后端
- [ ] 定时任务已设置
- [ ] 测试运行成功

## 常见问题

### Q: 后端启动失败？
检查 MongoDB 是否正常运行，环境变量是否正确配置。

### Q: 小程序无法连接后端？
检查：
1. 服务器域名是否已配置
2. API 地址是否正确
3. 防火墙是否开放端口
4. 是否使用 HTTPS（生产环境必需）

### Q: Kimi Claw 爬取失败？
检查：
1. API_BASE_URL 是否正确
2. API_KEY 是否匹配
3. 后端是否允许外网访问

## 生产环境建议

1. **使用 HTTPS**：小程序要求生产环境使用 HTTPS
2. **启用 MongoDB 认证**：生产环境建议开启数据库认证
3. **配置反向代理**：使用 Nginx 作为反向代理
4. **日志监控**：配置日志收集和监控告警
5. **定期备份**：定期备份数据库数据

## 联系方式

如有问题，请提交 Issue 或联系开发者。

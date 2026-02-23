# 菜谱小程序部署文档

## 系统要求

- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- 1GB+ RAM
- 10GB+ 磁盘空间

## 快速部署

### 1. 克隆代码

```bash
git clone https://github.com/gonio/recipe.git
cd recipe/backend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件
```

**必需配置**:
```bash
JWT_SECRET=your-secret-key
API_KEY=your-api-key
PORT=3000
```

**微信小程序登录** (可选):
```bash
WECHAT_APPID=your-wechat-appid
WECHAT_SECRET=your-wechat-secret
```

### 4. 启动服务

```bash
npm start
```

服务将在 http://localhost:3000 运行

## 生产环境部署

### 使用 PM2 进程管理

```bash
npm install -g pm2
pm2 start server-sqlite.js --name recipe-backend
pm2 save
pm2 startup
```

### 配置 Nginx 反向代理

```bash
sudo apt-get install nginx
```

创建配置文件 `/etc/nginx/sites-available/recipe`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
    }
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/recipe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 配置 HTTPS (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 防火墙配置

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 安全配置

### SSH 加固

编辑 `/etc/ssh/sshd_config`:
```
PermitRootLogin prohibit-password
PasswordAuthentication no
MaxAuthTries 3
```

重启 SSH:
```bash
sudo systemctl restart ssh
```

### 安装 Fail2Ban

```bash
sudo apt-get install fail2ban
```

创建 `/etc/fail2ban/jail.local`:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
```

```bash
sudo systemctl restart fail2ban
```

## 前端配置

修改 `wechat-app/app.js`:

```javascript
App({
  globalData: {
    apiBaseUrl: 'https://your-domain.com/api'
  }
})
```

## 定时任务

配置每天自动抓取菜谱:

```bash
# 使用 cron 每天 9 点执行
crontab -e
# 添加:
0 9 * * * cd /path/to/recipe/kimi-claw-scripts && node ai-crawler.js
```

## 备份

### 数据库备份

```bash
# SQLite 数据库位置
backend/data/recipe.db

# 备份
cp backend/data/recipe.db backup/recipe-$(date +%Y%m%d).db
```

## 故障排查

### 查看日志

```bash
# PM2 日志
pm2 logs recipe-backend

# Nginx 日志
sudo tail -f /var/log/nginx/error.log
```

### 检查服务状态

```bash
# 后端服务
pm2 status

# Nginx
sudo systemctl status nginx

# 数据库
ls -la backend/data/
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/auth/wechat-login | POST | 微信登录 |
| /api/auth/user | GET | 获取用户信息 |
| /api/recipes/cuisines | GET | 获取菜系列表 |
| /api/recipes/search | GET | 搜索菜谱 |
| /api/recipes/detail/:id | GET | 菜谱详情 |
| /api/recipes/favorites | GET | 收藏列表 |
| /api/recipes/market | GET | 市场菜谱 |
| /api/recipes/daily-recommend | GET | 今日推荐 |

## 技术栈

- **后端**: Node.js + Express + Sequelize + SQLite
- **前端**: 微信小程序
- **进程管理**: PM2
- **反向代理**: Nginx
- **安全**: Fail2Ban + UFW

## 许可证

MIT

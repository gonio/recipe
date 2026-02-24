# 安全配置报告

## 部署时间
2026-02-23

## 网络配置

### 开放端口
| 端口 | 服务 | 访问范围 | 说明 |
|------|------|----------|------|
| 22 | SSH | 公网 | 需要密钥认证 |
| 80 | HTTP | 公网 | 自动重定向到 HTTPS |
| 443 | HTTPS | 公网 | 主访问入口 |

### 已关闭端口
- 3000 (Node.js) - 仅监听 127.0.0.1，不暴露公网

## SSL/TLS 配置
- 证书类型: 自签名证书
- 证书路径: `/etc/nginx/ssl/recipe.crt`
- 私钥路径: `/etc/nginx/ssl/recipe.key`
- 协议: TLSv1.2, TLSv1.3
- 加密套件: ECDHE + AES-GCM

## 安全响应头
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## 防火墙配置 (UFW)
- 默认策略: 拒绝入站，允许出站
- 允许端口: 22, 80, 443

## API 访问地址
```
https://xxx/api/
```

## 注意事项
1. 自签名证书会被浏览器标记为不安全，需要手动信任
2. 微信小程序开发时需要开启「不校验合法域名」选项
3. 生产环境建议使用 Let's Encrypt 证书

## 后续安全建议
1. 配置 SSH 密钥登录，禁用密码登录
2. 安装 fail2ban 防止暴力破解
3. 配置自动安全更新
4. 定期备份数据库
5. 使用真实域名和 Let's Encrypt 证书

## SSH 加固 (2026-02-23)

### 修改配置
- PermitRootLogin: prohibit-password (禁止 root 密码登录)
- PasswordAuthentication: no (禁用密码认证)
- MaxAuthTries: 3 (最大尝试次数)
- ClientAliveInterval: 300 (心跳检测)
- MaxSessions: 2 (最大会话数)

### 备份位置
/etc/ssh/sshd_config.bak.20260223

## Fail2Ban 配置

### 运行状态
- 服务: active (running)
- Jail 数量: 3
- 监控服务: sshd, nginx-http-auth, nginx-limit-req

### 封禁策略
- 最大尝试: 3 次
- 封禁时间: 1 小时
- 检测窗口: 10 分钟

### 查看封禁状态
```bash
fail2ban-client status sshd
fail2ban-client status nginx-http-auth
```

## 安全总结

| 项目 | 状态 |
|------|------|
| HTTPS | ✅ 自签名证书 |
| HTTP 重定向 | ✅ 自动跳转 |
| 防火墙 (UFW) | ✅ 仅开放 22, 80, 443 |
| Node.js 隔离 | ✅ 仅本地访问 |
| SSH 密钥认证 | ✅ 已配置 |
| SSH 密码禁用 | ✅ 已禁用 |
| Fail2Ban | ✅ 运行中 |
| 安全响应头 | ✅ 已配置 |

## 访问方式

### 服务器管理
- 方式: SSH 密钥登录
- 端口: 22
- 用户: root
- 密码: 已禁用


## 后续建议
1. 购买域名，配置 Let's Encrypt 证书
2. 配置自动安全更新
3. 定期备份数据库
4. 考虑使用非 root 用户运行服务

# Quickstart Guide: CloudBase Migration

**Feature**: 001-cloudbase-migration
**Created**: 2026-03-06
**Purpose**: Developer setup, deployment steps, and testing guide

---

## Prerequisites

- WeChat Developer Tools (latest version)
- Node.js 18+ (for cloud function development)
- CloudBase CLI (`npm install -g @cloudbase/cli`)
- CloudBase Environment (create at [console](https://console.cloud.tencent.com/tcb))

---

## 1. Environment Setup

### 1.1 Clone and Checkout Branch

```bash
git clone <repository>
cd recipe-miniapp
git checkout 001-cloudbase-migration
```

### 1.2 Configure CloudBase Environment

Create `.mcp.json` in project root:

```json
{
  "mcpServers": {
    "cloudbase": {
      "command": "npx",
      "args": ["@cloudbase/cloudbase-mcp@latest"],
      "env": {
        "TENCENTCLOUD_SECRETID": "<your-secret-id>",
        "TENCENTCLOUD_SECRETKEY": "<your-secret-key>",
        "CLOUDBASE_ENV_ID": "<your-env-id>"
      }
    }
  }
}
```

> **Security Note**: Never commit this file. It's already in `.gitignore`.

### 1.3 Login to CloudBase

```bash
npx @cloudbase/cli login
```

---

## 2. Database Setup

### 2.1 Create Collections

Use CloudBase Console or MCP:

```bash
# Create collections
npx @cloudbase/cli db:create recipes
npx @cloudbase/cli db:create users
npx @cloudbase/cli db:create ai_generation_logs
npx @cloudbase/cli db:create market_daily
```

### 2.2 Configure Security Rules

Upload `config/cloudbase-security-rules.json`:

```bash
npx @cloudbase/cli db:upsert-rules --collection recipes --rules-file config/cloudbase-security-rules.json
```

### 2.3 Create Indexes

In CloudBase Console:
1. Go to Database → recipes
2. Create indexes: `cuisine`, `isDailyRecommended + createdAt`, `heatScore`

---

## 3. Cloud Functions Setup

### 3.1 Install Dependencies

```bash
cd cloudfunctions/auth
npm install
cd ../recipe-daily-curation
npm install @cloudbase/node-sdk
cd ../recipe-recommend
npm install
cd ../user-toggle-favorite
npm install
```

### 3.2 Configure AI SDK

For `recipe-daily-curation`, create `config.json`:

```json
{
  "ai": {
    "model": "hunyuan-2.0-instruct-20251111",
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

### 3.3 Deploy Functions

```bash
# Deploy all functions
npx @cloudbase/cli fn:deploy auth
npx @cloudbase/cli fn:deploy recipe-daily-curation
npx @cloudbase/cli fn:deploy recipe-recommend
npx @cloudbase/cli fn:deploy user-toggle-favorite
```

### 3.4 Configure Scheduled Trigger

In CloudBase Console:
1. Go to Cloud Functions → Triggers
2. Add Timer Trigger to `recipe-daily-curation`
3. Cron expression: `0 0 9 * * * *` (9:00 AM daily)

---

## 4. Data Migration

### 4.1 Export from MongoDB

```bash
cd scripts/data-migration

# Export existing data
node export-mongodb.js
```

### 4.2 Transform Data

```bash
node transform-data.js
```

### 4.3 Import to CloudBase

```bash
node import-cloudbase.js --env-id=<your-env-id>
```

### 4.4 Verify Migration

```bash
# Check counts
npx @cloudbase/cli db:count recipes
npx @cloudbase/cli db:count users
```

---

## 5. Frontend Setup

### 5.1 Configure Environment

Edit `wechat-app/app.js`:

```javascript
wx.cloud.init({
  env: '<your-env-id>',  // Replace with your env ID
  traceUser: true
})
```

### 5.2 Import to WeChat Developer Tools

1. Open WeChat Developer Tools
2. Import project → Select `wechat-app` folder
3. Set AppID (or use test account)
4. Enable "Local Service" in settings

### 5.3 Test Cloud Integration

1. Click "Compile"
2. Check Console for CloudBase initialization success
3. Test auth: Navigate to profile page
4. Check network requests in Network tab

---

## 6. Testing Checklist

### 6.1 Core Functionality

| Feature | Test Case | Expected Result |
|---------|-----------|-----------------|
| Auth | Open Mini Program | User auto-logged in, no login screen |
| Recipe List | View homepage | Recipes display in card layout |
| Search | Search "宫保" | Relevant recipes appear |
| Favorite | Tap heart icon | Visual feedback, saved to favorites |
| Market | Navigate to Market | 2 daily recipes displayed |
| Recommendations | View recommendations | Personalized recipes shown |

### 6.2 Edge Cases

| Scenario | Test | Expected |
|----------|------|----------|
| No network | Disconnect WiFi | Graceful error message |
| Empty search | Search "xyz" | "No results" message |
| Rapid actions | Tap favorite 5x quickly | No crashes, correct final state |
| First-time user | Clear storage, reopen | Auto-create user, preferences empty |

### 6.3 Performance

```bash
# In WeChat DevTools Performance panel:
- Page load time < 2s
- First paint < 1s
- API response < 500ms
```

---

## 7. Deployment

### 7.1 Pre-deployment Checklist

- [ ] All tests passing
- [ ] Data migration complete
- [ ] Cloud functions deployed
- [ ] Scheduled trigger configured
- [ ] Security rules active
- [ ] Console links documented

### 7.2 Production Deployment

```bash
# Deploy cloud functions to production
npx @cloudbase/cli fn:deploy --env-id=<prod-env> auth
npx @cloudbase/cli fn:deploy --env-id=<prod-env> recipe-daily-curation
npx @cloudbase/cli fn:deploy --env-id=<prod-env> recipe-recommend
npx @cloudbase/cli fn:deploy --env-id=<prod-env> user-toggle-favorite
```

### 7.3 Monitor After Deployment

Check CloudBase Console:
- [ ] Functions → Logs (no errors)
- [ ] Database → Performance (query times)
- [ ] Scheduled Triggers → Execution history
- [ ] AI Generation Logs → Daily job status

---

## 8. Troubleshooting

### Issue: Cloud function timeout

**Solution**: Increase function memory (256MB → 512MB) or optimize query

### Issue: Database permission denied

**Solution**: Check security rules in Console, verify `openid` field

### Issue: AI API not responding

**Solution**:
1. Check AI service quota in Console
2. Verify model name is correct
3. Check function logs for error details

### Issue: Images not loading

**Solution**: Add image domains to `wechat-app/app.json`:

```json
{
  "networkTimeout": {...},
  "permission": {...},
  "requiredBackgroundModes": [...],
  "usingComponents": {...}
}
```

---

## Console Links

After deployment, bookmark these:

| Resource | URL |
|----------|-----|
| CloudBase Console | `https://console.cloud.tencent.com/tcb/env/overview?envId=<env-id>` |
| Database | `https://console.cloud.tencent.com/tcb/db/?envId=<env-id>` |
| Cloud Functions | `https://console.cloud.tencent.com/tcb/scf/?envId=<env-id>` |
| Scheduled Triggers | `https://console.cloud.tencent.com/tcb/scf/trigger?envId=<env-id>` |

---

## Next Steps

1. Run tests in WeChat DevTools
2. Fix any discovered bugs
3. Submit PR for code review
4. Merge to main when approved

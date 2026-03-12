# Implementation Plan: CloudBase Migration and UI Redesign

**Branch**: `001-cloudbase-migration` | **Date**: 2026-03-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cloudbase-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

将美味食谱小程序从自托管 Express/MongoDB 后端迁移至 CloudBase 云开发平台。采用微信小程序原生框架 + CloudBase 云函数架构，实现无感知微信登录、每日 AI 菜谱精选、智能推荐等功能。UI 采用淡蓝色主题（#42A5F5）的卡片式布局设计。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript ES6+ / Node.js 18+
**Primary Dependencies**: WeChat Mini Program Framework, CloudBase SDK (`wx.cloud` / `@cloudbase/node-sdk`), miniprogram-automator
**Storage**: CloudBase NoSQL Database (recipes, users, ai_generation_logs, market_daily collections)
**Testing**: MCP-based E2E testing via WeChat DevTools MCP, miniprogram-automator
**Target Platform**: WeChat Mini Program (微信开发者工具 + 真机)
**Project Type**: mobile-app (微信小程序)
**Performance Goals**: Page load < 2s on 4G, favorite action feedback < 300ms
**Constraints**: < 2MB per cloud function, CloudBase service quotas, WeChat Mini Program size limits
**Scale/Scope**: Personal recipe app, ~100 recipes initially, single user focus

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Refer to `.specify/memory/constitution.md` for project principles.

**UX First**: Does this feature respect WeChat Mini Program UX guidelines?
- [x] Page load time under 2 seconds considered?
- [x] User feedback mechanisms defined?
- [x] Error states have recovery paths?

**Cloud-Native Architecture**: Is CloudBase properly utilized?
- [x] CloudBase SDK direct access considered for simple operations?
- [x] RESTful patterns followed for custom APIs (/api/[resource]/[action])?
- [x] Consistent JSON response format documented?

**Platform-Native Authentication**: Is WeChat login properly handled?
- [x] No explicit login required (natural login-free)?
- [x] OpenID obtained via wxContext in cloud functions?

**Data Integrity**: Is data handling robust?
- [x] Schema validation defined for all writes?
- [x] Required fields identified (name, cuisine, ingredients, steps)?
- [x] CloudBase security rules configured for data access?
- [x] No sensitive data in version control?

**Separation of Concerns**: Are architectural boundaries clear?
- [x] Frontend uses CloudBase SDK or API (no direct DB connection strings)?
- [x] Business logic resides in appropriate layer (SDK vs cloud function)?
- [x] Each component independently testable?

**CloudBase Best Practices**: Are platform guidelines followed?
- [x] `cloudbase-guidelines` skill referenced for CloudBase features?
- [x] MCP tools available for CloudBase operations?
- [x] Console management links documented?

**Content Automation**: Does this affect the crawler?
- [x] Crawler integration points documented (if applicable)?
- [x] Duplicate detection considered (if content-related)?

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
wechat-app/                    # 微信小程序前端
├── pages/                     # 页面文件
│   ├── index/                 # 首页 - 菜谱列表
│   ├── market/                # Market - 每日精选
│   ├── recommend/             # 今日推荐
│   ├── favorites/             # 我的收藏
│   ├── search/                # 搜索页面
│   ├── recipe-detail/         # 菜谱详情
│   ├── profile/               # 个人中心
│   └── preferences/           # 偏好设置
├── components/                # 可复用组件
│   ├── recipe-card/           # 菜谱卡片
│   ├── search-bar/            # 搜索栏
│   ├── filter-modal/          # 筛选弹窗
│   ├── loading-skeleton/      # 骨架屏
│   └── network-status/        # 网络状态提示
├── utils/                     # 工具函数
│   ├── cloudbase.js           # CloudBase SDK 初始化
│   ├── recipe-api.js          # 菜谱相关 API
│   ├── user-api.js            # 用户相关 API
│   └── ui-helpers.js          # UI 辅助函数
├── images/                    # 图片资源
├── app.js                     # 小程序入口
├── app.json                   # 全局配置
└── app.wxss                   # 全局样式

cloudfunctions/                # CloudBase 云函数
├── auth/                      # 用户认证
├── recipe-recommend/          # 智能推荐
├── user-toggle-favorite/      # 收藏切换
└── recipe-daily-curation/     # 每日精选（定时触发）

minitest/                      # MCP 自动化测试
├── test-suite-complete.js     # 完整测试套件
├── test-market.js             # Market 页面测试
├── test-favorite.js           # 收藏功能测试
└── launch-devtools.js         # 开发工具启动脚本

scripts/data-migration/        # 数据迁移脚本
├── export-mongodb.js
├── transform-data.js
└── import-cloudbase.js
```

**Structure Decision**: 采用微信小程序标准目录结构 + CloudBase 云函数架构。前端使用微信小程序原生框架（WXML/WXSS/JS），后端功能通过 CloudBase 云函数实现，数据存储使用 CloudBase NoSQL 数据库。测试采用 MCP 自动化测试框架。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

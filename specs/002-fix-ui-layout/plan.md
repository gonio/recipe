# Implementation Plan: 修复UI视觉布局问题

**Branch**: `002-fix-ui-layout` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fix-ui-layout/spec.md`

## Summary

修复微信小程序的UI视觉布局问题，包括：图标显示不全、图片截断变形、按钮错位、按钮出现在错误位置等问题。通过调整WXSS样式、修复WXML结构，并使用MCP E2E测试配合大模型视觉检查进行验证。

## Technical Context

**Language/Version**: JavaScript ES6+ / WeChat Mini Program Framework
**Primary Dependencies**: WeChat Mini Program native components, WXSS styling
**Storage**: N/A - 纯UI修复，不涉及数据存储变更
**Testing**: wechat-miniprogram-mcp-testing skill + 大模型视觉检查
**Target Platform**: WeChat Mini Program (iOS/Android)
**Project Type**: mobile-app (WeChat Mini Program)
**Performance Goals**: 页面渲染无卡顿，图片加载优化
**Constraints**: 适配iPhone SE(375px)到iPhone 14 Pro Max(430px)屏幕尺寸
**Scale/Scope**: 9个页面，5个组件的UI修复

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Refer to `.specify/memory/constitution.md` for project principles.

**UX First**: Does this feature respect WeChat Mini Program UX guidelines?
- [x] Page load time under 2 seconds considered? - 纯样式修复，不影响加载性能
- [x] User feedback mechanisms defined? - 图片加载失败时显示占位图
- [x] Error states have recovery paths? - 图片加载失败有降级处理

**Cloud-Native Architecture**: Is CloudBase properly utilized?
- [x] CloudBase SDK direct access considered for simple operations? - N/A，纯UI修复
- [x] RESTful patterns followed for custom APIs? - N/A，纯UI修复
- [x] Consistent JSON response format documented? - N/A，纯UI修复

**Platform-Native Authentication**: Is WeChat login properly handled?
- [x] No explicit login required? - N/A，纯UI修复
- [x] OpenID obtained via wxContext in cloud functions? - N/A，纯UI修复

**Data Integrity**: Is data handling robust?
- [x] Schema validation defined for all writes? - N/A，纯UI修复
- [x] Required fields identified? - N/A，纯UI修复
- [x] CloudBase security rules configured? - N/A，纯UI修复
- [x] No sensitive data in version control? - 已确认

**Separation of Concerns**: Are architectural boundaries clear?
- [x] Frontend uses CloudBase SDK or API? - N/A，纯UI修复
- [x] Business logic resides in appropriate layer? - N/A，纯UI修复
- [x] Each component independently testable? - 使用MCP测试skill验证

**CloudBase Best Practices**: Are platform guidelines followed?
- [x] `cloudbase-guidelines` skill referenced? - 无需CloudBase操作
- [x] MCP tools available? - 使用wechat-miniprogram-mcp-testing skill
- [x] Console management links documented? - N/A

**Automated Testing with MCP**: Are MCP testing guidelines followed?
- [x] MUST use `wechat-miniprogram-mcp-testing` skill? - 是，SC-006要求使用
- [x] MUST start WeChat DevTools using `launch-devtools.js`? - 是，计划中使用
- [x] MUST generate test reports in `minitest/`? - 是，SC-006要求

**Content Automation**: Does this affect the crawler?
- [x] Crawler integration points documented? - N/A
- [x] Duplicate detection considered? - N/A

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-ui-layout/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
wechat-app/
├── pages/
│   ├── index/           # 首页 - 修复图标、图片、按钮位置
│   ├── market/          # Market页面 - 修复收藏按钮位置
│   ├── favorites/       # 收藏页面 - 修复长按菜单按钮
│   ├── recipe-detail/   # 详情页 - 修复底部操作栏按钮
│   ├── search/          # 搜索页 - 修复搜索按钮对齐
│   ├── profile/         # 个人中心 - 修复图标显示
│   ├── recommend/       # 推荐页面 - 修复布局一致性
│   └── preferences/     # 偏好设置 - 修复布局一致性
├── components/
│   ├── recipe-card/     # 菜谱卡片 - 修复收藏按钮位置、图片显示
│   ├── search-bar/      # 搜索栏 - 修复按钮对齐
│   ├── filter-modal/    # 筛选弹窗 - 修复按钮布局
│   ├── loading-skeleton/# 骨架屏 - 修复布局显示
│   └── network-status/  # 网络状态 - 修复图标显示
├── images/              # 图标资源目录
└── minitest/
    ├── launch-devtools.js   # 启动DevTools脚本
    └── reports/             # UI修复验证截图报告
```

**Structure Decision**: 基于现有微信小程序项目结构，重点修复pages/和components/目录下的WXSS/WXML文件。使用minitest/目录存放MCP测试生成的截图用于大模型视觉检查。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - 所有宪法检查项均通过，无需特殊说明。

## Implementation Strategy

### Phase 1: 问题识别与截图基线

1. 使用`wechat-miniprogram-mcp-testing` skill启动微信开发者工具
2. 运行E2E测试覆盖所有页面，生成截图基线
3. 使用大模型视觉检查分析截图，识别UI问题
4. 创建问题清单（图标截断、按钮错位、图片变形等）

### Phase 2: UI修复实施

按优先级修复：
1. **P1 - 图标显示问题**: 修复所有页面图标截断/变形
2. **P1 - 图片显示问题**: 修复菜谱卡片和详情页图片显示
3. **P1 - 按钮错位问题**: 修复搜索按钮、收藏按钮位置
4. **P1 - 移除错误按钮**: 移除不当位置的按钮
5. **P2 - 布局一致性**: 统一各页面间距、圆角、阴影

### Phase 3: 验证与报告

1. 重新运行MCP E2E测试生成修复后截图
2. 使用大模型视觉检查对比前后截图
3. 验证所有SC标准达成
4. 生成修复报告

## Testing Approach

### MCP E2E测试流程

```
1. 运行 minitest/launch-devtools.js 启动开发者工具
2. 使用 wechat-miniprogram-mcp-testing skill 连接 DevTools
3. 遍历所有页面并截图保存到 minitest/reports/
4. 使用大模型分析截图识别UI问题
5. 修复后重复测试验证
```

### 截图检查清单

- [ ] 首页 - 菜谱卡片图片无截断
- [ ] 首页 - 收藏心形图标完整显示
- [ ] 首页 - 菜系标签图标完整
- [ ] Market - 收藏按钮位置正确
- [ ] Market - NEW/精选标识完整
- [ ] 收藏页 - 心形图标完整
- [ ] 详情页 - 大图无拉伸变形
- [ ] 详情页 - 底部按钮居中
- [ ] 搜索页 - 搜索按钮对齐
- [ ] 个人中心 - 头像、设置图标正常

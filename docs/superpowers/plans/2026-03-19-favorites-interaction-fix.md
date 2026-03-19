# 收藏页交互修复 Implementation Plan

> **For Claude:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复我的收藏页面的长按取消收藏功能 Bug，并隐藏收藏页卡片上多余的收藏按钮。

**Architecture:** 在 `recipe-card` 组件添加 `showFavorite` 属性控制收藏按钮显示，修复收藏页事件绑定名称不匹配问题（`tapCard` vs `tap`），确保长按菜单可以正常触发和显示。

**Tech Stack:** WeChat Mini Program (WXML/WXSS/JS)，无外部依赖。

---

## Bug 分析（实施前必读）

当前存在三个 Bug：

**Bug 1 — 事件名称不匹配（导致点击卡片无响应）**
- `recipe-card.js` 触发：`triggerEvent('tapCard', ...)`
- `favorites.wxml` 监听：`bind:tap="onRecipeTap"` ❌
- 正确应为：`bind:tapCard="onRecipeTap"` ✅

**Bug 2 — 组件内部自行导航（导致父页面无法控制）**
- `recipe-card.js` 的 `onTapCard()` 在触发事件的同时还自己调用了 `wx.navigateTo()`
- 这意味着即使事件绑定错误，点击依然会跳转详情，掩盖了 Bug 1
- 但收藏页的 `onRecipeTap` 永远不会被调用，从而 `from=favorites` 参数也不会传递

**Bug 3 — 收藏按钮始终可见**
- `recipe-card` 没有 `showFavorite` 属性来控制收藏按钮显示
- 收藏页 (`favorites.wxml`) 传入的 `showFavorite="{{true}}"` 没有任何效果
- 收藏页的卡片本不应该显示收藏按钮（所有条目都已收藏，且操作应通过长按进行）

---

## Chunk 1: 修复 recipe-card 组件

### Task 1: 添加 `showFavorite` 属性到 recipe-card 组件

**Files:**
- Modify: `wechat-app/components/recipe-card/recipe-card.js`
- Modify: `wechat-app/components/recipe-card/recipe-card.wxml`

- [ ] **Step 1: 在 `recipe-card.js` 的 `properties` 中添加 `showFavorite` 属性**

  在 `wechat-app/components/recipe-card/recipe-card.js` 的 `properties` 对象中，在 `enableLongPress` 之后添加：

  ```javascript
  // 是否显示收藏按钮（默认显示）
  showFavorite: {
    type: Boolean,
    value: true
  }
  ```

- [ ] **Step 2: 在 `recipe-card.wxml` 中为收藏按钮添加条件渲染**

  将 `wechat-app/components/recipe-card/recipe-card.wxml` 中的收藏按钮从：
  ```xml
  <!-- 收藏按钮 -->
  <view class="favorite-btn" catchtap="onToggleFavorite" hover-class="btn-hover">
  ```
  改为：
  ```xml
  <!-- 收藏按钮（可通过 showFavorite 属性控制显示） -->
  <view class="favorite-btn" wx:if="{{showFavorite}}" catchtap="onToggleFavorite" hover-class="btn-hover">
  ```

- [ ] **Step 3: 验证 Market 页面和首页未受影响**

  确认以下页面未传入 `showFavorite` 属性（使用默认值 `true`，收藏按钮正常显示）：
  - `wechat-app/pages/index/index.wxml` 中使用 `recipe-card` 的地方
  - Market 页面使用自己的卡片样式，不受影响

- [ ] **Step 4: Commit**

  ```bash
  cd /d/recipe/recipe-miniapp
  git add wechat-app/components/recipe-card/recipe-card.js wechat-app/components/recipe-card/recipe-card.wxml
  git commit -m "feat: 添加 showFavorite 属性控制收藏按钮显示"
  ```

---

## Chunk 2: 修复收藏页事件绑定

### Task 2: 修复 favorites.wxml 中的事件绑定

**Files:**
- Modify: `wechat-app/pages/favorites/favorites.wxml`

- [ ] **Step 1: 修复 tap 事件绑定名称**

  将 `wechat-app/pages/favorites/favorites.wxml` 中的 `recipe-card` 组件的：
  ```xml
  bind:tap="onRecipeTap"
  ```
  改为：
  ```xml
  bind:tapCard="onRecipeTap"
  ```
  （与组件的 `triggerEvent('tapCard', ...)` 对应）

- [ ] **Step 2: 隐藏收藏按钮**

  在同一个 `recipe-card` 组件上将 `showFavorite="{{true}}"` 改为 `showFavorite="{{false}}"`:

  ```xml
  <recipe-card
    wx:for="{{favorites}}"
    wx:key="_id"
    recipe="{{item}}"
    showFavorite="{{false}}"
    isFavorited="{{true}}"
    enableLongPress="{{true}}"
    bind:tapCard="onRecipeTap"
    bind:favorite="onToggleFavorite"
    bind:longpress="onRecipeLongPress"
  />
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add wechat-app/pages/favorites/favorites.wxml
  git commit -m "fix: 修复收藏页事件绑定，隐藏卡片收藏按钮"
  ```

---

## Chunk 3: 修复 favorites.js 的事件处理

### Task 3: 修复 onRecipeTap 接收参数方式

**Files:**
- Modify: `wechat-app/pages/favorites/favorites.js`

- [ ] **Step 1: 分析当前问题**

  当前 `favorites.js` 的 `onRecipeTap`：
  ```javascript
  onRecipeTap(e) {
    const { id } = e.currentTarget.dataset;  // ❌ 组件触发的事件没有 dataset
    ...
  }
  ```

  组件 `recipe-card.js` 触发事件时：
  ```javascript
  this.triggerEvent('tapCard', {
    recipeId: recipe._id,
    recipe: recipe
  });
  ```

  父页面应该从 `e.detail` 获取数据，而不是 `e.currentTarget.dataset`。

- [ ] **Step 2: 修复 onRecipeTap 方法**

  将 `wechat-app/pages/favorites/favorites.js` 中的 `onRecipeTap` 从：
  ```javascript
  onRecipeTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}`
    });
  },
  ```
  改为：
  ```javascript
  onRecipeTap(e) {
    const { recipeId } = e.detail;
    if (!recipeId) return;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}&from=favorites`
    });
  },
  ```

  注意：`from=favorites` 参数为未来可能区分来源预留，当前详情页不处理此参数（无需修改详情页）。

- [ ] **Step 3: Commit**

  ```bash
  git add wechat-app/pages/favorites/favorites.js
  git commit -m "fix: 修复 onRecipeTap 从 e.detail 获取 recipeId"
  ```

---

## Chunk 4: MCP 自动化测试验收

### Task 4: 使用 MCP 自动化测试验证所有功能

**参考 skill:** `wechat-miniprogram-mcp-testing`

使用 `wechat-miniprogram-mcp-testing` skill 运行以下测试用例，确保所有功能正常。

- [ ] **Step 1: 连接开发者工具**

  使用 MCP 工具连接微信开发者工具（如工具未启动则先启动）：
  ```
  mcp__weixin-devtools-mcp__connect_devtools:
    projectPath: "D:\\recipe\\recipe-miniapp\\wechat-app"
    strategy: "auto"
  ```

- [ ] **Step 2: 测试用例 TC-1 — 收藏页卡片无收藏按钮**

  ```
  1. relaunch 到 /pages/favorites/favorites
  2. waitFor: favorites 页面加载完成
  3. get_page_snapshot
  4. 验证：快照中不存在 favorite-btn 元素（或验证 showFavorite=false 生效）
  5. screenshot 保存截图
  ```

- [ ] **Step 3: 测试用例 TC-2 — 点击卡片进入详情页**

  ```
  1. 确保在 /pages/favorites/favorites 且有收藏数据
  2. get_page_snapshot 找到第一个菜谱卡片的 uid
  3. click 点击该卡片
  4. waitFor: 等待详情页加载（等待 "食材准备" 或菜谱名称出现）
  5. get_current_page 确认当前页面是 recipe-detail
  6. screenshot 保存截图
  7. navigate_back 返回收藏页
  ```

- [ ] **Step 4: 测试用例 TC-3 — 长按卡片显示取消收藏菜单**

  ```
  1. 确保在 /pages/favorites/favorites 且有收藏数据
  2. get_page_snapshot 找到第一个菜谱卡片的 uid
  3. 使用 evaluate_script 模拟长按事件触发：
     getCurrentPages()[pages.length-1].onRecipeLongPress({detail: {recipe: {_id: 'xxx', name: 'xxx'}}})
     或直接通过 MCP 长按（若支持）
  4. waitFor: 等待 "取消收藏" 文字出现
  5. get_page_snapshot 验证 action-menu 显示
  6. screenshot 保存截图
  ```

  > 注意：微信小程序 MCP 工具目前不直接支持长按手势模拟。可通过 `evaluate_script` 直接调用 `onRecipeLongPress` 来测试弹窗逻辑。

- [ ] **Step 5: 测试用例 TC-4 — 取消收藏操作**

  ```
  1. 接 TC-3 之后，菜单已显示
  2. get_page_snapshot 找到 "取消收藏" 按钮的 uid
  3. click 点击 "取消收藏"
  4. waitFor: 等待菜单消失（等待 "取消收藏" 文字消失）
  5. 验证 Toast "已取消收藏" 出现，或验证收藏列表减少一项
  6. screenshot 保存截图
  ```

- [ ] **Step 6: 测试用例 TC-5 — 详情页收藏/取消收藏切换**

  ```
  1. navigate_to /pages/recipe-detail/recipe-detail?id=<有效ID>
  2. waitFor: 等待详情页加载
  3. get_page_snapshot 找到收藏按钮
  4. 验证初始状态（已收藏/未收藏）
  5. click 点击收藏按钮
  6. waitFor: 等待状态变化（按钮文字变化）
  7. 验证按钮状态已切换
  8. screenshot 保存截图
  ```

- [ ] **Step 7: 检查控制台无新增错误**

  ```
  list_console_messages types: ["error", "warn"]
  验证没有新增的错误信息（特别是事件绑定相关错误）
  ```

- [ ] **Step 8: 所有测试通过后，最终 Commit**

  ```bash
  git add .
  git commit -m "test: MCP 自动化测试验收通过 - 收藏页交互修复"
  ```

---

## 验收标准

| 测试场景 | 预期结果 |
|---------|--------|
| 收藏页卡片右上角 | 无收藏按钮显示 |
| 点击收藏页卡片 | 正确跳转到详情页 |
| 长按收藏页卡片 | 显示包含"取消收藏"的底部弹窗 |
| 点击弹窗"取消收藏" | 菜谱从列表移除，提示"已取消收藏" |
| 点击弹窗"取消"或遮罩 | 弹窗关闭，无操作 |
| 详情页收藏按钮 | 可正常切换收藏/取消收藏状态 |
| 控制台 | 无新增错误 |

---

## 注意事项

1. **不需要修改 Market 页面** — Market 使用自己的卡片模板（不是 `recipe-card` 组件），收藏按钮逻辑独立。
2. **不需要修改详情页** — `recipe-detail.js` 的收藏/取消收藏切换逻辑已经完整正确。
3. **组件自动导航问题** — `recipe-card.js` 的 `onTapCard()` 仍会自行调用 `wx.navigateTo()`，这在 favorites 页面会导致导航被触发两次（组件内一次 + 父页面 `onRecipeTap` 一次）。修复方案：在 `favorites.wxml` 中已通过 `bind:tapCard` 处理导航，需要注意组件内的自动导航可能造成双重跳转。**可选的额外修复**：如果发生双重跳转，在 `recipe-card.js` 中检查是否应该由父页面处理导航（通过新增 `handleNavigation` 属性控制）。但这属于范围扩展，仅在出现问题时处理。

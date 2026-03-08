# 🧪 前后端完整测试覆盖

> 覆盖所有前端页面交互和后端云函数功能

---

## 📱 前端功能矩阵

### 1. 首页 (pages/index/index)

| 功能 | 测试点 | 交互方式 | 优先级 |
|------|--------|----------|--------|
| **页面加载** | 数据加载 | 自动 | P0 |
| | 骨架屏显示 | 自动 | P0 |
| | 欢迎语显示 | 渲染检查 | P0 |
| **Market入口** | 点击跳转 | bindtap | P0 |
| **搜索栏** | 点击聚焦 | bindtap | P0 |
| | 输入关键词 | bindinput | P0 |
| | 执行搜索 | bindconfirm | P0 |
| | 清空搜索 | bindclear | P1 |
| **菜系筛选** | 点击标签 | bindtap | P0 |
| | 选中状态 | class切换 | P0 |
| | 筛选结果 | 数据更新 | P0 |
| | 全部标签 | 重置筛选 | P0 |
| **筛选弹窗** | 打开弹窗 | bindtap | P1 |
| | 选择菜系 | bindconfirm | P1 |
| | 重置筛选 | bindreset | P1 |
| | 关闭弹窗 | bindclose | P1 |
| **菜谱列表** | 卡片渲染 | wx:for | P0 |
| | 点击卡片 | bind:tapCard | P0 |
| | 收藏按钮 | bind:toggleFavorite | P0 |
| | 图片加载 | image组件 | P0 |
| **加载更多** | 上拉加载 | 滚动事件 | P1 |
| | 加载状态 | loading标志 | P1 |
| | 无更多数据 | noMore标志 | P1 |
| **错误处理** | 错误提示 | error状态 | P1 |
| | 重试按钮 | bindtap | P1 |
| **空状态** | 无数据提示 | wx:if | P1 |
| | 跳转Market | bindtap | P1 |

### 2. Market页面 (pages/market/market)

| 功能 | 测试点 | 交互方式 | 优先级 |
|------|--------|----------|--------|
| **页面加载** | 骨架屏 | wx:if | P0 |
| | 加载完成 | loading=false | P0 |
| **搜索功能** | 输入框聚焦 | bindfocus | P0 |
| | 输入关键词 | bindinput | P0 |
| | 执行搜索 | bindconfirm/bindtap | P0 |
| | 清空搜索 | bindtap | P1 |
| | 搜索按钮 | bindtap | P1 |
| **菜系筛选** | 横向滚动 | scroll-view | P0 |
| | 点击标签 | bindtap | P0 |
| | 选中高亮 | class切换 | P0 |
| | 全部菜系 | 默认选中 | P0 |
| **菜谱瀑布流** | 双列布局 | CSS Grid | P0 |
| | 图片显示 | image组件 | P0 |
| | 菜名显示 | text组件 | P0 |
| | 烹饪时间 | text条件渲染 | P1 |
| **Market标识** | NEW标识 | wx:if | P0 |
| | 精选标识 | wx:if | P0 |
| | 推荐理由 | 条件渲染 | P1 |
| **今日新增** | 新增提示 | wx:if | P1 |
| | 新增数量 | newCount | P1 |
| **收藏功能** | 收藏按钮 | catchtap | P0 |
| | 点击菜谱 | bindtap | P0 |
| | 跳转详情 | wx.navigateTo | P0 |
| **加载更多** | 滚动加载 | 滚动事件 | P1 |
| | 加载动画 | loading-dots | P1 |
| | 无更多提示 | noMore | P1 |
| **空状态** | 无Market数据 | wx:if | P0 |
| | 搜索无结果 | keyword+空列表 | P1 |
| **筛选结果** | 结果提示 | filter-result | P1 |
| | 结果数量 | recipes.length | P1 |

### 3. 收藏页面 (pages/favorites/favorites)

| 功能 | 测试点 | 交互方式 | 优先级 |
|------|--------|----------|--------|
| **页面加载** | 收藏列表 | onLoad | P0 |
| | 加载状态 | loading | P0 |
| **收藏列表** | 卡片渲染 | wx:for | P0 |
| | 菜名显示 | text | P0 |
| | 图片显示 | image | P0 |
| | 菜系标签 | text | P1 |
| | 烹饪时间 | text条件渲染 | P1 |
| **取消收藏** | 取消按钮 | bindtap | P0 |
| | 确认取消 | 交互反馈 | P0 |
| | 列表更新 | 数据移除 | P0 |
| **点击卡片** | 跳转详情 | bindtap | P0 |
| | 传参recipeId | url参数 | P0 |
| **空状态** | 无收藏提示 | wx:if | P0 |
| | 图标显示 | image | P0 |
| | 引导文字 | text | P0 |
| | 去发现按钮 | bindtap | P0 |
| | 跳转首页/Market | wx.switchTab | P0 |
| **加载更多** | 上拉加载 | 滚动事件 | P1 |
| | 分页加载 | skip/limit | P1 |

### 4. 推荐页面 (pages/recommend/recommend)

| 功能 | 测试点 | 交互方式 | 优先级 |
|------|--------|----------|--------|
| **页面加载** | 推荐数据 | onLoad | P0 |
| | 骨架屏 | loading | P0 |
| | 个性化/热门 | type标识 | P0 |
| **推荐列表** | 卡片渲染 | wx:for | P0 |
| | 推荐标签 | 热门/适合您 | P1 |
| | 推荐理由 | 条件渲染 | P1 |
| **收藏功能** | 收藏按钮 | bindtap | P0 |
| | 状态切换 | 已收藏/未收藏 | P0 |
| **点击卡片** | 跳转详情 | bindtap | P0 |
| **下拉刷新** | 刷新数据 | pullDownRefresh | P1 |
| | 更新推荐 | refresh=true | P1 |
| **加载更多** | 上拉加载 | 滚动事件 | P1 |
| **空状态** | 无推荐数据 | wx:if | P1 |

### 5. 菜谱详情页 (pages/recipe-detail/recipe-detail)

| 功能 | 测试点 | 交互方式 | 优先级 |
|------|--------|----------|--------|
| **页面加载** | 获取参数 | onLoad options | P0 |
| | 加载数据 | 云函数/数据库 | P0 |
| | 骨架屏 | loading | P0 |
| **顶部信息** | 菜谱名称 | text | P0 |
| | 菜系标签 | text | P0 |
| | 难度标签 | text条件渲染 | P1 |
| | 烹饪时间 | text | P0 |
| | 热度评分 | text | P1 |
| **收藏按钮** | 收藏状态 | 图标切换 | P0 |
| | 点击收藏 | bindtap | P0 |
| | 取消收藏 | bindtap | P0 |
| | 防抖处理 | 500ms | P0 |
| **食材列表** | 食材渲染 | wx:for | P0 |
| | 用量显示 | text | P0 |
| | 备选食材 | text条件渲染 | P1 |
| **步骤列表** | 步骤序号 | index+1 | P0 |
| | 步骤描述 | text | P0 |
| | 步骤图片 | image条件渲染 | P1 |
| | 烹饪时间 | text条件渲染 | P1 |
| **小贴士** | 提示显示 | wx:if | P1 |
| | 提示内容 | text | P1 |
| **返回按钮** | 返回上一页 | bindtap | P0 |
| | 返回首页 | bindtap | P1 |
| **分享功能** | 分享按钮 | bindtap | P1 |
| | 生成海报 | canvas绘制 | P1 |
| **相关推荐** | 推荐列表 | wx:for | P1 |
| | 点击跳转 | bindtap | P1 |

### 6. 搜索页面 (pages/search/search)

| 功能 | 测试点 | 交互方式 | 优先级 |
|------|--------|----------|--------|
| **搜索框** | 自动聚焦 | focus | P0 |
| | 输入关键词 | bindinput | P0 |
| | 防抖处理 | 500ms | P0 |
| | 清空按钮 | bindtap | P1 |
| | 搜索按钮 | bindtap | P0 |
| | 历史记录 | storage | P1 |
| **搜索结果** | 结果列表 | wx:for | P0 |
| | 高亮匹配 | text高亮 | P1 |
| | 无结果提示 | wx:if | P0 |
| **搜索历史** | 历史列表 | wx:for | P1 |
| | 点击历史 | bindtap | P1 |
| | 删除历史 | bindtap | P1 |
| | 清空历史 | bindtap | P1 |
| **热门搜索** | 热门列表 | wx:for | P1 |
| | 点击热门 | bindtap | P1 |
| **返回** | 返回上一页 | bindtap | P0 |

### 7. 个人中心 (pages/profile/profile)

| 功能 | 测试点 | 交互方式 | 优先级 |
|------|--------|----------|--------|
| **用户信息** | 头像显示 | image | P0 |
| | 昵称显示 | text | P0 |
| | 编辑资料 | bindtap | P1 |
| **统计数据** | 收藏数量 | text | P0 |
| | 浏览数量 | text | P1 |
| | 发布数量 | text | P1 |
| **功能列表** | 我的收藏 | bindtap | P0 |
| | 浏览历史 | bindtap | P1 |
| | 偏好设置 | bindtap | P0 |
| | 关于我们 | bindtap | P1 |
| | 意见反馈 | bindtap | P1 |

### 8. 偏好设置 (pages/preferences/preferences)

| 功能 | 测试点 | 交互方式 | 优先级 |
|------|--------|----------|--------|
| **菜系偏好** | 菜系列表 | wx:for | P0 |
| | 多选 | checkbox | P0 |
| | 选中状态 | checked | P0 |
| **保存设置** | 保存按钮 | bindtap | P0 |
| | 成功提示 | toast | P0 |
| | 返回上一页 | navigateBack | P0 |
| **返回** | 返回上一页 | bindtap | P0 |

### 9. 添加菜谱 (pages/add-recipe/add-recipe)

| 功能 | 测试点 | 交互方式 | 优先级 |
|------|--------|----------|--------|
| **基本信息** | 菜谱名称 | input | P0 |
| | 菜系选择 | picker | P0 |
| | 烹饪时间 | input/number | P1 |
| | 难度选择 | picker | P1 |
| **食材编辑** | 添加食材 | bindtap | P0 |
| | 删除食材 | bindtap | P0 |
| | 食材名称 | input | P0 |
| | 食材用量 | input | P0 |
| **步骤编辑** | 添加步骤 | bindtap | P0 |
| | 删除步骤 | bindtap | P0 |
| | 步骤描述 | textarea | P0 |
| | 步骤图片 | 上传图片 | P1 |
| | 排序 | 拖拽/上下 | P1 |
| **图片上传** | 选择图片 | wx.chooseImage | P0 |
| | 预览图片 | previewImage | P1 |
| | 删除图片 | bindtap | P1 |
| **小贴士** | 文本输入 | textarea | P1 |
| **提交** | 提交按钮 | bindtap | P0 |
| | 表单验证 | validate | P0 |
| | 成功提示 | toast | P0 |
| | 跳转详情 | redirectTo | P0 |

### 10. WebView (pages/web-view/web-view)

| 功能 | 测试点 | 交互方式 | 优先级 |
|------|--------|----------|--------|
| **页面加载** | 加载URL | src | P1 |
| | 标题显示 | navigationBar | P1 |
| **返回** | 返回上一页 | bindtap | P1 |

---

## ⚙️ 后端功能矩阵

### 1. 用户认证云函数 (cloudfunctions/auth)

| API | 功能 | 输入参数 | 返回值 | 测试点 | 优先级 |
|-----|------|----------|--------|--------|--------|
| **getOrCreateUser** | 获取或创建用户 | openid, userInfo | user, isNewUser | 用户已存在更新登录时间 | P0 |
| | | | | 用户不存在创建新用户 | P0 |
| | | | | 默认字段设置 | P0 |
| **main** | 主入口 | event, context | code, message, data | 获取OPENID | P0 |
| | | | | 调用getOrCreateUser | P0 |
| | | | | 返回用户信息 | P0 |

**测试场景：**
- [ ] 新用户首次登录，自动创建用户记录
- [ ] 老用户登录，更新最后登录时间
- [ ] 缺失OPENID，返回错误
- [ ] 数据库异常，错误处理

### 2. AI每日精选云函数 (cloudfunctions/recipe-daily-curation)

| API | 功能 | 输入参数 | 返回值 | 测试点 | 优先级 |
|-----|------|----------|--------|--------|--------|
| **main** | 定时触发入口 | event, context | code, message, data | 检查今日是否已执行 | P0 |
| | | event.force | | 强制重新执行 | P1 |
| | | | | 生成jobId | P0 |
| | | | | 记录执行日志 | P0 |
| **searchRecipesWithAI** | AI搜索菜谱 | logEntry | recipes, retriesUsed, timeoutOccurred | 调用AI模型 | P0 |
| | | | | 超时处理(30s) | P0 |
| | | | | 重试机制(3次) | P0 |
| | | | | 指数退避延迟 | P1 |
| **processRecipes** | 智能去重 | aiRecipes, existingRecipes, jobId | newRecipes, duplicates, updatedRecipes | 相似度计算 | P0 |
| | | | | 名称匹配 | P0 |
| | | | | 食材匹配 | P1 |
| | | | | 阈值判断(0.7) | P0 |
| **saveNewRecipes** | 保存新菜谱 | newRecipes | savedRecipeIds | 批量写入 | P0 |
| | | | | 更新收藏数 | P1 |
| **saveToMarketDaily** | 保存每日精选 | newRecipes, updatedRecipes, today | marketEntry | 写入market_daily | P0 |
| | | | | 关联菜谱ID | P0 |
| **saveLog** | 保存执行日志 | logEntry | logId | 写入ai_generation_logs | P0 |

**测试场景：**
- [ ] 定时触发每天9:00执行
- [ ] 今日已执行，跳过
- [ ] force=true，强制重新执行
- [ ] AI调用成功，返回菜谱数据
- [ ] AI调用超时，重试3次
- [ ] AI调用失败，降级策略
- [ ] 新菜谱与现有菜谱去重
- [ ] 相似菜谱合并更新
- [ ] 保存到recipes集合
- [ ] 保存到market_daily集合
- [ ] 记录完整执行日志

### 3. 个性化推荐云函数 (cloudfunctions/recipe-recommend)

| API | 功能 | 输入参数 | 返回值 | 测试点 | 优先级 |
|-----|------|----------|--------|--------|--------|
| **main** | 推荐入口 | limit, refresh | code, message, data | 获取OPENID | P0 |
| | | | | 未登录返回热门推荐 | P0 |
| | | | | 已登录个性化推荐 | P0 |
| **getHotRecipes** | 热门菜谱 | limit | hotRecipes | 按热度排序 | P0 |
| | | | | 限制数量 | P0 |
| **getPersonalizedRecommendations** | 个性化推荐 | OPENID, preferredCuisines, favorites, viewedRecipes, limit | recommendations | 根据偏好菜系筛选 | P0 |
| | | | | 排除已收藏 | P0 |
| | | | | 排除已浏览 | P1 |
| | | | | 随机打乱 | P1 |
| | | | | 热门补充 | P1 |

**测试场景：**
- [ ] 未登录用户，返回热门推荐
- [ ] 已登录无偏好，返回热门推荐
- [ ] 已登录有偏好，返回个性化推荐
- [ ] refresh=true，刷新推荐
- [ ] 推荐列表排除已收藏
- [ ] 推荐列表排除已浏览
- [ ] 推荐数量不足，用热门补充

### 4. 收藏功能云函数 (cloudfunctions/user-toggle-favorite)

| API | 功能 | 输入参数 | 返回值 | 测试点 | 优先级 |
|-----|------|----------|--------|--------|--------|
| **main** | 收藏入口 | action, recipeId | code, message, data | 参数校验(OPENID) | P0 |
| | | | | 参数校验(recipeId) | P0 |
| | | | | 参数校验(action) | P0 |
| **addFavorite** | 添加收藏 | OPENID, recipeId | success, isNewFavorite | 更新用户favorites数组 | P0 |
| | | | | 增加菜谱收藏数 | P0 |
| | | | | 已收藏跳过 | P0 |
| | | | | 记录收藏时间 | P1 |
| **removeFavorite** | 取消收藏 | OPENID, recipeId | success, isRemoved | 从favorites数组移除 | P0 |
| | | | | 减少菜谱收藏数 | P0 |
| | | | | 未收藏跳过 | P0 |
| **toggleFavorite** | 切换收藏 | OPENID, recipeId | success, isFavorited | 自动判断add/remove | P0 |

**测试场景：**
- [ ] 添加收藏成功
- [ ] 重复添加，不重复记录
- [ ] 取消收藏成功
- [ ] 取消未收藏的菜谱，不报错
- [ ] 切换收藏状态
- [ ] 缺失参数返回错误
- [ ] 无效action返回错误
- [ ] 收藏数正确增减

---

## 🔗 前后端集成测试

| 场景 | 前端操作 | 后端API | 验证点 |
|------|----------|---------|--------|
| **首页加载** | onLoad | auth.main | 用户自动创建/更新 |
| | | recipe-api.getRecipes | 菜谱列表加载 |
| **Market加载** | onLoad | auth.main | 用户身份验证 |
| | | market_daily.query | 每日精选加载 |
| **收藏菜谱** | 点击收藏 | user-toggle-favorite.main | action=add |
| | | | 收藏数+1 |
| | | | 用户favorites更新 |
| **取消收藏** | 点击取消 | user-toggle-favorite.main | action=remove |
| | | | 收藏数-1 |
| **获取推荐** | onLoad | recipe-recommend.main | 个性化推荐 |
| | 下拉刷新 | recipe-recommend.main | refresh=true |
| **搜索** | bindconfirm | recipe-api.search | 关键词查询 |
| | | | 结果高亮 |
| **每日精选** | 定时触发 | recipe-daily-curation.main | 定时器触发 |
| | | | AI生成菜谱 |
| | | | 保存到Market |

---

## 📋 测试执行清单

### 前端测试脚本
- [x] test-full-coverage.js - 基础功能测试
- [x] test-interactions.js - 交互功能测试
- [ ] test-pages-home.js - 首页专项测试
- [ ] test-pages-market.js - Market专项测试
- [ ] test-pages-favorites.js - 收藏专项测试
- [ ] test-pages-detail.js - 详情页专项测试
- [ ] test-pages-search.js - 搜索专项测试
- [ ] test-pages-profile.js - 个人中心专项测试

### 后端测试脚本
- [ ] test-cloud-auth.js - 认证云函数测试
- [ ] test-cloud-favorite.js - 收藏云函数测试
- [ ] test-cloud-recommend.js - 推荐云函数测试
- [ ] test-cloud-curation.js - 每日精选云函数测试

### 集成测试脚本
- [ ] test-integration-full.js - 完整集成测试
- [ ] test-e2e-user-journey.js - 用户旅程E2E测试

---

## ✅ 通过标准

### 前端
- 所有P0功能正常
- 所有页面加载时间 < 2s
- 控制台无Error日志
- 交互响应时间 < 300ms
- 防抖节流功能正常

### 后端
- 所有API返回正确
- 错误处理完善
- 数据库操作正确
- 云函数执行时间 < 5s
- 日志记录完整

### 集成
- 前后端数据一致
- 网络请求成功率 > 99%
- 并发操作正确
- 异常流程处理正确

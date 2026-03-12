# Feature Specification: CloudBase Migration and UI Redesign

**Feature Branch**: `001-cloudbase-migration`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "Migrate backend from cloud server to CloudBase, redesign WeChat Mini Program UI, and fix functional bugs"
**Constitution**: See `.specify/memory/constitution.md` for project principles

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Seamless Recipe Browsing (Priority: P1)

Users can browse, search, and view recipes with a modern, aesthetically pleasing interface that loads quickly and provides clear visual hierarchy.

**Why this priority**: This is the core value proposition of the app. The redesigned UI directly impacts user engagement and retention. A beautiful, intuitive recipe browsing experience is what keeps users coming back.

**Independent Test**: Can be fully tested by opening the Mini Program, navigating through recipe lists, searching for recipes, and viewing recipe details. The experience should feel modern, visually appealing, and responsive.

**Acceptance Scenarios**:

1. **Given** the user opens the Mini Program, **When** they view the homepage, **Then** they see a visually appealing card-based layout with clear recipe images, names, and key information (cuisine, cook time, difficulty)

2. **Given** the user is on the homepage, **When** they tap on a recipe card, **Then** they navigate to a detail page with beautiful typography, clear step-by-step instructions, and ingredient list

3. **Given** the user wants to find a specific recipe, **When** they use the search function, **Then** they get relevant results displayed in the same beautiful card layout with smooth animations

4. **Given** the user is viewing recipes, **When** they apply a cuisine filter, **Then** the list updates smoothly with appropriate visual feedback

---

### User Story 2 - Personalized Recipe Collection (Priority: P1)

Users can collect favorite recipes and receive personalized recommendations based on their preferences, with a seamless authentication experience.

**Why this priority**: Personalization drives user retention. The ability to save favorites and get recommendations makes the app more valuable to each individual user. WeChat's natural login-free authentication is critical for frictionless experience.

**Independent Test**: Can be fully tested by favoriting recipes, viewing the favorites list, and checking daily recommendations. No explicit login should be required.

**Acceptance Scenarios**:

1. **Given** the user finds a recipe they like, **When** they tap the favorite button, **Then** the recipe is saved to their collection with visual confirmation (heart animation or toast)

2. **Given** the user has favorited recipes from the Market, **When** they navigate to "My Recipes" tab, **Then** they see all their saved recipes in the same beautiful layout as the homepage

3. **Given** the user is viewing their saved recipes in "My Recipes", **When** they long-press on a recipe card, **Then** a context menu appears with "取消收藏" (Unfavorite) option

4. **Given** the user long-presses a recipe card in "My Recipes", **When** they select "取消收藏", **Then** the recipe is removed from their collection with visual confirmation

3. **Given** the user has set cuisine preferences, **When** they open "Today's Recommendation", **Then** they see recipes matching their preferences with a visually appealing presentation

4. **Given** the user uses the app for the first time, **When** they interact with any feature requiring user identity, **Then** it works seamlessly without explicit login/registration screens

5. **Given** the user is viewing "My Recipes" tab, **When** they examine the recipe list, **Then** they only see recipes they have previously favorited from the Market (no add-to-favorite action, only unfavorite via long-press)

---

### User Story 3 - Smart Daily Recipe Curation (Priority: P2)

Users discover new recipes through the "Market" section where the system intelligently curates 2 recipes daily - either fresh content from AI search or recommendations from existing recipes suitable for the day.

**Why this priority**: Automated content keeps the app fresh and gives users reasons to return. The intelligent deduplication ensures quality over quantity, while fallback recommendations ensure the Market is never empty.

**Independent Test**: Can be fully tested by checking the Market tab daily. Should see 2 recipes with clear indicators ("New" for fresh content, "Recommended" for existing), with no duplicates in the database.

**Acceptance Scenarios**:

1. **Given** the daily scheduled job runs, **When** AI finds new recipes with high popularity, **Then** 2 non-duplicate recipes (or higher-heat versions) appear in the Market with "New" indicators

2. **Given** the AI search finds no suitable new content, **When** the job completes, **Then** 2 existing recipes suitable for the current day appear with "Today's Pick" indicators

3. **Given** a recipe already exists in the database, **When** AI finds a similar recipe with higher heat score (likes/favorites), **Then** the higher-heat version replaces the original in the Market and database is updated

---

### User Story 4 - Reliable Core Functionality (Priority: P1)

All existing features work reliably without bugs, providing a smooth user experience across all main user flows.

**Why this priority**: Bug fixes are critical for user trust. Broken functionality destroys user confidence regardless of how beautiful the UI is. This story ensures the migration doesn't break existing features.

**Independent Test**: Can be fully tested by executing all main user flows end-to-end: browse recipes, search, favorite/unfavorite, view recommendations, and verify all interactions work correctly.

**Acceptance Scenarios**:

1. **Given** the user performs any core action (browse, search, favorite, view details), **When** the action completes, **Then** it succeeds without errors or unexpected behavior

2. **Given** the user is using the app, **When** network conditions fluctuate, **Then** the app handles gracefully with appropriate loading states and error messages

3. **Given** the user performs actions rapidly (tap favorite multiple times, quick navigation), **When** these actions occur, **Then** the app remains stable without crashes or data corruption

---

### Edge Cases

- What happens when the user has no internet connection?
- How does the system handle duplicate recipes from AI search (name similarity matching)?
- What happens when AI returns a recipe with the same name but higher external popularity?
- What happens when CloudBase service quotas are exceeded?
- How are users migrated from the old backend to CloudBase (data continuity)?
- What happens when recipe images fail to load?
- How does the system handle very long recipe names or ingredient lists?
- What happens when the user rapidly switches between tabs?
- What happens when AI search fails or returns no results for multiple consecutive days?
- How does the system determine which existing recipes are "suitable for the day" (seasonality logic)?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST provide a redesigned WeChat Mini Program UI with modern aesthetics, following the light blue (#42A5F5) theme with card-based layouts, rounded corners, and soft shadows

- **FR-002**: System MUST migrate all backend functionality from cloud server to CloudBase platform, eliminating dependency on self-hosted Node.js/Express server

- **FR-003**: System MUST use CloudBase NoSQL database to store all recipe and user data, replacing MongoDB

- **FR-004**: System MUST use CloudBase SDK (`wx.cloud`) for all database operations from the Mini Program, implementing direct SDK access for simple CRUD and cloud functions for complex operations

- **FR-005**: System MUST use WeChat's natural login-free authentication, obtaining user identity via `wxContext.OPENID` without explicit login screens

- **FR-006**: System MUST fix all existing functional bugs identified during testing - Bugs will be discovered and documented during the testing phase before implementation

- **FR-007**: System MUST configure CloudBase security rules to ensure proper data access control (users can only access their own favorites, recipes are publicly readable)

- **FR-008**: System MUST migrate existing recipe data from current MongoDB to CloudBase NoSQL without data loss

- **FR-009**: System MUST implement daily recipe curation using CloudBase scheduled triggers (cron: daily at 9:00 AM), generating exactly 2 recipes per day via AI model search (Hunyuan/DeepSeek with web search capability)

- **FR-010**: System MUST maintain or improve page load performance (target: under 2 seconds on standard mobile networks) after CloudBase migration

- **FR-011**: System MUST provide clear visual feedback for all user interactions (loading states, success confirmations, error messages)

- **FR-012**: System MUST implement responsive design that works across different mobile screen sizes

- **FR-013**: System MUST implement intelligent deduplication for AI-discovered recipes: compare against existing recipes by name similarity (>80% match threshold); if duplicate detected, keep the version with higher heat score (favoriteCount + external popularity metrics)

- **FR-014**: System MUST implement fallback recommendation logic: when AI search returns no suitable new recipes, select 2 existing recipes based on seasonality, user preferences, and historical popularity for "Today's Pick"

- **FR-015**: System MUST track recipe heat scores combining internal favoriteCount with external popularity metrics (when available from AI search) to determine which version to keep

- **FR-016**: System MUST use Chinese for code comments, UI text, and documentation; code variables, function names, and file paths remain in English

- **FR-017**: "My Recipes" (favorites) page MUST only display recipes that the user has already favorited from the Market; the only available action is "unfavorite" (取消收藏) triggered via long-press on the recipe card, which shows a context menu

### Key Entities *(include if feature involves data)*

- **Recipe**: Represents a cooking recipe with attributes: name, cuisine, imageUrl, ingredients[], steps[], cookTime, difficulty, tags[], favoriteCount, isDailyRecommended, sourceType (ai_generated|manual), createdAt, updatedAt

- **User**: Represents a WeChat Mini Program user with attributes: openid (WeChat OpenID), nickname, avatarUrl, preferredCuisines[], favorites[] (recipe IDs), viewedRecipes[], createdAt

- **AIRecipeGenerationLog**: Represents an AI recipe generation job with attributes: jobId, status, recipesSearched, recipesAdded, recipesDuplicated, modelUsed (hunyuan|deepseek), fallbackToExisting (boolean), errors[], executedAt

### CloudBase Requirements *(for CloudBase-dependent features)*

<!--
  ACTION REQUIRED: If this feature uses CloudBase services, specify requirements below.
  Reference the cloudbase-guidelines skill for platform-specific guidance.
-->

**CloudBase Services**:
- [x] NoSQL Database: recipes collection, users collection
- [x] Cloud Functions: user-authentication (get OpenID), daily-recommend (generate recommendations), ai-recipe-generator (AI-powered recipe creation)
- [x] Scheduled Triggers: Daily AI recipe generation (cron: 0 0 9 * * * *)
- [x] Cloud Storage: recipe images, user avatars
- [x] Authentication: WeChat OpenID (natural login-free)

**Data Access Pattern** (choose one):
- [x] SDK direct access: Frontend uses `wx.cloud` for simple CRUD (read recipes, get user favorites)
- [x] Cloud function access: Complex operations via server-side functions (crawler ingestion, recommendation generation)
- [ ] API endpoints: External integrations or custom backend (N/A - fully migrating to CloudBase)

**Security Configuration**:
- [ ] CloudBase security rules defined for database collections (recipes: public read; users: user-private; favorites: user-private)
- [ ] API keys secured for admin/crawler endpoints (Kimi Claw crawler authentication)
- [ ] No sensitive credentials exposed in client-side code

**Console Links**: [Provide CloudBase console URLs for managed resources after creation]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can browse, search, and view recipes with 100% success rate (no functional bugs in core flows)

- **SC-002**: Page load time remains under 2 seconds on 4G mobile networks for all main screens (homepage, recipe detail, favorites)

- **SC-003**: All existing recipe data (100% of current MongoDB records) is successfully migrated to CloudBase without data loss

- **SC-004**: Users can favorite/unfavorite recipes with visual feedback displayed within 300ms of interaction

- **SC-005**: Daily recommendations load successfully and display personalized content based on user preferences

- **SC-006**: Daily curation successfully provides exactly 2 recipes per day in the Market section, with 100% availability (fallback recommendations ensure no empty days)

- **SC-007**: Deduplication logic achieves >95% accuracy in detecting true duplicates (by name similarity >80%) and correctly selects higher-heat versions

- **SC-008**: Zero explicit login screens required - user identity is obtained seamlessly via WeChat OpenID

- **SC-009**: UI receives positive feedback in informal testing - users describe it as "beautiful", "modern", or "easy to use"

## Assumptions

- Current MongoDB data can be exported and imported to CloudBase NoSQL with schema adaptations as needed
- WeChat Mini Program environment provides stable access to `wx.cloud` APIs
- AI recipe generation uses CloudBase AI SDK with Hunyuan or DeepSeek models
- Recipe images can be migrated to CloudBase Storage or continue using existing URLs
- Express backend will be fully decommissioned - all functionality migrated to CloudBase

## Dependencies

- CloudBase environment must be set up and configured
- MCP tools should be available for CloudBase development
- WeChat Mini Program development tools for testing
- Existing MongoDB database access for data migration
- **WeChat DevTools MCP**: Automated Mini Program testing via MCP integration

## Testing Approach

### Automated E2E Testing with WeChat DevTools MCP

This feature uses **WeChat Developer Tools MCP** for automated end-to-end testing, replacing traditional manual testing approaches.

**MCP Capabilities Utilized**:
- **Page Snapshot**: Capture accessibility tree for element identification
- **Element Interaction**: Click, input, scroll automation
- **Console Monitoring**: Capture and analyze runtime logs
- **Network Interception**: Simulate offline/slow network conditions
- **Performance Metrics**: Measure page load times and rendering performance

**Test Coverage**:

| Flow | Test Method | MCP Commands |
|------|-------------|--------------|
| Recipe Browsing | Automated | `connect_devtools` → `navigate_to` → `get_page_snapshot` → `click` → `assert_text` |
| Search Function | Automated | `fill` → `press_key` → `wait_for` → `assert_state` |
| Favorite/Unfavorite | Automated | `click` → `wait_for` → `navigate_to` → `assert_text` |
| Network Error Handling | Automated | `emulate` (network) → `click` → `assert_text` (error message) |
| Offline Mode | Automated | `emulate` (offline) → `assert_state` (offline indicator) |
| Performance | Automated | `navigate_page` → measure duration → assert < 2s |

**Testing Workflow**:
1. Connect to WeChat DevTools via MCP (`connect_devtools`)
2. Navigate to target page (`navigate_to`)
3. Capture page snapshot for element discovery (`get_page_snapshot`)
4. Execute user actions (`click`, `fill`, `scroll`)
5. Assert expected outcomes (`assert_text`, `assert_state`)
6. Capture console logs for error detection (`list_console_messages`)

**Benefits**:
- Faster regression testing (minutes vs hours)
- Reproducible test scenarios
- Real device simulation in DevTools
- Automated performance measurement
- CI/CD integration ready

## Clarifications

### Session 2026-03-06

- **Q**: AI 菜谱搜集的具体方式？→ **A**: 使用 CloudBase 定时触发器 + AI 生成菜谱（Option B）。每天定时触发云函数，调用 AI 模型（混元/DeepSeek）生成原创菜谱内容，直接存储到 CloudBase NoSQL。

- **Q**: 每天生成多少道菜谱？→ **A**: 每天生成 2 道。智能去重：AI 搜索新菜谱，与现有库对比，仅添加不重复的或热度（点赞/收藏）更高的版本。若当天无新内容，则从现有菜谱中推荐 2 道适合当天制作的菜。

- **Q**: 项目开发语言要求？→ **A**: 代码注释、UI 文本、文档使用中文；代码变量名、函数名、文件路径保持英文（已修正：此前理解有误，变量和函数名应为英文）

### Session 2026-03-08

- **Q**: "我的菜谱"页面的功能定义是什么？→ **A**: "我的菜谱"只展示从市场收藏的菜谱，功能上只有取消收藏，通过长按卡片触发显示取消收藏选项

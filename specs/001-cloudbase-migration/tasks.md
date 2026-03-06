# Tasks: CloudBase Migration and UI Redesign

**Constitution Alignment**: Tasks should uphold principles in `.specify/memory/constitution.md`
- **UX First**: Frontend tasks include UX validation
- **Cloud-Native Architecture**: Tasks leverage CloudBase SDK or APIs appropriately
- **Platform-Native Authentication**: Tasks use WeChat OpenID (no explicit login)
- **Data Integrity**: Model tasks include validation logic
- **Separation of Concerns**: No cross-tier dependencies in single task
- **CloudBase Best Practices**: Tasks reference cloudbase-guidelines skill
- **Content Automation**: Daily curation via scheduled cloud functions

**Input**: Design documents from `/specs/001-cloudbase-migration/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md

**Tests**: Manual testing via WeChat Developer Tools (no automated test tasks generated)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and CloudBase environment setup

- [ ] T001 Create cloudfunctions directory structure with auth, recipe-daily-curation, recipe-recommend, user-toggle-favorite subdirectories
- [ ] T002 [P] Initialize cloudfunctions/auth with package.json and @cloudbase/node-sdk dependency
- [ ] T003 [P] Initialize cloudfunctions/recipe-daily-curation with package.json and @cloudbase/node-sdk dependency
- [ ] T004 [P] Initialize cloudfunctions/recipe-recommend with package.json and @cloudbase/node-sdk dependency
- [ ] T005 [P] Initialize cloudfunctions/user-toggle-favorite with package.json and @cloudbase/node-sdk dependency
- [ ] T006 Create config/cloudbase-security-rules.json with recipes, users, ai_generation_logs, market_daily security rules
- [ ] T007 Create scripts/data-migration directory with export-mongodb.js, transform-data.js, import-cloudbase.js stubs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core CloudBase infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Set up CloudBase environment and create NoSQL collections: recipes, users, ai_generation_logs, market_daily
- [ ] T009 Deploy security rules from config/cloudbase-security-rules.json to CloudBase
- [ ] T010 Create database indexes: cuisine, isDailyRecommended+createdAt, heatScore, name(text) on recipes collection
- [ ] T011 Implement cloudfunctions/auth/index.js with getUserInfo action and OpenID extraction
- [ ] T012 Deploy auth cloud function and verify WeChat login integration
- [ ] T013 Create wechat-app/utils/cloudbase.js with SDK initialization and error handling
- [ ] T014 Create wechat-app/utils/recipe-api.js with getRecipesByCuisine, searchRecipes, getRecipeById functions
- [ ] T015 Create wechat-app/utils/user-api.js with getUserFavorites, toggleFavorite, updatePreferences functions
- [ ] T016 Create wechat-app/utils/ui-helpers.js with showLoading, hideLoading, showSkeleton, hideSkeleton functions
- [ ] T017 [P] Migrate existing MongoDB data to CloudBase using scripts/data-migration/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Seamless Recipe Browsing (Priority: P1) 🎯 MVP

**Goal**: Users can browse, search, and view recipes with a modern, aesthetically pleasing interface

**Independent Test**: Open Mini Program, navigate recipe lists, search recipes, view details - all with redesigned UI and <2s load time

### UI Components for User Story 1

- [ ] T018 [P] [US1] Create wechat-app/components/recipe-card/recipe-card component with WXML, WXSS, JS for card-based layout
- [ ] T019 [P] [US1] Create wechat-app/components/search-bar/search-bar component with input and search icon
- [ ] T020 [P] [US1] Create wechat-app/components/filter-modal/filter-modal component for cuisine filter selection
- [ ] T021 [P] [US1] Create wechat-app/components/loading-skeleton/loading-skeleton component for loading states

### Homepage Implementation (User Story 1)

- [ ] T022 [US1] Redesign wechat-app/pages/index/index.wxss with light blue (#42A5F5) theme, card layout, rounded corners, soft shadows
- [ ] T023 [US1] Update wechat-app/pages/index/index.wxml with recipe-card component usage and filter UI
- [ ] T024 [US1] Refactor wechat-app/pages/index/index.js with CloudBase SDK integration, pagination, pull-to-refresh
- [ ] T025 [US1] Add smooth scroll and image lazy loading to homepage for performance optimization

### Recipe Detail Page (User Story 1)

- [ ] T026 [US1] Redesign wechat-app/pages/recipe-detail/recipe-detail.wxss with beautiful typography and clear visual hierarchy
- [ ] T027 [US1] Update wechat-app/pages/recipe-detail/recipe-detail.wxml with ingredient list and step-by-step instructions
- [ ] T028 [US1] Refactor wechat-app/pages/recipe-detail/recipe-detail.js with CloudBase data fetching and view tracking

### Search Functionality (User Story 1)

- [ ] T029 [US1] Integrate search-bar component into homepage with real-time search results
- [ ] T030 [US1] Implement search results page with card-based layout matching homepage design

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Personalized Recipe Collection (Priority: P1)

**Goal**: Users can collect favorites and receive recommendations with seamless WeChat authentication

**Independent Test**: Favorite/unfavorite recipes, view favorites list, check recommendations - all without explicit login screens

### Authentication & User Data (User Story 2)

- [ ] T031 [US2] Update wechat-app/app.js to call auth cloud function on launch and store userInfo in globalData
- [ ] T032 [US2] Implement auto user creation on first interaction in cloudfunctions/auth/index.js

### Favorites Functionality (User Story 2)

- [ ] T033 [US2] Implement cloudfunctions/user-toggle-favorite/index.js with add/remove actions and transaction support
- [ ] T034 [US2] Deploy user-toggle-favorite cloud function and test favorite/unfavorite operations
- [ ] T035 [US2] Create wechat-app/pages/favorites/ directory with WXML, WXSS, JS for favorites list page
- [ ] T036 [US2] Add heart button animation and toast feedback to recipe-card component for favorite action

### Recommendations (User Story 2)

- [ ] T037 [US2] Implement cloudfunctions/recipe-recommend/index.js with personalized recommendation algorithm
- [ ] T038 [US2] Deploy recipe-recommend cloud function
- [ ] T039 [US2] Create wechat-app/pages/recommend/ directory with WXML, WXSS, JS for recommendations page
- [ ] T040 [US2] Add preference settings UI in profile page for cuisine preferences

### Profile Page (User Story 2)

- [ ] T041 [US2] Create wechat-app/pages/profile/ directory with user info display and preference settings
- [ ] T042 [US2] Integrate user preferences with recommendation system

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 4 - Reliable Core Functionality (Priority: P1)

**Goal**: All existing features work reliably without bugs, with proper error handling and loading states

**Independent Test**: Execute all main user flows end-to-end, verify no errors, rapid actions stable

### Bug Fixes & Testing (User Story 4)

- [ ] T043 [US4] Test and fix any existing functional bugs in recipe browsing, search, and detail view
- [ ] T044 [US4] Test and fix any existing functional bugs in favorites and recommendations
- [ ] T045 [US4] Implement error handling for network failures in all API calls with user-friendly messages
- [ ] T046 [US4] Add debouncing for rapid favorite/unfavorite actions to prevent duplicate operations
- [ ] T047 [US4] Implement offline detection and graceful degradation in wechat-app/app.js

### Performance Optimization (User Story 4)

- [ ] T048 [US4] Verify and optimize page load times to meet <2s target on 4G networks
- [ ] T049 [US4] Add skeleton screens to all pages with loading states
- [ ] T050 [US4] Implement image lazy loading and placeholder for failed image loads
- [ ] T051 [US4] Add cache strategy for market_daily and user preferences (1 hour cache)

**Checkpoint**: All core functionality reliable and performant

---

## Phase 6: User Story 3 - Smart Daily Recipe Curation (Priority: P2)

**Goal**: Daily AI-powered recipe curation with intelligent deduplication and fallback recommendations

**Independent Test**: Check Market tab daily, verify 2 recipes appear with correct indicators, no duplicates

### AI Curation Cloud Function (User Story 3)

- [ ] T052 [US3] Implement name similarity algorithm (Levenshtein distance) in cloudfunctions/recipe-daily-curation/utils.js
- [ ] T053 [US3] Create AI prompt template for recipe search in cloudfunctions/recipe-daily-curation/prompts.js
- [ ] T054 [US3] Implement cloudfunctions/recipe-daily-curation/index.js with AI integration, deduplication, and heat comparison
- [ ] T055 [US3] Implement fallback recommendation logic for days with no new AI content
- [ ] T056 [US3] Deploy recipe-daily-curation cloud function
- [ ] T057 [US3] Configure scheduled trigger (cron: 0 0 9 * * * *) for daily execution at 9:00 AM

### Market Page (User Story 3)

- [ ] T058 [US3] Create wechat-app/pages/market/ directory with WXML, WXSS, JS for Market tab
- [ ] T059 [US3] Implement "New" and "Today's Pick" indicators in market recipe cards
- [ ] T060 [US3] Add date-based caching for market recipes to reduce API calls

### Curation Logging (User Story 3)

- [ ] T061 [US3] Implement logging to ai_generation_logs collection with job status, recipes added, duplicates detected
- [ ] T062 [US3] Create simple monitoring view (optional) or console logging for curation job results

**Checkpoint**: All user stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T063 [P] Update wechat-app/app.json tabBar configuration for all pages (index, market, favorites, recommend, profile)
- [ ] T064 [P] Update wechat-app/app.wxss global styles with light blue theme variables and common component styles
- [ ] T065 [P] Add responsive design media queries for different mobile screen sizes
- [ ] T066 Create comprehensive README.md with setup instructions, deployment guide, and troubleshooting
- [ ] T067 Verify all CloudBase console links documented in quickstart.md
- [ ] T068 Final testing: Run through all user stories end-to-end
- [ ] T069 Code cleanup and remove any unused files from old Express backend
- [ ] T070 Security review: Verify no sensitive data in client-side code, security rules properly configured

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 and 4 can proceed in parallel (UI work and bug fixes)
  - User Story 2 depends on auth from Foundational, can start after US1 components ready
  - User Story 3 depends on all infrastructure, should be last
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation required, no dependencies on other stories
- **User Story 2 (P1)**: Foundation required, shares recipe-card component with US1
- **User Story 4 (P1)**: Foundation required, can run parallel with US1
- **User Story 3 (P2)**: Foundation required, all cloud functions must be ready first

### Within Each User Story

- Components can be built in parallel (marked [P])
- Pages depend on components being ready
- Cloud functions can be deployed independently
- Integration tests after all components complete

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All component creation in US1 can run in parallel
- Bug fixes in US4 can be done parallel with US1 UI work
- Cloud function development can happen parallel with frontend work

---

## Parallel Execution Examples

```bash
# Phase 1 Setup - all parallel:
Task: "Create cloudfunctions directory structure"
Task: "Initialize auth cloud function"
Task: "Initialize recipe-daily-curation cloud function"
Task: "Initialize recipe-recommend cloud function"
Task: "Initialize user-toggle-favorite cloud function"

# Phase 2 Foundational - partial parallel:
Task: "Set up CloudBase collections" (blocking)
Task: "Deploy security rules" (parallel to collections)
Task: "Create database indexes" (after collections)
Task: "Implement auth cloud function" (parallel)
Task: "Create frontend utils" (parallel after auth ready)

# Phase 3 US1 - components parallel:
Task: "Create recipe-card component"
Task: "Create search-bar component"
Task: "Create filter-modal component"
Task: "Create loading-skeleton component"

# Phase 7 Polish - all parallel:
Task: "Update app.json tabBar"
Task: "Update app.wxss global styles"
Task: "Add responsive design"
Task: "Update README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Seamless Recipe Browsing)
4. **STOP and VALIDATE**: Test recipe browsing, search, detail view
5. Deploy demo if ready

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP with browsing!)
3. Add User Story 4 → Test bug fixes → Deploy/Demo
4. Add User Story 2 → Test favorites/recommendations → Deploy/Demo
5. Add User Story 3 → Test daily curation → Deploy/Demo (Complete!)
6. Each story adds value without breaking previous stories

### Suggested Execution Order for Single Developer

Given the complexity of this migration, suggested order:

1. **Week 1**: Setup + Foundational + US1 (Homepage redesign)
2. **Week 2**: US4 (Bug fixes) + US2 (Favorites/Recommendations)
3. **Week 3**: US3 (Daily Curation) + Polish

### Risk Mitigation

- **US1 is MVP**: If timeline slips, US1 alone provides value
- **Data migration can happen early**: Run in parallel with development
- **Cloud functions tested independently**: Each function can be tested via console before frontend integration
- **Fallback for US3**: If AI integration complex, can delay US3 and manually curate initially

---

## Task Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|------------------------|
| Phase 1: Setup | 7 | 5 parallel (T002-T005, T007) |
| Phase 2: Foundational | 10 | 4 parallel (T008-T010, T013-T016) |
| Phase 3: US1 | 13 | 4 parallel (components T018-T021) |
| Phase 4: US2 | 12 | 2 parallel (T031-T032) |
| Phase 5: US4 | 9 | 3 parallel (T043-T045) |
| Phase 6: US3 | 11 | 2 parallel (T052-T053) |
| Phase 7: Polish | 8 | 4 parallel (T063-T066) |
| **Total** | **70 tasks** | **24 parallel tasks** |

**MVP Scope (US1 only)**: 30 tasks
**Full Feature**: 70 tasks

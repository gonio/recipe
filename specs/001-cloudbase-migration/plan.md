# Implementation Plan: CloudBase Migration and UI Redesign

**Branch**: `001-cloudbase-migration` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cloudbase-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Migrate the 美味食谱 (Delicious Recipes) WeChat Mini Program from a self-hosted Express/MongoDB backend to CloudBase platform. Redesign the UI with modern aesthetics following the light blue (#42A5F5) theme. Implement intelligent daily recipe curation using CloudBase scheduled triggers and AI model search (Hunyuan/DeepSeek) with deduplication logic. Fix all existing functional bugs discovered during testing.

**Primary Technical Approach**:
- Frontend: Refactor WeChat Mini Program pages with redesigned UI components
- Database: Migrate from MongoDB to CloudBase NoSQL with data integrity
- Backend: Replace Express APIs with CloudBase SDK direct access + Cloud Functions
- Automation: CloudBase scheduled triggers + AI integration for daily recipe curation

## Technical Context

**Language/Version**: JavaScript (ES6+), Node.js 18+
**Primary Dependencies**: WeChat Mini Program Framework, CloudBase SDK (`wx.cloud` / `@cloudbase/node-sdk`)
**Storage**: CloudBase NoSQL (Document Database)
**Testing**: Manual testing via WeChat Developer Tools
**Target Platform**: WeChat Mini Program (iOS/Android)
**Project Type**: mobile-app
**Performance Goals**: Page load < 2s on 4G, visual feedback < 300ms
**Constraints**: Must work offline gracefully, limited to CloudBase free tier quotas initially
**Scale/Scope**: Single user base, ~100-1000 recipes initially, daily 2 new recipe additions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Refer to `.specify/memory/constitution.md` for project principles.

**UX First**: Does this feature respect WeChat Mini Program UX guidelines?
- [x] Page load time under 2 seconds considered? (FR-010, SC-002)
- [x] User feedback mechanisms defined? (FR-011)
- [x] Error states have recovery paths? (Edge cases documented)

**Cloud-Native Architecture**: Is CloudBase properly utilized?
- [x] CloudBase SDK direct access considered for simple operations? (FR-004)
- [x] RESTful patterns followed for custom APIs? (N/A - fully SDK-based)
- [x] Consistent JSON response format documented? (Will document in contracts/)

**Platform-Native Authentication**: Is WeChat login properly handled?
- [x] No explicit login required (natural login-free)? (FR-005, SC-008)
- [x] OpenID obtained via wxContext in cloud functions? (User Story 2)

**Data Integrity**: Is data handling robust?
- [x] Schema validation defined for all writes? (Key Entities section)
- [x] Required fields identified? (Recipe: name, cuisine, ingredients, steps, cookTime, difficulty)
- [ ] CloudBase security rules configured for data access? (Phase 1 deliverable)
- [x] No sensitive data in version control? (.gitignore configured)

**Separation of Concerns**: Are architectural boundaries clear?
- [x] Frontend uses CloudBase SDK or API? (FR-004)
- [x] Business logic resides in appropriate layer? (SDK for CRUD, Cloud Functions for AI/scheduled tasks)
- [x] Each component independently testable? (User stories independently testable)

**CloudBase Best Practices**: Are platform guidelines followed?
- [x] `cloudbase-guidelines` skill referenced? (Constitution VI)
- [x] MCP tools available? (Dependencies listed)
- [ ] Console management links documented? (Post-deployment deliverable)

**Content Automation**: Does this feature involve automated content?
- [x] AI integration points documented? (FR-009, User Story 3)
- [x] Duplicate detection considered? (FR-013: 80% name similarity, heat score comparison)

**Gate Status**: ✅ PASS - All critical checks satisfied. Minor items (security rules, console links) are Phase 1 deliverables.

## Project Structure

### Documentation (this feature)

```text
specs/001-cloudbase-migration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (CloudBase best practices, AI integration patterns)
├── data-model.md        # Phase 1 output (NoSQL schema, relationships, validation rules)
├── quickstart.md        # Phase 1 output (Development setup, deployment guide)
├── contracts/           # Phase 1 output (Cloud Function interfaces, SDK usage patterns)
│   ├── cloud-functions.md
│   └── frontend-sdk.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

**Structure Decision**: WeChat Mini Program + CloudBase Cloud Functions architecture

```text
wechat-app/                    # WeChat Mini Program (existing - refactored)
├── pages/
│   ├── index/                 # Homepage - redesigned recipe list
│   ├── market/                # Market tab - daily curated recipes
│   ├── favorites/             # My Recipes tab
│   ├── recommend/             # Today's Recommendation tab
│   ├── profile/               # User profile & settings
│   └── recipe-detail/         # Recipe detail page - redesigned
├── components/
│   ├── recipe-card/           # Reusable recipe card component
│   ├── search-bar/            # Search component
│   ├── filter-modal/          # Cuisine filter modal
│   └── loading-skeleton/      # Loading states
├── utils/
│   ├── cloudbase.js           # CloudBase SDK initialization & helpers
│   ├── recipe-api.js          # Recipe data access (SDK calls)
│   ├── user-api.js            # User data access (SDK calls)
│   └── ui-helpers.js          # UI utilities (animations, formatters)
├── images/                    # Static assets
├── app.js                     # App entry - CloudBase init
├── app.json                   # App configuration
└── app.wxss                   # Global styles - light blue theme

cloudfunctions/                # CloudBase Cloud Functions (new)
├── auth/                      # User authentication (OpenID)
│   └── index.js
├── recipe-daily-curation/     # Daily AI recipe curation (scheduled)
│   └── index.js
├── recipe-recommend/          # Personalized recommendations
│   └── index.js
└── shared/                    # Shared utilities (if needed)
    └── utils.js

scripts/                       # Utility scripts
├── data-migration/            # MongoDB to CloudBase migration
│   ├── export-mongodb.js
│   ├── transform-data.js
│   └── import-cloudbase.js
└── test-data/                 # Test data generation
    └── seed-recipes.js

config/                        # Configuration
├── cloudbase-security-rules.json   # Database security rules
└── scheduled-triggers.json    # CloudBase trigger config
```

## Complexity Tracking

| Decision | Rationale | Simpler Alternative Rejected |
|-----------|-----------|------------------------------|
| Cloud Functions for AI curation instead of SDK direct | Scheduled triggers only work in Cloud Functions; AI API calls need server-side execution | SDK direct access from frontend rejected - cannot schedule and would expose API keys |
| Separate recipe-card component | Reusable across homepage, market, favorites, search results | Inline cards rejected - duplication and maintenance overhead |
| Name similarity (80%) + heat score for deduplication | Balances precision (avoid false duplicates) with flexibility (catch variations) | Exact match rejected - would miss recipe variations with different authors/sources |

---

## Phase 0: Research

**Status**: Research topics identified below. Research findings will be documented in `research.md`.

### Research Topics

1. **CloudBase Scheduled Triggers**: Configuration, limitations, error handling, retry mechanisms
2. **CloudBase AI SDK**: Model availability (Hunyuan vs DeepSeek), web search capabilities, response parsing
3. **WeChat Mini Program Performance**: Best practices for <2s page load, image lazy loading, skeleton screens
4. **Name Similarity Algorithm**: Efficient string similarity for Chinese recipe names (Levenshtein, Jaro-Winkler, or embedding-based)
5. **Data Migration Strategy**: MongoDB to CloudBase NoSQL schema mapping, batch import, validation

**Decision Required**:
- [ ] Which AI model for recipe search? (Hunyuan vs DeepSeek vs hybrid)
- [ ] Name similarity algorithm implementation choice
- [ ] Image storage strategy (CloudBase Storage vs external URLs)

---

## Phase 1: Design (Pending Phase 0 Completion)

**Prerequisites**: All [NEEDS CLARIFICATION] items in research.md must be resolved

**Planned Outputs**:
1. `data-model.md` - NoSQL schema with validation rules, indexes, relationships
2. `contracts/cloud-functions.md` - Cloud Function interfaces (auth, curation, recommend)
3. `contracts/frontend-sdk.md` - SDK usage patterns for frontend
4. `quickstart.md` - Developer setup, deployment steps, testing guide
5. Agent context update via `update-agent-context.sh`

**Re-evaluation**: Constitution Check will be re-run after Phase 1 to verify design compliance.

---

*Plan generation complete. Run `/speckit.research` to begin Phase 0 research, or proceed directly to `/speckit.tasks` if all technical decisions are already clear.*

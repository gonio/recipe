<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.0.0 → 1.1.0 (Minor - New principle added, existing principles expanded)
Modified Principles:
  - II. API-First Design → Renamed to II. Cloud-Native Architecture (expanded scope)
  - IV. Separation of Concerns → Updated with CloudBase-specific data access rules
Added Principles:
  - III. Platform-Native Authentication (NEW - WeChat Mini Program specific)
  - VI. CloudBase Best Practices (NEW - MCP tools, SDK direct access)
Reordered Principles: Yes (Authentication moved to III, Data Integrity to IV)
Added Sections:
  - CloudBase Platform Requirements
Updated Sections:
  - Technology Stack → Added CloudBase services
  - Development Workflow → Added MCP tool usage
Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section updated with CloudBase checks
  ✅ .specify/templates/spec-template.md - Added CloudBase requirements section
  ✅ .specify/templates/tasks-template.md - Added CloudBase SDK task categories
Follow-up TODOs:
  - Verify CloudBase environment setup when implementing new features
  - Ensure MCP configuration is in place for all developers
================================================================================
-->

# 美味食谱 (Delicious Recipes) Constitution

## Core Principles

### I. User Experience First

The WeChat Mini Program frontend MUST deliver a seamless, intuitive experience that respects platform conventions.

- Pages MUST load within 2 seconds on standard mobile networks
- All interactive elements MUST provide immediate visual feedback
- The UI MUST follow WeChat's Mini Program design guidelines
- Navigation MUST be intuitive with clear information hierarchy
- Error states MUST be user-friendly with actionable recovery paths

**Rationale**: This is a consumer-facing recipe app where user engagement depends on a delightful, frictionless experience. Poor UX directly impacts retention.

### II. Cloud-Native Architecture

All CloudBase services MUST be utilized following platform-specific best practices for WeChat Mini Programs.

- Backend functionality MUST be exposed through well-designed RESTful APIs OR direct SDK calls
- APIs MUST follow REST conventions with consistent URL patterns (/api/[resource]/[action])
- All endpoints MUST return consistent JSON response formats
- Authentication MUST use WeChat OpenID (naturally login-free for Mini Programs)
- All endpoints MUST include proper HTTP status codes
- MUST prioritize CloudBase SDK direct database access over cloud functions when possible

**Rationale**: Leveraging CloudBase's native capabilities reduces complexity, improves performance, and follows WeChat ecosystem conventions.

### III. Platform-Native Authentication

Authentication MUST follow WeChat Mini Program's natural login-free paradigm.

- Users MUST NOT be required to explicitly log in or register
- User identity MUST be obtained via `wxContext.OPENID` in cloud functions
- Backend MUST use WeChat OpenID as the primary user identifier
- User profiles MUST be created automatically on first interaction
- Session management MUST be handled by WeChat's built-in mechanisms

**Rationale**: WeChat Mini Programs provide seamless authentication through the WeChat runtime. Forcing explicit login creates friction and degrades user experience.

### IV. Data Integrity

Recipe and user data MUST be accurate, complete, and consistently structured.

- All database writes MUST pass validation against defined schemas
- Recipe data MUST include: name, cuisine, ingredients, steps, cookTime, difficulty
- User favorites and preferences MUST be persisted reliably
- Data migrations MUST be documented and reversible
- API keys and sensitive data MUST never be committed to version control
- CloudBase security rules MUST be configured for proper data access control

**Rationale**: Recipe content is the core value proposition. Corrupt or incomplete data undermines user trust and app functionality.

### V. Separation of Concerns

The three-tier architecture (Frontend / Backend / Crawler) MUST maintain clear boundaries.

- WeChat Mini Program MUST communicate via CloudBase SDK OR API calls, never directly to database
- Business logic MUST reside in the most appropriate layer:
  - Simple CRUD: Use CloudBase SDK direct access from frontend
  - Complex logic: Use cloud functions or backend APIs
- Kimi Claw crawler MUST be an isolated component with single responsibility (content acquisition)
- Shared code (models, utilities) MUST be in clearly defined shared locations
- Each tier MUST be independently testable

**Rationale**: Clear boundaries enable independent development, testing, and deployment while leveraging CloudBase's flexible data access patterns.

### VI. CloudBase Best Practices

MUST follow CloudBase platform guidelines for optimal development experience.

- MUST read `cloudbase-guidelines` skill FIRST when working with CloudBase features
- MUST use CloudBase MCP tools for environment management, deployment, and database operations
- Database operations SHOULD prefer SDK direct access: simple queries from frontend, complex queries via cloud functions
- Cloud functions MUST be used for operations requiring server-side logic or sensitive operations
- Static hosting MUST be used for web deployments with CDN cache awareness
- Console management links MUST be provided after resource creation

**Rationale**: CloudBase provides purpose-built tools and SDKs that simplify development. Following platform best practices ensures reliability and maintainability.

### VII. Content Automation

The Kimi Claw crawler system MUST reliably acquire and ingest recipe content.

- Crawler MUST validate scraped data before API submission
- Duplicate recipes MUST be detected and prevented
- Failed crawls MUST be logged with retry mechanisms
- API endpoints for content creation MUST be secured with API keys
- Content classification (cuisine, difficulty) SHOULD be automated where possible

**Rationale**: Automated content acquisition is a key differentiator. Manual content entry does not scale for a recipe discovery platform.

## Technology Stack

**Frontend**: WeChat Mini Program (WXML, WXSS, JavaScript)
- Target: WeChat Developer Tools, ES6+
- UI Framework: Native WeChat components with custom styling
- Design System: Light blue theme (#42A5F5), card-based layout
- CloudBase SDK: wx.cloud for database, storage, and cloud functions

**Backend**: Node.js + CloudBase
- Runtime: Node.js LTS
- Framework: Express 5.x (for custom APIs)
- Database: CloudBase NoSQL (primary) or MySQL (if needed)
- Authentication: WeChat OpenID via wxContext
- Cloud Functions: For server-side logic and sensitive operations
- Deployment: CloudBase static hosting + cloud functions

**CloudBase Services**:
- NoSQL Database: Primary data storage for recipes and users
- Cloud Functions: Server-side logic, crawler endpoints
- Cloud Storage: Recipe images and static assets
- Static Hosting: Web deployments (if applicable)
- AI+ (optional): Text generation and image capabilities

**Automation**: Kimi Claw Scripts
- Runtime: Node.js
- Purpose: Web crawling and content ingestion
- Scheduling: Daily cron-like execution
- Integration: API calls to backend endpoints

## CloudBase Platform Requirements

**MCP Configuration**:
- CloudBase MCP MUST be installed for enhanced development experience
- Configuration file: `.mcp.json` (project-level)
- Essential tools: environment management, function deployment, database operations

**Development Workflow with MCP**:
1. Use MCP tools for CloudBase environment queries
2. Use MCP tools for database structure management
3. Use MCP tools for cloud function deployment
4. Use MCP tools for static hosting file management

**Alternative (CLI)**:
- When MCP unavailable, use `mcporter` CLI with `--output json`
- Requires: Secret ID, Secret Key, Env ID configured

## Development Workflow

**Spec-Driven Development**: All features MUST begin with a specification in `.specify/specs/`

1. **Specification Phase**: Define user stories, requirements, and success criteria
2. **Planning Phase**: Create implementation plan with technical decisions
3. **Task Generation**: Break down into executable tasks with dependencies
4. **Implementation**: Execute tasks in dependency order
5. **Validation**: Verify against specification success criteria

**CloudBase-First Development Order**:
1. **Platform Understanding**: Read `cloudbase-guidelines` skill
2. **Frontend First**: Develop Mini Program pages with CloudBase SDK integration
3. **Backend as Needed**: Add cloud functions only when SDK direct access insufficient
4. **Database Design**: Define NoSQL collections and security rules
5. **Deployment**: Use MCP tools for cloud function and hosting deployment

**Code Quality Gates**:
- All API changes MUST be documented in contracts/
- CloudBase security rules MUST be reviewed for data access patterns
- Backend routes MUST have corresponding controller logic separation
- Frontend pages MUST follow WeChat Mini Program page lifecycle conventions
- Environment-specific configuration MUST use .env files (never hardcoded)
- CloudBase console links MUST be provided in documentation for managed resources

## Governance

This constitution defines the non-negotiable principles for the 美味食谱 project. All design decisions, code reviews, and architectural discussions MUST reference and respect these principles.

**Amendment Process**:
1. Propose amendment with rationale and impact analysis
2. Review against existing principles for conflicts
3. Update dependent templates if principles change
4. Increment version according to semantic versioning:
   - MAJOR: Breaking principle changes or removals
   - MINOR: New principles or significant expansions
   - PATCH: Clarifications, wording improvements

**Compliance Review**:
- All PRs SHOULD verify compliance with constitution principles
- Template files MUST be updated when principles change
- Architecture decisions MUST document which principles they uphold
- CloudBase-specific implementations MUST reference `cloudbase-guidelines`

**Version**: 1.1.0 | **Ratified**: 2026-03-06 | **Last Amended**: 2026-03-06

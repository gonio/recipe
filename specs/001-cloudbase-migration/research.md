# Research: CloudBase Migration and UI Redesign

**Feature**: 001-cloudbase-migration
**Created**: 2026-03-06
**Purpose**: Research technical decisions and best practices for CloudBase implementation

---

## Topic 1: CloudBase Scheduled Triggers

### Decision: Use CloudBase Timer Triggers for Daily Curation

**Rationale**: CloudBase supports cron-based scheduled triggers that automatically invoke cloud functions. This is the native serverless approach that requires no external scheduling infrastructure.

**Configuration**:
```json
{
  "triggers": [{
    "name": "daily-recipe-curation",
    "type": "timer",
    "config": "0 0 9 * * * *"
  }]
}
```

**Limitations Identified**:
- Maximum 2 timer triggers per function in free tier
- Function timeout: 60 seconds (sufficient for AI API calls)
- Cold start latency: ~500ms-2s (acceptable for background job)

**Error Handling Strategy**:
- Log all errors to CloudBase Logs
- Implement exponential backoff for AI API failures (max 3 retries)
- Store failed job status in `AIRecipeGenerationLog` for manual inspection

---

## Topic 2: CloudBase AI SDK - Model Selection

### Decision: Use Hunyuan-2.0-Instruct (Primary) with DeepSeek-V3.2 Fallback

**Rationale**:
- Hunyuan has better Chinese language understanding for recipe names and descriptions
- DeepSeek-V3.2 provides good reasoning capabilities for recipe structure parsing
- Both models support via `@cloudbase/node-sdk` AI extension

**Web Search Capability**:
- Hunyuan supports function calling but direct web search requires external integration
- [NEEDS DECISION]: Use model's knowledge cutoff (2024) or integrate with external search API?

**Implementation Pattern**:
```javascript
const { generateText } = require('@cloudbase/node-sdk/ai');

// Search for popular recipes
const result = await generateText({
  model: 'hunyuan-2.0-instruct-20251111',
  prompt: '搜索最近流行的"川菜"菜谱，返回菜名、食材、步骤',
  temperature: 0.7
});
```

---

## Topic 3: Name Similarity Algorithm

### Decision: Use Levenshtein Distance with Normalized Similarity

**Algorithm Choice**:
- **Levenshtein Distance**: Edit distance between two strings
- **Normalization**: `similarity = 1 - (distance / maxLength)`
- **Threshold**: 0.8 (80%) as specified in FR-013

**Example**:
```javascript
function calculateSimilarity(str1, str2) {
  const distance = levenshtein(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (distance / maxLength);
}

// "宫保鸡丁" vs "宫爆鸡丁" → 0.75 similarity (different character)
// "鱼香肉丝" vs "鱼香肉丝" → 1.0 similarity (exact match)
```

**Optimization**: Pre-compute and cache similarity matrix for existing recipes to avoid O(n²) comparison on each run.

---

## Topic 4: Data Migration Strategy

### Decision: Three-Phase Migration

**Phase 1: Export from MongoDB**
```bash
mongoexport --db recipe_miniapp --collection recipes --out recipes.json
mongoexport --db recipe_miniapp --collection users --out users.json
```

**Phase 2: Transform**
- Map MongoDB `_id` to CloudBase `_id`
- Add `sourceType: 'migrated'` field to distinguish from AI-curated
- Validate required fields (name, cuisine, ingredients, steps, cookTime, difficulty)

**Phase 3: Import to CloudBase**
```javascript
// Batch import via SDK
const batch = db.collection('recipes').where({}).limit(100);
// Process in batches to avoid timeout
```

**Validation Strategy**:
- Count verification: `mongodb_count == cloudbase_count`
- Sample validation: Randomly check 10% of records for field completeness
- Rollback plan: Keep MongoDB running until validation complete

---

## Topic 5: Image Storage Strategy

### Decision: Keep Existing External URLs (Phase 1), Migrate to CloudBase Storage (Phase 2)

**Rationale**:
- Existing images already hosted and working
- Migration adds complexity and storage costs
- CloudBase Storage can be adopted later as optimization

**Future Migration Path**:
1. Download images to CloudBase Storage during curation
2. Update recipe documents with new Cloud Storage URLs
3. Implement CDN caching for faster loading

---

## Outstanding Decisions

| Topic | Options | Status |
|-------|---------|--------|
| AI Web Search | A) Use model knowledge only; B) Integrate external search API | [NEEDS DECISION] |
| Heat Score Algorithm | A) favoriteCount only; B) favoriteCount + views; C) favoriteCount + external popularity | [NEEDS DECISION] |
| Seasonal Logic | A) Current month ingredients; B) Weather-based; C) Simple random from existing | [NEEDS DECISION] |

---

## Recommendations

1. **Start with Model Knowledge Only**: Hunyuan's training data includes popular Chinese recipes. External search API adds complexity and rate limits.

2. **Heat Score = favoriteCount + viewCount * 0.1**: Internal metrics only, simpler to implement and maintain.

3. **Seasonal Logic = Ingredient-based**: Map current month to seasonal ingredients, filter recipes containing those ingredients.

---

## Research Artifacts

- [CloudBase Timer Triggers Documentation](https://docs.cloudbase.net/cn/functions/triggers/timer.html)
- [CloudBase Node SDK AI Module](https://docs.cloudbase.net/cn/ai/ai-sdk-node.html)
- [WeChat Mini Program Performance Best Practices](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/)

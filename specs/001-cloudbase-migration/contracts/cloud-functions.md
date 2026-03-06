# Cloud Functions Contract

**Feature**: 001-cloudbase-migration
**Created**: 2026-03-06
**Purpose**: Cloud Function interfaces, inputs/outputs, and error handling

---

## Function: `auth`

**Purpose**: Get WeChat OpenID and create/update user record
**Trigger**: HTTP Request
**Access**: WeChat Mini Program only

### Input

```javascript
{
  "action": "getUserInfo",  // REQUIRED
  "userInfo": {             // OPTIONAL: WeChat user info
    "nickName": String,
    "avatarUrl": String
  }
}
```

### Output

```javascript
{
  "code": 0,                // 0 = success, non-zero = error
  "message": "success",
  "data": {
    "openid": String,       // WeChat OpenID
    "user": {               // User document from users collection
      "_id": String,
      "nickname": String,
      "avatarUrl": String,
      "preferredCuisines": Array,
      "favorites": Array,
      "createdAt": Date
    },
    "isNewUser": Boolean    // true if newly created
  }
}
```

### Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| 1001 | Invalid request | Check request format |
| 1002 | WeChat auth failed | Retry login |
| 1003 | Database error | Contact support |

---

## Function: `recipe-daily-curation`

**Purpose**: Daily AI-powered recipe curation job
**Trigger**: Timer (Cron: `0 0 9 * * * *` - daily at 9:00 AM)
**Access**: Internal only (scheduled trigger)

### Process Flow

1. Query existing recipes (for deduplication)
2. Call AI model to search for popular recipes
3. Parse AI response into structured recipe data
4. Check for duplicates (80% name similarity)
5. Compare heat scores if duplicate found
6. Insert new recipes or update higher-heat versions
7. Select 2 recipes for Market (new or fallback)
8. Create/Update `market_daily` document for today
9. Log results to `ai_generation_logs`

### AI Prompt Template

```
搜索当前流行的{cuisine}菜谱，返回以下格式的JSON数组（最多5个）：
[
  {
    "name": "菜名",
    "cuisine": "菜系",
    "ingredients": ["食材1 用量", "食材2 用量"],
    "steps": ["步骤1", "步骤2"],
    "cookTime": 烹饪时间分钟数,
    "difficulty": 难度1-5,
    "tags": ["标签1", "标签2"],
    "popularity": 流行度分数1-100
  }
]

菜系选择：川菜、粤菜、湘菜、鲁菜、苏菜、浙菜、闽菜、徽菜
要求：
- 选择广受欢迎的家常菜或餐厅热门菜
- 步骤清晰，食材常见
- 不同菜系的菜不要重复
```

### Output (Logged, not returned)

```javascript
{
  "jobId": String,
  "status": "completed",
  "recipesSearched": 5,
  "recipesAdded": 2,
  "recipesDuplicated": 1,
  "recipesFallback": 0,
  "modelUsed": "hunyuan",
  "executionTimeMs": 3500
}
```

### Error Handling

- **AI API Failure**: Retry 3 times with exponential backoff, then mark failed and use fallback
- **Parse Error**: Log malformed response, skip to next recipe
- **Database Error**: Mark job as failed, retry on next scheduled run

---

## Function: `recipe-recommend`

**Purpose**: Generate personalized recipe recommendations
**Trigger**: HTTP Request
**Access**: Authenticated users

### Input

```javascript
{
  "openid": String,         // REQUIRED: User OpenID
  "limit": Number           // OPTIONAL: Max results (default: 10, max: 50)
}
```

### Algorithm

1. Get user preferences (`preferredCuisines`)
2. Get user's recently viewed recipes (last 30 days)
3. Query recipes:
   - Filter by preferred cuisines (if any)
   - Exclude recently viewed
   - Sort by heatScore descending
   - Limit to requested count
4. If insufficient results, include random high-heat recipes

### Output

```javascript
{
  "code": 0,
  "message": "success",
  "data": {
    "recommendations": [
      {
        "recipeId": String,
        "name": String,
        "cuisine": String,
        "imageUrl": String,
        "cookTime": Number,
        "difficulty": Number,
        "heatScore": Number,
        "reason": "根据您喜欢的{cuisine}推荐" | "热门菜谱"
      }
    ],
    "total": Number
  }
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| 2001 | User not found |
| 2002 | Invalid limit parameter |

---

## Function: `user-toggle-favorite`

**Purpose**: Add or remove recipe from user favorites
**Trigger**: HTTP Request
**Access**: Authenticated users (own data only)

### Input

```javascript
{
  "openid": String,         // REQUIRED
  "recipeId": String,       // REQUIRED
  "action": "add" | "remove" // REQUIRED
}
```

### Process

- **Add**: Push `recipeId` to `user.favorites`, increment `recipe.favoriteCount`
- **Remove**: Pull `recipeId` from `user.favorites`, decrement `recipe.favoriteCount`
- **Transaction**: Use CloudBase transaction to ensure atomicity

### Output

```javascript
{
  "code": 0,
  "message": "success",
  "data": {
    "isFavorited": Boolean,  // Current state after operation
    "favoriteCount": Number  // Updated recipe favorite count
  }
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| 3001 | Invalid action |
| 3002 | Recipe not found |
| 3003 | Already favorited/unfavorited |

---

## Common Error Format

All functions return errors in this format:

```javascript
{
  "code": Number,           // Non-zero error code
  "message": String,        // Human-readable error message
  "detail": String          // Optional technical details (dev mode only)
}
```

---

## Security

1. **Authentication**: All HTTP-triggered functions validate WeChat OpenID
2. **Authorization**: Users can only modify their own data
3. **Rate Limiting**: CloudBase handles rate limiting automatically
4. **Input Validation**: All inputs validated against schemas

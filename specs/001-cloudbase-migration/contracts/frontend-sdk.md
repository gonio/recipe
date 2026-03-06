# Frontend SDK Contract

**Feature**: 001-cloudbase-migration
**Created**: 2026-03-06
**Purpose**: CloudBase SDK usage patterns for WeChat Mini Program frontend

---

## Initialization

```javascript
// app.js
App({
  onLaunch() {
    // Initialize CloudBase
    wx.cloud.init({
      env: 'your-env-id',      // CloudBase environment ID
      traceUser: true          // Track user analytics
    })

    // Check auth status
    this.checkAuth()
  },

  globalData: {
    db: null,
    userInfo: null,
    openid: null
  },

  checkAuth() {
    const db = wx.cloud.database()
    this.globalData.db = db

    // Call auth cloud function to get/verify OpenID
    wx.cloud.callFunction({
      name: 'auth',
      data: { action: 'getUserInfo' }
    }).then(res => {
      this.globalData.userInfo = res.result.data.user
      this.globalData.openid = res.result.data.openid
    })
  }
})
```

---

## Database Operations

### Recipe API

```javascript
// utils/recipe-api.js

const db = wx.cloud.database()
const _ = db.command

/**
 * Get recipes by cuisine with pagination
 * @param {string} cuisine - Cuisine type or 'all'
 * @param {number} page - Page number (0-indexed)
 * @param {number} pageSize - Items per page
 */
function getRecipesByCuisine(cuisine, page = 0, pageSize = 20) {
  let query = db.collection('recipes')

  if (cuisine && cuisine !== 'all') {
    query = query.where({ cuisine })
  }

  return query
    .orderBy('heatScore', 'desc')
    .skip(page * pageSize)
    .limit(pageSize)
    .get()
}

/**
 * Search recipes by name
 * @param {string} keyword - Search keyword
 * @param {number} limit - Max results
 */
function searchRecipes(keyword, limit = 20) {
  return db.collection('recipes')
    .where({
      name: db.RegExp({
        regexp: `.*${keyword}.*`,
        options: 'i'
      })
    })
    .limit(limit)
    .get()
}

/**
 * Get single recipe by ID
 * @param {string} recipeId
 */
function getRecipeById(recipeId) {
  return db.collection('recipes').doc(recipeId).get()
}

/**
 * Get today's market recipes
 */
function getMarketRecipes() {
  const today = new Date().toISOString().split('T')[0]

  return db.collection('market_daily')
    .where({ date: today })
    .get()
    .then(res => {
      if (!res.data.length) return []

      const recipeIds = res.data[0].recipes.map(r => r.recipeId)

      // Fetch full recipe details
      return db.collection('recipes')
        .where({ _id: _.in(recipeIds) })
        .get()
        .then(recipesRes => {
          // Sort by market order
          return res.data[0].recipes.map(marketItem => {
            const recipe = recipesRes.data.find(r => r._id === marketItem.recipeId)
            return {
              ...recipe,
              marketType: marketItem.type,
              marketReason: marketItem.reason
            }
          })
        })
    })
}

/**
 * Get personalized recommendations
 * @param {number} limit
 */
function getRecommendations(limit = 10) {
  // Call cloud function for complex recommendation logic
  return wx.cloud.callFunction({
    name: 'recipe-recommend',
    data: { limit }
  }).then(res => res.result.data.recommendations)
}

module.exports = {
  getRecipesByCuisine,
  searchRecipes,
  getRecipeById,
  getMarketRecipes,
  getRecommendations
}
```

---

### User API

```javascript
// utils/user-api.js

const db = wx.cloud.database()
const _ = db.command

/**
 * Get current user's favorites
 */
function getUserFavorites() {
  return db.collection('users')
    .where({ _openid: '{openid}' })  // CloudBase auto-fills openid
    .get()
    .then(res => {
      if (!res.data.length) return []
      const favoriteIds = res.data[0].favorites || []

      if (!favoriteIds.length) return []

      return db.collection('recipes')
        .where({ _id: _.in(favoriteIds) })
        .get()
        .then(recipesRes => recipesRes.data)
    })
}

/**
 * Toggle favorite status
 * @param {string} recipeId
 * @param {boolean} isFavoriting - true to add, false to remove
 */
function toggleFavorite(recipeId, isFavoriting) {
  return wx.cloud.callFunction({
    name: 'user-toggle-favorite',
    data: {
      recipeId,
      action: isFavoriting ? 'add' : 'remove'
    }
  })
}

/**
 * Update user preferences
 * @param {Array} preferredCuisines
 */
function updatePreferences(preferredCuisines) {
  return db.collection('users')
    .where({ _openid: '{openid}' })
    .update({
      data: {
        preferredCuisines,
        updatedAt: db.serverDate()
      }
    })
}

/**
 * Track recipe view
 * @param {string} recipeId
 */
function trackRecipeView(recipeId) {
  return db.collection('users')
    .where({ _openid: '{openid}' })
    .update({
      data: {
        viewedRecipes: _.push([{
          recipeId,
          viewedAt: db.serverDate()
        }]),
        updatedAt: db.serverDate()
      }
    })
}

module.exports = {
  getUserFavorites,
  toggleFavorite,
  updatePreferences,
  trackRecipeView
}
```

---

## Error Handling Pattern

```javascript
// utils/error-handler.js

const ErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNKNOWN: 'UNKNOWN'
}

function handleCloudError(error) {
  console.error('CloudBase Error:', error)

  // Determine error type
  let errorType = ErrorCode.UNKNOWN
  let userMessage = '操作失败，请重试'

  if (error.message && error.message.includes('network')) {
    errorType = ErrorCode.NETWORK_ERROR
    userMessage = '网络连接失败，请检查网络后重试'
  } else if (error.errCode === -502001) {
    errorType = ErrorCode.DATABASE_ERROR
    userMessage = '数据查询失败'
  } else if (error.errCode === -401) {
    errorType = ErrorCode.PERMISSION_DENIED
    userMessage = '权限不足'
  }

  // Show toast
  wx.showToast({
    title: userMessage,
    icon: 'none',
    duration: 2000
  })

  return { errorType, userMessage }
}

// Usage in pages
function loadRecipes() {
  recipeApi.getRecipesByCuisine('川菜')
    .then(res => {
      this.setData({ recipes: res.data })
    })
    .catch(handleCloudError)
}
```

---

## Loading States Pattern

```javascript
// utils/ui-helpers.js

function showLoading(title = '加载中...') {
  wx.showLoading({ title, mask: true })
}

function hideLoading() {
  wx.hideLoading()
}

function showSkeleton(page) {
  page.setData({ showSkeleton: true })
}

function hideSkeleton(page) {
  page.setData({ showSkeleton: false })
}

// Usage in page
Page({
  data: {
    recipes: [],
    showSkeleton: true,
    loading: false
  },

  onLoad() {
    this.loadRecipes()
  },

  async loadRecipes() {
    showSkeleton(this)

    try {
      const res = await recipeApi.getRecipesByCuisine('all')
      this.setData({
        recipes: res.data,
        showSkeleton: false
      })
    } catch (error) {
      hideSkeleton(this)
      handleCloudError(error)
    }
  }
})
```

---

## Best Practices

### 1. Query Optimization

```javascript
// GOOD: Use indexed fields in where clause
.where({ cuisine: '川菜', isDailyRecommended: true })

// BAD: Query unindexed fields then filter in JS
.where({}).get().then(res => res.data.filter(r => r.someField === 'value'))
```

### 2. Pagination

```javascript
// Always paginate large lists
const PAGE_SIZE = 20

function loadMore() {
  const { page, recipes } = this.data

  recipeApi.getRecipesByCuisine('all', page + 1, PAGE_SIZE)
    .then(res => {
      this.setData({
        recipes: [...recipes, ...res.data],
        page: page + 1,
        hasMore: res.data.length === PAGE_SIZE
      })
    })
}
```

### 3. Caching

```javascript
// Cache market recipes for 1 hour
const CACHE_KEY = 'market_recipes'
const CACHE_DURATION = 3600000 // 1 hour

async function getMarketRecipesWithCache() {
  const cached = wx.getStorageSync(CACHE_KEY)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const recipes = await recipeApi.getMarketRecipes()

  wx.setStorageSync(CACHE_KEY, {
    data: recipes,
    timestamp: Date.now()
  })

  return recipes
}
```

### 4. Offline Handling

```javascript
wx.getNetworkType({
  success: (res) => {
    if (res.networkType === 'none') {
      wx.showToast({
        title: '当前无网络，部分功能不可用',
        icon: 'none',
        duration: 3000
      })
    }
  }
})
```

---

## Security Considerations

1. **Never hardcode sensitive data**: Environment ID should be in config files
2. **Validate all inputs**: Check types and ranges before database operations
3. **Use Cloud Functions for sensitive ops**: Favorites, user updates go through functions
4. **Leverage security rules**: Rely on CloudBase rules for data access control

/**
 * 前端测试服务器
 * 用于本地测试微信小程序前端，模拟后端 API 响应
 * 
 * 使用方法:
 * 1. node test-server.js
 * 2. 修改 wechat-app/app.js 中的 apiBaseUrl 为 http://localhost:3999/api
 * 3. 在微信开发者工具中预览
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3999;

// ========== 模拟数据 ==========

// 模拟用户
const mockUser = {
  id: 'user_001',
  openid: 'mock_openid_123',
  nickname: '测试用户',
  avatarUrl: '',
  preferredCuisines: ['川菜', '湘菜', '家常菜'],
  favoritesCount: 5,
  newRecipesCount: 3
};

// 模拟菜谱数据
const mockRecipes = [
  {
    _id: 'recipe_001',
    name: '麻婆豆腐',
    cuisine: '川菜',
    imageUrl: '',
    ingredients: [
      { name: '嫩豆腐', amount: '400g' },
      { name: '猪肉末', amount: '100g' },
      { name: '豆瓣酱', amount: '30g' },
      { name: '花椒粉', amount: '5g' }
    ],
    steps: [
      { order: 1, description: '豆腐切小块，用盐水焯烫后沥干', imageUrl: '' },
      { order: 2, description: '热锅凉油，下入肉末炒至变色', imageUrl: '' },
      { order: 3, description: '加入豆瓣酱、蒜末、姜末炒出红油', imageUrl: '' },
      { order: 4, description: '加入适量清水烧开', imageUrl: '' },
      { order: 5, description: '放入豆腐，小火炖煮5分钟', imageUrl: '' },
      { order: 6, description: '勾芡收汁，撒上花椒粉和葱花即可', imageUrl: '' }
    ],
    cookTime: 20,
    difficulty: 2,
    tags: ['辣', '下饭', '经典'],
    favoriteCount: 128,
    isFavorite: true,
    source: 'Kimi Claw'
  },
  {
    _id: 'recipe_002',
    name: '剁椒鱼头',
    cuisine: '湘菜',
    imageUrl: '',
    ingredients: [
      { name: '鱼头', amount: '1个' },
      { name: '剁椒', amount: '200g' },
      { name: '姜', amount: '20g' },
      { name: '葱', amount: '30g' }
    ],
    steps: [
      { order: 1, description: '鱼头洗净，从中间劈开，用料酒和盐腌制15分钟' },
      { order: 2, description: '姜切丝，葱切段，铺在盘底' },
      { order: 3, description: '将腌制好的鱼头放在葱姜上' },
      { order: 4, description: '均匀铺上剁椒' },
      { order: 5, description: '大火蒸15-20分钟' },
      { order: 6, description: '出锅后淋上热油即可' }
    ],
    cookTime: 30,
    difficulty: 3,
    tags: ['辣', '蒸菜', '经典'],
    favoriteCount: 256,
    isFavorite: true,
    source: 'Kimi Claw'
  },
  {
    _id: 'recipe_003',
    name: '番茄炒蛋',
    cuisine: '家常菜',
    imageUrl: '',
    ingredients: [
      { name: '番茄', amount: '2个' },
      { name: '鸡蛋', amount: '3个' },
      { name: '葱花', amount: '10g' }
    ],
    steps: [
      { order: 1, description: '番茄洗净切块，鸡蛋打散备用' },
      { order: 2, description: '热锅凉油，倒入蛋液炒散盛出' },
      { order: 3, description: '锅中加少许油，放入番茄翻炒' },
      { order: 4, description: '番茄出汁后加入炒好的鸡蛋' },
      { order: 5, description: '调入盐和少许糖，撒上葱花即可' }
    ],
    cookTime: 10,
    difficulty: 1,
    tags: ['简单', '快手', '经典'],
    favoriteCount: 999,
    isFavorite: false,
    source: 'Kimi Claw'
  },
  {
    _id: 'recipe_004',
    name: '红烧肉',
    cuisine: '家常菜',
    imageUrl: '',
    ingredients: [
      { name: '五花肉', amount: '500g' },
      { name: '冰糖', amount: '30g' },
      { name: '生抽', amount: '30ml' },
      { name: '老抽', amount: '15ml' }
    ],
    steps: [
      { order: 1, description: '五花肉洗净切块，冷水下锅焯水' },
      { order: 2, description: '锅中放油，小火炒糖色' },
      { order: 3, description: '放入肉块翻炒上色' },
      { order: 4, description: '加入调料和热水，小火炖煮45分钟' },
      { order: 5, description: '大火收汁即可' }
    ],
    cookTime: 60,
    difficulty: 3,
    tags: ['经典', '下饭', '荤菜'],
    favoriteCount: 888,
    isFavorite: false,
    source: 'Kimi Claw'
  },
  {
    _id: 'recipe_005',
    name: '糖醋排骨',
    cuisine: '家常菜',
    imageUrl: '',
    ingredients: [
      { name: '排骨', amount: '500g' },
      { name: '白糖', amount: '50g' },
      { name: '醋', amount: '40ml' },
      { name: '生抽', amount: '20ml' }
    ],
    steps: [
      { order: 1, description: '排骨洗净切段，冷水下锅焯水' },
      { order: 2, description: '锅中放油，将排骨煎至两面金黄' },
      { order: 3, description: '加入料酒、生抽、白糖、醋翻炒均匀' },
      { order: 4, description: '加入适量热水，大火烧开转小火炖30分钟' },
      { order: 5, description: '大火收汁，撒上白芝麻出锅' }
    ],
    cookTime: 45,
    difficulty: 2,
    tags: ['酸甜', '下饭', '经典'],
    favoriteCount: 666,
    isFavorite: true,
    source: 'Kimi Claw'
  }
];

// 用户收藏列表
let userFavorites = ['recipe_001', 'recipe_002', 'recipe_005'];

// ========== API 路由 ==========

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: 'test-server' });
});

// 微信登录
app.post('/api/auth/wechat-login', (req, res) => {
  console.log('[TEST] 微信登录:', req.body.code);
  res.json({
    success: true,
    data: {
      token: 'mock_token_' + Date.now(),
      user: mockUser
    }
  });
});

// 获取用户信息
app.get('/api/auth/user', (req, res) => {
  console.log('[TEST] 获取用户信息');
  res.json({
    success: true,
    data: {
      ...mockUser,
      favoritesCount: userFavorites.length
    }
  });
});

// 更新偏好
app.put('/api/auth/preferences', (req, res) => {
  console.log('[TEST] 更新偏好:', req.body.cuisines);
  mockUser.preferredCuisines = req.body.cuisines || mockUser.preferredCuisines;
  res.json({
    success: true,
    data: { preferredCuisines: mockUser.preferredCuisines }
  });
});

// 获取收藏列表
app.get('/api/recipes/favorites', (req, res) => {
  const { cuisine, page = 1, limit = 20 } = req.query;
  console.log('[TEST] 获取收藏, 菜系:', cuisine);
  
  let recipes = mockRecipes.filter(r => userFavorites.includes(r._id));
  if (cuisine) {
    recipes = recipes.filter(r => r.cuisine === cuisine);
  }
  
  res.json({
    success: true,
    data: {
      recipes: recipes.map(r => ({ ...r, isFavorite: true })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recipes.length,
        pages: Math.ceil(recipes.length / limit)
      }
    }
  });
});

// 获取市场菜谱
app.get('/api/recipes/market', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  console.log('[TEST] 获取市场菜谱');
  
  // 返回未收藏的菜谱
  const recipes = mockRecipes.filter(r => !userFavorites.includes(r._id));
  
  res.json({
    success: true,
    data: {
      recipes: recipes.map(r => ({ ...r, isFavorite: false })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recipes.length,
        pages: Math.ceil(recipes.length / limit)
      }
    }
  });
});

// 获取今日推荐
app.get('/api/recipes/daily-recommend', (req, res) => {
  console.log('[TEST] 获取今日推荐');
  
  // 随机返回3个菜谱
  const shuffled = [...mockRecipes].sort(() => 0.5 - Math.random());
  const recipes = shuffled.slice(0, 3).map(r => ({
    ...r,
    isFavorite: userFavorites.includes(r._id)
  }));
  
  res.json({
    success: true,
    data: { recipes }
  });
});

// 获取菜谱详情
app.get('/api/recipes/detail/:id', (req, res) => {
  const { id } = req.params;
  console.log('[TEST] 获取详情:', id);
  
  const recipe = mockRecipes.find(r => r._id === id);
  if (!recipe) {
    return res.status(404).json({ success: false, message: '菜谱不存在' });
  }
  
  res.json({
    success: true,
    data: {
      ...recipe,
      isFavorite: userFavorites.includes(id)
    }
  });
});

// 收藏菜谱
app.post('/api/recipes/favorite', (req, res) => {
  const { recipeId } = req.body;
  console.log('[TEST] 收藏:', recipeId);
  
  if (!userFavorites.includes(recipeId)) {
    userFavorites.push(recipeId);
  }
  
  res.json({ success: true, message: '收藏成功' });
});

// 取消收藏
app.post('/api/recipes/unfavorite', (req, res) => {
  const { recipeId } = req.body;
  console.log('[TEST] 取消收藏:', recipeId);
  
  userFavorites = userFavorites.filter(id => id !== recipeId);
  
  res.json({ success: true, message: '取消收藏成功' });
});

// 搜索菜谱
app.get('/api/recipes/search', (req, res) => {
  const { keyword, page = 1, limit = 20 } = req.query;
  console.log('[TEST] 搜索:', keyword);
  
  let recipes = mockRecipes;
  if (keyword) {
    const lower = keyword.toLowerCase();
    recipes = recipes.filter(r => 
      r.name.toLowerCase().includes(lower) ||
      r.ingredients.some(i => i.name.includes(keyword))
    );
  }
  
  res.json({
    success: true,
    data: {
      recipes: recipes.map(r => ({
        ...r,
        isFavorite: userFavorites.includes(r._id)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recipes.length,
        pages: Math.ceil(recipes.length / limit)
      }
    }
  });
});

// 获取菜系列表
app.get('/api/recipes/cuisines', (req, res) => {
  const cuisines = ['湘菜', '川菜', '粤菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜', '西餐', '日韩料理', '东南亚菜'];
  res.json({ success: true, data: { cuisines } });
});

// ========== 启动服务器 ==========

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║     🧪 菜谱小程序前端测试服务器已启动            ║
║                                                ║
║     地址: http://localhost:${PORT}/api            ║
║                                                ║
╠════════════════════════════════════════════════╣
║                                                ║
║  测试步骤:                                      ║
║  1. 确保测试服务器运行中 (node test-server.js)   ║
║  2. 修改 wechat-app/app.js:                    ║
║     apiBaseUrl: 'http://localhost:3999/api'    ║
║  3. 在微信开发者工具中预览                      ║
║                                                ║
║  注意: 微信开发者工具需开启「不校验合法域名」    ║
║       设置 → 项目设置 → 不校验合法域名...       ║
║                                                ║
╚════════════════════════════════════════════════╝
  `);
});

const Recipe = require('../models/Recipe');
const User = require('../models/User');

// 获取首页收藏的菜谱
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cuisine, page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    let query = { _id: { $in: user.favorites } };
    if (cuisine) {
      query.cuisine = cuisine;
    }

    const recipes = await Recipe.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Recipe.countDocuments(query);

    res.json({
      success: true,
      data: {
        recipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取收藏错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取市场菜谱
exports.getMarketRecipes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 获取用户偏好菜系的菜谱，排除已收藏的
    const recipes = await Recipe.find({
      cuisine: { $in: user.preferredCuisines },
      _id: { $nin: user.favorites },
      isPublished: true
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Recipe.countDocuments({
      cuisine: { $in: user.preferredCuisines },
      _id: { $nin: user.favorites },
      isPublished: true
    });

    res.json({
      success: true,
      data: {
        recipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取市场菜谱错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取今日推荐
exports.getDailyRecommend = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 获取今日推荐（优先用户偏好菜系）
    let recipes = await Recipe.getDailyRecommend(user.preferredCuisines);
    
    // 如果没有今日推荐，随机获取一些菜谱
    if (recipes.length === 0) {
      recipes = await Recipe.find({
        cuisine: { $in: user.preferredCuisines }
      }).limit(3);
    }

    res.json({
      success: true,
      data: { recipes }
    });
  } catch (error) {
    console.error('获取推荐错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取菜谱详情
exports.getRecipeDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: '菜谱不存在' });
    }

    let isFavorite = false;
    if (userId) {
      const user = await User.findById(userId);
      isFavorite = user.favorites.includes(id);
      
      // 标记为已查看
      if (!user.viewedRecipes.includes(id)) {
        user.viewedRecipes.push(id);
        await user.save();
      }
    }

    res.json({
      success: true,
      data: {
        ...recipe.toObject(),
        isFavorite
      }
    });
  } catch (error) {
    console.error('获取详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 收藏菜谱
exports.addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 检查是否已收藏
    if (user.favorites.includes(recipeId)) {
      return res.json({ success: true, message: '已经收藏过了' });
    }

    // 添加到收藏
    user.favorites.push(recipeId);
    await user.save();

    // 增加菜谱收藏数
    await Recipe.findByIdAndUpdate(recipeId, { $inc: { favoriteCount: 1 } });

    res.json({ success: true, message: '收藏成功' });
  } catch (error) {
    console.error('收藏错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 取消收藏
exports.removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 从收藏中移除
    user.favorites = user.favorites.filter(id => id.toString() !== recipeId);
    await user.save();

    // 减少菜谱收藏数
    await Recipe.findByIdAndUpdate(recipeId, { $inc: { favoriteCount: -1 } });

    res.json({ success: true, message: '取消收藏成功' });
  } catch (error) {
    console.error('取消收藏错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 搜索菜谱
exports.searchRecipes = async (req, res) => {
  try {
    const { keyword, cuisine, page = 1, limit = 20 } = req.query;
    
    let query = { isPublished: true };
    
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
        { 'ingredients.name': { $regex: keyword, $options: 'i' } }
      ];
    }
    
    if (cuisine) {
      query.cuisine = cuisine;
    }

    const recipes = await Recipe.find(query)
      .sort({ favoriteCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Recipe.countDocuments(query);

    res.json({
      success: true,
      data: {
        recipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 按菜系获取菜谱（用于收藏页分类）
exports.getRecipesByCuisine = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 按菜系分组获取收藏的菜谱
    const recipes = await Recipe.find({
      _id: { $in: user.favorites }
    }).sort({ cuisine: 1, createdAt: -1 });

    // 按菜系分组
    const grouped = recipes.reduce((acc, recipe) => {
      if (!acc[recipe.cuisine]) {
        acc[recipe.cuisine] = [];
      }
      acc[recipe.cuisine].push(recipe);
      return acc;
    }, {});

    res.json({
      success: true,
      data: { grouped }
    });
  } catch (error) {
    console.error('获取分组错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 管理员：添加菜谱（Kimi Claw 调用）
exports.createRecipe = async (req, res) => {
  try {
    const recipeData = req.body;
    
    // 检查是否已存在同名菜谱
    const existing = await Recipe.findOne({ 
      name: recipeData.name,
      cuisine: recipeData.cuisine 
    });
    
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: '菜谱已存在',
        data: existing
      });
    }

    const recipe = new Recipe(recipeData);
    await recipe.save();

    res.status(201).json({
      success: true,
      message: '菜谱创建成功',
      data: recipe
    });
  } catch (error) {
    console.error('创建菜谱错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取所有菜系列表
exports.getCuisines = async (req, res) => {
  try {
    const cuisines = ['湘菜', '川菜', '粤菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜', '西餐', '日韩料理', '东南亚菜'];
    
    res.json({
      success: true,
      data: { cuisines }
    });
  } catch (error) {
    console.error('获取菜系错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

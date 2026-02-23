const { Recipe, User } = require('../models');

// 获取首页收藏的菜谱
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cuisine, page = 1, limit = 20 } = req.query;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const favorites = user.favorites || [];
    const where = { id: favorites };
    if (cuisine) {
      where.cuisine = cuisine;
    }

    const { count, rows: recipes } = await Recipe.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        recipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
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
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const { Op } = require('sequelize');
    const favorites = user.favorites || [];
    const preferredCuisines = user.preferredCuisines || [];

    const where = {
      cuisine: preferredCuisines,
      id: { [Op.notIn]: favorites },
      isPublished: true
    };

    const { count, rows: recipes } = await Recipe.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        recipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
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
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const { Op } = require('sequelize');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const preferredCuisines = user.preferredCuisines || [];

    // 获取今日推荐
    let recipes = await Recipe.findAll({
      where: {
        isDailyRecommended: true,
        recommendDate: { [Op.gte]: today },
        cuisine: preferredCuisines
      },
      order: [['recommendDate', 'DESC']],
      limit: 3
    });
    
    // 如果没有今日推荐，随机获取一些菜谱
    if (recipes.length === 0) {
      recipes = await Recipe.findAll({
        where: { cuisine: preferredCuisines },
        limit: 3
      });
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
    
    const recipe = await Recipe.findByPk(id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: '菜谱不存在' });
    }

    let isFavorite = false;
    if (userId) {
      const user = await User.findByPk(userId);
      const favorites = user.favorites || [];
      isFavorite = favorites.includes(parseInt(id));
      
      // 标记为已查看
      const viewedRecipes = user.viewedRecipes || [];
      if (!viewedRecipes.includes(parseInt(id))) {
        viewedRecipes.push(parseInt(id));
        await user.update({ viewedRecipes });
      }
    }

    res.json({
      success: true,
      data: {
        ...recipe.toJSON(),
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
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const favorites = user.favorites || [];
    
    // 检查是否已收藏
    if (favorites.includes(parseInt(recipeId))) {
      return res.json({ success: true, message: '已经收藏过了' });
    }

    // 添加到收藏
    favorites.push(parseInt(recipeId));
    await user.update({ favorites });

    // 增加菜谱收藏数
    const recipe = await Recipe.findByPk(recipeId);
    if (recipe) {
      await recipe.update({ favoriteCount: recipe.favoriteCount + 1 });
    }

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
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    let favorites = user.favorites || [];
    
    // 从收藏中移除
    favorites = favorites.filter(id => id !== parseInt(recipeId));
    await user.update({ favorites });

    // 减少菜谱收藏数
    const recipe = await Recipe.findByPk(recipeId);
    if (recipe) {
      await recipe.update({ favoriteCount: Math.max(0, recipe.favoriteCount - 1) });
    }

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
    
    const { Op } = require('sequelize');
    const where = { isPublished: true };
    
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { tags: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (cuisine) {
      where.cuisine = cuisine;
    }

    const { count, rows: recipes } = await Recipe.findAndCountAll({
      where,
      order: [['favoriteCount', 'DESC'], ['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        recipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
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
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const favorites = user.favorites || [];
    
    // 按菜系分组获取收藏的菜谱
    const recipes = await Recipe.findAll({
      where: { id: favorites },
      order: [['cuisine', 'ASC'], ['createdAt', 'DESC']]
    });

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
      where: {
        name: recipeData.name,
        cuisine: recipeData.cuisine 
      }
    });
    
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: '菜谱已存在',
        data: existing
      });
    }

    const recipe = await Recipe.create(recipeData);

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

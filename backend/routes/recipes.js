const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { verifyToken, optionalAuth, verifyApiKey } = require('../middleware/auth');

// 公开接口
router.get('/detail/:id', optionalAuth, recipeController.getRecipeDetail);
router.get('/cuisines', recipeController.getCuisines);
router.get('/search', optionalAuth, recipeController.searchRecipes);

// 需要登录的接口
router.get('/favorites', verifyToken, recipeController.getFavorites);
router.get('/favorites/grouped', verifyToken, recipeController.getRecipesByCuisine);
router.get('/market', verifyToken, recipeController.getMarketRecipes);
router.get('/daily-recommend', verifyToken, recipeController.getDailyRecommend);
router.post('/favorite', verifyToken, recipeController.addFavorite);
router.post('/unfavorite', verifyToken, recipeController.removeFavorite);

// 管理员接口（Kimi Claw 调用）
router.post('/admin/create', verifyApiKey, recipeController.createRecipe);

module.exports = router;

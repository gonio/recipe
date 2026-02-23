const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// 微信小程序登录
router.post('/wechat-login', authController.wechatLogin);

// 更新用户偏好菜系
router.put('/preferences', verifyToken, authController.updatePreferences);

// 获取用户信息
router.get('/user', verifyToken, authController.getUserInfo);

module.exports = router;

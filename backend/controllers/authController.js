const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// 微信小程序登录
exports.wechatLogin = async (req, res) => {
  try {
    const { code, userInfo } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: '缺少 code 参数' });
    }

    // 调用微信接口获取 openid
    const appid = process.env.WECHAT_APPID;
    const secret = process.env.WECHAT_SECRET;
    
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    
    const wxResponse = await axios.get(wxUrl);
    const { openid, session_key } = wxResponse.data;
    
    if (!openid) {
      return res.status(400).json({ 
        success: false, 
        message: '微信登录失败',
        error: wxResponse.data 
      });
    }

    // 查找或创建用户
    let user = await User.findOne({ openid });
    
    if (!user) {
      user = new User({
        openid,
        nickname: userInfo?.nickName || '',
        avatarUrl: userInfo?.avatarUrl || '',
        preferredCuisines: ['家常菜'] // 默认菜系
      });
      await user.save();
    } else {
      // 更新用户信息
      if (userInfo) {
        user.nickname = userInfo.nickName || user.nickname;
        user.avatarUrl = userInfo.avatarUrl || user.avatarUrl;
      }
      user.lastLogin = new Date();
      await user.save();
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id, openid },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          preferredCuisines: user.preferredCuisines
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新用户偏好菜系
exports.updatePreferences = async (req, res) => {
  try {
    const { cuisines } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    user.preferredCuisines = cuisines;
    await user.save();

    res.json({
      success: true,
      data: {
        preferredCuisines: user.preferredCuisines
      }
    });
  } catch (error) {
    console.error('更新偏好错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取用户信息
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId)
      .populate('favorites', 'name imageUrl cuisine cookTime');
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 检查是否有新食谱
    const newRecipesCount = await require('../models/Recipe').countDocuments({
      cuisine: { $in: user.preferredCuisines },
      _id: { $nin: user.viewedRecipes },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7天内
    });

    res.json({
      success: true,
      data: {
        id: user._id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        preferredCuisines: user.preferredCuisines,
        favoritesCount: user.favorites.length,
        newRecipesCount
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

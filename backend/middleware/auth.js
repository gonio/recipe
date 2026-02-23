const jwt = require('jsonwebtoken');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未提供 token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'token 已过期' });
    }
    return res.status(401).json({ success: false, message: 'token 无效' });
  }
};

// 可选的验证（用于部分公开的接口）
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    next();
  }
};

// API Key 验证（用于 Kimi Claw 调用）
exports.verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ success: false, message: 'API Key 无效' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '验证失败' });
  }
};

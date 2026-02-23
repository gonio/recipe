const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nickname: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  // 用户偏好的菜系
  preferredCuisines: [{
    type: String,
    enum: ['湘菜', '川菜', '粤菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜', '西餐', '日韩料理', '东南亚菜']
  }],
  // 收藏的食谱ID
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  // 已查看的新食谱（用于标记首页的新内容）
  viewedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  // 用户创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 最后登录时间
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// 检查是否有新食谱
userSchema.methods.hasNewRecipes = function() {
  return this.favorites.some(recipeId => !this.viewedRecipes.includes(recipeId));
};

module.exports = mongoose.model('User', userSchema);

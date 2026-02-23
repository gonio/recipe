const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  // 菜谱名称
  name: {
    type: String,
    required: true,
    index: true
  },
  // 菜系分类
  cuisine: {
    type: String,
    required: true,
    enum: ['湘菜', '川菜', '粤菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜', '西餐', '日韩料理', '东南亚菜'],
    index: true
  },
  // 菜谱图片
  imageUrl: {
    type: String,
    default: ''
  },
  // 食材列表
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      default: ''
    }
  }],
  // 烹饪步骤
  steps: [{
    order: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ''
    }
  }],
  // 烹饪时间（分钟）
  cookTime: {
    type: Number,
    default: 0
  },
  // 难度等级 1-5
  difficulty: {
    type: Number,
    default: 3,
    min: 1,
    max: 5
  },
  // 标签
  tags: [{
    type: String
  }],
  // 来源
  source: {
    type: String,
    default: 'Kimi Claw'
  },
  // 来源URL
  sourceUrl: {
    type: String,
    default: ''
  },
  // 收藏数
  favoriteCount: {
    type: Number,
    default: 0
  },
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // 是否已推送到市场
  isPublished: {
    type: Boolean,
    default: true
  },
  // 是否是今日推荐
  isDailyRecommended: {
    type: Boolean,
    default: false
  },
  // 推荐日期
  recommendDate: {
    type: Date,
    default: null
  }
});

// 索引优化查询
recipeSchema.index({ cuisine: 1, createdAt: -1 });
recipeSchema.index({ isDailyRecommended: 1, recommendDate: -1 });

// 虚拟字段：是否为无图菜谱
recipeSchema.virtual('hasImage').get(function() {
  return !!this.imageUrl && this.imageUrl.trim() !== '';
});

// 方法：增加收藏数
recipeSchema.methods.incrementFavorite = function() {
  this.favoriteCount += 1;
  return this.save();
};

// 静态方法：获取今日推荐
recipeSchema.statics.getDailyRecommend = async function(cuisines = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let query = { 
    isDailyRecommended: true,
    recommendDate: { $gte: today }
  };
  
  if (cuisines.length > 0) {
    query.cuisine = { $in: cuisines };
  }
  
  return this.find(query).sort({ recommendDate: -1 }).limit(3);
};

// 静态方法：获取市场新菜谱
recipeSchema.statics.getMarketRecipes = async function(page = 1, limit = 20, cuisines = []) {
  const query = { isPublished: true };
  
  if (cuisines.length > 0) {
    query.cuisine = { $in: cuisines };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

module.exports = mongoose.model('Recipe', recipeSchema);

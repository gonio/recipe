const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// 使用 SQLite 数据库
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/recipe.db'),
  logging: false
});

// 用户模型
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  openid: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  avatarUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  preferredCuisines: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  favorites: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  viewedRecipes: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'users',
  timestamps: true
});

// 菜谱模型
const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cuisine: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  ingredients: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  steps: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  cookTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  difficulty: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'Kimi Claw'
  },
  sourceUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  favoriteCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isDailyRecommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recommendDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'recipes',
  timestamps: true
});

// 同步数据库
const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('数据库同步成功');
  } catch (error) {
    console.error('数据库同步失败:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Recipe,
  syncDB
};

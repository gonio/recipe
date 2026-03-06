/**
 * MongoDB 数据导出脚本
 * 将现有 MongoDB 菜谱数据导出为 JSON 文件
 */

const fs = require('fs');
const path = require('path');

// TODO: 配置 MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_db';
const OUTPUT_FILE = path.join(__dirname, 'exported-recipes.json');

/**
 * 从 MongoDB 导出菜谱数据
 */
async function exportFromMongoDB() {
  console.log('开始导出 MongoDB 数据...');
  console.log('连接:', MONGODB_URI);

  try {
    // TODO: 实现 MongoDB 连接和导出逻辑
    // const { MongoClient } = require('mongodb');
    // const client = new MongoClient(MONGODB_URI);
    // await client.connect();
    // const db = client.db('recipe_db');
    // const recipes = await db.collection('recipes').find({}).toArray();

    // 模拟数据示例
    const mockRecipes = [
      {
        name: '示例菜谱 - 需要替换为真实数据',
        cuisine: '川菜',
        description: '这是一个占位符示例'
      }
    ];

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mockRecipes, null, 2));
    console.log(`导出完成: ${OUTPUT_FILE}`);
    console.log(`导出记录数: ${mockRecipes.length}`);

    return OUTPUT_FILE;
  } catch (error) {
    console.error('导出失败:', error);
    throw error;
  }
}

// 执行导出
if (require.main === module) {
  exportFromMongoDB()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { exportFromMongoDB };

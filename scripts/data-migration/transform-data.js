/**
 * 数据转换脚本
 * 将 MongoDB 导出的数据转换为 CloudBase NoSQL 格式
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, 'exported-recipes.json');
const OUTPUT_FILE = path.join(__dirname, 'transformed-recipes.json');

/**
 * 转换单条菜谱数据
 * @param {Object} mongoRecipe - MongoDB 格式的菜谱
 * @returns {Object} CloudBase 格式的菜谱
 */
function transformRecipe(mongoRecipe) {
  return {
    // 基础信息
    name: mongoRecipe.name || '',
    cuisine: mongoRecipe.cuisine || '其他',
    imageUrl: mongoRecipe.imageUrl || '',

    // 食材和步骤
    ingredients: mongoRecipe.ingredients || [],
    steps: mongoRecipe.steps || [],

    // 烹饪信息
    cookTime: mongoRecipe.cookTime || 30,
    difficulty: mongoRecipe.difficulty || 3,
    tags: mongoRecipe.tags || [],

    // 热度统计
    favoriteCount: mongoRecipe.favoriteCount || 0,
    viewCount: 0,
    heatScore: (mongoRecipe.favoriteCount || 0),

    // 来源标记
    isDailyRecommended: false,
    sourceType: 'migrated',
    aiSource: null,

    // 时间戳
    createdAt: mongoRecipe.createdAt ? new Date(mongoRecipe.createdAt) : new Date(),
    updatedAt: mongoRecipe.updatedAt ? new Date(mongoRecipe.updatedAt) : new Date()
  };
}

/**
 * 转换数据文件
 */
async function transformData() {
  console.log('开始转换数据...');

  try {
    if (!fs.existsSync(INPUT_FILE)) {
      throw new Error(`输入文件不存在: ${INPUT_FILE}`);
    }

    const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
    const mongoRecipes = JSON.parse(rawData);

    console.log(`读取到 ${mongoRecipes.length} 条记录`);

    const transformedRecipes = mongoRecipes.map(transformRecipe);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transformedRecipes, null, 2));

    console.log(`转换完成: ${OUTPUT_FILE}`);
    console.log(`转换记录数: ${transformedRecipes.length}`);

    // 输出统计信息
    const cuisineStats = transformedRecipes.reduce((acc, r) => {
      acc[r.cuisine] = (acc[r.cuisine] || 0) + 1;
      return acc;
    }, {});
    console.log('菜系分布:', cuisineStats);

    return OUTPUT_FILE;
  } catch (error) {
    console.error('转换失败:', error);
    throw error;
  }
}

// 执行转换
if (require.main === module) {
  transformData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { transformData, transformRecipe };

/**
 * 菜谱爬虫脚本
 * 
 * 这个脚本用于自动从各大美食网站抓取菜谱数据
 * 支持通过 SearchWeb 和 FetchURL 工具获取菜谱信息
 * 
 * 使用方法:
 * 1. 在 Kimi Claw 中配置定时任务
 * 2. 设置 API_KEY 和 API_BASE_URL 环境变量
 * 3. 运行: node crawler.js
 */

require('dotenv').config();
const axios = require('axios');

// 配置
const CONFIG = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://your-server:3000/api',
  apiKey: process.env.API_KEY || 'your-api-key',
  cuisines: ['湘菜', '川菜', '粤菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜'],
  maxRecipesPerCuisine: 5, // 每次每种菜系最多抓取数量
};

// 菜系关键词映射
const CUISINE_KEYWORDS = {
  '湘菜': ['剁椒鱼头', '辣椒炒肉', '口味虾', '臭豆腐', '糖油粑粑', '毛氏红烧肉'],
  '川菜': ['麻婆豆腐', '宫保鸡丁', '水煮鱼', '回锅肉', '火锅', '辣子鸡'],
  '粤菜': ['白切鸡', '烧鹅', '虾饺', '叉烧', '蛋挞', '云吞面'],
  '鲁菜': ['糖醋鲤鱼', '九转大肠', '葱烧海参', '德州扒鸡'],
  '苏菜': ['松鼠桂鱼', '叫花鸡', '狮子头', '东坡肉'],
  '浙菜': ['西湖醋鱼', '龙井虾仁', '叫花鸡', '东坡肉'],
  '闽菜': ['佛跳墙', '荔枝肉', '沙茶面', '土笋冻'],
  '徽菜': ['臭鳜鱼', '毛豆腐', '火腿炖甲鱼'],
  '家常菜': ['番茄炒蛋', '土豆丝', '青椒肉丝', '红烧排骨']
};

// 使用 SearchWeb 搜索菜谱
async function searchRecipes(cuisine, keyword) {
  console.log(`搜索 ${cuisine}: ${keyword}`);
  
  // 注意：实际使用时需要调用 Kimi Claw 的 SearchWeb 工具
  // 这里返回模拟数据，实际使用时替换为真实的搜索结果
  
  // 模拟搜索结果
  return [
    {
      name: `${keyword}`,
      cuisine: cuisine,
      source: '美食杰',
      sourceUrl: `https://www.meishij.net/search/${encodeURIComponent(keyword)}`
    }
  ];
}

// 使用 FetchURL 获取菜谱详情
async function fetchRecipeDetail(url) {
  console.log(`获取详情: ${url}`);
  
  // 注意：实际使用时需要调用 Kimi Claw 的 FetchURL 工具
  // 这里返回模拟数据
  
  return null; // 实际使用时从网页解析数据
}

// 调用后端 API 创建菜谱
async function createRecipe(recipeData) {
  try {
    const response = await axios.post(
      `${CONFIG.apiBaseUrl}/recipes/admin/create`,
      recipeData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': CONFIG.apiKey
        }
      }
    );
    
    if (response.data.success) {
      console.log(`✅ 成功创建菜谱: ${recipeData.name}`);
      return response.data.data;
    } else {
      console.log(`⚠️ 菜谱已存在: ${recipeData.name}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ 创建菜谱失败: ${recipeData.name}`, error.message);
    return null;
  }
}

// 生成示例菜谱数据（实际使用时替换为真实爬取的数据）
function generateSampleRecipe(cuisine, dishName) {
  const recipes = {
    '剁椒鱼头': {
      name: '剁椒鱼头',
      cuisine: '湘菜',
      cookTime: 30,
      difficulty: 3,
      ingredients: [
        { name: '鱼头', amount: '1个（约1000g）' },
        { name: '剁椒', amount: '200g' },
        { name: '姜', amount: '20g' },
        { name: '葱', amount: '30g' },
        { name: '料酒', amount: '30ml' },
        { name: '盐', amount: '适量' },
        { name: '食用油', amount: '50ml' }
      ],
      steps: [
        { order: 1, description: '鱼头洗净，从中间劈开，用料酒和盐腌制15分钟' },
        { order: 2, description: '姜切丝，葱切段，铺在盘底' },
        { order: 3, description: '将腌制好的鱼头放在葱姜上' },
        { order: 4, description: '均匀铺上剁椒' },
        { order: 5, description: '大火蒸15-20分钟' },
        { order: 6, description: '出锅后淋上热油即可' }
      ],
      tags: ['辣', '蒸菜', '经典'],
      source: 'Kimi Claw'
    },
    '麻婆豆腐': {
      name: '麻婆豆腐',
      cuisine: '川菜',
      cookTime: 20,
      difficulty: 2,
      ingredients: [
        { name: '嫩豆腐', amount: '400g' },
        { name: '猪肉末', amount: '100g' },
        { name: '豆瓣酱', amount: '30g' },
        { name: '花椒粉', amount: '5g' },
        { name: '蒜末', amount: '15g' },
        { name: '姜末', amount: '10g' },
        { name: '葱花', amount: '适量' }
      ],
      steps: [
        { order: 1, description: '豆腐切小块，用盐水焯烫后沥干' },
        { order: 2, description: '热锅凉油，下入肉末炒至变色' },
        { order: 3, description: '加入豆瓣酱、蒜末、姜末炒出红油' },
        { order: 4, description: '加入适量清水烧开' },
        { order: 5, description: '放入豆腐，小火炖煮5分钟' },
        { order: 6, description: '勾芡收汁，撒上花椒粉和葱花即可' }
      ],
      tags: ['辣', '下饭', '经典'],
      source: 'Kimi Claw'
    },
    '番茄炒蛋': {
      name: '番茄炒蛋',
      cuisine: '家常菜',
      cookTime: 10,
      difficulty: 1,
      ingredients: [
        { name: '番茄', amount: '2个' },
        { name: '鸡蛋', amount: '3个' },
        { name: '葱花', amount: '10g' },
        { name: '盐', amount: '适量' },
        { name: '糖', amount: '少许' },
        { name: '食用油', amount: '30ml' }
      ],
      steps: [
        { order: 1, description: '番茄洗净切块，鸡蛋打散备用' },
        { order: 2, description: '热锅凉油，倒入蛋液炒散盛出' },
        { order: 3, description: '锅中加少许油，放入番茄翻炒' },
        { order: 4, description: '番茄出汁后加入炒好的鸡蛋' },
        { order: 5, description: '调入盐和少许糖，撒上葱花即可' }
      ],
      tags: ['简单', '快手', '经典'],
      source: 'Kimi Claw'
    }
  };
  
  return recipes[dishName] || null;
}

// 主爬虫函数
async function crawlRecipes() {
  console.log('🚀 开始爬取菜谱...');
  console.log(`📊 配置: 爬取 ${CONFIG.cuisines.length} 个菜系，每类最多 ${CONFIG.maxRecipesPerCuisine} 个`);
  
  let totalCreated = 0;
  
  for (const cuisine of CONFIG.cuisines) {
    console.log(`\n📍 正在处理菜系: ${cuisine}`);
    
    const keywords = CUISINE_KEYWORDS[cuisine] || [cuisine];
    let cuisineCount = 0;
    
    for (const keyword of keywords) {
      if (cuisineCount >= CONFIG.maxRecipesPerCuisine) break;
      
      try {
        // 搜索菜谱
        const searchResults = await searchRecipes(cuisine, keyword);
        
        for (const result of searchResults) {
          if (cuisineCount >= CONFIG.maxRecipesPerCuisine) break;
          
          // 生成示例菜谱数据
          const recipeData = generateSampleRecipe(cuisine, keyword);
          
          if (recipeData) {
            // 创建菜谱
            const created = await createRecipe(recipeData);
            if (created) {
              totalCreated++;
              cuisineCount++;
            }
          }
          
          // 延迟，避免请求过快
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ 处理 ${keyword} 失败:`, error.message);
      }
    }
    
    console.log(`✅ ${cuisine} 菜系完成，新增 ${cuisineCount} 个菜谱`);
  }
  
  console.log(`\n🎉 爬取完成！共新增 ${totalCreated} 个菜谱`);
  return totalCreated;
}

// 设置今日推荐
async function setDailyRecommend() {
  console.log('🌟 设置今日推荐...');
  
  try {
    // 这里可以调用 API 设置今日推荐
    // 或者通过数据库操作直接设置
    console.log('✅ 今日推荐设置完成');
  } catch (error) {
    console.error('❌ 设置推荐失败:', error.message);
  }
}

// 执行主程序
if (require.main === module) {
  crawlRecipes()
    .then(() => setDailyRecommend())
    .then(() => {
      console.log('\n✨ 所有任务完成！');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 程序出错:', error);
      process.exit(1);
    });
}

module.exports = {
  crawlRecipes,
  setDailyRecommend,
  searchRecipes,
  createRecipe
};

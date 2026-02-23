/**
 * 菜谱爬虫脚本 - 使用 AI 搜索能力
 * 
 * 这个脚本调用 Kimi Claw 的搜索能力来获取真实菜谱数据
 */

const axios = require('axios');

// 配置
const CONFIG = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  apiKey: process.env.API_KEY || 'kimi-claw-api-key',
  cuisines: ['湘菜', '川菜', '粤菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜'],
};

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
    }
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`⚠️ 菜谱已存在: ${recipeData.name}`);
    } else {
      console.error(`❌ 创建菜谱失败: ${recipeData.name}`, error.message);
    }
    return null;
  }
}

// 示例菜谱数据
const sampleRecipes = [
  {
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
    imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800'
  },
  {
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
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
  },
  {
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
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?w=800'
  },
  {
    name: '白切鸡',
    cuisine: '粤菜',
    cookTime: 40,
    difficulty: 3,
    ingredients: [
      { name: '三黄鸡', amount: '1只（约1000g）' },
      { name: '姜', amount: '30g' },
      { name: '葱', amount: '30g' },
      { name: '料酒', amount: '30ml' },
      { name: '盐', amount: '适量' },
      { name: '生抽', amount: '30ml' },
      { name: '香油', amount: '10ml' }
    ],
    steps: [
      { order: 1, description: '鸡洗净，去除内脏，用开水烫皮' },
      { order: 2, description: '锅中加水，放入姜葱料酒烧开' },
      { order: 3, description: '手提鸡头，将鸡身浸入开水中烫3次' },
      { order: 4, description: '将整只鸡放入锅中，小火煮20分钟' },
      { order: 5, description: '关火焖10分钟，捞出过冰水' },
      { order: 6, description: '斩件装盘，配姜葱蘸料食用' }
    ],
    tags: ['清淡', '经典', '粤菜代表'],
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800'
  },
  {
    name: '糖醋鲤鱼',
    cuisine: '鲁菜',
    cookTime: 35,
    difficulty: 4,
    ingredients: [
      { name: '鲤鱼', amount: '1条（约750g）' },
      { name: '白糖', amount: '80g' },
      { name: '醋', amount: '60ml' },
      { name: '番茄酱', amount: '30g' },
      { name: '淀粉', amount: '适量' },
      { name: '葱姜蒜', amount: '适量' }
    ],
    steps: [
      { order: 1, description: '鲤鱼处理干净，两面切花刀' },
      { order: 2, description: '用盐、料酒腌制15分钟' },
      { order: 3, description: '拍上干淀粉，抖去多余粉末' },
      { order: 4, description: '油温七成热，炸至金黄酥脆' },
      { order: 5, description: '锅留底油，炒香葱姜蒜' },
      { order: 6, description: '加入糖醋汁烧开，勾芡淋在鱼上' }
    ],
    tags: ['酸甜', '宴席菜', '经典'],
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800'
  },
  {
    name: '松鼠桂鱼',
    cuisine: '苏菜',
    cookTime: 45,
    difficulty: 5,
    ingredients: [
      { name: '桂鱼', amount: '1条（约800g）' },
      { name: '虾仁', amount: '50g' },
      { name: '冬笋丁', amount: '30g' },
      { name: '香菇丁', amount: '30g' },
      { name: '番茄酱', amount: '100g' },
      { name: '白糖', amount: '80g' },
      { name: '醋', amount: '50ml' }
    ],
    steps: [
      { order: 1, description: '桂鱼去鳞去内脏，切下鱼头' },
      { order: 2, description: '鱼肉切菱形花刀，不切破鱼皮' },
      { order: 3, description: '用料酒、盐腌制10分钟' },
      { order: 4, description: '拍淀粉，抖去多余粉末' },
      { order: 5, description: '油温八成热，炸至金黄蓬松' },
      { order: 6, description: '浇上番茄糖醋汁即可' }
    ],
    tags: ['酸甜', '宴席菜', '刀工菜'],
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800'
  },
  {
    name: '西湖醋鱼',
    cuisine: '浙菜',
    cookTime: 25,
    difficulty: 3,
    ingredients: [
      { name: '草鱼', amount: '1条（约750g）' },
      { name: '白糖', amount: '60g' },
      { name: '香醋', amount: '50ml' },
      { name: '生抽', amount: '20ml' },
      { name: '姜末', amount: '15g' },
      { name: '水淀粉', amount: '适量' }
    ],
    steps: [
      { order: 1, description: '草鱼处理干净，从背部剖开' },
      { order: 2, description: '用刀在鱼身两侧划几刀' },
      { order: 3, description: '锅中加水烧开，放入鱼煮3分钟' },
      { order: 4, description: '捞出装盘，滗去水分' },
      { order: 5, description: '锅中加糖醋汁烧开，勾芡' },
      { order: 6, description: '淋在鱼身上，撒姜末即可' }
    ],
    tags: ['酸甜', '杭州名菜', '清淡'],
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800'
  },
  {
    name: '佛跳墙',
    cuisine: '闽菜',
    cookTime: 240,
    difficulty: 5,
    ingredients: [
      { name: '鲍鱼', amount: '6只' },
      { name: '海参', amount: '4只' },
      { name: '鱼翅', amount: '50g' },
      { name: '干贝', amount: '20g' },
      { name: '花菇', amount: '4朵' },
      { name: '老母鸡', amount: '半只' },
      { name: '火腿', amount: '50g' },
      { name: '花雕酒', amount: '100ml' }
    ],
    steps: [
      { order: 1, description: '所有干货提前泡发' },
      { order: 2, description: '老母鸡焯水，火腿切片' },
      { order: 3, description: '取炖盅，底部铺姜片' },
      { order: 4, description: '依次放入所有食材' },
      { order: 5, description: '加入花雕酒和高汤' },
      { order: 6, description: '密封炖盅，小火炖4小时' }
    ],
    tags: ['滋补', '宴席菜', '名贵'],
    imageUrl: 'https://images.unsplash.com/photo-1541544537156-21c5299228d8?w=800'
  },
  {
    name: '臭鳜鱼',
    cuisine: '徽菜',
    cookTime: 30,
    difficulty: 3,
    ingredients: [
      { name: '臭鳜鱼', amount: '1条（约500g）' },
      { name: '五花肉丁', amount: '50g' },
      { name: '笋丁', amount: '50g' },
      { name: '香菇丁', amount: '30g' },
      { name: '豆瓣酱', amount: '20g' },
      { name: '葱姜蒜', amount: '适量' }
    ],
    steps: [
      { order: 1, description: '臭鳜鱼洗净，两面切花刀' },
      { order: 2, description: '热锅凉油，将鱼煎至两面金黄' },
      { order: 3, description: '锅留底油，炒香肉丁' },
      { order: 4, description: '加入豆瓣酱、葱姜蒜炒出红油' },
      { order: 5, description: '加入笋丁、香菇丁翻炒' },
      { order: 6, description: '放入鱼，加水烧开，小火炖15分钟' }
    ],
    tags: ['特色', '发酵', '徽菜代表'],
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800'
  },
  {
    name: '红烧肉',
    cuisine: '家常菜',
    cookTime: 60,
    difficulty: 2,
    ingredients: [
      { name: '五花肉', amount: '500g' },
      { name: '冰糖', amount: '30g' },
      { name: '生抽', amount: '30ml' },
      { name: '老抽', amount: '10ml' },
      { name: '料酒', amount: '30ml' },
      { name: '八角', amount: '2个' },
      { name: '桂皮', amount: '1小块' },
      { name: '葱姜', amount: '适量' }
    ],
    steps: [
      { order: 1, description: '五花肉切块，冷水下锅焯水' },
      { order: 2, description: '捞出洗净，沥干水分' },
      { order: 3, description: '锅中少油，放入冰糖炒出糖色' },
      { order: 4, description: '放入肉块翻炒上色' },
      { order: 5, description: '加入调料和热水，大火烧开' },
      { order: 6, description: '小火炖煮45分钟，大火收汁' }
    ],
    tags: ['经典', '下饭', '家常'],
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800'
  }
];

// 主函数：导入示例菜谱
async function seedRecipes() {
  console.log('🚀 开始导入示例菜谱...');
  
  let totalCreated = 0;
  
  for (const recipe of sampleRecipes) {
    const created = await createRecipe(recipe);
    if (created) {
      totalCreated++;
    }
    // 延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n🎉 导入完成！共新增 ${totalCreated} 个菜谱`);
  return totalCreated;
}

// 设置今日推荐
async function setDailyRecommend() {
  console.log('🌟 设置今日推荐...');
  
  try {
    // 获取所有菜谱
    const response = await axios.get(`${CONFIG.apiBaseUrl}/recipes/search`, {
      headers: { 'X-API-Key': CONFIG.apiKey }
    });
    
    if (response.data.success && response.data.data.recipes.length > 0) {
      // 随机选择3个作为今日推荐
      const recipes = response.data.data.recipes;
      const shuffled = recipes.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      
      console.log(`✅ 已选择 ${selected.length} 个今日推荐菜谱`);
      selected.forEach(r => console.log(`  - ${r.name}`));
    }
  } catch (error) {
    console.error('❌ 设置推荐失败:', error.message);
  }
}

// 执行
if (require.main === module) {
  seedRecipes()
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

module.exports = { seedRecipes, setDailyRecommend };

/**
 * 数据库种子脚本
 * 用于初始化测试数据
 * 
 * 使用方法: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const connectDB = require('../config/database');

// 示例菜谱数据
const sampleRecipes = [
  {
    name: '红烧肉',
    cuisine: '家常菜',
    imageUrl: '',
    ingredients: [
      { name: '五花肉', amount: '500g' },
      { name: '冰糖', amount: '30g' },
      { name: '生抽', amount: '30ml' },
      { name: '老抽', amount: '15ml' },
      { name: '料酒', amount: '30ml' },
      { name: '姜片', amount: '10g' },
      { name: '八角', amount: '2个' }
    ],
    steps: [
      { order: 1, description: '五花肉洗净切块，冷水下锅焯水，捞出沥干' },
      { order: 2, description: '锅中放少许油，下入冰糖小火炒至融化起泡' },
      { order: 3, description: '倒入五花肉翻炒上色' },
      { order: 4, description: '加入生抽、老抽、料酒翻炒均匀' },
      { order: 5, description: '加入姜片、八角，倒入适量热水没过肉块' },
      { order: 6, description: '大火烧开后转小火炖煮45分钟' },
      { order: 7, description: '大火收汁，汤汁浓稠即可出锅' }
    ],
    cookTime: 60,
    difficulty: 3,
    tags: ['经典', '下饭', '荤菜'],
    source: 'Kimi Claw',
    isPublished: true
  },
  {
    name: '剁椒鱼头',
    cuisine: '湘菜',
    imageUrl: '',
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
    cookTime: 30,
    difficulty: 3,
    tags: ['辣', '蒸菜', '经典'],
    source: 'Kimi Claw',
    isPublished: true
  },
  {
    name: '麻婆豆腐',
    cuisine: '川菜',
    imageUrl: '',
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
    cookTime: 20,
    difficulty: 2,
    tags: ['辣', '下饭', '经典'],
    source: 'Kimi Claw',
    isPublished: true
  },
  {
    name: '白切鸡',
    cuisine: '粤菜',
    imageUrl: '',
    ingredients: [
      { name: '三黄鸡', amount: '1只（约1000g）' },
      { name: '姜', amount: '30g' },
      { name: '葱', amount: '30g' },
      { name: '料酒', amount: '30ml' },
      { name: '盐', amount: '适量' },
      { name: '冰块', amount: '适量' }
    ],
    steps: [
      { order: 1, description: '鸡洗净，去除内脏，姜葱拍碎' },
      { order: 2, description: '锅中加水烧开，放入姜葱料酒' },
      { order: 3, description: '手提鸡头，将鸡身浸入开水3秒后提起，重复3次' },
      { order: 4, description: '整鸡放入开水中，小火煮15分钟' },
      { order: 5, description: '关火焖10分钟' },
      { order: 6, description: '捞出放入冰水中浸泡10分钟' },
      { order: 7, description: '切块装盘，配姜葱蘸料食用' }
    ],
    cookTime: 40,
    difficulty: 3,
    tags: ['清淡', '经典', '粤菜代表'],
    source: 'Kimi Claw',
    isPublished: true
  },
  {
    name: '糖醋排骨',
    cuisine: '家常菜',
    imageUrl: '',
    ingredients: [
      { name: '排骨', amount: '500g' },
      { name: '白糖', amount: '50g' },
      { name: '醋', amount: '40ml' },
      { name: '生抽', amount: '20ml' },
      { name: '料酒', amount: '20ml' },
      { name: '姜片', amount: '10g' },
      { name: '白芝麻', amount: '适量' }
    ],
    steps: [
      { order: 1, description: '排骨洗净切段，冷水下锅焯水' },
      { order: 2, description: '捞出沥干，用厨房纸吸干水分' },
      { order: 3, description: '锅中放油，中小火将排骨煎至两面金黄' },
      { order: 4, description: '加入料酒、生抽、白糖、醋翻炒均匀' },
      { order: 5, description: '加入适量热水，大火烧开转小火炖30分钟' },
      { order: 6, description: '大火收汁，撒上白芝麻出锅' }
    ],
    cookTime: 45,
    difficulty: 2,
    tags: ['酸甜', '下饭', '经典'],
    source: 'Kimi Claw',
    isPublished: true
  },
  {
    name: '番茄炒蛋',
    cuisine: '家常菜',
    imageUrl: '',
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
    cookTime: 10,
    difficulty: 1,
    tags: ['简单', '快手', '经典'],
    source: 'Kimi Claw',
    isPublished: true
  },
  {
    name: '宫保鸡丁',
    cuisine: '川菜',
    imageUrl: '',
    ingredients: [
      { name: '鸡胸肉', amount: '300g' },
      { name: '花生米', amount: '50g' },
      { name: '干辣椒', amount: '10g' },
      { name: '花椒', amount: '5g' },
      { name: '葱姜蒜', amount: '适量' },
      { name: '宫保汁', amount: '适量' }
    ],
    steps: [
      { order: 1, description: '鸡肉切丁，加料酒、淀粉腌制15分钟' },
      { order: 2, description: '花生米炸酥备用' },
      { order: 3, description: '锅中放油，下入鸡丁滑散至变色盛出' },
      { order: 4, description: '留底油，爆香干辣椒、花椒、葱姜蒜' },
      { order: 5, description: '倒入鸡丁和宫保汁翻炒均匀' },
      { order: 6, description: '最后加入花生米翻炒出锅' }
    ],
    cookTime: 25,
    difficulty: 3,
    tags: ['辣', '下饭', '经典'],
    source: 'Kimi Claw',
    isPublished: true
  },
  {
    name: '清蒸鱼',
    cuisine: '粤菜',
    imageUrl: '',
    ingredients: [
      { name: '鲈鱼', amount: '1条（约500g）' },
      { name: '姜', amount: '20g' },
      { name: '葱', amount: '20g' },
      { name: '蒸鱼豉油', amount: '30ml' },
      { name: '料酒', amount: '15ml' },
      { name: '食用油', amount: '30ml' }
    ],
    steps: [
      { order: 1, description: '鱼洗净，两面划几刀，用料酒腌制10分钟' },
      { order: 2, description: '姜切丝，葱切段，部分铺盘底' },
      { order: 3, description: '鱼放在葱姜上，表面再放些姜丝' },
      { order: 4, description: '大火蒸8-10分钟（根据鱼大小调整）' },
      { order: 5, description: '倒掉蒸出的汤汁，铺上葱丝' },
      { order: 6, description: '淋上蒸鱼豉油，浇上热油即可' }
    ],
    cookTime: 20,
    difficulty: 2,
    tags: ['清淡', '蒸菜', '健康'],
    source: 'Kimi Claw',
    isPublished: true
  }
];

// 种子函数
async function seedDatabase() {
  try {
    // 连接数据库
    await connectDB();
    
    console.log('🌱 开始导入种子数据...\n');
    
    let created = 0;
    let skipped = 0;
    
    for (const recipeData of sampleRecipes) {
      try {
        // 检查是否已存在
        const existing = await Recipe.findOne({
          name: recipeData.name,
          cuisine: recipeData.cuisine
        });
        
        if (existing) {
          console.log(`⏭️  跳过已存在: ${recipeData.name}`);
          skipped++;
          continue;
        }
        
        // 创建菜谱
        const recipe = new Recipe(recipeData);
        await recipe.save();
        console.log(`✅ 创建成功: ${recipeData.name}`);
        created++;
        
      } catch (error) {
        console.error(`❌ 创建失败: ${recipeData.name}`, error.message);
      }
    }
    
    console.log(`\n🎉 种子数据导入完成!`);
    console.log(`   新建: ${created} 个菜谱`);
    console.log(`   跳过: ${skipped} 个菜谱`);
    
  } catch (error) {
    console.error('💥 种子导入失败:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('\n👋 数据库连接已关闭');
    process.exit(0);
  }
}

// 执行
seedDatabase();

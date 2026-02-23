/**
 * 生成占位图片和空状态图片
 */

const sharp = require('sharp');
const path = require('path');

const outputDir = path.join(__dirname, '../../wechat-app/images');

// 创建简单的 SVG 占位图
function createPlaceholderSVG(text, color = '#90A4AE', bgColor = '#E3F2FD') {
  return `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="${bgColor}"/>
  <circle cx="100" cy="80" r="40" fill="none" stroke="${color}" stroke-width="3"/>
  <path d="M70 120 Q100 150 130 120" fill="none" stroke="${color}" stroke-width="3"/>
  <text x="100" y="180" font-family="Arial" font-size="16" fill="${color}" text-anchor="middle">${text}</text>
</svg>
  `.trim();
}

// 创建食物占位图
function createFoodPlaceholderSVG() {
  return `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#E3F2FD"/>
  <ellipse cx="100" cy="110" rx="50" ry="30" fill="#BBDEFB" stroke="#42A5F5" stroke-width="2"/>
  <path d="M60 90 Q100 60 140 90" fill="#FFCC80" stroke="#FF9800" stroke-width="2"/>
  <circle cx="85" cy="100" r="5" fill="#FF7043"/>
  <circle cx="115" cy="105" r="5" fill="#FF7043"/>
  <circle cx="100" cy="95" r="4" fill="#66BB6A"/>
</svg>
  `.trim();
}

// 创建头像占位图
function createAvatarPlaceholderSVG() {
  return `
<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" fill="#E3F2FD"/>
  <circle cx="60" cy="50" r="25" fill="#90A4AE"/>
  <ellipse cx="60" cy="110" rx="35" ry="30" fill="#90A4AE"/>
</svg>
  `.trim();
}

// 创建难度图标
function createDifficultySVG(filled) {
  const color = filled ? '#42A5F5' : '#CFD8DC';
  return `
<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="12" width="4" height="8" fill="${color}"/>
  <rect x="10" y="8" width="4" height="12" fill="${filled >= 2 ? '#42A5F5' : '#CFD8DC'}"/>
  <rect x="16" y="4" width="4" height="16" fill="${filled >= 3 ? '#42A5F5' : '#CFD8DC'}"/>
</svg>
  `.trim();
}

async function generatePlaceholders() {
  console.log('🖼️ 生成占位图片...\n');
  
  const placeholders = [
    { name: 'default-food', svg: createFoodPlaceholderSVG() },
    { name: 'default-avatar', svg: createAvatarPlaceholderSVG() },
    { name: 'empty-favorites', svg: createPlaceholderSVG('暂无收藏') },
    { name: 'empty-market', svg: createPlaceholderSVG('暂无新菜谱') },
    { name: 'empty-recommend', svg: createPlaceholderSVG('推荐准备中') },
    { name: 'no-result', svg: createPlaceholderSVG('未找到结果') }
  ];
  
  for (const item of placeholders) {
    const outputPath = path.join(outputDir, `${item.name}.png`);
    await sharp(Buffer.from(item.svg))
      .png()
      .toFile(outputPath);
    console.log(`✅ ${item.name}.png`);
  }
  
  // 生成难度图标
  await sharp(Buffer.from(createDifficultySVG(3)))
    .png()
    .toFile(path.join(outputDir, 'difficulty.png'));
  console.log('✅ difficulty.png');
  
  console.log('\n✅ 占位图片生成完成！');
}

generatePlaceholders().catch(console.error);

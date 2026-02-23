/**
 * 生成更多小程序图标
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const outputDir = path.join(__dirname, '../../wechat-app/images');

// 更多图标配置
const moreIcons = [
  { name: 'search', icon: 'magnifying-glass' },
  { name: 'time', icon: 'clock' },
  { name: 'fire', icon: 'fire' },
  { name: 'heart', icon: 'heart' },
  { name: 'heart-filled', icon: 'heart', solid: true },
  { name: 'back', icon: 'arrow-left' },
  { name: 'arrow-right', icon: 'chevron-right' },
  { name: 'edit', icon: 'pencil' },
  { name: 'star', icon: 'star' },
  { name: 'refresh', icon: 'arrow-path' },
  { name: 'share', icon: 'share' },
  { name: 'check', icon: 'check' },
  { name: 'close', icon: 'x-mark' },
  { name: 'cuisine', icon: 'cake' },
  { name: 'category', icon: 'folder' },
  { name: 'about', icon: 'information-circle' },
  { name: 'feedback', icon: 'chat-bubble-left-ellipsis' },
  { name: 'notice', icon: 'bell' }
];

function downloadSVG(iconName, type) {
  return new Promise((resolve, reject) => {
    const url = `https://cdn.jsdelivr.net/npm/heroicons@2.0.13/24/${type}/${iconName}.svg`;
    const tempPath = path.join(outputDir, `${iconName}_${type}_temp.svg`);
    
    const file = fs.createWriteStream(tempPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(tempPath);
      });
    }).on('error', reject);
  });
}

function modifySVGColor(svgPath, color) {
  let svg = fs.readFileSync(svgPath, 'utf8');
  svg = svg.replace(/stroke="currentColor"/g, `stroke="${color}"`);
  svg = svg.replace(/fill="currentColor"/g, `fill="${color}"`);
  return svg;
}

async function convertToPNG(svgPath, outputPath, color, size = 48) {
  const svgContent = modifySVGColor(svgPath, color);
  await sharp(Buffer.from(svgContent))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`✅ ${path.basename(outputPath)}`);
}

async function main() {
  console.log('🎨 生成更多图标...\n');
  
  for (const item of moreIcons) {
    try {
      const iconName = item.icon;
      const outputName = item.name;
      const isSolid = item.solid || outputName.includes('filled');
      const type = isSolid ? 'solid' : 'outline';
      
      const tempPath = await downloadSVG(iconName, type);
      await convertToPNG(tempPath, path.join(outputDir, `${outputName}.png`), '#607D8B', 48);
      fs.unlinkSync(tempPath);
      
    } catch (error) {
      console.error(`❌ ${item.name}:`, error.message);
    }
  }
  
  console.log('\n✅ 完成！');
}

main().catch(console.error);

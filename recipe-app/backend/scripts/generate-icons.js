/**
 * 生成小程序图标脚本
 * 下载 Heroicons 并转换为 PNG 格式
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// 图标配置
const icons = [
  { name: 'home', outline: 'home', solid: 'home' },
  { name: 'market', outline: 'shopping-bag', solid: 'shopping-bag' },
  { name: 'recommend', outline: 'star', solid: 'star' },
  { name: 'profile', outline: 'user', solid: 'user' }
];

// 输出目录
const outputDir = path.join(__dirname, '../../wechat-app/images');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 下载 SVG
function downloadSVG(iconName, type) {
  return new Promise((resolve, reject) => {
    const url = `https://cdn.jsdelivr.net/npm/heroicons@2.0.13/24/${type}/${iconName}.svg`;
    const tempPath = path.join(outputDir, `${iconName}_${type}_temp.svg`);
    
    const file = fs.createWriteStream(tempPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
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

// 修改 SVG 颜色
function modifySVGColor(svgPath, color) {
  let svg = fs.readFileSync(svgPath, 'utf8');
  // 将 currentColor 替换为指定颜色
  svg = svg.replace(/stroke="currentColor"/g, `stroke="${color}"`);
  svg = svg.replace(/fill="currentColor"/g, `fill="${color}"`);
  return svg;
}

// 转换 SVG 到 PNG
async function convertToPNG(svgPath, outputPath, color, size = 81) {
  const svgContent = modifySVGColor(svgPath, color);
  
  await sharp(Buffer.from(svgContent))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`✅ Generated: ${path.basename(outputPath)}`);
}

// 主函数
async function main() {
  console.log('🎨 开始生成小程序图标...\n');
  
  const colors = {
    normal: '#90A4AE',    // 未选中 - 灰色
    active: '#42A5F5'     // 选中 - 淡蓝色
  };
  
  for (const icon of icons) {
    try {
      console.log(`📦 处理图标: ${icon.name}`);
      
      // 下载 outline 版本（未选中状态）
      const outlinePath = await downloadSVG(icon.outline, 'outline');
      await convertToPNG(outlinePath, path.join(outputDir, `${icon.name}.png`), colors.normal);
      
      // 下载 solid 版本（选中状态）
      const solidPath = await downloadSVG(icon.solid, 'solid');
      await convertToPNG(solidPath, path.join(outputDir, `${icon.name}-active.png`), colors.active);
      
      // 清理临时文件
      fs.unlinkSync(outlinePath);
      fs.unlinkSync(solidPath);
      
    } catch (error) {
      console.error(`❌ 处理 ${icon.name} 失败:`, error.message);
    }
  }
  
  console.log('\n🎉 图标生成完成！');
  console.log(`📁 输出目录: ${outputDir}`);
  
  // 列出生成的文件
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
  console.log('\n生成的文件:');
  files.forEach(f => console.log(`   - ${f}`));
}

main().catch(console.error);

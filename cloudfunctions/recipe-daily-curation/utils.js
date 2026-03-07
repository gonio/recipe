/**
 * 工具函数库
 * 包含字符串相似度计算、去重算法等
 */

/**
 * 计算 Levenshtein 距离（编辑距离）
 * 两个字符串之间，由一个转成另一个所需的最少编辑操作次数
 * @param {string} str1 字符串1
 * @param {string} str2 字符串2
 * @returns {number} 编辑距离
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;

  // 创建距离矩阵
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  // 初始化第一行和第一列
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // 填充矩阵
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 删除
          dp[i][j - 1] + 1,     // 插入
          dp[i - 1][j - 1] + 1  // 替换
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * 计算字符串相似度
 * 基于 Levenshtein 距离，返回 0-1 之间的值，1 表示完全相同
 * @param {string} str1 字符串1
 * @param {string} str2 字符串2
 * @returns {number} 相似度 (0-1)
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;

  // 统一转换为小写并去除空格
  const s1 = str1.toLowerCase().replace(/\s+/g, '');
  const s2 = str2.toLowerCase().replace(/\s+/g, '');

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  return 1 - distance / maxLength;
}

/**
 * 查找最佳匹配
 * 在候选列表中找出与目标字符串最相似的项目
 * @param {string} target 目标字符串
 * @param {Array} candidates 候选列表，每项应包含 name 字段
 * @param {number} threshold 相似度阈值 (0-1)，低于此值不返回
 * @param {number} maxMatches 最大返回匹配数
 * @returns {Array} 匹配结果列表，每项包含 recipe 和 similarity
 */
function findBestMatches(target, candidates, threshold = 0.8, maxMatches = 3) {
  if (!target || !candidates || candidates.length === 0) {
    return [];
  }

  const matches = [];

  for (const candidate of candidates) {
    const candidateName = candidate.name || '';
    const similarity = calculateSimilarity(target, candidateName);

    if (similarity >= threshold) {
      matches.push({
        recipe: candidate,
        similarity,
        matchedName: candidateName
      });
    }
  }

  // 按相似度排序
  matches.sort((a, b) => b.similarity - a.similarity);

  // 返回前 N 个
  return matches.slice(0, maxMatches);
}

/**
 * 检查是否为重复菜谱
 * 使用名称相似度判断
 * @param {string} name1 菜谱名称1
 * @param {string} name2 菜谱名称2
 * @param {number} threshold 相似度阈值，默认 0.8
 * @returns {boolean} 是否为重复
 */
function isDuplicate(name1, name2, threshold = 0.8) {
  const similarity = calculateSimilarity(name1, name2);
  return similarity >= threshold;
}

/**
 * 批量去重
 * 从 AI 发现的菜谱中过滤掉与现有菜谱重复的项目
 * @param {Array} aiRecipes AI 发现的菜谱列表
 * @param {Array} existingRecipes 现有菜谱列表
 * @param {number} threshold 相似度阈值
 * @returns {Object} 包含 newRecipes(新菜谱) 和 duplicates(重复项)
 */
function deduplicateRecipes(aiRecipes, existingRecipes, threshold = 0.8) {
  const newRecipes = [];
  const duplicates = [];

  for (const aiRecipe of aiRecipes) {
    let isDup = false;

    for (const existing of existingRecipes) {
      if (isDuplicate(aiRecipe.name, existing.name, threshold)) {
        isDup = true;
        duplicates.push({
          aiRecipe,
          existingRecipe: existing,
          similarity: calculateSimilarity(aiRecipe.name, existing.name)
        });
        break;
      }
    }

    if (!isDup) {
      newRecipes.push(aiRecipe);
    }
  }

  return { newRecipes, duplicates };
}

/**
 * 计算菜谱热度分数
 * 基于收藏数、浏览量和外部流行度
 * @param {Object} recipe 菜谱对象
 * @param {Object} externalMetrics 外部指标（如 AI 返回的流行度）
 * @returns {number} 热度分数
 */
function calculateHeatScore(recipe, externalMetrics = {}) {
  let score = 0;

  // 内部指标
  const favoriteCount = recipe.favoriteCount || 0;
  const viewCount = recipe.viewCount || 0;

  // 收藏权重高（每收藏 +10 分）
  score += favoriteCount * 10;

  // 浏览量权重较低（每 10 次浏览 +1 分）
  score += Math.floor(viewCount / 10);

  // 外部流行度（如果有）
  if (externalMetrics.popularity) {
    score += externalMetrics.popularity * 5;
  }

  // 基础分（确保新菜谱也有展示机会）
  score += 10;

  return Math.round(score);
}

/**
 * 生成唯一 ID
 * 基于时间戳和随机数
 * @returns {string} 唯一 ID
 */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 延迟函数
 * @param {number} ms 毫秒数
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试机制
 * @param {Function} fn 要执行的函数
 * @param {number} retries 重试次数
 * @param {number} delay 重试间隔（毫秒）
 * @returns {Promise<any>}
 */
async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 1) {
      throw error;
    }
    await sleep(delay);
    return retry(fn, retries - 1, delay);
  }
}

/**
 * 日期格式化
 * @param {Date} date 日期对象
 * @param {string} format 格式字符串，如 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
}

module.exports = {
  levenshteinDistance,
  calculateSimilarity,
  findBestMatches,
  isDuplicate,
  deduplicateRecipes,
  calculateHeatScore,
  generateId,
  sleep,
  retry,
  formatDate
};

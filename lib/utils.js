const fs = require('fs');
const path = require('path');

/**
 * 获取文件大小
 * @param {string} filePath - 文件路径
 * @returns {number} 文件大小（字节）
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * 格式化字节数为可读格式
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的字符串
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {boolean} 文件是否存在
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * 创建目录（如果不存在）
 * @param {string} dirPath - 目录路径
 * @returns {boolean} 是否创建成功
 */
function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 复制文件
 * @param {string} src - 源文件路径
 * @param {string} dest - 目标文件路径
 * @returns {boolean} 是否复制成功
 */
function copyFile(src, dest) {
  try {
    // 确保目标目录存在
    const destDir = path.dirname(dest);
    ensureDir(destDir);
    
    fs.copyFileSync(src, dest);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 递归复制目录
 * @param {string} src - 源目录路径
 * @param {string} dest - 目标目录路径
 * @returns {Promise<void>}
 */
async function copyDirectory(src, dest) {
  try {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    throw new Error(`复制目录失败: ${error.message}`);
  }
}

/**
 * 获取文件扩展名
 * @param {string} filePath - 文件路径
 * @returns {string} 文件扩展名
 */
function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

/**
 * 检查是否为支持的图片格式
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否为支持的图片格式
 */
function isImageFile(filePath) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
  return imageExtensions.includes(getFileExtension(filePath));
}

/**
 * 检查是否为CSS文件
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否为CSS文件
 */
function isCSSFile(filePath) {
  return getFileExtension(filePath) === '.css';
}

/**
 * 检查是否为JavaScript文件
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否为JavaScript文件
 */
function isJSFile(filePath) {
  const jsExtensions = ['.js', '.mjs', '.cjs'];
  return jsExtensions.includes(getFileExtension(filePath));
}

/**
 * 检查是否为HTML文件
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否为HTML文件
 */
function isHTMLFile(filePath) {
  const htmlExtensions = ['.html', '.htm'];
  return htmlExtensions.includes(getFileExtension(filePath));
}

/**
 * 计算文件哈希值
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>} 文件哈希值
 */
async function getFileHash(filePath) {
  const crypto = require('crypto');
  const fs = require('fs');
  
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * 生成时间戳
 * @returns {string} 时间戳字符串
 */
function generateTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * 深度合并对象
 * @param {object} target - 目标对象
 * @param {object} source - 源对象
 * @returns {object} 合并后的对象
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * 验证配置选项
 * @param {object} options - 配置选项
 * @returns {object} 验证后的配置选项
 */
function validateOptions(options) {
  const defaults = {
    inputDir: './',
    outputDir: './dist',
    html: true,
    css: true,
    js: true,
    images: true,
    backup: false,
    verbose: false
  };
  
  return deepMerge(defaults, options);
}

/**
 * 计算压缩率
 * @param {number} originalSize - 原始大小
 * @param {number} optimizedSize - 优化后大小
 * @returns {object} 压缩统计信息
 */
function calculateCompressionRatio(originalSize, optimizedSize) {
  const savedBytes = originalSize - optimizedSize;
  const savedPercentage = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(2) : 0;
  
  return {
    originalSize,
    optimizedSize,
    savedBytes,
    savedPercentage: parseFloat(savedPercentage),
    compressionRatio: originalSize > 0 ? (optimizedSize / originalSize).toFixed(4) : 1
  };
}

/**
 * 生成报告
 * @param {object} stats - 统计信息
 * @returns {string} 报告内容
 */
function generateReport(stats) {
  const { originalSize, optimizedSize, filesProcessed, timeElapsed } = stats;
  const compression = calculateCompressionRatio(originalSize, optimizedSize);
  
  return `
静态页面优化报告
================
处理文件数量: ${filesProcessed}
原始文件大小: ${formatBytes(originalSize)}
优化后大小: ${formatBytes(optimizedSize)}
节省空间: ${formatBytes(compression.savedBytes)} (${compression.savedPercentage}%)
处理时间: ${(timeElapsed / 1000).toFixed(2)}s
压缩比: ${compression.compressionRatio}
================
`;
}

/**
 * 清理临时文件
 * @param {Array} tempFiles - 临时文件列表
 * @returns {void}
 */
function cleanupTempFiles(tempFiles) {
  tempFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (error) {
      console.warn(`清理临时文件失败: ${file}`, error.message);
    }
  });
}

/**
 * 获取文件修改时间
 * @param {string} filePath - 文件路径
 * @returns {Date} 文件修改时间
 */
function getFileModTime(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  } catch (error) {
    return new Date(0);
  }
}

/**
 * 检查文件是否需要更新
 * @param {string} inputPath - 输入文件路径
 * @param {string} outputPath - 输出文件路径
 * @returns {boolean} 是否需要更新
 */
function needsUpdate(inputPath, outputPath) {
  try {
    if (!fs.existsSync(outputPath)) {
      return true;
    }
    
    const inputTime = getFileModTime(inputPath);
    const outputTime = getFileModTime(outputPath);
    
    return inputTime > outputTime;
  } catch (error) {
    return true;
  }
}

module.exports = {
  getFileSize,
  formatBytes,
  fileExists,
  ensureDir,
  copyFile,
  copyDirectory,
  getFileExtension,
  isImageFile,
  isCSSFile,
  isJSFile,
  isHTMLFile,
  getFileHash,
  generateTimestamp,
  deepMerge,
  validateOptions,
  calculateCompressionRatio,
  generateReport,
  cleanupTempFiles,
  getFileModTime,
  needsUpdate
};

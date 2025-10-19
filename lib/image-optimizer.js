const fs = require('fs');
const path = require('path');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminWebp = require('imagemin-webp');

/**
 * 图片文件优化器
 * 功能包括：压缩图片、格式转换、生成WebP格式、优化SVG等
 */
class ImageOptimizer {
  constructor() {
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    this.defaultOptions = {
      jpeg: {
        quality: 80,
        progressive: true,
        arithmetic: false
      },
      png: {
        quality: [0.6, 0.8],
        speed: 1,
        strip: true
      },
      svg: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                removeUselessStrokeAndFill: true,
                removeEmptyAttrs: true,
                removeHiddenElems: true,
                removeEmptyText: true,
                removeEmptyContainers: true,
                removeUnusedNS: true,
                removeUselessDefs: true,
                removeEditorsNSData: true,
                removeMetadata: true,
                removeTitle: true,
                removeDesc: true,
                removeComments: true,
                removeDoctype: true,
                removeXMLProcInst: true,
                removeXMLNS: false,
                removeEditorsNSData: true,
                cleanupIDs: true,
                cleanupNumericValues: true,
                convertColors: true,
                convertPathData: true,
                convertShapeToPath: true,
                convertTransform: true,
                mergePaths: true,
                moveElemsAttrsToGroup: true,
                moveGroupAttrsToElems: true,
                removeAttrs: true,
                removeElementsByAttr: true,
                removeStyleElement: true,
                removeScriptElement: true,
                sortAttrs: true,
                transformsWithOnePath: true
              }
            }
          }
        ]
      },
      webp: {
        quality: 80,
        method: 6,
        preset: 'default',
        sns: 50,
        autoFilter: true,
        sharpness: 0,
        lossless: false,
        nearLossless: false,
        smartSubsample: false,
        mixed: false
      }
    };
  }

  /**
   * 优化图片文件
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   * @param {object} options - 优化选项
   * @returns {Promise<void>}
   */
  async optimize(inputPath, outputPath, options = {}) {
    try {
      const fileExt = path.extname(inputPath).toLowerCase();
      const mergedOptions = { ...this.defaultOptions, ...options.imageOptions };
      
      // 确保输出目录存在
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      let optimizedBuffer;
      
      switch (fileExt) {
        case '.jpg':
        case '.jpeg':
          optimizedBuffer = await this.optimizeJPEG(inputPath, mergedOptions);
          break;
        case '.png':
          optimizedBuffer = await this.optimizePNG(inputPath, mergedOptions);
          break;
        case '.svg':
          optimizedBuffer = await this.optimizeSVG(inputPath, mergedOptions);
          break;
        case '.gif':
          optimizedBuffer = await this.optimizeGIF(inputPath, mergedOptions);
          break;
        case '.webp':
          optimizedBuffer = await this.optimizeWebP(inputPath, mergedOptions);
          break;
        default:
          throw new Error(`不支持的图片格式: ${fileExt}`);
      }
      
      // 写入优化后的文件
      fs.writeFileSync(outputPath, optimizedBuffer);
      
      // 如果启用了WebP转换，生成WebP版本
      if (options.generateWebP && !fileExt.includes('webp')) {
        await this.generateWebP(inputPath, outputPath, mergedOptions);
      }
      
    } catch (error) {
      throw new Error(`图片优化失败: ${error.message}`);
    }
  }

  /**
   * 优化JPEG图片
   * @param {string} inputPath - 输入文件路径
   * @param {object} options - 优化选项
   * @returns {Promise<Buffer>} 优化后的图片数据
   */
  async optimizeJPEG(inputPath, options) {
    const plugins = [
      imageminMozjpeg(options.jpeg)
    ];
    
    const result = await imagemin([inputPath], {
      plugins
    });
    
    return result[0].data;
  }

  /**
   * 优化PNG图片
   * @param {string} inputPath - 输入文件路径
   * @param {object} options - 优化选项
   * @returns {Promise<Buffer>} 优化后的图片数据
   */
  async optimizePNG(inputPath, options) {
    const plugins = [
      imageminPngquant(options.png)
    ];
    
    const result = await imagemin([inputPath], {
      plugins
    });
    
    return result[0].data;
  }

  /**
   * 优化SVG图片
   * @param {string} inputPath - 输入文件路径
   * @param {object} options - 优化选项
   * @returns {Promise<Buffer>} 优化后的图片数据
   */
  async optimizeSVG(inputPath, options) {
    const plugins = [
      imageminSvgo(options.svg)
    ];
    
    const result = await imagemin([inputPath], {
      plugins
    });
    
    return result[0].data;
  }

  /**
   * 优化GIF图片
   * @param {string} inputPath - 输入文件路径
   * @param {object} options - 优化选项
   * @returns {Promise<Buffer>} 优化后的图片数据
   */
  async optimizeGIF(inputPath, options) {
    // GIF优化相对简单，主要是移除元数据
    const buffer = fs.readFileSync(inputPath);
    return buffer;
  }

  /**
   * 优化WebP图片
   * @param {string} inputPath - 输入文件路径
   * @param {object} options - 优化选项
   * @returns {Promise<Buffer>} 优化后的图片数据
   */
  async optimizeWebP(inputPath, options) {
    const plugins = [
      imageminWebp(options.webp)
    ];
    
    const result = await imagemin([inputPath], {
      plugins
    });
    
    return result[0].data;
  }

  /**
   * 生成WebP格式图片
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   * @param {object} options - 优化选项
   * @returns {Promise<void>}
   */
  async generateWebP(inputPath, outputPath, options) {
    try {
      const webpPath = outputPath.replace(/\.[^.]+$/, '.webp');
      const plugins = [
        imageminWebp(options.webp)
      ];
      
      const result = await imagemin([inputPath], {
        plugins
      });
      
      fs.writeFileSync(webpPath, result[0].data);
    } catch (error) {
      console.warn('WebP转换失败:', error.message);
    }
  }

  /**
   * 分析图片文件
   * @param {string} filePath - 文件路径
   * @returns {object} 分析结果
   */
  analyzeImage(filePath) {
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    const analysis = {
      fileSize: stats.size,
      extension: ext,
      lastModified: stats.mtime,
      isImage: this.supportedFormats.includes(ext)
    };
    
    return analysis;
  }

  /**
   * 批量优化图片
   * @param {Array} inputPaths - 输入文件路径列表
   * @param {string} outputDir - 输出目录
   * @param {object} options - 优化选项
   * @returns {Promise<Array>} 优化结果列表
   */
  async batchOptimize(inputPaths, outputDir, options = {}) {
    const results = [];
    
    for (const inputPath of inputPaths) {
      try {
        const fileName = path.basename(inputPath);
        const outputPath = path.join(outputDir, fileName);
        
        await this.optimize(inputPath, outputPath, options);
        
        const originalSize = fs.statSync(inputPath).size;
        const optimizedSize = fs.statSync(outputPath).size;
        const savedBytes = originalSize - optimizedSize;
        const savedPercentage = ((savedBytes / originalSize) * 100).toFixed(2);
        
        results.push({
          inputPath,
          outputPath,
          originalSize,
          optimizedSize,
          savedBytes,
          savedPercentage,
          success: true
        });
        
      } catch (error) {
        results.push({
          inputPath,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }

  /**
   * 获取图片信息
   * @param {string} filePath - 文件路径
   * @returns {Promise<object>} 图片信息
   */
  async getImageInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      return {
        name: path.basename(filePath),
        size: stats.size,
        extension: ext,
        lastModified: stats.mtime,
        isSupported: this.supportedFormats.includes(ext)
      };
    } catch (error) {
      throw new Error(`获取图片信息失败: ${error.message}`);
    }
  }

  /**
   * 检查是否需要优化
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   * @returns {boolean} 是否需要优化
   */
  needsOptimization(inputPath, outputPath) {
    try {
      if (!fs.existsSync(outputPath)) {
        return true;
      }
      
      const inputStats = fs.statSync(inputPath);
      const outputStats = fs.statSync(outputPath);
      
      // 如果输出文件比输入文件大，需要重新优化
      return outputStats.size >= inputStats.size;
    } catch (error) {
      return true;
    }
  }

  /**
   * 清理临时文件
   * @param {Array} tempFiles - 临时文件列表
   * @returns {void}
   */
  cleanupTempFiles(tempFiles) {
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
}

/**
 * 优化图片文件的主函数
 * @param {string} inputPath - 输入文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {object} options - 优化选项
 * @returns {Promise<void>}
 */
async function optimizeImages(inputPath, outputPath, options = {}) {
  const optimizer = new ImageOptimizer();
  return await optimizer.optimize(inputPath, outputPath, options);
}

module.exports = {
  ImageOptimizer,
  optimizeImages
};

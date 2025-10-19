const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const chalk = require('chalk');
const ora = require('ora');
const { optimizeHTML } = require('./lib/html-optimizer');
const { optimizeCSS } = require('./lib/css-optimizer');
const { optimizeJS } = require('./lib/js-optimizer');
const { optimizeImages } = require('./lib/image-optimizer');
const { getFileSize, formatBytes } = require('./lib/utils');

class StaticPageOptimizer {
  constructor(options = {}) {
    this.options = {
      inputDir: options.inputDir || './',
      outputDir: options.outputDir || './dist',
      html: options.html !== false,
      css: options.css !== false,
      js: options.js !== false,
      images: options.images !== false,
      backup: options.backup !== false,
      verbose: options.verbose || false,
      ...options
    };
    
    this.stats = {
      originalSize: 0,
      optimizedSize: 0,
      filesProcessed: 0,
      timeElapsed: 0
    };
  }

  async optimize() {
    const startTime = Date.now();
    console.log(chalk.blue.bold('🚀 静态页面瘦身工具启动中...\n'));

    try {
      // 创建输出目录
      if (!fs.existsSync(this.options.outputDir)) {
        fs.mkdirSync(this.options.outputDir, { recursive: true });
      }

      // 备份原文件
      if (this.options.backup) {
        await this.createBackup();
      }

      // 处理HTML文件
      if (this.options.html) {
        await this.processHTML();
      }

      // 处理CSS文件
      if (this.options.css) {
        await this.processCSS();
      }

      // 处理JavaScript文件
      if (this.options.js) {
        await this.processJS();
      }

      // 处理图片文件
      if (this.options.images) {
        await this.processImages();
      }

      this.stats.timeElapsed = Date.now() - startTime;
      this.showResults();

    } catch (error) {
      console.error(chalk.red('❌ 优化过程中出现错误:'), error.message);
      throw error;
    }
  }

  async createBackup() {
    const spinner = ora('创建备份文件...').start();
    try {
      const backupDir = path.join(this.options.outputDir, 'backup');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // 复制所有文件到备份目录
      await this.copyDirectory(this.options.inputDir, backupDir);
      spinner.succeed('备份文件创建完成');
    } catch (error) {
      spinner.fail('备份文件创建失败');
      throw error;
    }
  }

  async processHTML() {
    const spinner = ora('优化HTML文件...').start();
    try {
      const htmlFiles = await glob('**/*.html', { cwd: this.options.inputDir });
      
      for (const file of htmlFiles) {
        const inputPath = path.join(this.options.inputDir, file);
        const outputPath = path.join(this.options.outputDir, file);
        
        // 确保输出目录存在
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const originalSize = getFileSize(inputPath);
        const optimizedContent = await optimizeHTML(inputPath, this.options);
        
        fs.writeFileSync(outputPath, optimizedContent);
        
        const optimizedSize = getFileSize(outputPath);
        this.updateStats(originalSize, optimizedSize);
        
        if (this.options.verbose) {
          console.log(chalk.green(`✓ ${file}: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)}`));
        }
      }
      
      spinner.succeed(`HTML文件优化完成 (${htmlFiles.length} 个文件)`);
    } catch (error) {
      spinner.fail('HTML文件优化失败');
      throw error;
    }
  }

  async processCSS() {
    const spinner = ora('优化CSS文件...').start();
    try {
      const cssFiles = await glob('**/*.css', { cwd: this.options.inputDir });
      
      for (const file of cssFiles) {
        const inputPath = path.join(this.options.inputDir, file);
        const outputPath = path.join(this.options.outputDir, file);
        
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const originalSize = getFileSize(inputPath);
        const optimizedContent = await optimizeCSS(inputPath, this.options);
        
        fs.writeFileSync(outputPath, optimizedContent);
        
        const optimizedSize = getFileSize(outputPath);
        this.updateStats(originalSize, optimizedSize);
        
        if (this.options.verbose) {
          console.log(chalk.green(`✓ ${file}: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)}`));
        }
      }
      
      spinner.succeed(`CSS文件优化完成 (${cssFiles.length} 个文件)`);
    } catch (error) {
      spinner.fail('CSS文件优化失败');
      throw error;
    }
  }

  async processJS() {
    const spinner = ora('优化JavaScript文件...').start();
    try {
      const jsFiles = await glob('**/*.js', { cwd: this.options.inputDir });
      
      for (const file of jsFiles) {
        const inputPath = path.join(this.options.inputDir, file);
        const outputPath = path.join(this.options.outputDir, file);
        
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const originalSize = getFileSize(inputPath);
        const optimizedContent = await optimizeJS(inputPath, this.options);
        
        fs.writeFileSync(outputPath, optimizedContent);
        
        const optimizedSize = getFileSize(outputPath);
        this.updateStats(originalSize, optimizedSize);
        
        if (this.options.verbose) {
          console.log(chalk.green(`✓ ${file}: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)}`));
        }
      }
      
      spinner.succeed(`JavaScript文件优化完成 (${jsFiles.length} 个文件)`);
    } catch (error) {
      spinner.fail('JavaScript文件优化失败');
      throw error;
    }
  }

  async processImages() {
    const spinner = ora('优化图片文件...').start();
    try {
      const imageFiles = await glob('**/*.{jpg,jpeg,png,gif,svg,webp}', { cwd: this.options.inputDir });
      
      for (const file of imageFiles) {
        const inputPath = path.join(this.options.inputDir, file);
        const outputPath = path.join(this.options.outputDir, file);
        
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const originalSize = getFileSize(inputPath);
        await optimizeImages(inputPath, outputPath, this.options);
        
        const optimizedSize = getFileSize(outputPath);
        this.updateStats(originalSize, optimizedSize);
        
        if (this.options.verbose) {
          console.log(chalk.green(`✓ ${file}: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)}`));
        }
      }
      
      spinner.succeed(`图片文件优化完成 (${imageFiles.length} 个文件)`);
    } catch (error) {
      spinner.fail('图片文件优化失败');
      throw error;
    }
  }

  async copyDirectory(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  updateStats(originalSize, optimizedSize) {
    this.stats.originalSize += originalSize;
    this.stats.optimizedSize += optimizedSize;
    this.stats.filesProcessed++;
  }

  showResults() {
    const savedBytes = this.stats.originalSize - this.stats.optimizedSize;
    const savedPercentage = ((savedBytes / this.stats.originalSize) * 100).toFixed(2);
    
    console.log(chalk.blue.bold('\n📊 优化结果统计:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.white(`处理文件数量: ${chalk.yellow(this.stats.filesProcessed)}`));
    console.log(chalk.white(`原始文件大小: ${chalk.red(formatBytes(this.stats.originalSize))}`));
    console.log(chalk.white(`优化后大小: ${chalk.green(formatBytes(this.stats.optimizedSize))}`));
    console.log(chalk.white(`节省空间: ${chalk.cyan(formatBytes(savedBytes))} (${savedPercentage}%)`));
    console.log(chalk.white(`处理时间: ${chalk.magenta((this.stats.timeElapsed / 1000).toFixed(2))}s`));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (savedBytes > 0) {
      console.log(chalk.green.bold('🎉 优化完成！页面已成功瘦身！'));
    } else {
      console.log(chalk.yellow.bold('⚠️  文件已经过优化，无需进一步处理'));
    }
  }
}

module.exports = StaticPageOptimizer;

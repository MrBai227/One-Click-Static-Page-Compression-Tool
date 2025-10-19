#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const StaticPageOptimizer = require('../index');
const { validateOptions } = require('../lib/utils');

const program = new Command();

program
  .name('static-optimizer')
  .description('静态页面一键瘦身工具 - 优化HTML、CSS、JS、图片等静态资源')
  .version('1.0.0');

program
  .option('-i, --input <dir>', '输入目录', './')
  .option('-o, --output <dir>', '输出目录', './dist')
  .option('--no-html', '跳过HTML优化')
  .option('--no-css', '跳过CSS优化')
  .option('--no-js', '跳过JavaScript优化')
  .option('--no-images', '跳过图片优化')
  .option('--backup', '创建备份文件')
  .option('-v, --verbose', '显示详细信息')
  .option('--config <file>', '配置文件路径')
  .option('--dry-run', '预览模式，不实际执行优化')
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('🚀 静态页面瘦身工具'));
      console.log(chalk.gray('─'.repeat(50)));
      
      // 加载配置文件
      let config = {};
      if (options.config) {
        const configPath = path.resolve(options.config);
        if (fs.existsSync(configPath)) {
          config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          console.log(chalk.green(`✓ 已加载配置文件: ${configPath}`));
        } else {
          console.log(chalk.yellow(`⚠️  配置文件不存在: ${configPath}`));
        }
      }
      
      // 合并配置
      const finalOptions = validateOptions({
        ...config,
        inputDir: options.input,
        outputDir: options.output,
        html: options.html,
        css: options.css,
        js: options.js,
        images: options.images,
        backup: options.backup,
        verbose: options.verbose
      });
      
      // 显示配置信息
      console.log(chalk.cyan('📋 配置信息:'));
      console.log(chalk.white(`输入目录: ${chalk.yellow(finalOptions.inputDir)}`));
      console.log(chalk.white(`输出目录: ${chalk.yellow(finalOptions.outputDir)}`));
      console.log(chalk.white(`HTML优化: ${finalOptions.html ? chalk.green('✓') : chalk.red('✗')}`));
      console.log(chalk.white(`CSS优化: ${finalOptions.css ? chalk.green('✓') : chalk.red('✗')}`));
      console.log(chalk.white(`JS优化: ${finalOptions.js ? chalk.green('✓') : chalk.red('✗')}`));
      console.log(chalk.white(`图片优化: ${finalOptions.images ? chalk.green('✓') : chalk.red('✗')}`));
      console.log(chalk.white(`创建备份: ${finalOptions.backup ? chalk.green('✓') : chalk.red('✗')}`));
      console.log(chalk.gray('─'.repeat(50)));
      
      if (options.dryRun) {
        console.log(chalk.yellow('🔍 预览模式 - 不会实际执行优化'));
        return;
      }
      
      // 创建优化器实例
      const optimizer = new StaticPageOptimizer(finalOptions);
      
      // 执行优化
      await optimizer.optimize();
      
    } catch (error) {
      console.error(chalk.red('❌ 执行失败:'), error.message);
      process.exit(1);
    }
  });

// 配置文件生成命令
program
  .command('init')
  .description('生成默认配置文件')
  .option('-o, --output <file>', '输出文件路径', 'optimizer.config.json')
  .action((options) => {
    const config = {
      inputDir: './',
      outputDir: './dist',
      html: {
        enabled: true,
        removeComments: true,
        removeCommentsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeEmptyElements: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeHTMLComments: true,
        removeXMLProcInst: true,
        removeIntertagSpaces: true,
        sortAttributes: true,
        sortClassName: true
      },
      css: {
        enabled: true,
        level: 2,
        format: {
          breaks: {
            afterAtRule: false,
            afterBlockBegins: false,
            afterBlockEnds: false,
            afterComment: false,
            afterProperty: false,
            afterRuleBegins: false,
            afterRuleEnds: false,
            beforeBlockEnds: false,
            betweenSelectors: false
          },
          indentBy: 0,
          indentWith: 'space',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          },
          wrapAt: false
        },
        inline: false,
        rebase: false,
        returnPromise: false,
        sourceMap: false,
        sourceMapInlineSources: false
      },
      js: {
        enabled: true,
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
          passes: 2,
          unsafe: false,
          unsafe_comps: false,
          unsafe_Function: false,
          unsafe_math: false,
          unsafe_proto: false,
          unsafe_regexp: false,
          unsafe_undefined: false,
          conditionals: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
          loops: true,
          properties: true,
          reduce_vars: true,
          sequences: true,
          side_effects: true,
          switches: true,
          top_retain: false,
          typeofs: true,
          unused: true
        },
        mangle: {
          toplevel: false,
          eval: false,
          keep_fnames: false,
          reserved: [],
          properties: {
            regex: /^_/,
            reserved: []
          }
        },
        format: {
          comments: false,
          beautify: false,
          ascii_only: false,
          ecma: 5,
          indent_level: 0,
          indent_start: 0,
          inline_script: false,
          keep_numbers: false,
          max_line_len: false,
          preamble: null,
          preserve_annotations: false,
          quote_keys: false,
          quote_style: 0,
          safari10: false,
          semicolons: true,
          shebang: false,
          shorthand: false,
          source_map: null,
          webkit: false,
          width: 80,
          wrap_iife: false,
          wrap_func_args: false
        },
        ecma: 5,
        enclose: false,
        keep_classnames: false,
        keep_fnames: false,
        module: false,
        nameCache: null,
        parse: {
          bare_returns: false,
          ecma: 5,
          html5_comments: true,
          shebang: true
        },
        safari10: false,
        sourceMap: false,
        toplevel: false,
        warnings: false
      },
      images: {
        enabled: true,
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
        },
        generateWebP: false
      },
      backup: false,
      verbose: false
    };
    
    try {
      fs.writeFileSync(options.output, JSON.stringify(config, null, 2));
      console.log(chalk.green(`✓ 配置文件已生成: ${options.output}`));
    } catch (error) {
      console.error(chalk.red('❌ 生成配置文件失败:'), error.message);
      process.exit(1);
    }
  });

// 分析命令
program
  .command('analyze')
  .description('分析静态资源文件')
  .option('-i, --input <dir>', '输入目录', './')
  .option('-v, --verbose', '显示详细信息')
  .action(async (options) => {
    try {
      const { glob } = require('glob');
      const { formatBytes, getFileSize } = require('../lib/utils');
      
      console.log(chalk.blue.bold('📊 静态资源分析报告'));
      console.log(chalk.gray('─'.repeat(50)));
      
      const inputDir = options.input;
      
      // 分析各种文件类型
      const htmlFiles = await glob('**/*.html', { cwd: inputDir });
      const cssFiles = await glob('**/*.css', { cwd: inputDir });
      const jsFiles = await glob('**/*.js', { cwd: inputDir });
      const imageFiles = await glob('**/*.{jpg,jpeg,png,gif,svg,webp}', { cwd: inputDir });
      
      let totalSize = 0;
      let fileCount = 0;
      
      // HTML文件统计
      let htmlSize = 0;
      htmlFiles.forEach(file => {
        const filePath = path.join(inputDir, file);
        const size = getFileSize(filePath);
        htmlSize += size;
        totalSize += size;
        fileCount++;
      });
      
      // CSS文件统计
      let cssSize = 0;
      cssFiles.forEach(file => {
        const filePath = path.join(inputDir, file);
        const size = getFileSize(filePath);
        cssSize += size;
        totalSize += size;
        fileCount++;
      });
      
      // JS文件统计
      let jsSize = 0;
      jsFiles.forEach(file => {
        const filePath = path.join(inputDir, file);
        const size = getFileSize(filePath);
        jsSize += size;
        totalSize += size;
        fileCount++;
      });
      
      // 图片文件统计
      let imageSize = 0;
      imageFiles.forEach(file => {
        const filePath = path.join(inputDir, file);
        const size = getFileSize(filePath);
        imageSize += size;
        totalSize += size;
        fileCount++;
      });
      
      console.log(chalk.cyan('📁 文件统计:'));
      console.log(chalk.white(`HTML文件: ${chalk.yellow(htmlFiles.length)} 个 (${formatBytes(htmlSize)})`));
      console.log(chalk.white(`CSS文件: ${chalk.yellow(cssFiles.length)} 个 (${formatBytes(cssSize)})`));
      console.log(chalk.white(`JS文件: ${chalk.yellow(jsFiles.length)} 个 (${formatBytes(jsSize)})`));
      console.log(chalk.white(`图片文件: ${chalk.yellow(imageFiles.length)} 个 (${formatBytes(imageSize)})`));
      console.log(chalk.gray('─'.repeat(30)));
      console.log(chalk.white(`总计: ${chalk.yellow(fileCount)} 个文件 (${formatBytes(totalSize)})`));
      
      if (options.verbose) {
        console.log(chalk.cyan('\n📋 详细文件列表:'));
        
        if (htmlFiles.length > 0) {
          console.log(chalk.green('\nHTML文件:'));
          htmlFiles.forEach(file => {
            const filePath = path.join(inputDir, file);
            const size = getFileSize(filePath);
            console.log(chalk.white(`  ${file} (${formatBytes(size)})`));
          });
        }
        
        if (cssFiles.length > 0) {
          console.log(chalk.green('\nCSS文件:'));
          cssFiles.forEach(file => {
            const filePath = path.join(inputDir, file);
            const size = getFileSize(filePath);
            console.log(chalk.white(`  ${file} (${formatBytes(size)})`));
          });
        }
        
        if (jsFiles.length > 0) {
          console.log(chalk.green('\nJavaScript文件:'));
          jsFiles.forEach(file => {
            const filePath = path.join(inputDir, file);
            const size = getFileSize(filePath);
            console.log(chalk.white(`  ${file} (${formatBytes(size)})`));
          });
        }
        
        if (imageFiles.length > 0) {
          console.log(chalk.green('\n图片文件:'));
          imageFiles.forEach(file => {
            const filePath = path.join(inputDir, file);
            const size = getFileSize(filePath);
            console.log(chalk.white(`  ${file} (${formatBytes(size)})`));
          });
        }
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 分析失败:'), error.message);
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

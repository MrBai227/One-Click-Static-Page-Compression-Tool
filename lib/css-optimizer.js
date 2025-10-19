const fs = require('fs');
const CleanCSS = require('clean-css');
const { PurgeCSS } = require('purgecss');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');

/**
 * CSS文件优化器
 * 功能包括：压缩CSS、移除未使用样式、合并重复规则、优化选择器等
 */
class CSSOptimizer {
  constructor() {
    this.defaultOptions = {
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
    };
  }

  /**
   * 优化CSS文件
   * @param {string} filePath - 文件路径
   * @param {object} options - 优化选项
   * @returns {Promise<string>} 优化后的CSS内容
   */
  async optimize(filePath, options = {}) {
    try {
      const cssContent = fs.readFileSync(filePath, 'utf8');
      const mergedOptions = { ...this.defaultOptions, ...options.cssOptions };
      
      // 预处理：移除开发工具相关的代码
      let processedContent = this.preprocessCSS(cssContent);
      
      // 使用PostCSS处理
      processedContent = await this.processWithPostCSS(processedContent, filePath);
      
      // 使用CleanCSS压缩
      const cleanCSS = new CleanCSS(mergedOptions);
      const result = cleanCSS.minify(processedContent);
      
      if (result.errors.length > 0) {
        console.warn('CSS压缩警告:', result.errors);
      }
      
      // 后处理：进一步优化
      const finalContent = this.postprocessCSS(result.styles);
      
      return finalContent;
    } catch (error) {
      throw new Error(`CSS优化失败: ${error.message}`);
    }
  }

  /**
   * 使用PostCSS处理CSS
   * @param {string} content - CSS内容
   * @param {string} filePath - 文件路径
   * @returns {Promise<string>} 处理后的CSS内容
   */
  async processWithPostCSS(content, filePath) {
    const plugins = [
      postcssImport(),
      postcssPresetEnv({
        stage: 3,
        features: {
          'nesting-rules': true,
          'custom-properties': true,
          'custom-media-queries': true
        }
      })
    ];

    const result = await postcss(plugins).process(content, {
      from: filePath,
      to: filePath
    });

    return result.css;
  }

  /**
   * 预处理CSS内容
   * @param {string} content - CSS内容
   * @returns {string} 预处理后的内容
   */
  preprocessCSS(content) {
    let processed = content;
    
    // 移除开发环境相关的注释
    processed = processed.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      // 保留重要的注释（如版权信息）
      if (match.includes('Copyright') || match.includes('License')) {
        return match;
      }
      return '';
    });
    
    // 移除空白行
    processed = processed.replace(/^\s*[\r\n]/gm, '');
    
    // 移除不必要的分号
    processed = processed.replace(/;\s*}/g, '}');
    
    return processed;
  }

  /**
   * 后处理CSS内容
   * @param {string} content - 已压缩的CSS内容
   * @returns {string} 最终优化后的内容
   */
  postprocessCSS(content) {
    let processed = content;
    
    // 移除多余的空格
    processed = processed.replace(/\s+/g, ' ');
    
    // 优化选择器
    processed = this.optimizeSelectors(processed);
    
    // 移除空的规则
    processed = processed.replace(/[^{}]*{\s*}/g, '');
    
    return processed.trim();
  }

  /**
   * 优化CSS选择器
   * @param {string} content - CSS内容
   * @returns {string} 优化后的内容
   */
  optimizeSelectors(content) {
    return content.replace(/([^{}]+){([^{}]*)}/g, (match, selector, rules) => {
      // 优化选择器
      let optimizedSelector = selector
        .replace(/\s*>\s*/g, '>')
        .replace(/\s*\+\s*/g, '+')
        .replace(/\s*~\s*/g, '~')
        .replace(/\s+/g, ' ')
        .trim();
      
      // 移除重复的选择器
      const selectors = optimizedSelector.split(',').map(s => s.trim());
      const uniqueSelectors = [...new Set(selectors)];
      
      return `${uniqueSelectors.join(',')}{${rules}}`;
    });
  }

  /**
   * 移除未使用的CSS
   * @param {string} cssContent - CSS内容
   * @param {Array} htmlFiles - HTML文件列表
   * @param {object} options - 选项
   * @returns {Promise<string>} 清理后的CSS内容
   */
  async removeUnusedCSS(cssContent, htmlFiles, options = {}) {
    try {
      const purgeOptions = {
        content: htmlFiles,
        css: [{ raw: cssContent }],
        defaultExtractor: content => {
          // 自定义提取器，提取所有可能的类名和ID
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
          const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
          return broadMatches.concat(innerMatches);
        },
        ...options.purgeOptions
      };

      const purgeResult = await new PurgeCSS().purge(purgeOptions);
      return purgeResult[0].css || cssContent;
    } catch (error) {
      console.warn('移除未使用CSS失败:', error.message);
      return cssContent;
    }
  }

  /**
   * 分析CSS文件
   * @param {string} filePath - 文件路径
   * @returns {object} 分析结果
   */
  analyzeCSS(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const analysis = {
      totalLines: content.split('\n').length,
      totalChars: content.length,
      rules: this.extractRules(content),
      selectors: this.extractSelectors(content),
      properties: this.extractProperties(content),
      mediaQueries: this.extractMediaQueries(content),
      imports: this.extractImports(content),
      keyframes: this.extractKeyframes(content)
    };
    
    return analysis;
  }

  /**
   * 提取CSS规则
   * @param {string} content - CSS内容
   * @returns {Array} 规则列表
   */
  extractRules(content) {
    const ruleRegex = /([^{}]+){([^{}]*)}/g;
    const rules = [];
    let match;
    
    while ((match = ruleRegex.exec(content)) !== null) {
      rules.push({
        selector: match[1].trim(),
        properties: match[2].trim()
      });
    }
    
    return rules;
  }

  /**
   * 提取选择器
   * @param {string} content - CSS内容
   * @returns {Array} 选择器列表
   */
  extractSelectors(content) {
    const selectorRegex = /([^{}]+){/g;
    const selectors = [];
    let match;
    
    while ((match = selectorRegex.exec(content)) !== null) {
      const selectorText = match[1].trim();
      if (selectorText && !selectorText.includes('@')) {
        selectors.push(selectorText);
      }
    }
    
    return selectors;
  }

  /**
   * 提取属性
   * @param {string} content - CSS内容
   * @returns {Array} 属性列表
   */
  extractProperties(content) {
    const propertyRegex = /([a-zA-Z-]+)\s*:/g;
    const properties = [];
    let match;
    
    while ((match = propertyRegex.exec(content)) !== null) {
      properties.push(match[1]);
    }
    
    return [...new Set(properties)];
  }

  /**
   * 提取媒体查询
   * @param {string} content - CSS内容
   * @returns {Array} 媒体查询列表
   */
  extractMediaQueries(content) {
    const mediaRegex = /@media\s+([^{]+){([\s\S]*?)}/g;
    const mediaQueries = [];
    let match;
    
    while ((match = mediaRegex.exec(content)) !== null) {
      mediaQueries.push({
        condition: match[1].trim(),
        rules: match[2].trim()
      });
    }
    
    return mediaQueries;
  }

  /**
   * 提取@import规则
   * @param {string} content - CSS内容
   * @returns {Array} import列表
   */
  extractImports(content) {
    const importRegex = /@import\s+["']([^"']+)["']/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  /**
   * 提取@keyframes规则
   * @param {string} content - CSS内容
   * @returns {Array} keyframes列表
   */
  extractKeyframes(content) {
    const keyframesRegex = /@keyframes\s+(\w+)\s*{([\s\S]*?)}/g;
    const keyframes = [];
    let match;
    
    while ((match = keyframesRegex.exec(content)) !== null) {
      keyframes.push({
        name: match[1],
        rules: match[2].trim()
      });
    }
    
    return keyframes;
  }

  /**
   * 合并重复的CSS规则
   * @param {string} content - CSS内容
   * @returns {string} 合并后的CSS内容
   */
  mergeDuplicateRules(content) {
    const rules = this.extractRules(content);
    const ruleMap = new Map();
    
    // 按选择器分组
    rules.forEach(rule => {
      const key = rule.selector;
      if (ruleMap.has(key)) {
        ruleMap.get(key).properties += ';' + rule.properties;
      } else {
        ruleMap.set(key, rule);
      }
    });
    
    // 重新构建CSS
    let mergedCSS = '';
    ruleMap.forEach(rule => {
      mergedCSS += `${rule.selector}{${rule.properties}}`;
    });
    
    return mergedCSS;
  }
}

/**
 * 优化CSS文件的主函数
 * @param {string} filePath - 文件路径
 * @param {object} options - 优化选项
 * @returns {Promise<string>} 优化后的CSS内容
 */
async function optimizeCSS(filePath, options = {}) {
  const optimizer = new CSSOptimizer();
  return await optimizer.optimize(filePath, options);
}

module.exports = {
  CSSOptimizer,
  optimizeCSS
};

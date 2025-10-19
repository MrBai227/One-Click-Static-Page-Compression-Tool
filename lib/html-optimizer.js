const fs = require('fs');
const htmlMinifier = require('html-minifier-terser');

/**
 * HTML文件优化器
 * 功能包括：压缩HTML、移除注释、优化空白字符、移除冗余属性等
 */
class HTMLOptimizer {
  constructor() {
    this.defaultOptions = {
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeEmptyElements: true,
      lint: false,
      keepClosingSlash: false,
      caseSensitive: false,
      minifyJS: false,
      minifyCSS: false,
      minifyURLs: false,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeHTMLComments: true,
      removeXMLProcInst: true,
      removeIntertagSpaces: true,
      sortAttributes: true,
      sortClassName: true,
      removeUnusedCss: false,
      removeUnusedJs: false,
      customAttrAssign: [],
      customAttrSurround: [],
      customAttrCollapse: /^ng-/
    };
  }

  /**
   * 优化HTML文件
   * @param {string} filePath - 文件路径
   * @param {object} options - 优化选项
   * @returns {Promise<string>} 优化后的HTML内容
   */
  async optimize(filePath, options = {}) {
    try {
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      const mergedOptions = { ...this.defaultOptions, ...options.htmlOptions };
      
      // 预处理：移除开发工具相关的注释和代码
      let processedContent = this.preprocessHTML(htmlContent);
      
      // 使用html-minifier进行压缩
      const optimizedContent = await htmlMinifier.minify(processedContent, mergedOptions);
      
      // 后处理：进一步优化
      const finalContent = this.postprocessHTML(optimizedContent);
      
      return finalContent;
    } catch (error) {
      throw new Error(`HTML优化失败: ${error.message}`);
    }
  }

  /**
   * 预处理HTML内容
   * @param {string} content - HTML内容
   * @returns {string} 预处理后的内容
   */
  preprocessHTML(content) {
    let processed = content;
    
    // 移除开发环境相关的注释
    processed = processed.replace(/<!--[\s\S]*?-->/g, (match) => {
      // 保留重要的注释（如条件注释）
      if (match.includes('[if') || match.includes('[endif')) {
        return match;
      }
      return '';
    });
    
    // 移除console.log等调试代码
    processed = processed.replace(/console\.(log|warn|error|info|debug)\([^)]*\);?/g, '');
    
    // 移除空白行
    processed = processed.replace(/^\s*[\r\n]/gm, '');
    
    return processed;
  }

  /**
   * 后处理HTML内容
   * @param {string} content - 已压缩的HTML内容
   * @returns {string} 最终优化后的内容
   */
  postprocessHTML(content) {
    let processed = content;
    
    // 移除多余的空格
    processed = processed.replace(/\s+/g, ' ');
    
    // 优化属性顺序（可选）
    processed = this.optimizeAttributeOrder(processed);
    
    // 移除空的class和id属性
    processed = processed.replace(/\s+(class|id)=""/g, '');
    
    return processed.trim();
  }

  /**
   * 优化属性顺序
   * @param {string} content - HTML内容
   * @returns {string} 优化后的内容
   */
  optimizeAttributeOrder(content) {
    return content.replace(/<(\w+)([^>]*)>/g, (match, tagName, attributes) => {
      if (!attributes.trim()) return match;
      
      // 属性优先级：id, class, 其他属性
      const attrMap = new Map();
      const attrList = [];
      
      // 解析属性
      attributes.replace(/(\w+)=["']([^"']*)["']/g, (attrMatch, name, value) => {
        attrMap.set(name, value);
        attrList.push(name);
      });
      
      // 重新排序属性
      const orderedAttrs = [];
      
      // 优先属性
      const priorityAttrs = ['id', 'class', 'type', 'name', 'value', 'src', 'href'];
      priorityAttrs.forEach(attr => {
        if (attrMap.has(attr)) {
          orderedAttrs.push(`${attr}="${attrMap.get(attr)}"`);
          attrMap.delete(attr);
        }
      });
      
      // 其他属性按字母顺序
      const remainingAttrs = Array.from(attrMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]));
      
      remainingAttrs.forEach(([name, value]) => {
        orderedAttrs.push(`${name}="${value}"`);
      });
      
      return `<${tagName}${orderedAttrs.length ? ' ' + orderedAttrs.join(' ') : ''}>`;
    });
  }

  /**
   * 分析HTML文件结构
   * @param {string} filePath - 文件路径
   * @returns {object} 分析结果
   */
  analyzeHTML(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const analysis = {
      totalLines: content.split('\n').length,
      totalChars: content.length,
      tags: this.extractTags(content),
      scripts: this.extractScripts(content),
      styles: this.extractStyles(content),
      images: this.extractImages(content),
      links: this.extractLinks(content)
    };
    
    return analysis;
  }

  /**
   * 提取HTML标签
   * @param {string} content - HTML内容
   * @returns {Array} 标签列表
   */
  extractTags(content) {
    const tagRegex = /<\/?(\w+)[^>]*>/g;
    const tags = [];
    let match;
    
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1].toLowerCase());
    }
    
    return tags;
  }

  /**
   * 提取脚本标签
   * @param {string} content - HTML内容
   * @returns {Array} 脚本信息
   */
  extractScripts(content) {
    const scriptRegex = /<script[^>]*src=["']([^"']*)["'][^>]*>/g;
    const scripts = [];
    let match;
    
    while ((match = scriptRegex.exec(content)) !== null) {
      scripts.push({
        src: match[1],
        inline: false
      });
    }
    
    // 内联脚本
    const inlineScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
    while ((match = inlineScriptRegex.exec(content)) !== null) {
      scripts.push({
        src: 'inline',
        content: match[1].trim(),
        inline: true
      });
    }
    
    return scripts;
  }

  /**
   * 提取样式标签
   * @param {string} content - HTML内容
   * @returns {Array} 样式信息
   */
  extractStyles(content) {
    const styleRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*)["'][^>]*>/g;
    const styles = [];
    let match;
    
    while ((match = styleRegex.exec(content)) !== null) {
      styles.push({
        href: match[1],
        inline: false
      });
    }
    
    // 内联样式
    const inlineStyleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
    while ((match = inlineStyleRegex.exec(content)) !== null) {
      styles.push({
        href: 'inline',
        content: match[1].trim(),
        inline: true
      });
    }
    
    return styles;
  }

  /**
   * 提取图片标签
   * @param {string} content - HTML内容
   * @returns {Array} 图片信息
   */
  extractImages(content) {
    const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/g;
    const images = [];
    let match;
    
    while ((match = imgRegex.exec(content)) !== null) {
      images.push({
        src: match[1],
        alt: match[0].match(/alt=["']([^"']*)["']/)?.[1] || '',
        title: match[0].match(/title=["']([^"']*)["']/)?.[1] || ''
      });
    }
    
    return images;
  }

  /**
   * 提取链接标签
   * @param {string} content - HTML内容
   * @returns {Array} 链接信息
   */
  extractLinks(content) {
    const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/g;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        href: match[1],
        text: match[0].replace(/<[^>]*>/g, '').trim()
      });
    }
    
    return links;
  }
}

/**
 * 优化HTML文件的主函数
 * @param {string} filePath - 文件路径
 * @param {object} options - 优化选项
 * @returns {Promise<string>} 优化后的HTML内容
 */
async function optimizeHTML(filePath, options = {}) {
  const optimizer = new HTMLOptimizer();
  return await optimizer.optimize(filePath, options);
}

module.exports = {
  HTMLOptimizer,
  optimizeHTML
};

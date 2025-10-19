const fs = require('fs');
const { minify } = require('terser');

/**
 * JavaScript文件优化器
 * 功能包括：压缩JS、混淆代码、移除未使用代码、优化变量名等
 */
class JSOptimizer {
  constructor() {
    this.defaultOptions = {
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
    };
  }

  /**
   * 优化JavaScript文件
   * @param {string} filePath - 文件路径
   * @param {object} options - 优化选项
   * @returns {Promise<string>} 优化后的JavaScript内容
   */
  async optimize(filePath, options = {}) {
    try {
      const jsContent = fs.readFileSync(filePath, 'utf8');
      const mergedOptions = { ...this.defaultOptions, ...options.jsOptions };
      
      // 预处理：移除开发工具相关的代码
      let processedContent = this.preprocessJS(jsContent);
      
      // 使用Terser进行压缩和混淆
      const result = await minify(processedContent, mergedOptions);
      
      if (result.error) {
        throw new Error(`JavaScript压缩失败: ${result.error.message}`);
      }
      
      // 后处理：进一步优化
      const finalContent = this.postprocessJS(result.code);
      
      return finalContent;
    } catch (error) {
      throw new Error(`JavaScript优化失败: ${error.message}`);
    }
  }

  /**
   * 预处理JavaScript内容
   * @param {string} content - JavaScript内容
   * @returns {string} 预处理后的内容
   */
  preprocessJS(content) {
    let processed = content;
    
    // 移除开发环境相关的注释
    processed = processed.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      // 保留重要的注释（如版权信息）
      if (match.includes('Copyright') || match.includes('License') || match.includes('@license')) {
        return match;
      }
      return '';
    });
    
    // 移除单行注释（保留重要注释）
    processed = processed.replace(/\/\/.*$/gm, (match) => {
      if (match.includes('@') || match.includes('TODO') || match.includes('FIXME')) {
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
   * 后处理JavaScript内容
   * @param {string} content - 已压缩的JavaScript内容
   * @returns {string} 最终优化后的内容
   */
  postprocessJS(content) {
    let processed = content;
    
    // 移除多余的空格
    processed = processed.replace(/\s+/g, ' ');
    
    // 优化分号使用
    processed = this.optimizeSemicolons(processed);
    
    // 移除空的语句
    processed = processed.replace(/;\s*;/g, ';');
    
    return processed.trim();
  }

  /**
   * 优化分号使用
   * @param {string} content - JavaScript内容
   * @returns {string} 优化后的内容
   */
  optimizeSemicolons(content) {
    // 移除不必要的分号
    return content
      .replace(/;\s*}/g, '}')
      .replace(/;\s*\)/g, ')')
      .replace(/;\s*\]/g, ']')
      .replace(/;\s*$/gm, '');
  }

  /**
   * 分析JavaScript文件
   * @param {string} filePath - 文件路径
   * @returns {object} 分析结果
   */
  analyzeJS(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const analysis = {
      totalLines: content.split('\n').length,
      totalChars: content.length,
      functions: this.extractFunctions(content),
      variables: this.extractVariables(content),
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      classes: this.extractClasses(content),
      comments: this.extractComments(content)
    };
    
    return analysis;
  }

  /**
   * 提取函数
   * @param {string} content - JavaScript内容
   * @returns {Array} 函数列表
   */
  extractFunctions(content) {
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)/g;
    const arrowFunctionRegex = /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g;
    const functions = [];
    let match;
    
    // 普通函数
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'function'
      });
    }
    
    // 箭头函数
    while ((match = arrowFunctionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'arrow'
      });
    }
    
    return functions;
  }

  /**
   * 提取变量
   * @param {string} content - JavaScript内容
   * @returns {Array} 变量列表
   */
  extractVariables(content) {
    const varRegex = /(?:var|let|const)\s+(\w+)/g;
    const variables = [];
    let match;
    
    while ((match = varRegex.exec(content)) !== null) {
      variables.push(match[1]);
    }
    
    return [...new Set(variables)];
  }

  /**
   * 提取import语句
   * @param {string} content - JavaScript内容
   * @returns {Array} import列表
   */
  extractImports(content) {
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  /**
   * 提取export语句
   * @param {string} content - JavaScript内容
   * @returns {Array} export列表
   */
  extractExports(content) {
    const exportRegex = /export\s+(?:default\s+)?(?:function\s+(\w+)|const\s+(\w+)|class\s+(\w+)|{([^}]+)})/g;
    const exports = [];
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      if (match[1]) exports.push({ name: match[1], type: 'function' });
      if (match[2]) exports.push({ name: match[2], type: 'const' });
      if (match[3]) exports.push({ name: match[3], type: 'class' });
      if (match[4]) {
        const namedExports = match[4].split(',').map(e => e.trim());
        exports.push(...namedExports.map(name => ({ name, type: 'named' })));
      }
    }
    
    return exports;
  }

  /**
   * 提取类
   * @param {string} content - JavaScript内容
   * @returns {Array} 类列表
   */
  extractClasses(content) {
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
    const classes = [];
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      classes.push({
        name: match[1],
        extends: match[2] || null
      });
    }
    
    return classes;
  }

  /**
   * 提取注释
   * @param {string} content - JavaScript内容
   * @returns {Array} 注释列表
   */
  extractComments(content) {
    const singleLineRegex = /\/\/.*$/gm;
    const multiLineRegex = /\/\*[\s\S]*?\*\//g;
    const comments = [];
    let match;
    
    // 单行注释
    while ((match = singleLineRegex.exec(content)) !== null) {
      comments.push({
        type: 'single',
        content: match[0].trim()
      });
    }
    
    // 多行注释
    while ((match = multiLineRegex.exec(content)) !== null) {
      comments.push({
        type: 'multi',
        content: match[0].trim()
      });
    }
    
    return comments;
  }

  /**
   * 移除未使用的代码
   * @param {string} content - JavaScript内容
   * @param {Array} usedIdentifiers - 已使用的标识符
   * @returns {string} 清理后的JavaScript内容
   */
  removeUnusedCode(content, usedIdentifiers = []) {
    // 这是一个简化的实现，实际项目中可能需要更复杂的AST分析
    let processed = content;
    
    // 移除未使用的变量声明
    const varRegex = /(?:var|let|const)\s+(\w+)(?:\s*=\s*[^;]+)?;/g;
    processed = processed.replace(varRegex, (match, varName) => {
      if (usedIdentifiers.includes(varName)) {
        return match;
      }
      return '';
    });
    
    return processed;
  }

  /**
   * 优化变量名
   * @param {string} content - JavaScript内容
   * @returns {string} 优化后的JavaScript内容
   */
  optimizeVariableNames(content) {
    // 这是一个简化的实现，实际项目中需要使用AST分析
    const variableMap = new Map();
    let counter = 0;
    
    // 生成短变量名
    const generateShortName = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      let name = '';
      let num = counter++;
      
      do {
        name = chars[num % chars.length] + name;
        num = Math.floor(num / chars.length);
      } while (num > 0);
      
      return name;
    };
    
    // 替换长变量名
    const longVarRegex = /\b[a-zA-Z_$][a-zA-Z0-9_$]{10,}\b/g;
    return content.replace(longVarRegex, (match) => {
      if (!variableMap.has(match)) {
        variableMap.set(match, generateShortName());
      }
      return variableMap.get(match);
    });
  }
}

/**
 * 优化JavaScript文件的主函数
 * @param {string} filePath - 文件路径
 * * @param {object} options - 优化选项
 * @returns {Promise<string>} 优化后的JavaScript内容
 */
async function optimizeJS(filePath, options = {}) {
  const optimizer = new JSOptimizer();
  return await optimizer.optimize(filePath, options);
}

module.exports = {
  JSOptimizer,
  optimizeJS
};

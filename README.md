# 静态页面一键瘦身工具

一个强大的静态页面优化工具，能够自动压缩和优化HTML、CSS、JavaScript和图片文件，显著减少文件大小，提高页面加载速度。

## ✨ 功能特性

- 🚀 **HTML优化**: 压缩HTML、移除注释、优化空白字符、移除冗余属性
- 🎨 **CSS优化**: 压缩CSS、移除未使用样式、合并重复规则、优化选择器
- 📦 **JavaScript优化**: 压缩JS、混淆代码、移除未使用代码、优化变量名
- 🖼️ **图片优化**: 压缩图片、格式转换、生成WebP格式、优化SVG
- 📊 **详细统计**: 显示优化前后的文件大小对比和压缩率
- ⚙️ **灵活配置**: 支持配置文件，可自定义优化选项
- 🔄 **备份功能**: 自动创建备份文件，确保数据安全

## 🛠️ 安装

```bash
# 克隆项目
git clone https://github.com/MrBai227/One-Click-Static-Page-Compression-Tool.git
cd One-Click-Static-Page-Compression-Tool

# 安装依赖
npm install

# 全局安装（可选）
npm install -g .
```

## 🚀 快速开始

### 基本使用

```bash
# 优化当前目录下的所有静态文件
npx static-optimizer

# 指定输入和输出目录
npx static-optimizer -i ./src -o ./dist

# 只优化HTML和CSS文件
npx static-optimizer --no-js --no-images

# 显示详细信息
npx static-optimizer -v
```

### 使用配置文件

```bash
# 生成默认配置文件
npx static-optimizer init

# 使用配置文件
npx static-optimizer --config optimizer.config.json
```

### 分析静态资源

```bash
# 分析当前目录的静态资源
npx static-optimizer analyze

# 显示详细文件列表
npx static-optimizer analyze -v
```

## 📋 命令行选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `-i, --input <dir>` | 输入目录 | `./` |
| `-o, --output <dir>` | 输出目录 | `./dist` |
| `--no-html` | 跳过HTML优化 | - |
| `--no-css` | 跳过CSS优化 | - |
| `--no-js` | 跳过JavaScript优化 | - |
| `--no-images` | 跳过图片优化 | - |
| `--backup` | 创建备份文件 | - |
| `-v, --verbose` | 显示详细信息 | - |
| `--config <file>` | 配置文件路径 | - |
| `--dry-run` | 预览模式，不实际执行优化 | - |

## ⚙️ 配置文件

配置文件使用JSON格式，支持以下选项：

```json
{
  "inputDir": "./",
  "outputDir": "./dist",
  "html": {
    "enabled": true,
    "removeComments": true,
    "collapseWhitespace": true,
    "removeAttributeQuotes": true
  },
  "css": {
    "enabled": true,
    "level": 2,
    "format": {
      "breaks": {
        "afterAtRule": false,
        "afterBlockBegins": false
      }
    }
  },
  "js": {
    "enabled": true,
    "compress": {
      "drop_console": true,
      "drop_debugger": true
    },
    "mangle": {
      "toplevel": false
    }
  },
  "images": {
    "enabled": true,
    "jpeg": {
      "quality": 80,
      "progressive": true
    },
    "png": {
      "quality": [0.6, 0.8]
    },
    "webp": {
      "quality": 80
    }
  },
  "backup": false,
  "verbose": false
}
```

## 📊 优化效果

使用本工具后，您通常可以看到：

- **HTML文件**: 减少20-40%的文件大小
- **CSS文件**: 减少30-50%的文件大小
- **JavaScript文件**: 减少40-60%的文件大小
- **图片文件**: 减少20-50%的文件大小（取决于原始质量）

## 🔧 高级用法

### 自定义优化选项

```javascript
const StaticPageOptimizer = require('static-page-optimizer');

const optimizer = new StaticPageOptimizer({
  inputDir: './src',
  outputDir: './dist',
  html: {
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true
  },
  css: {
    level: 2,
    format: {
      breaks: {
        afterAtRule: false
      }
    }
  },
  js: {
    compress: {
      drop_console: true,
      drop_debugger: true
    }
  },
  images: {
    jpeg: {
      quality: 85
    },
    png: {
      quality: [0.7, 0.9]
    }
  }
});

await optimizer.optimize();
```

### 分析文件结构

```javascript
const { HTMLOptimizer, CSSOptimizer, JSOptimizer, ImageOptimizer } = require('static-page-optimizer');

// 分析HTML文件
const htmlAnalyzer = new HTMLOptimizer();
const htmlAnalysis = htmlAnalyzer.analyzeHTML('./index.html');

// 分析CSS文件
const cssAnalyzer = new CSSOptimizer();
const cssAnalysis = cssAnalyzer.analyzeCSS('./styles.css');

// 分析JavaScript文件
const jsAnalyzer = new JSOptimizer();
const jsAnalysis = jsAnalyzer.analyzeJS('./script.js');

// 分析图片文件
const imageAnalyzer = new ImageOptimizer();
const imageAnalysis = imageAnalyzer.analyzeImage('./image.jpg');
```

## 📁 项目结构

```
static-page-optimizer/
├── bin/
│   └── cli.js              # 命令行接口
├── lib/
│   ├── html-optimizer.js   # HTML优化器
│   ├── css-optimizer.js    # CSS优化器
│   ├── js-optimizer.js     # JavaScript优化器
│   ├── image-optimizer.js  # 图片优化器
│   └── utils.js            # 工具函数
├── index.js                # 主入口文件
├── package.json           # 项目配置
└── README.md              # 说明文档
```

## 🤝 贡献

欢迎提交Issue和Pull Request来帮助改进这个项目！

## 📄 许可证

MIT License

## 🙏 致谢

感谢以下开源项目的支持：

- [html-minifier-terser](https://github.com/terser/html-minifier-terser)
- [clean-css](https://github.com/jakubpawlowicz/clean-css)
- [terser](https://github.com/terser/terser)
- [imagemin](https://github.com/imagemin/imagemin)
- [purgecss](https://github.com/FullHuman/purgecss)
- [postcss](https://github.com/postcss/postcss)

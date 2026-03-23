<div align="center">
  <img src="public/icon-128.png" width="128" alt="Claudo Shadow Matrix">
  <br />
  <h1>Claudo (克劳多)</h1>
  <p><strong>The Ultimate UI Overhaul & Agentic Standalone Framework for Claude.ai</strong><br>专为 Claude.ai 打造的超强浸入式 UI 与独立代理框架</p>
</div>

---

## 🌍 Introduction | 简介

**Claudo** is a high-performance, standalone Chrome/Firefox extension engineered to entirely transform the Claude.ai user experience. Moving away from fragile DOM injections and generic aesthetics, Claudo establishes an independent, premium visual language and a robust suite of power-user tools natively floating within the Claude interface.

**Claudo**（由原名 Claude Nexus 深度重生而来）是一个专为彻底重构 Claude.ai 使用体验而生的高性能独立浏览器扩展。它摒弃了原有脆弱的网页 DOM 注入方式，采用顶级的前端隔离技术架构，为你带来真正的“原生沉浸式”视觉语言以及一整套硬核黑客工具。

Built by **Alan & Antigravity AI**, this project was completely reimagined to function as an unapologetic, sovereign productivity engine.

## 🚀 Flagship Modules | 核心杀器

### 1. The FloatBall Nexus | 星芒悬浮球中枢
A centralized, physics-driven floating widget that serves as the command center for all Claudo capabilities. Sporting the custom **Claude AI Asterisk** vector asset and draped in a deep-dark `#18181b` frosted glass aesthetic.
一个自带物理引擎的中央悬浮控制舱。它搭载了极致的高清专属星芒图标与深色磨砂玻璃面板（匹配原生深色模式），随时悬停提供火力支援，无惧 Claude.ai 原生界面的任何更新迭代！

### 2. Deep WebComponent Isolation | 殿堂级防污染隔离墙 (Shadow DOM)
Unlike previous generic extensions, Claudo encapsulates its entire React 19 interface within an impenetrable **Shadow DOM (`attachShadow`)**. This ensures absolutely zero cascading stylesheet bleeding into Claude.ai, while a low-latency `MutationObserver` mirrors Claude's native dark mode switches into the shadow host for pixel-perfect integration.
与市面所有低劣插件不同，Claudo 的内部 React 组件包裹在最厚实的 WebComponent 防火墙之下。这意味着我们的排版（Tailwind）哪怕错漏百出，也绝不可能有一丝一毫污染到官方 Claude 原本的界面！同时，底层的超光速监视器会自动感知 Claude 网页的“黑夜模式”开关，实现插件深浅色自动跟随。

### 3. Cherry-Pick Export Engine | 穿刺抓取系统
A state-of-the-art export timeline that bypasses React virtual-DOM pitfalls. Select any conversation nodes and export them cleanly to Markdown or TXT format.
绕过虚拟 DOM 的防爬虫屏障，随时精准抓取屏幕上任意指定的对话并以 Markdown 清洗导出，纯净绝伦。

### 4. Seamless Internationalization | 零闪烁语言引擎
A beautifully crafted native Floating Panel language selector, dynamically translating all extension UI elements without ever leaving the webpage or opening an external Chrome popup.
内嵌在悬浮球内部的原生级多语言控制面板。点击按钮即刻在英文和中文简体间瞬切，你再也不用别扭地点开浏览器的“扩展弹出框”来设置功能了！

---

## 🛠️ Installation & Build | 构建属于你的超级系统

### Development | 开发服跑通配置
```bash
npm install
npm run dev:chrome
```

### Production Build | 一键成图炼金炉
```bash
npm run build:chrome
```

> **Note:** Load the compiled `dist_chrome` directory directly into Edge/Chrome's `chrome://extensions` via "Load unpacked".
> **装载须知:** 请在浏览器中将上述命令跑完后吐出来的 `dist_chrome` 文件夹作为未打包插件载入！

---

## 📜 License
MIT © Alan & Antigravity AI
> _Never compromise. Never surrender the DOM._

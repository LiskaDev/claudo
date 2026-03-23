<div align="center">
  <img src="public/icon-128.png" width="128" alt="Claudo Logo">
  <br />
  <h1>Claudo (克劳多)</h1>
  <p><strong>专为 Claude.ai 打造的浸入式 UI 与增强快捷插件</strong><br>The Ultimate UI Overhaul & Agentic Standalone Framework for Claude.ai</p>
</div>

---

## 🌍 项目简介 | Introduction

**Claudo** 是一个专为增强和重构 Claude.ai 使用体验而生的高性能独立浏览器扩展。它采用了顶级的 WebComponent (Shadow DOM) 前端隔离技术，为你带来真正的“原生沉浸式”视觉体验以及一整套极其便利的效率工具。

**Claudo** is a high-performance standalone extension engineered to entirely transform the Claude.ai user experience, establishing an independent, premium visual language and a robust suite of power-user tools natively floating within the Claude interface.

---

## 🚀 核心功能 | Core Features

### 1. 悬浮球中枢 (The FloatBall Nexus)
自带物理引擎的中央悬浮控制舱。可随意拖拽停靠在屏幕边缘，无惧 Claude 官方界面更新，随时提供全局快捷入口。
A centralized, physics-driven floating widget that serves as the command center for all Claudo capabilities.

### 2. 对话选段导出 (Cherry-Pick Export Engine)
点击开启后，随时精准勾选屏幕上任意指定的历史对话气泡，一键提取并清洗为 Markdown 或 TXT 格式，纯净导出。
Select any conversation nodes and export them cleanly to Markdown or TXT format.

### 3. 会话宽度调节 (Chat Width Override)
突破官方聊天窗口的宽度限制，通过悬浮球滑块自由拉伸聊天框宽度，大屏阅读代码和长文更加舒适。
Quickly adjust and override the native chat container width to fully utilize wide monitors.

### 4. 深色模式穿透 (Adaptive Dark Mode)
内置底层监听器，自动感知 Claude 网页的黑夜/白天模式开关，插件的悬浮球与所有面板颜色无缝跟随切换。
An embedded observer mirrors Claude's native dark mode switches for pixel-perfect integration.

### 5. 沉浸式多语言引擎 (Seamless Internationalization)
自带原生级多语言控制面板，支持在中/英文之间即时切换，设置项直接内嵌于网页中，无需繁琐点击浏览器扩展图标。
A native embedded language selector dynamically translating all extension UI elements without external popups.

---

## 🛠️ 安装与使用 | Installation & Build

### 本地开发 (Development)
```bash
npm install
npm run dev:chrome
```

### 生产版本打包 (Production Build)
```bash
npm run build:chrome
```

> **装载须知 (Note):** 请在 Edge/Chrome 浏览器的扩展程序页面（`chrome://extensions`）中开启“开发者模式”，点击“加载已解压的扩展程序”，选择命令打包生成的 `dist_chrome` 文件夹即可。

---

## 📜 开源协议 | License
MIT © Alan & Antigravity AI

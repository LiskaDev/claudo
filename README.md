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
<img width="477" height="341" alt="QQ20260323-160514" src="https://github.com/user-attachments/assets/e898a0de-1f1e-45f3-a7cd-e5996a274f62" />

### 2. 对话选段导出 (Cherry-Pick Export Engine)
点击开启后，随时精准勾选屏幕上任意指定的历史对话气泡，一键提取并清洗为 Markdown 或 TXT 格式，纯净导出。
Select any conversation nodes and export them cleanly to Markdown or TXT format.
<img width="1587" height="1226" alt="image" src="https://github.com/user-attachments/assets/ff1bfd4d-6e16-4144-99fd-66d60d6e61da" />

### 3. 沉浸式侧边栏 (DeepSeek-Style Scrollbar)
独家重构优化侧边栏历史记录滑动条 UI，带来媲美 DeepSeek 的极致清爽视觉体验，彻底告别原生粗糙的滚动条。
Custom-styled, auto-hiding history scrollbar inspired by DeepSeek's UI, providing a remarkably clean and modern navigation experience.
<img width="493" height="519" alt="image" src="https://github.com/user-attachments/assets/86b595f4-0618-4849-8373-3d9b831e4bd1" />
<img width="1049" height="585" alt="image" src="https://github.com/user-attachments/assets/827c5fdf-032f-4bbe-ae39-9a5e7be50aec" />

### 4. 深色模式穿透 (Adaptive Dark Mode)
内置底层监听器，自动感知 Claude 网页的黑夜/白天模式开关，插件的悬浮球与所有面板颜色无缝跟随切换。
An embedded observer mirrors Claude's native dark mode switches for pixel-perfect integration.

### 5. 宽度自由调节 (Chat Width Override)
突破官方宽度限制，大屏阅读长文代码更加舒适。
Adjust chat container width to fully utilize wide monitors.

### 6. 多语言引擎 (Seamless Internationalization)
内嵌原生多语言面板，支持中/英双语无缝即时切换。
Embedded selector seamlessly translating all UI elements.

### 7. 动态额度监控指纹环 (Real-time Usage Rings)
在悬浮球外围以 Apple Watch 闭环风格实时渲染「当前 5 小时会话窗口剩余可用量（红圈）」与「周免额度（绿圈）」。鼠标悬停 0.5 秒即刻浮现精确百分比与重置时间。
Silently intercepts hidden GraphQL utilization endpoints to vividly render 5-hour and 7-day message limits as glassmorphic concentric rings tracking pure user allocation.
<img width="497" height="546" alt="image" src="https://github.com/user-attachments/assets/d765aed2-8ed5-4be8-a026-592086c4532c" />

### 8. 对话内高性能搜索 (In-Conversation Search Engine)
基于 `CSS Custom Highlight API` 架构的零污染搜索引擎。在任意对话页面按下 `Ctrl/Cmd + F`，可无限制高亮查找长篇历史记录，彻底杜绝污染 React DOM 树导致的官方页面崩溃。
A zero-DOM-mutation search engine relying on explicit Custom Highlights API rendering to instantly traverse infinite context lengths locally.
<img width="2096" height="1392" alt="image" src="https://github.com/user-attachments/assets/1113b5a8-072c-4099-bc22-b8c3764b4f97" />

### 9. 全局极客快捷热键 (Global Shortcuts Engine)
专为键盘流超级用户（Power User）打造的无缝心流操作：
- `Ctrl/Cmd + F`：在此对话页内唤起超级查找
- `Ctrl/Cmd + /`：一键呼出“系统提示词面具（Prompt Library）”
- `Alt + X`：开关框选提取模式（Selection Export）
- `Esc`：秒关一切悬浮操作面板
<img width="592" height="432" alt="image" src="https://github.com/user-attachments/assets/8ed180fb-2502-4ddf-9378-1af8397f7bf6" />

### 10. DOM 劫持预警系统 (DOM Health Sentinel)
悬浮球右上角的“呼吸红点”。由于深度操作 DOM，当 Claude 官方团队某天暗改底层 HTML 结构，导致我们的导出或搜素引擎脱钩时，红点会自动报警闪烁，提示某项进阶功能暂时失效。
A subtle heartbeat dot that automatically raises visual alarms if official Claude push updates fracture our injected structural assumptions.

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

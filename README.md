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

<img width="654" height="500" alt="QQ20260325-133342" src="https://github.com/user-attachments/assets/7b5b4ef5-88c1-47ec-99fb-a21880d99881" />

### 2. 对话选段导出 (Cherry-Pick Export Engine)
点击开启后，随时精准勾选屏幕上任意指定的历史对话气泡，一键提取并清洗为 Markdown 或 TXT 格式，纯净导出。
Select any conversation nodes and export them cleanly to Markdown or TXT format.

<img width="2067" height="1374" alt="QQ20260325-133700" src="https://github.com/user-attachments/assets/f22bc5cf-56e5-452a-853b-7125e0d6b8be" />

### 3. 沉浸式侧边栏 (DeepSeek-Style Scrollbar)
独家重构优化侧边栏历史记录滑动条 UI，带来媲美 DeepSeek 的极致清爽视觉体验，彻底告别原生粗糙的滚动条。
Custom-styled, auto-hiding history scrollbar inspired by DeepSeek's UI, providing a remarkably clean and modern navigation experience.

<img width="2093" height="1387" alt="QQ20260325-135426" src="https://github.com/user-attachments/assets/df201aec-f1c3-4d1c-b021-845b1cc970ee" />
<img width="2092" height="1391" alt="QQ20260325-135453" src="https://github.com/user-attachments/assets/ae988bf3-f170-40ff-ad59-b8ac6fb6da5f" />

### 4. 深色模式穿透 (Adaptive Dark Mode)
内置底层监听器，自动感知 Claude 网页的黑夜/白天模式开关，插件的悬浮球与所有面板颜色无缝跟随切换。
An embedded observer mirrors Claude's native dark mode switches for pixel-perfect integration.
<img width="1998" height="1347" alt="QQ20260325-135613" src="https://github.com/user-attachments/assets/2dad43da-5f60-4b38-acbb-79cc6267cca2" />
<img width="2019" height="1371" alt="QQ20260325-135622" src="https://github.com/user-attachments/assets/3228b0ce-b8cc-414b-8749-ae8e40c92291" />

### 5. 宽度自由调节 (Chat Width Override)
突破官方宽度限制，大屏阅读长文代码更加舒适。
Adjust chat container width to fully utilize wide monitors.
<img width="1635" height="1005" alt="QQ20260325-133418" src="https://github.com/user-attachments/assets/e35011e6-d2da-4abc-9c5b-9c4452809223" />
<img width="2096" height="1077" alt="QQ20260325-133434" src="https://github.com/user-attachments/assets/084a12a9-4dfb-4570-8425-83df2fd6a477" />

### 6. 多语言引擎 (Seamless Internationalization)
内嵌原生多语言面板，支持中/英双语无缝即时切换。
Embedded selector seamlessly translating all UI elements.
<img width="555" height="738" alt="QQ20260325-133726" src="https://github.com/user-attachments/assets/11e897b7-d71d-4fe4-8eec-b66b6d309e54" />

### 7. 动态额度监控指纹环 (Real-time Usage Rings)
在悬浮球外围以 Apple Watch 闭环风格实时渲染「当前 5 小时会话窗口剩余可用量（红圈）」与「周免额度（绿圈）」。鼠标悬停 0.5 秒即刻浮现精确百分比与重置时间。
Silently intercepts hidden GraphQL utilization endpoints to vividly render 5-hour and 7-day message limits as glassmorphic concentric rings tracking pure user allocation.

<img width="818" height="481" alt="QQ20260325-133152" src="https://github.com/user-attachments/assets/22fdd8c5-585f-4399-afc5-795981f9e9a8" />

### 8. 对话内高性能搜索 (In-Conversation Search Engine)
基于 `CSS Custom Highlight API` 架构的零污染搜索引擎。在任意对话页面按下 `Ctrl/Cmd + F`，可无限制高亮查找长篇历史记录，彻底杜绝污染 React DOM 树导致的官方页面崩溃。
A zero-DOM-mutation search engine relying on explicit Custom Highlights API rendering to instantly traverse infinite context lengths locally.

<img width="2013" height="1257" alt="QQ20260325-134108" src="https://github.com/user-attachments/assets/37031ce3-2a86-44c3-91f4-7b5e7049fd5b" />

### 9. 全局极客快捷热键 (Global Shortcuts Engine)
专为键盘流超级用户（Power User）打造的无缝心流操作：
- `Ctrl/Cmd + F`：在此对话页内唤起超级查找
- `Ctrl/Cmd + /`：一键呼出“系统提示词面具（Prompt Library）”
- `Alt + X`：开关框选提取模式（Selection Export）
- `Esc`：秒关一切悬浮操作面板

<img width="646" height="555" alt="QQ20260325-134623" src="https://github.com/user-attachments/assets/823099a3-0725-4f68-a222-8fdd42e56af0" />

### 10. DOM 劫持预警系统 (DOM Health Sentinel)
悬浮球右上角的“呼吸红点”。由于深度操作 DOM，当 Claude 官方团队某天暗改底层 HTML 结构，导致我们的导出或搜素引擎脱钩时，红点会自动报警闪烁，提示某项进阶功能暂时失效。
A subtle heartbeat dot that automatically raises visual alarms if official Claude push updates fracture our injected structural assumptions.

<img width="1343" height="458" alt="QQ20260325-135219" src="https://github.com/user-attachments/assets/caf07159-1252-4f09-8a41-daccb7957460" />

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

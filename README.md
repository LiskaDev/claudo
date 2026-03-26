<div align="center">
  <img src="public/icon-128.png" width="100" alt="Claudo Logo" />
  <h1>Claudo</h1>
  <p>A powerful browser extension that supercharges your Claude.ai experience</p>

  ![Chrome](https://img.shields.io/badge/Chrome-passing-brightgreen?logo=googlechrome)
  ![License](https://img.shields.io/badge/License-MIT-blue)
  ![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)

  **[English](#english) · [中文](#chinese)**
</div>

---

<a name="english"></a>

## What is Claudo?

Claude.ai is great — but it has gaps. No system prompt support, no in-page search, no usage visibility, no way to export conversations. Claudo fills all of that, built as a fully isolated Shadow DOM extension that won't break when Claude updates.

---

## ✨ Features

### 1. FloatBall Command Center
A draggable floating button that lives on top of Claude. Snap it to any edge of the screen. All Claudo features are one click away — without ever leaving your conversation.

<div align="center">
  <img src="https://github.com/user-attachments/assets/7b5b4ef5-88c1-47ec-99fb-a21880d99881" width="600" alt="FloatBall" />
</div>

---

### 2. Real-time Usage Rings
Two concentric rings around the FloatBall show your Claude usage at a glance — inner ring for the current 5-hour session, outer ring for the weekly limit. Hover for 0.5s to see exact percentages and reset times. Color shifts green → orange → red as limits approach.

<div align="center">
  <img src="https://github.com/user-attachments/assets/22fdd8c5-585f-4399-afc5-795981f9e9a8" width="600" alt="Usage Rings" />
</div>

---

### 3. Cherry-Pick Export
Enter selection mode with `Alt+X`, click any message bubbles you want, and export them as clean Markdown or TXT. Great for saving just the useful parts of a long conversation.

<div align="center">
  <img src="https://github.com/user-attachments/assets/f22bc5cf-56e5-452a-853b-7125e0d6b8be" width="600" alt="Export" />
</div>

---

### 4. In-Conversation Search
Press `Ctrl/Cmd+F` to search inside any Claude conversation. Built on the CSS Custom Highlight API — highlights appear instantly without touching Claude's DOM, so the page never crashes.

<div align="center">
  <img src="https://github.com/user-attachments/assets/37031ce3-2a86-44c3-91f4-7b5e7049fd5b" width="600" alt="Search" />
</div>

---

### 5. Chat Width Control
Claude's default layout wastes space on wide monitors. Drag the width slider to stretch the conversation area to whatever width feels right for you.

<div align="center">
  <img src="https://github.com/user-attachments/assets/084a12a9-4dfb-4570-8425-83df2fd6a477" width="600" alt="Width Control" />
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/e35011e6-d2da-4abc-9c5b-9c4452809223" width="600" alt="Width Control" />
</div>
---

### 6. Prompt Library
Store your frequently-used prompts and inject them instantly with `Ctrl/Cmd+/`. Stop retyping the same instructions every new chat.

<div align="center">
  <img src="https://github.com/user-attachments/assets/7f0773b5-4720-41aa-bc14-2c7a9542e0ab" width="600" />
</div>

---

### 7. DeepSeek-Style Sidebar
A clean, auto-hiding scrollbar for Claude's conversation history — inspired by DeepSeek's minimal UI. Much easier on the eyes than the default.

<div align="center">
  <img src="https://github.com/user-attachments/assets/df201aec-f1c3-4d1c-b021-845b1cc970ee" width="600" alt="Sidebar" />
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/ae988bf3-f170-40ff-ad59-b8ac6fb6da5f" width="600" alt="Sidebar" />
</div>
---

### 8. Dark Mode Sync
Claudo automatically follows Claude's light/dark mode. No manual toggle needed.

<div align="center">
  <img src="https://github.com/user-attachments/assets/2dad43da-5f60-4b38-acbb-79cc6267cca2" width="600" alt="Dark Mode" />
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/3228b0ce-b8cc-414b-8749-ae8e40c92291" width="600" alt="深色模式" />
</div>
---

### 9. DOM Health Sentinel
A small breathing dot on the FloatBall. If Claude's team pushes an update that breaks Claudo's export or search features, the dot turns red and blinks — so you know immediately which feature needs attention.

<div align="center">
  <img src="https://github.com/user-attachments/assets/caf07159-1252-4f09-8a41-daccb7957460" width="600" alt="DOM Sentinel" />
</div>

---

### 10. Edge Snap & Focus Mode
Drag the FloatBall to either side of the screen and it snaps into the edge — half-hidden, nearly transparent. Out of sight, out of mind. Hover to peek at it, drag it back out to resume normal use.

Perfect for when you want to focus without the usage rings drawing your attention.
<div align="center">
  <img src="https://github.com/user-attachments/assets/c160910e-3283-4424-b21a-b70a513022da" width="600" alt="边缘磁吸收纳" />
</div>
---

### 11. Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + F` | In-conversation search |
| `Ctrl/Cmd + /` | Open prompt library |
| `Alt + X` | Toggle selection export mode |
| `Esc` | Close any open panel |

---

## 🛠️ Installation

### Install from Store
*(Coming soon — pending Edge Add-ons review)*

### Load Manually (Developer Mode)
```bash
npm install
npm run build:chrome
```
Then go to `chrome://extensions`, enable **Developer Mode**, click **Load unpacked**, and select the `dist_chrome` folder.

---

## 📜 License
MIT © Alan & Antigravity AI

---
---

<a name="chinese"></a>

## Claudo 是什么？

Claude.ai 很好用，但有不少缺口——没有系统提示词支持、无法在页面内搜索、看不到用量、无法导出对话。Claudo 补齐了这些，基于 Shadow DOM 完全隔离构建，不会因为 Claude 更新而损坏。

---

## ✨ 功能介绍

### 1. 悬浮球控制中心
一个可拖拽的悬浮按钮，常驻在 Claude 页面上方，可吸附到屏幕任意边缘。所有 Claudo 功能一键直达，不打断你的对话流程。

<div align="center">
  <img src="https://github.com/user-attachments/assets/7b5b4ef5-88c1-47ec-99fb-a21880d99881" width="600" alt="悬浮球" />
</div>

---

### 2. 实时用量指纹环
悬浮球外围的两个同心圆环实时显示 Claude 用量——内圈是当前5小时会话，外圈是本周额度。鼠标悬停0.5秒弹出精确百分比和重置时间。颜色随用量从绿变橙变红。

<div align="center">
  <img src="https://github.com/user-attachments/assets/22fdd8c5-585f-4399-afc5-795981f9e9a8" width="600" alt="用量圆环" />
</div>

---

### 3. 对话选段导出
按 `Alt+X` 进入选择模式，点选任意对话气泡，一键导出为干净的 Markdown 或 TXT 格式。只保留你想要的内容。

<div align="center">
  <img src="https://github.com/user-attachments/assets/f22bc5cf-56e5-452a-853b-7125e0d6b8be" width="600" alt="导出" />
</div>

---

### 4. 对话内搜索
按 `Ctrl/Cmd+F` 在当前对话内搜索。基于 CSS Custom Highlight API 构建，高亮渲染不接触 Claude 的 DOM，页面不会崩溃。

<div align="center">
  <img src="https://github.com/user-attachments/assets/37031ce3-2a86-44c3-91f4-7b5e7049fd5b" width="600" alt="搜索" />
</div>

---

### 5. 宽度自由调节
Claude 默认布局在宽屏上浪费空间。拖动宽度滑块，把对话区域调到你最舒适的宽度。

<div align="center">
  <img src="https://github.com/user-attachments/assets/084a12a9-4dfb-4570-8425-83df2fd6a477" width="600" alt="宽度调节" />
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/e35011e6-d2da-4abc-9c5b-9c4452809223" width="600" alt="Width Control" />
</div>
---

### 6. 提示词库
存储常用提示词，用 `Ctrl/Cmd+/` 随时调用。再也不用每次新建对话都重新粘贴一遍。
<div align="center">
  <img src="https://github.com/user-attachments/assets/7f0773b5-4720-41aa-bc14-2c7a9542e0ab" width="600" />
</div>
---

### 7. 极简侧边栏
参考 DeepSeek 风格重构的自动隐藏滚动条，历史对话列表更清爽。

<div align="center">
  <img src="https://github.com/user-attachments/assets/df201aec-f1c3-4d1c-b021-845b1cc970ee" width="600" alt="侧边栏" />
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/ae988bf3-f170-40ff-ad59-b8ac6fb6da5f" width="600" alt="Sidebar" />
</div>
---

### 8. 深色模式同步
自动跟随 Claude 的明暗模式切换，无需手动调整。

<div align="center">
  <img src="https://github.com/user-attachments/assets/2dad43da-5f60-4b38-acbb-79cc6267cca2" width="600" alt="深色模式" />
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/3228b0ce-b8cc-414b-8749-ae8e40c92291" width="600" alt="深色模式" />
</div>
---

### 9. DOM 健康哨兵
悬浮球右上角的呼吸小红点。当 Claude 官方更新导致导出或搜索功能失效时，红点自动闪烁报警，让你第一时间知道哪里出了问题。

<div align="center">
  <img src="https://github.com/user-attachments/assets/caf07159-1252-4f09-8a41-daccb7957460" width="600" alt="DOM哨兵" />
</div>

---

### 10. 边缘磁吸收纳
把悬浮球拖到屏幕左右两侧，它会自动吸附进边缘——半隐半现，透明度极低。专注工作时眼不见心不烦，鼠标悬停可预览，拖出来立刻恢复正常。

额度圆环在吸附状态下自动隐藏，彻底消除视觉干扰。
<div align="center">
  <img src="https://github.com/user-attachments/assets/c160910e-3283-4424-b21a-b70a513022da" width="600" alt="边缘磁吸收纳" />
</div>
---

### 11. 全局快捷键
| 快捷键 | 功能 |
|---|---|
| `Ctrl/Cmd + F` | 对话内搜索 |
| `Ctrl/Cmd + /` | 打开提示词库 |
| `Alt + X` | 开关选段导出模式 |
| `Esc` | 关闭所有面板 |

---

## 🛠️ 安装

### 从商店安装
*(即将上线 — 正在等待 Edge 商店审核)*

### 手动加载（开发者模式）
```bash
npm install
npm run build:chrome
```
打开 `chrome://extensions`，开启**开发者模式**，点击**加载已解压的扩展程序**，选择 `dist_chrome` 文件夹。

---

## 📜 开源协议
MIT © LiskaDev

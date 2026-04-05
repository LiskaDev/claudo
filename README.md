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

**Batch selection:** Click turn 6 → hold `Shift` → click turn 20 to select everything in between. Or just hold your mouse down on turn 6 and drag to turn 20 — same result, no keyboard needed.

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
A clean, auto-hiding scrollbar for Claude's conversation history — inspired by DeepSeek's minimal UI. Drag the handle to reposition it vertically so it never blocks important content.

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
| `Shift + Click` | Range-select messages (in export mode) |
| `Esc` | Close any open panel |

---

### 12. Context Gauge
A tiny SVG ring + dot that sits inside the top-right corner of the chat input box.

- **Ring arc** — tracks the *total conversation context* (all messages combined). Green = plenty of room, amber = over 80k tokens, red = over 150k tokens (time to start a new chat). The ring fills to 100% at 200k — Claude's full context window. Think of it as a fuel gauge for the conversation.
- **Centre dot** — tracks the size of your *current message*. Green → amber → red as estimated token count grows (thresholds: 5k / 15k tokens).

Hover for 0.5 s to see a plain-language tooltip: `上下文充裕 🟢 · 放心打字 😃`

No numbers, no jargon — just an instant read on whether the conversation is getting long or whether your current message is too big.

> **Accuracy note:** Token counts are estimated from visible DOM text (CJK ≈ 1 token/char, other ≈ 1 token/3.5 chars). Images, attachments, and collapsed "Show more" content are not counted, so the real context usage is typically 10–30% higher than shown. Thresholds are set conservatively to account for this.

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript 5 |
| Build Tool | Vite 6 + @crxjs/vite-plugin |
| Styling | Tailwind CSS v4 |
| i18n | react-i18next (EN / ZH / ZH-TW) |
| Storage | `chrome.storage.local` via a typed service layer |
| Target | Chrome / Edge (Manifest V3) |

### Extension Process Model

A Chrome extension runs in three separate execution contexts, each with different permissions:

```
┌─────────────────────────────────────────┐
│           Browser (Host)                │
│                                         │
│  ┌──────────────┐  ┌────────────────┐   │
│  │  Background  │  │  Options Page  │   │
│  │  (SW)        │  │  (future)      │   │
│  │  index.ts    │  │  React SPA     │   │
│  └──────┬───────┘  └────────────────┘   │
│         │ chrome.runtime.sendMessage    │
│  ┌──────▼──────────────────────────┐   │
│  │         Content Script          │   │
│  │  Injected into claude.ai tabs   │   │
│  │        index.tsx (entry)        │   │
│  │   ┌─────────────────────────┐   │   │
│  │   │  Shadow DOM (#claudo-   │   │   │
│  │   │  root-host → #__root)   │   │   │
│  │   │  All React UI lives here│   │   │
│  │   └─────────────────────────┘   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Shadow DOM Isolation

The most important architectural decision: **all React UI is mounted inside a Shadow DOM**, not directly into Claude's `<body>`. This achieves two things:

1. **CSS containment** — Claudo's Tailwind styles cannot leak out and break Claude's UI.
2. **Stability** — Claude's own React re-renders cannot touch or unmount Claudo's tree.

The host element injected into Claude's page is `#claudo-root-host`. Inside it lives the Shadow Root, and inside that is `#__root` — the React mount point and the Tailwind dark-mode scope root.

Dark mode is synced by a `MutationObserver` that watches Claude's `<html>` element and mirrors its `class`/`data-theme`/`data-mode` attributes onto `#__root`.

### Source Directory

```
src/
├── constants/
│   └── selectors.ts          # All Claude DOM selectors (single source of truth)
├── locales/
│   ├── en/translation.json
│   ├── zh/translation.json
│   └── zh-TW/translation.json
├── services/
│   ├── i18n.ts               # i18next initialization
│   └── storage.ts            # Typed chrome.storage.local wrapper
├── types/                    # Shared TypeScript interfaces
└── pages/
    ├── background/
    │   └── index.ts          # Service Worker (minimal — message routing)
    ├── options/              # Extension options page (reserved)
    └── content/              # Main content script injected into claude.ai
        ├── index.tsx         # Entry: mounts Shadow DOM, starts MutationObservers
        ├── style.css         # Base styles injected into Shadow Root
        ├── hooks/            # All React custom hooks
        │   ├── useConversations.ts   # Parses Claude's conversation list
        │   ├── useDomHealth.ts       # Monitors DOM selector validity
        │   ├── useDraggable.ts       # FloatBall physics drag logic
        │   ├── useExport.ts          # Export mode state machine
        │   ├── usePromptLibrary.ts   # Prompt CRUD + chrome.storage sync
        │   ├── useSidebarOpen.ts     # Detects Claude sidebar open/close
        │   ├── useTimeline.ts        # Timeline scroll & position state
        │   ├── useWidthControl.ts    # Chat width slider + persistence
        │   ├── useInputCounter.ts    # Input token tracking (paste-aware)
        │   ├── useContextCounter.ts  # Conversation context estimation
        │   └── useInputCounterEnabled.ts  # Toggle state for Context Gauge
        ├── services/         # Content-side service modules
        │   ├── exportExtractors.ts   # Scrapes message DOM → clean data
        │   ├── exportFormatters.ts   # Data → Markdown / TXT strings
        │   ├── advancedExport.ts     # PDF / batch export pipeline
        │   ├── exportTypes.ts        # Shared export TypeScript types
        │   └── storage.ts            # Content-script storage helpers
        ├── utils/
        │   └── dom.ts                # DOM utility helpers
        └── components/
            ├── FloatBall/            # Draggable floating command center
            │   ├── index.tsx         # Main FloatBall component
            │   ├── UsageRings.tsx    # Concentric usage ring renderer
            │   ├── useUsageRings.ts  # Usage data polling hook
            │   ├── panelRegistry.ts  # Panel slot → component mapping
            │   └── panels/
            │       ├── PromptPanel.tsx     # Prompt library UI
            │       ├── WidthPanel.tsx      # Width control slider
            │       ├── LanguagePanel.tsx   # Language switcher
            │       └── ShortcutsPanel.tsx  # Keyboard shortcut reference
            ├── ExportHub/            # Message selection & export UI
            ├── SearchBar/            # In-page search (CSS Custom Highlight API)
            ├── Timeline/             # DeepSeek-style sidebar navigator
            └── InputCounter/         # Context gauge (ring + dot SVG indicator)
```

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

**批量选择：** 点击第 6 轮 → 按住 `Shift` → 点击第 20 轮，中间所有条目一次全选。或者直接在第 6 轮按住鼠标往下拖到第 20 轮松手，效果完全一样，不用碰键盘。

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
参考 DeepSeek 风格重构的自动隐藏历史滚动条。支持上下拖拽调整位置，不会遮挡重要内容。

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
| `Shift + 点击` | 范围选择消息（导出模式下） |
| `Esc` | 关闭所有面板 |

---

### 12. 对话仪表
输入框内部右上角的一个小圆环 + 中心圆点。

- **圆环弧线** — 追踪整个对话的上下文用量（所有消息加在一起）。绿色 = 空间充裕，黄色 = 超过 8 万 token，红色 = 超过 15 万 token（该开新对话了）。圆环在 20 万 token（Claude 的完整上下文窗口）时填满。像汽车的油量表。
- **中心圆点** — 追踪你当前正在输入的消息大小。打字/粘贴越多，颜色从绿变黄变红（阈值：5k / 15k token）。

鼠标悬停 0.5 秒弹出提示：`上下文充裕 🟢 · 放心，这条不长 😃`

不看数字、不看术语——一眼知道对话是不是太长了、这条消息是不是太大了。

> **精度说明：** Token 数量是根据页面可见文字估算的（中日韩字符 ≈ 1 token/字，其他 ≈ 1 token/3.5字符）。图片、附件和被折叠的「显示更多」内容不会被计入，因此实际上下文用量通常比显示值高 10–30%。阈值已做保守设置以弥补这一偏差。

---

## 🏗️ 项目架构

### 技术选型

| 层级 | 技术 |
|---|---|
| UI 框架 | React 19 + TypeScript 5 |
| 构建工具 | Vite 6 + @crxjs/vite-plugin |
| 样式 | Tailwind CSS v4 |
| 国际化 | react-i18next（EN / ZH / ZH-TW）|
| 数据存储 | `chrome.storage.local`（带类型的服务封装层）|
| 目标平台 | Chrome / Edge（Manifest V3）|

### 插件进程模型

Chrome 插件在三个相互隔离的执行上下文中运行，各自拥有不同的权限：

```
┌─────────────────────────────────────────┐
│              浏览器（宿主）              │
│                                         │
│  ┌──────────────┐  ┌────────────────┐   │
│  │  Background  │  │  Options 页面  │   │
│  │  Service     │  │  （预留）      │   │
│  │  Worker      │  │  React SPA     │   │
│  └──────┬───────┘  └────────────────┘   │
│         │ chrome.runtime.sendMessage    │
│  ┌──────▼──────────────────────────┐   │
│  │         Content Script          │   │
│  │      注入到 claude.ai 标签页    │   │
│  │       index.tsx（入口）         │   │
│  │   ┌─────────────────────────┐   │   │
│  │   │  Shadow DOM             │   │   │
│  │   │  #claudo-root-host      │   │   │
│  │   │  → #__root              │   │   │
│  │   │  所有 React UI 都在这里  │   │   │
│  │   └─────────────────────────┘   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Shadow DOM 隔离机制

**最核心的架构决策：所有 React UI 都挂载在 Shadow DOM 内部**，而不是直接注入到 Claude 的 `<body>`。这带来两个关键好处：

1. **CSS 隔离** — Claudo 的 Tailwind 样式不会泄漏出去破坏 Claude 的原生 UI。
2. **稳定性** — Claude 自身的 React 重渲染无法触碰或卸载 Claudo 的 React 树。

注入到 Claude 页面的宿主元素是 `#claudo-root-host`，其内部的 Shadow Root 里挂着 `#__root`——这同时是 React 挂载点和 Tailwind 暗色模式的作用域根节点。

暗色同步方案：通过一个 `MutationObserver` 监听 Claude 的 `<html>` 元素，把 `class`、`data-theme`、`data-mode` 属性实时镜像同步到内部的 `#__root` 上，实现 `dark:` 系列样式的正确触发。

### 源码目录结构

```
src/
├── constants/
│   └── selectors.ts          # 所有 Claude DOM 选择器（唯一数据来源）
├── locales/
│   ├── en/translation.json
│   ├── zh/translation.json
│   └── zh-TW/translation.json
├── services/
│   ├── i18n.ts               # i18next 初始化
│   └── storage.ts            # 带类型的 chrome.storage.local 访问封装
├── types/                    # 共享 TypeScript 接口定义
└── pages/
    ├── background/
    │   └── index.ts          # Service Worker（轻量，仅消息路由）
    ├── options/              # 扩展选项页（预留）
    └── content/              # 注入 claude.ai 的主 Content Script
        ├── index.tsx         # 入口：挂载 Shadow DOM，启动 MutationObserver
        ├── style.css         # 注入 Shadow Root 的基础样式
        ├── hooks/            # 所有 React 自定义 Hook
        │   ├── useConversations.ts   # 解析 Claude 对话列表
        │   ├── useDomHealth.ts       # 监控 DOM 选择器有效性
        │   ├── useDraggable.ts       # 悬浮球物理拖拽逻辑
        │   ├── useExport.ts          # 导出模式状态机
        │   ├── usePromptLibrary.ts   # 提示词 CRUD + storage 同步
        │   ├── useSidebarOpen.ts     # 检测 Claude 侧边栏开关状态
        │   ├── useTimeline.ts        # 时间线滚动与位置状态
        │   ├── useWidthControl.ts    # 宽度滑块 + 持久化
        │   ├── useInputCounter.ts    # 输入 token 追踪（支持粘贴卡片）
        │   ├── useContextCounter.ts  # 对话上下文估算
        │   └── useInputCounterEnabled.ts  # 对话仪表开关状态
        ├── services/         # Content Script 侧服务模块
        │   ├── exportExtractors.ts   # 抓取消息 DOM → 结构化数据
        │   ├── exportFormatters.ts   # 数据 → Markdown / TXT 字符串
        │   ├── advancedExport.ts     # PDF / 批量导出管线
        │   ├── exportTypes.ts        # 导出相关 TypeScript 类型
        │   └── storage.ts            # Content Script 存储辅助函数
        ├── utils/
        │   └── dom.ts                # DOM 工具函数
        └── components/
            ├── FloatBall/            # 可拖拽悬浮控制中心
            │   ├── index.tsx         # 主 FloatBall 组件
            │   ├── UsageRings.tsx    # 同心用量圆环渲染器
            │   ├── useUsageRings.ts  # 用量数据轮询 Hook
            │   ├── panelRegistry.ts  # 面板插槽 → 组件映射表
            │   └── panels/
            │       ├── PromptPanel.tsx     # 提示词库 UI
            │       ├── WidthPanel.tsx      # 宽度控制滑块
            │       ├── LanguagePanel.tsx   # 语言切换器
            │       └── ShortcutsPanel.tsx  # 键盘快捷键参考
            ├── ExportHub/            # 消息选择 & 导出 UI
            ├── SearchBar/            # 对话内搜索（CSS Custom Highlight API）
            ├── Timeline/             # 极简侧边栏时间线导航器
            └── InputCounter/         # 对话仪表（圆环 + 圆点 SVG 指示器）
```

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

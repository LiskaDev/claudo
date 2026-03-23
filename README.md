<div align="center">
  <img src="https://i.imgur.com/your-claudo-logo-placeholder.png" alt="claudo Matrix Orbit" width="200"/>
  <h1>claudo</h1>
  <p><strong>The Ultimate UI Overhaul & Agentic Standalone Framework for Claude.ai</strong></p>
</div>

---

## 🌌 Introduction

**claudo** (Claude + Matrix) is a high-performance, standalone Chrome/Firefox extension engineered to entirely transform the Claude.ai user experience. Moving away from fragile DOM injections and generic aesthetics, claudo establishes an independent, premium visual language and a robust suite of power-user tools natively floating within the Claude interface.

Built by **Alan** & **Antigravity AI**, this project was forked from the legacy "Claude Nexus" and completely reimagined to function as an unapologetic, sovereign productivity engine.

## 🚀 Flagship Modules

### 1. The FloatBall Nexus
A centralized, physics-driven floating widget that serves as the command center for all claudo capabilities. Sporting the custom **Claude AI Sparkle** vector asset and draped in a deep-dark `#18181b` frosted glass aesthetic, the FloatBall ensures all tools are available regardless of how Claude's official UI changes.

### 2. Cherry-Pick Export Engine (V2)
A state-of-the-art export timeline that completely bypasses React virtual-DOM re-rendering pitfalls.
- **Index-Based Tracking:** Pinpoints message selection recursively.
- **Floating Export Dock:** Batch actions for JSON/Markdown dumps.
- **Role Detection:** Automatically identifies `# User` and `# Assistant` boundaries inside complex DOM node ancestors.

### 3. Spatial Typography (Chat Spacing)
Dynamically control the `rem` width of the Claude chat window to optimize cognitive load and paragraph readability, particularly on ultrawide monitors.

### 4. Zero-Friction Prompt Library
Save, copy, and inject your most heavily-used system prompts directly from the FloatBall. Re-engineered to discard redundant titles and enforce a minimalist, action-first "Voyager" design pattern with single-click clipboard injection.

## 🛠 Architecture & Tech Stack

claudo is built with unyielding performance in mind:

- **React 19 & TypeScript:** Strict typing mapped over modern React hooks (`useDraggable`, `useTimeline`).
- **Tailwind CSS v4:** Highly modular, with aggressive resets deliberately stripped (`preflight(none)`) to guarantee zero pollution of Claude’s native interface.
- **Vite (CRXJS):** Lightning-fast HMR and bundling tailored specifically for WebExtension APIs.
- **Lucide Iconography:** Augmented with bespoke, handcrafted inline SVGs perfectly matching Anthropic's brand aesthetics.

## �?Deployment

### Local Development
```bash
# Install critical dependencies
npm install

# Launch Vite HMR Server for Chrome
npm run dev

# Pack the production extension
npm run build
```

*claudo takes full advantage of Chrome Local Storage without demanding invasive telemetry permissions. It strictly targets `https://claude.ai/*`.*

## ⚖️ License & Philosophy
This is an independent enhancement project and holds no affiliation with Anthropic. Designed exclusively for maximizing personal workflow velocity. All intellectual overrides and DOM patches within this repository are the property of the claudo architectural design.

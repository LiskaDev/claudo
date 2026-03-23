<div align="center">
  <img src="public/icon-128.png" width="128" alt="Claudo Shadow Matrix">
  <br />
  <h1>Claudo</h1>
  <p><strong>The Ultimate UI Overhaul & Agentic Standalone Framework for Claude.ai</strong></p>
</div>

---

## 🌍 Introduction

**Claudo** is a high-performance, standalone Chrome/Firefox extension engineered to entirely transform the Claude.ai user experience. Moving away from fragile DOM injections and generic aesthetics, Claudo establishes an independent, premium visual language and a robust suite of power-user tools natively floating within the Claude interface.

Built by **Alan & Antigravity AI**, this project was completely reimagined to function as an unapologetic, sovereign productivity engine.

## 🚀 Flagship Modules

### 1. The FloatBall Nexus
A centralized, physics-driven floating widget that serves as the command center for all Claudo capabilities. Sporting the custom **Claude AI Asterisk** vector asset and draped in a deep-dark `#18181b` frosted glass aesthetic, the FloatBall ensures all tools are available regardless of how Claude's official UI changes.

### 2. Deep WebComponent Isolation
Unlike previous generic extensions, Claudo encapsulates its entire React 19 interface within an impenetrable **Shadow DOM (`attachShadow`)**. This ensures absolutely zero cascading stylesheet bleeding into Claude.ai, while a low-latency `MutationObserver` mirrors Claude's native dark mode switches into the shadow host for pixel-perfect integration.

### 3. Cherry-Pick Export Engine
A state-of-the-art export timeline that bypasses React virtual-DOM pitfalls. Select any conversation nodes and export them cleanly to Markdown or TXT format.

### 4. Seamless Internationalization
A beautifully crafted native Floating Panel language selector, dynamically translating all extension UI elements without ever leaving the webpage or opening an external Chrome popup.

---

## 🛠️ Installation & Build

### Development
```bash
npm install
npm run dev:chrome
```

### Production Build
```bash
npm run build:chrome
```

> **Note:** Load the compiled `dist_chrome` directory directly into Edge/Chrome's `chrome://extensions` via "Load unpacked".

---

## 📜 License
MIT © Alan & Antigravity AI

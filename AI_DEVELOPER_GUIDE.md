# Claudo - AI Developer Guide

> **CRITICAL MUST-READ FOR ANY AI OR DEVELOPER EDITING THIS PROJECT**

## 1. WebComponent (Shadow DOM) Isolation Architecture
This extension operates **entirely within a Shadow DOM**. This prevents Claude.ai's native React DOM from interfering with our UI, and prevents our Tailwind CSS from bleeding out into Claude's UI.
- The host element injected into Claude's `<body>` is `#claudo-root-host`.
- The internal root wrapper tracking Tailwind variants is `#__root` (constant `APP_ROOT_ID` inside the ShadowRoot).

## 2. Tailwind Dark Mode Synchronization
In standard Tailwind, `.dark` cascades from the `html` tag. However, standard CSS selectors **cannot pierce the Shadow DOM boundary**. 
- We implemented a `MutationObserver` in `src/pages/content/index.tsx` that copies `class`, `data-theme`, and `data-mode` from Claude's `<html>` element to our inner `#__root` container.
- Our Tailwind configuration uses a custom variant (`@custom-variant dark`) to trigger whenever a child is inside `.dark` / `[data-mode="dark"]`.

### 🚨 THE MOST COMMON BUG (Portal CSS Failing)
When you use React's `createPortal()` for Tooltips, Modals, or Dropdowns:
**DO NOT** portal to `document.body` or `shadowRoot` directly! If you do, the portal escapes the `.dark` container `#__root`, losing all `dark:bg-xxx` styles!

**CORRECT PORTAL TARGET:**
```tsx
const target = document.getElementById('__root-host')?.shadowRoot?.getElementById('__root') || document.body;
createPortal(<Tooltip />, target);
```

## 3. Core Components
- **FloatBall (`src/components/FloatBall`)**: Physics-enabled UI anchor. Handles dragging and boundaries explicitly to avoid clipping.
- **ExportHub (`src/components/ExportHub`)**: Implements Capture-Phase native click interception to selectively extract Markdown arrays from Claude.
- **Timeline (`src/components/Timeline`)**: A custom DeepSeek-style sidebar history navigator injected. Relies on portal rendering for hover tooltips.

## 4. UI/UX Rules
- **Hover States**: Always use distinct hover states on active elements (`hover:bg-black/5 dark:hover:bg-white/5`).
- **Contrast**: In Dark Mode, avoid `#FFFFFF` for backgrounds. Use `zinc-800` for panels, `zinc-700` for tooltips/dropdowns (elevation), and `zinc-100` / `zinc-300` for text visibility.
- **Design Language**: Stick strictly to Tailwind primitives avoiding arbitrary hex values unless recreating a specific brand color (e.g., `#D97757` for the Claude accent).

## 5. CSS Selectors (DOM Polling)
Because Claude.ai frequently shifts its UI, **DO NOT HARDCODE ANY CLAUDE NATIVE SELECTORS** in components or hooks (e.g., `[data-test-render-count]`, `div.font-claude-message`).
- **Always** pull them from the single source of truth: `src/constants/selectors.ts`. 
- If you need a new selector, define it there and export it.

## 6. Chrome Extension Context Invalidation (Data Safety)
When this extension updates in the background, the injected Content Script becomes "orphaned" and loses connection to `chrome.storage.local`.
- If an orphaned script tries to read from storage, it will fail. **DO NOT** assume the user's data array is empty (`[]`). If you overwrite it with new data while disconnected, you will trigger catastrophic data loss.
- Always check `!chrome?.runtime?.id` before rendering crucial UI arrays (like `PromptPanel.tsx` or `ExportHub`), and if disconnected, politely lock the UI and instruct the user to hit F5 to reconnect.

## 7. Mandatory Internationalization (i18n)
This extension strictly supports dual-language operation (English & Chinese). 
**NEVER HARDCODE UI STRINGS IN REACT COMPONENTS.**
- If you create a new tooltip, a new FloatBall menu, an alert, or any visible text snippet, it **must** be implemented using `react-i18next`.
- You **must** populate `src/locales/zh/translation.json` AND `src/locales/en/translation.json` concurrently in the exact same commit.
- Any un-translated Chinese literal pushed to production is considered a critical failure. Always wrap text in `useTranslation().t()`.

## 8. Store Deployment & Versioning Protocol
When the user requests to package the extension for the Edge/Chrome extension store, **do not manually zip the source folder**. You must execute the full build pipeline:
1. **Version Bump**: Update `"version"` in both `package.json` and `manifest.json`.
2. **Build**: Run `npm run build:chrome` to compile all `.tsx` and `.ts` React files into the native `dist_chrome/` output folder.
3. **Archive**: Use PowerShell to compress the build artifacts into a clean `.zip` file for the user to upload (ensuring `.vite` manifest caches are purged to prevent Edge Store validation failures):
   `Remove-Item -Recurse -Force dist_chrome\.vite -ErrorAction SilentlyContinue; Compress-Archive -Path "dist_chrome\*" -DestinationPath "claudo_vX.X.X.zip" -Force`

## 9. SPA Navigation Survival Pattern
Claude.ai is a React SPA. When users switch conversations, the URL changes but the page is **not reloaded**. Any hook that uses a one-time `useEffect` to attach to a DOM element will be orphaned after navigation.

**Required pattern for hooks that attach to Claude's native DOM elements:**
```ts
// Poll every 500ms to detect element replacement after SPA navigation
const poll = () => {
  const el = document.querySelector(MY_SELECTOR);
  if (el instanceof HTMLElement) {
    attach(el);   // idempotent: no-op if same element
  } else if (currentEl) {
    detach();     // clear state when element disappears
  }
};
poll();
const intervalId = window.setInterval(poll, 500);
return () => { window.clearInterval(intervalId); detach(); };
```
This pattern is used in `useInputCounter.ts` and `useContextCounter.ts`. Do **not** use a one-time attach with a fallback `MutationObserver` on `document.body` — it will silently break on navigation.

## 10. Input Load Indicator Architecture
The input indicator (`src/pages/content/components/InputCounter/`) is a **two-dimensional** indicator rendered as a fixed-position SVG inside the Shadow DOM.

| Dimension | Visual | Hook | Trigger |
|---|---|---|---|
| Current message size | Ring arc (stroke dashoffset) | `useInputCounter` | Every keystroke (via `input` event + MutationObserver) |
| Total context size | Centre dot colour | `useContextCounter` | Only when new messages arrive (childList MutationObserver) |

**Performance contract:**
- `useInputCounter`: throttled with `requestAnimationFrame` — at most 1 DOM read per frame during typing.
- `useContextCounter`: scans all message `textContent` only when `childList` changes on the scroll container, **not on every keystroke**.
- Both hooks use the 500ms interval SPA survival pattern (§9).

**Token estimation** (`estimateTokens`): CJK characters ≈ 1 token each; remaining ≈ 1 per 3.5 chars. Accuracy ±15%. DOM-only scan underestimates by ~10-30% (images/attachments not counted). Thresholds are intentionally conservative to avoid false alarms.

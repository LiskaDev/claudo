---
name: DeepSeek Style Timeline UI
description: A set of strict CSS and React component guidelines for replicating the highly dense, micro-indexed, and smoothly expanding auto-hiding scrollbar side panel UI seen in DeepSeek's chat history timeline.
---

# DeepSeek Timeline UI Guide

When instructed to create a "DeepSeek Timeline" or "DeepSeek style sidebar", study the `examples/Timeline.tsx` implementation carefully and adhere to the following strict layout and UX rules:

## 1. Vertical Density
- **Row Height:** Use extremely compact rows. Set `min-h-[26px]` and `my-px` (1px margin top/bottom) yielding a mathematically dense 28px total item footprint.
- **Micro Typography:** Use `text-[12px]` to reduce the visual weight of the text labels, keeping them firmly in "indexer/auxiliary" territory.

## 2. The Anchor Lines (Dashes)
- **Geometry:** Horizontal anchor lines should be thin and slightly elongated (`w-[14px] h-[1.5px]`), forming a clean ragged-left border via `justify-end`.
- **Spacing:** The text label ellipsis must hug the anchor line closely (`mr-2` or max 8px distance).

## 3. Monochromatic Active States
- **Accent Colors (The Dash):** It is highly recommended to use a sophisticated Signature Brand Color (like DeepSeek Blue or Claude Terracotta) for the active timeline node indicator (the minimal horizontal dash).
- **Monochrome Block Backgrounds:** While the dash itself can be a vibrant brand color, keep the expanded hover/active container blocks (the background behind the dense text) strictly monochrome (e.g., `bg-white/10` or `bg-zinc-200`) to ensure the UI remains uncluttered.
   > **⚠️ Critical Brand-Color Implementation Nuances:**
   > - **Light & Dark Contextual Tuning:** Deploy raw brand colors (e.g., `bg-blue-600` or `bg-orange-600`) for light mode dashes, but artificially **brighten them** in dark mode (e.g., `bg-blue-400`) to guarantee razor-sharp legibility without muddy bleeding against dark canvases.
   > - **Background Segregation:** Even with an active brand color dash, the underlying container block MUST remain an inert neutral gray (e.g., `bg-zinc-200/80` or `bg-white/10`), preemptively voiding any aggressive color clashes.
   > - **Visual Hierarchy Protection:** Calibrate the horizontal dash's footprint (transparency and contrast) carefully. Its vibrant saturation must serve purely as a passive anchor, legally prohibited from stealing the focal gravity from the actual dense typography.
- **Inactive Dashes:** Keep inactive dashes heavily muted (`bg-white/20` in dark mode) so they don't fight with the dense text.

## 4. DOM-Level Scrollbar Auto-Hide (Critical UX)
- Never rely on CSS pseudo-hovers to hide the scroll container width. DeepSeek natively removes the scrollbar when collapsed.
- Toggle scroll overflow explicitly from the React component state:
  ```tsx
  className={isExpanded ? 'overflow-y-auto' : 'overflow-y-hidden'}
  ```
- This guarantees that native OS scrollbars (typically 16px wide) never overlap or clip menus during the tightly contracted state (e.g. 32px width).

## 5. Overlay Scrollbar Styling
- Explicitly inject an inline `<style>` tag into the React component overriding Webkit scrollbars. This is heavily preferred over Tailwind arbitrary pseudo-class extensions which may strip out native fallback resets in complex Chromium environments.
- **Thumb Dimensions:** Force `width: 4px` and native rounded corners (`border-radius: 4px`).
- **Nuke Buttons:** Add explicit `display: none` to `::-webkit-scrollbar-button` and `::-webkit-scrollbar-corner` to rigorously prevent Windows OS from injecting up/down polygon arrows.
- **Track Default:** Ensure track is `background: transparent;` so the 4px pill floats natively like macOS overlays.

## 6. Instant Scroll Navigation
- DeepSeek prioritizes speed over sluggish cinematic scrolling when fetching extremely long histories.
- Do not use `behavior: 'smooth'` for jumping between historical chat nodes. The navigation must be crisp and instantaneous (`behavior: 'instant'`). 
###  架构进阶（高级特性增强）
除了核心的 UI 设计，该 Skill 还被强化了最严苛的前端架构：
1. **渲染把控 (Event Loop & LayoutReflow)**：放弃平庸的 useEffect，采用 useLayoutEffect 层叠加宽强制的**双缓存重绘帧缓冲区 
equestAnimationFrame**，确保滚动动画仅在页面完全重排计算完毕后触发，从物理级别断绝高度抓错闪跳。
2. **极客级无障碍辅助支持 (Native A11y)**：不仅仅是视觉，代码完全贯彻了 W3C 的 WAI-ARIA 隐形标识体系。手动对齐拦截键盘流：注入 
ole="button"、
ole="navigation" 与最核心的 	abIndex={0} 焦点链，并通过 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') }} 手写键盘回车事件，赋予纯 <div> 原生按钮的完整尊严。
3. **隔离式复现 (Memoization Rendering)**：以 useMemo 缓存机制接管动态拼接的大段字符串（如 linear-gradient 的坐标更新掩码），切断 React 对深层字面量的滥用重绘链路。



   > ** Advanced A11y & CSS Tokenization (Hardening):**
   > - **Forced-Colors Media Query:** For maximum robustness in WCAG AAA compliance, any brand-colored dashes MUST gracefully degrade to pure system-defined high-contrast colors when `@media (forced-colors: active)` is detected. This ensures visually impaired users utilizing OS-level high-contrast themes are not blocked by CSS-forced brand pastels.
   > - **CSS Variable Standardization:** Avoid hardcoding literal hex values (e.g., `bg-[#D97757]`) directly in the DOM array map. Inject scoped CSS variables (e.g., `--brand-accent`) within the parent container's inline styles or global `:root`. This unlocks instant cross-theme scaling, empowering `className="bg-[var(--brand-accent)]"` to automatically adapt without brittle search-and-replace.

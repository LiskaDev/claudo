import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { exportStore, useExportStore } from './store';
import ExportDock from './ExportDock';

import { MESSAGE_RENDER_WRAPPER_SELECTOR } from '@src/constants/selectors';

export const CLAUDE_SELECTORS = {
  // Aliased to central configs preventing brittle hardcoded DOM matching
  messageNode: MESSAGE_RENDER_WRAPPER_SELECTOR,
};

// Module-level variables persist across re-renders for Shift+click and drag state.
let lastClickedIndex = -1;
let isDragging = false;
let dragStartIndex = -1;
let dragStartState = false; // true = drag-selects, false = drag-deselects
let dragCurrentIndex = -1;
let dragMoved = false; // true once drag enters a node different from start

const idToIndex = (id: string) => parseInt(id.replace('cherry-msg-', ''), 10);

export default function ExportHub() {
  const store = useExportStore();

  useEffect(() => {
    if (!store.isSelectionMode) {
      // Complete Sanitizer step ONLY when completely exiting Selection Mode.
      document.body.classList.remove('cherry-pick-mode');
      document.querySelectorAll('[data-cherry-selected]').forEach(n => n.removeAttribute('data-cherry-selected'));
      document.querySelectorAll('[data-cherry-id]').forEach(n => n.removeAttribute('data-cherry-id'));
      // Reset all interaction state
      lastClickedIndex = -1;
      isDragging = false;
      dragStartIndex = -1;
      dragCurrentIndex = -1;
      dragMoved = false;
      document.body.style.userSelect = '';
      return;
    }

    // Attach master active class to trigger global CSS override layer
    document.body.classList.add('cherry-pick-mode');

    // Assign IDs to native DOM blocks
    const syncDOM = () => {
      const nodes = document.querySelectorAll(CLAUDE_SELECTORS.messageNode);
      nodes.forEach((node, idx) => {
        const id = `cherry-msg-${idx}`;
        if (!node.hasAttribute('data-cherry-id')) {
          node.setAttribute('data-cherry-id', id);
        }
        if (store.selectedIds.has(id)) {
          node.setAttribute('data-cherry-selected', 'true');
        } else {
          node.removeAttribute('data-cherry-selected');
        }
      });
    };
    syncDOM();

    // High-performance Capture-Phase click interceptor preventing Claude hooks from misfiring.
    // Supports Shift+click range selection and suppresses the synthetic click fired after a drag.
    const handleClick = (e: MouseEvent) => {
      const path = e.composedPath() as HTMLElement[];
      const isInsideDock = path.some(n => n.nodeType === 1 && n.classList?.contains('export-dock-container'));
      if (isInsideDock) return;

      const target = e.target as HTMLElement;
      const node = target.closest(CLAUDE_SELECTORS.messageNode);

      if (node) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Suppress the browser's synthetic click that fires after a multi-node drag
        if (dragMoved) {
          dragMoved = false;
          return;
        }

        const id = node.getAttribute('data-cherry-id');
        if (id) {
          const currentIdx = idToIndex(id);
          if (e.shiftKey && lastClickedIndex !== -1) {
            // Shift+click: toggle the entire range; anchor stays at lastClickedIndex
            exportStore.toggleRange(lastClickedIndex, currentIdx);
          } else {
            exportStore.toggleId(id);
            lastClickedIndex = currentIdx;
          }
        }
      } else {
        // Block all empty space clicks during selection mode!
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    // Drag brush: record start node and desired state on mousedown
    const handleMouseDown = (e: MouseEvent) => {
      const path = e.composedPath() as HTMLElement[];
      const isInsideDock = path.some(n => n.nodeType === 1 && n.classList?.contains('export-dock-container'));
      if (isInsideDock) return;

      const node = (e.target as HTMLElement).closest(CLAUDE_SELECTORS.messageNode);
      if (!node) return;

      const id = node.getAttribute('data-cherry-id');
      if (!id) return;

      isDragging = true;
      dragMoved = false;
      dragStartIndex = idToIndex(id);
      dragCurrentIndex = dragStartIndex;
      // Dragging from a selected item deselects; from unselected selects
      dragStartState = !exportStore.getSnapshot().selectedIds.has(id);
      document.body.style.userSelect = 'none';
    };

    // Drag brush: extend selection as pointer moves over new nodes
    const handleMouseOver = (e: MouseEvent) => {
      if (!isDragging) return;
      const node = (e.target as HTMLElement).closest(CLAUDE_SELECTORS.messageNode);
      if (!node) return;
      const id = node.getAttribute('data-cherry-id');
      if (!id) return;
      const currentIdx = idToIndex(id);
      if (currentIdx === dragCurrentIndex) return; // No new node entered
      dragCurrentIndex = currentIdx;
      dragMoved = true;
      exportStore.setRangeState(dragStartIndex, currentIdx, dragStartState);
    };

    // Drag brush: end drag and restore text selection
    const handleMouseUp = () => {
      isDragging = false;
      document.body.style.userSelect = '';
    };

    // Third parameter 'true' forces execution in the DOM capture phase!
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [store.isSelectionMode, store.selectedIds]); // Re-syncs attribute bindings strictly upon state mutation

  return (
    <>
      <CustomStyle />
      {store.isSelectionMode && (
        <div className="export-dock-container relative z-[99999]">
          <ExportDock />
        </div>
      )}
    </>
  );
}

function CustomStyle() {
  return createPortal(
    <style>{`
      /* Phase 2: Cherry-Pick Dimmer & Hardware Accel Toggles */
      body.cherry-pick-mode::before {
        content: "";
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.15);
        z-index: 99990;
        pointer-events: none;
        transition: background 0.3s ease;
      }
      html.dark body.cherry-pick-mode::before {
        background: rgba(0,0,0,0.6);
      }
      
      body.cherry-pick-mode [data-test-render-count] {
        cursor: pointer !important;
        position: relative !important;
        z-index: 99991 !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 12px;
      }
      
      /* Pure CSS Checkbox Injection via Pseudo Element */
      body.cherry-pick-mode [data-test-render-count]::after {
        content: "";
        position: absolute;
        top: 12px;
        right: 12px;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        border: 2px solid #a1a1aa;
        background: white;
        opacity: 0;
        transform: scale(0.9);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 99992;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      html.dark body.cherry-pick-mode [data-test-render-count]::after {
        background: #27272a;
        border-color: #52525b;
      }

      /* Hover States */
      body.cherry-pick-mode [data-test-render-count]:hover {
        box-shadow: 0 0 0 2px #3b82f6 !important;
        background-color: rgba(59, 130, 246, 0.05) !important;
      }
      body.cherry-pick-mode [data-test-render-count]:hover::after {
        opacity: 1;
        transform: scale(1);
      }

      /* Active Selected States (Green Theme Checkmark) */
      body.cherry-pick-mode [data-test-render-count][data-cherry-selected="true"] {
        box-shadow: 0 0 0 2px #10b981 !important;
        background-color: rgba(16, 185, 129, 0.08) !important;
      }
      body.cherry-pick-mode [data-test-render-count][data-cherry-selected="true"]::after {
        opacity: 1;
        transform: scale(1);
        background: #10b981;
        border-color: #10b981;
      }
      
      /* W3C CSS Checkmark Hack */
      body.cherry-pick-mode [data-test-render-count][data-cherry-selected="true"]::before {
        content: "";
        position: absolute;
        top: 16px;
        right: 19px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        z-index: 99993;
      }

      /* ========================================================================= */
      /* 全局暗黑模式修复：原生/第三方 Tooltip 白底遮罩修复 */
      /* ========================================================================= */
      /* 1. 修复原生浏览器悬停提示（title 属性）发白 */
      html.dark, 
      html[data-mode="dark"], 
      html[data-theme="dark"] {
        color-scheme: dark;
      }

      /* 2. 修复 Claude官方或第三方库（如 Radix UI / Tippy 等）脱离文档流的自定义 DOM 弹出气泡发白 */
      html.dark [data-radix-popper-content-wrapper] > div,
      html.dark [role="tooltip"],
      html.dark .tippy-box {
        background-color: rgb(39, 39, 42) !important;
        color: rgb(212, 212, 216) !important;
        border: 1px solid rgb(63, 63, 70) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
      }

      /* 修复悬停气泡小箭头的内部填充色防漏黑底白牙 */
      html.dark [data-radix-popper-content-wrapper] svg > polygon,
      html.dark [data-radix-popper-content-wrapper] svg path,
      html.dark [role="tooltip"] svg > polygon,
      html.dark [role="tooltip"] svg path,
      html.dark .tippy-arrow::before {
        fill: rgb(39, 39, 42) !important;
        color: rgb(39, 39, 42) !important;
      }
    `}</style>,
    document.head
  );
}

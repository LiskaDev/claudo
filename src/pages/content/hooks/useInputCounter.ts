/**
 * useInputCounter.ts
 * Tracks Claude chat input content and exposes character/token counts.
 * Creates a portal container on document.body with position:fixed so the
 * gauge ring escapes the input fieldset's layout flow and stays put across
 * DOM changes (e.g. "model unavailable" toasts).
 * Re-attaches on SPA navigation.
 *
 * Two sources of content:
 *  1. Typed text — read from el.innerText on every change.
 *  2. PASTED cards — Claude collapses large pastes into cards outside the
 *     editable div. We capture exact clipboard data on paste and store it
 *     in a Map keyed by line count. On each frame, we scan the fieldset
 *     for live PASTED cards, extract line count from aria-label, and look
 *     up the matching clipboard data. Cards that have been deleted simply
 *     stop matching, so their chars/tokens are no longer included.
 *
 * Created: 2026-04-04
 * Updated: 2026-06-13 — portal container moved to document.body, position:fixed.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CHAT_INPUT_SELECTOR,
  CHAT_INPUT_FIELDSET_SELECTOR,
  PASTED_CARD_SELECTOR,
} from '@src/constants/selectors';
import {
  PASTED_LINES_RE,
  savePasteMap,
  loadPasteMap,
  clearPasteStorage,
  usePasteDataMap,
} from './usePasteTracker';

/** Must stay in sync with RING_SIZE in InputCounter/index.tsx. */
export const GAUGE_SIZE_PX = 18;
/** Right-offset from the fieldset edge (same as original absolute positioning). */
export const DEFAULT_RIGHT_OFFSET = 20;
/** Top-offset from the fieldset edge. */
export const DEFAULT_TOP_OFFSET = 8;

/** Position expressed relative to the fieldset's top-right corner, not an absolute page coordinate. */
export interface GaugeOffset {
  offsetRight: number;
  offsetTop: number;
}

const DEFAULT_OFFSET: GaugeOffset = {
  offsetRight: DEFAULT_RIGHT_OFFSET + GAUGE_SIZE_PX,
  offsetTop: DEFAULT_TOP_OFFSET,
};

/** Minimum fieldset position delta (px) before the poll fallback re-applies the gauge position. */
const POSITION_DRIFT_THRESHOLD_PX = 1;

export interface InputCounterState {
  chars: number;
  tokens: number;
  /** Container element on document.body (position:fixed). Use with createPortal. */
  portalTarget: HTMLElement | null;
  /** Sets the gauge's offset from the fieldset's top-right corner and repositions it immediately. */
  setOffset: (offset: GaugeOffset) => void;
  /** Restores the default top-right-corner offset and repositions the gauge immediately. */
  resetOffset: () => void;
  /** Current bounding rect of the chat input fieldset, or null if not attached. */
  getFieldsetRect: () => DOMRect | null;
}

const EMPTY_STATE: Omit<InputCounterState, 'setOffset' | 'resetOffset' | 'getFieldsetRect'> = {
  chars: 0,
  tokens: 0,
  portalTarget: null,
};

/**
 * Token estimator for mixed CJK + Latin text.
 * CJK ≈ 1 token each; remaining ≈ 1 per 3.5 chars.
 */
export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  const cjk = (text.match(/[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/g) ?? []).length;
  const rest = text.length - cjk;
  return Math.max(1, Math.round(cjk + rest / 3.5));
};

export const useInputCounter = (): InputCounterState => {
  const [state, setState] = useState(EMPTY_STATE);

  const rafRef = useRef<number>(0);
  const inputElRef = useRef<HTMLElement | null>(null);
  const moRef = useRef<MutationObserver | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const fieldsetRoRef = useRef<ResizeObserver | null>(null);
  /** Last-seen fieldset top/left, used by the poll fallback to detect pure-position moves. */
  const lastFieldsetRectRef = useRef<{ left: number; top: number } | null>(null);
  /** Current gauge offset from the fieldset's top-right corner (default until restored/dragged). */
  const offsetRef = useRef<GaugeOffset>(DEFAULT_OFFSET);
  /** Latest applyPosition()/getFieldsetRect() closures, assigned inside the effect below so the
   *  stable callbacks exposed to consumers always call the current attach/detach cycle's logic. */
  const applyPositionRef = useRef<() => void>(() => {});
  const getFieldsetRectRef = useRef<() => DOMRect | null>(() => null);

  const pasteDataMap = usePasteDataMap();
  const portalRef = useRef<HTMLElement | null>(null);

  const setOffset = useCallback((offset: GaugeOffset) => {
    offsetRef.current = offset;
    applyPositionRef.current();
  }, []);

  const resetOffset = useCallback(() => {
    offsetRef.current = DEFAULT_OFFSET;
    applyPositionRef.current();
  }, []);

  const getFieldsetRect = useCallback((): DOMRect | null => getFieldsetRectRef.current(), []);

  useEffect(() => {
    /** Resolves the fieldset element currently wrapping the attached input, if any. */
    const getFieldsetEl = (): HTMLElement | null => {
      const el = inputElRef.current;
      if (!el) return null;
      const fieldset = el.closest(CHAT_INPUT_FIELDSET_SELECTOR);
      return fieldset instanceof HTMLElement ? fieldset : null;
    };

    /**
     * Recomputes the gauge's fixed position from the fieldset's current bounding
     * rect plus the active offset, clamps it into the viewport, and writes it
     * directly to the portal container's style. Called on attach, whenever the
     * fieldset resizes/moves, and whenever the offset itself changes (restore,
     * drag-end, reset).
     */
    const applyPosition = () => {
      const fieldset = getFieldsetEl();
      const portal = portalRef.current;
      if (!fieldset || !portal) return;

      const rect = fieldset.getBoundingClientRect();
      const { offsetRight, offsetTop } = offsetRef.current;
      const rawLeft = rect.right - offsetRight;
      const rawTop = rect.top + offsetTop;
      const left = Math.max(0, Math.min(rawLeft, window.innerWidth - GAUGE_SIZE_PX));
      const top = Math.max(0, Math.min(rawTop, window.innerHeight - GAUGE_SIZE_PX));

      portal.style.left = `${left}px`;
      portal.style.top = `${top}px`;
      lastFieldsetRectRef.current = { left: rect.left, top: rect.top };
    };
    applyPositionRef.current = applyPosition;
    getFieldsetRectRef.current = () => getFieldsetEl()?.getBoundingClientRect() ?? null;

    /**
     * Reads the current input element's text content and scans for PASTED cards.
     * Combines both sources into a single {chars, tokens} state update.
     * Called on every requestAnimationFrame when input changes are detected.
     */
    const readInput = () => {
      const el = inputElRef.current;
      if (!el) return;

      const typedText = (el.innerText ?? el.textContent ?? '').trim();
      const typedChars = typedText.length;
      const typedTokens = typedChars === 0 ? 0 : estimateTokens(typedText);

      // ── Sum up PASTED cards by looking up each card's line count in our map ─
      const fieldset = el.closest(CHAT_INPUT_FIELDSET_SELECTOR);
      const pastedCards = fieldset
        ? Array.from(fieldset.querySelectorAll<HTMLElement>(PASTED_CARD_SELECTOR))
        : [];

      let pastedChars = 0;
      let pastedTokens = 0;

      if (pastedCards.length > 0) {
        for (const card of pastedCards) {
          const ariaLabel = card.getAttribute('aria-label') ?? '';
          const lineMatch = ariaLabel.match(PASTED_LINES_RE);
          if (lineMatch) {
            const lineCount = parseInt(lineMatch[1].replace(/,/g, ''), 10);
            const data = pasteDataMap.current.get(lineCount);
            if (data) {
              pastedChars += data.chars;
              pastedTokens += data.tokens;
            }
            // No fallback: if we don't have exact clipboard data (e.g. after
            // page refresh), we skip the card rather than guessing wrong.
          }
        }
      } else {
        // No PASTED cards in DOM → clean up the map and storage
        pasteDataMap.current.clear();
        clearPasteStorage();
      }

      setState({
        chars: typedChars + pastedChars,
        tokens: typedTokens + pastedTokens,
        portalTarget: portalRef.current,
      });
    };

    const scheduleUpdate = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        readInput();
      });
    };

    // ── paste event: capture full clipboard text before Tiptap folds it ──────
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain') ?? '';
      if (text.length > 0) {
        const lineCount = text.split('\n').length;
        pasteDataMap.current.set(lineCount, {
          chars: text.length,
          tokens: estimateTokens(text),
        });
        savePasteMap(pasteDataMap.current);
      }
      scheduleUpdate();
    };

    /**
     * Removes all event listeners, observers, and the portal container.
     * Resets state to EMPTY. Called when navigating away or when the input
     * element disappears from the DOM.
     */
    const detach = () => {
      const el = inputElRef.current;
      if (el) {
        el.removeEventListener('input', scheduleUpdate);
        el.removeEventListener('paste', handlePaste as EventListener, { capture: true });
      }
      moRef.current?.disconnect(); moRef.current = null;
      roRef.current?.disconnect(); roRef.current = null;
      fieldsetRoRef.current?.disconnect(); fieldsetRoRef.current = null;
      lastFieldsetRectRef.current = null;
      // Remove portal container from document.body
      if (portalRef.current) {
        portalRef.current.remove();
        portalRef.current = null;
      }
      inputElRef.current = null;
      pasteDataMap.current.clear();
      setState(EMPTY_STATE);
    };

    /**
     * Binds event listeners, observers, and the portal container to the given
     * chat input element. Idempotent: no-op if already attached to the same el.
     * Called by the 500ms SPA navigation poll loop.
     */
    const attach = (el: HTMLElement) => {
      if (inputElRef.current === el) return;
      detach();

      // Restore paste data from sessionStorage (survives page refresh)
      loadPasteMap(pasteDataMap.current);

      inputElRef.current = el;

      // ── Create portal container on document.body with position:fixed ──
      // Position is computed by applyPosition() from the fieldset rect + the
      // active offset (default, or the user's last dragged/restored offset).
      const fieldset = el.closest(CHAT_INPUT_FIELDSET_SELECTOR);
      if (fieldset instanceof HTMLElement) {
        const container = document.createElement('div');
        container.setAttribute('data-claudo-gauge', 'true');
        container.style.cssText = `position:fixed;z-index:9999;pointer-events:auto;`;
        document.body.appendChild(container);
        portalRef.current = container;
        applyPosition();

        // Keep the gauge glued to the fieldset's top-right corner as it
        // resizes (e.g. preview panel opening/closing/dragging).
        fieldsetRoRef.current = new ResizeObserver(applyPosition);
        fieldsetRoRef.current.observe(fieldset);
      }

      el.addEventListener('input', scheduleUpdate);
      el.addEventListener('paste', handlePaste as EventListener, { capture: true });

      // MutationObserver on the fieldset (contains both editable div and PASTED cards)
      const container = el.closest(CHAT_INPUT_FIELDSET_SELECTOR) ?? el.parentElement;
      moRef.current = new MutationObserver(scheduleUpdate);
      moRef.current.observe(el, { childList: true, subtree: true, characterData: true });
      if (container && container !== el) {
        moRef.current.observe(container, { childList: true, subtree: true });
      }

      roRef.current = new ResizeObserver(scheduleUpdate);
      roRef.current.observe(el);

      scheduleUpdate();
    };

    // ── Poll every 500 ms to survive SPA navigation ──────────────────────────
    const poll = () => {
      const el = document.querySelector(CHAT_INPUT_SELECTOR);
      if (el instanceof HTMLElement) {
        attach(el);

        // ResizeObserver only fires on width/height changes. A fieldset that
        // keeps its size but moves (e.g. welcome-page centered input ↔
        // bottom-docked input) needs this position-only diff check instead.
        const fieldset = getFieldsetEl();
        if (fieldset) {
          const rect = fieldset.getBoundingClientRect();
          const last = lastFieldsetRectRef.current;
          const moved =
            !last ||
            Math.abs(rect.left - last.left) > POSITION_DRIFT_THRESHOLD_PX ||
            Math.abs(rect.top - last.top) > POSITION_DRIFT_THRESHOLD_PX;
          if (moved) applyPosition();
        }
      } else if (inputElRef.current) {
        detach();
      }
    };

    poll();
    const intervalId = window.setInterval(poll, 500);

    return () => {
      window.clearInterval(intervalId);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      detach();
    };
  }, []);

  return { ...state, setOffset, resetOffset, getFieldsetRect };
};
/**
 * useInputCounter.ts
 * Tracks Claude chat input content and exposes character/token counts.
 * Creates a portal container inside the fieldset for stable positioning.
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
 */

import { useEffect, useRef, useState } from 'react';
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

export interface InputCounterState {
  chars: number;
  tokens: number;
  /** Container element appended inside the fieldset. Use with createPortal. */
  portalTarget: HTMLElement | null;
}

const EMPTY_STATE: InputCounterState = { chars: 0, tokens: 0, portalTarget: null };

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
  const [state, setState] = useState<InputCounterState>(EMPTY_STATE);

  const rafRef = useRef<number>(0);
  const inputElRef = useRef<HTMLElement | null>(null);
  const moRef = useRef<MutationObserver | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  const pasteDataMap = usePasteDataMap();
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
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
      // Remove portal container from Claude's DOM
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

      // ── Create portal container inside the fieldset ──────────────────────
      const fieldset = el.closest(CHAT_INPUT_FIELDSET_SELECTOR);
      if (fieldset instanceof HTMLElement) {
        // Ensure fieldset is a containing block for absolute positioning
        const computed = window.getComputedStyle(fieldset);
        if (computed.position === 'static') {
          fieldset.style.position = 'relative';
        }
        const container = document.createElement('div');
        container.setAttribute('data-claudo-gauge', 'true');
        container.style.cssText = 'position:absolute;top:8px;right:20px;z-index:9999;pointer-events:auto;';
        fieldset.appendChild(container);
        portalRef.current = container;
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

  return state;
};

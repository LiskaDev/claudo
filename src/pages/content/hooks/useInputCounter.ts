/**
 * useInputCounter.ts
 * Tracks Claude chat input content and exposes character/token counts
 * plus the input element's DOMRect. Re-attaches on SPA navigation.
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
import { CHAT_INPUT_SELECTOR } from '@src/constants/selectors';

export interface InputCounterState {
  chars: number;
  tokens: number;
  rect: DOMRect | null;
}

const EMPTY_STATE: InputCounterState = { chars: 0, tokens: 0, rect: null };

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

/** Regex to extract line count from PASTED card aria-label, e.g. "pasted, 361 lines" */
const PASTED_LINES_RE = /(\d[\d,]*)\s*line/;

/** sessionStorage key for persisting paste data across page refreshes */
const PASTE_STORAGE_KEY = 'claudo_paste_data';

function savePasteMap(map: Map<number, { chars: number; tokens: number }>) {
  try {
    const obj: Record<string, { chars: number; tokens: number }> = {};
    map.forEach((v, k) => { obj[k] = v; });
    sessionStorage.setItem(PASTE_STORAGE_KEY, JSON.stringify(obj));
  } catch { /* quota exceeded or disabled — ignore */ }
}

function loadPasteMap(map: Map<number, { chars: number; tokens: number }>) {
  try {
    const raw = sessionStorage.getItem(PASTE_STORAGE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw) as Record<string, { chars: number; tokens: number }>;
    for (const [k, v] of Object.entries(obj)) {
      map.set(parseInt(k, 10), v);
    }
  } catch { /* corrupted data — ignore */ }
}

function clearPasteStorage() {
  try { sessionStorage.removeItem(PASTE_STORAGE_KEY); } catch { /* ignore */ }
}

export const useInputCounter = (): InputCounterState => {
  const [state, setState] = useState<InputCounterState>(EMPTY_STATE);

  const rafRef     = useRef<number>(0);
  const inputElRef = useRef<HTMLElement | null>(null);
  const moRef      = useRef<MutationObserver | null>(null);
  const roRef      = useRef<ResizeObserver | null>(null);

  // Per-paste clipboard data, keyed by line count (extracted from clipboard text).
  // When readInput scans the DOM for PASTED cards, it extracts line count from
  // each card's aria-label and looks up the matching entry here.
  const pasteDataMap = useRef<Map<number, { chars: number; tokens: number }>>(new Map());

  useEffect(() => {
    // ── Compute and publish the latest counts ────────────────────────────────
    const readInput = () => {
      const el = inputElRef.current;
      if (!el) return;

      const typedText   = (el.innerText ?? el.textContent ?? '').trim();
      const typedChars  = typedText.length;
      const typedTokens = typedChars === 0 ? 0 : estimateTokens(typedText);

      // ── Sum up PASTED cards by looking up each card's line count in our map ─
      const fieldset = el.closest('fieldset');
      const pastedCards = fieldset
        ? Array.from(fieldset.querySelectorAll<HTMLElement>('button[aria-label*="Pasted Text"]'))
        : [];

      let pastedChars  = 0;
      let pastedTokens = 0;

      if (pastedCards.length > 0) {
        for (const card of pastedCards) {
          const ariaLabel = card.getAttribute('aria-label') ?? '';
          const lineMatch = ariaLabel.match(PASTED_LINES_RE);
          if (lineMatch) {
            const lineCount = parseInt(lineMatch[1].replace(/,/g, ''), 10);
            const data = pasteDataMap.current.get(lineCount);
            if (data) {
              pastedChars  += data.chars;
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
        chars:  typedChars  + pastedChars,
        tokens: typedTokens + pastedTokens,
        rect:   el.getBoundingClientRect(),
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
          chars:  text.length,
          tokens: estimateTokens(text),
        });
        savePasteMap(pasteDataMap.current);
      }
      scheduleUpdate();
    };

    // ── Detach from the current element ─────────────────────────────────────
    const detach = () => {
      const el = inputElRef.current;
      if (el) {
        el.removeEventListener('input', scheduleUpdate);
        el.removeEventListener('paste', handlePaste as EventListener, { capture: true });
      }
      moRef.current?.disconnect(); moRef.current = null;
      roRef.current?.disconnect(); roRef.current = null;
      inputElRef.current = null;
      pasteDataMap.current.clear();
      setState(EMPTY_STATE);
    };

    // ── Attach to the chat input element ────────────────────────────────────
    const attach = (el: HTMLElement) => {
      if (inputElRef.current === el) return;
      detach();

      // Restore paste data from sessionStorage (survives page refresh)
      loadPasteMap(pasteDataMap.current);

      inputElRef.current = el;
      el.addEventListener('input', scheduleUpdate);
      el.addEventListener('paste', handlePaste as EventListener, { capture: true });

      // MutationObserver on the fieldset (contains both editable div and PASTED cards)
      const container = el.closest('fieldset') ?? el.closest('form') ?? el.parentElement?.parentElement ?? el.parentElement;
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

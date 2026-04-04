/**
 * useInputCounter.ts
 * Purpose: Tracks Claude chat input content and exposes character/token counts
 *          plus the input element's DOMRect. Re-attaches automatically on SPA
 *          navigation so the counter survives conversation switches.
 *
 * Two sources of content:
 *  1. Typed text  — read from el.innerText on every change.
 *  2. PASTED cards — Claude collapses large pastes into cards outside the
 *     editable div, so innerText can't see them.  We capture the full text
 *     from e.clipboardData at paste time and accumulate it in pastedRef.
 *     pastedRef is reset to 0 in the `input` event handler when innerText
 *     becomes empty (i.e. the user deleted everything).
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

export const useInputCounter = (): InputCounterState => {
  const [state, setState] = useState<InputCounterState>(EMPTY_STATE);

  const rafRef     = useRef<number>(0);
  const inputElRef = useRef<HTMLElement | null>(null);
  const moRef      = useRef<MutationObserver | null>(null);
  const roRef      = useRef<ResizeObserver | null>(null);

  // Accumulated chars/tokens from large pastes (cards outside the editable div).
  const pastedRef = useRef<{ chars: number; tokens: number }>({ chars: 0, tokens: 0 });

  useEffect(() => {
    // ── Compute and publish the latest counts ────────────────────────────────
    const readInput = () => {
      const el = inputElRef.current;
      if (!el) return;

      const typedText   = (el.innerText ?? el.textContent ?? '').trim();
      const typedChars  = typedText.length;
      const typedTokens = typedChars === 0 ? 0 : estimateTokens(typedText);

      setState({
        chars:  typedChars  + pastedRef.current.chars,
        tokens: typedTokens + pastedRef.current.tokens,
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

    // ── input event: user typed or deleted something ─────────────────────────
    // Only this handler clears pastedRef — when the user empties the whole
    // input box, both typed text and PASTED cards are gone.
    const handleInput = () => {
      const el = inputElRef.current;
      if (!el) return;
      if ((el.innerText ?? '').trim() === '') {
        pastedRef.current = { chars: 0, tokens: 0 };
      }
      scheduleUpdate();
    };

    // ── paste event: capture full clipboard text before Tiptap folds it ──────
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain') ?? '';
      if (text.length > 0) {
        pastedRef.current = {
          chars:  pastedRef.current.chars  + text.length,
          tokens: pastedRef.current.tokens + estimateTokens(text),
        };
      }
      scheduleUpdate();
    };

    // ── Detach from the current element ─────────────────────────────────────
    const detach = () => {
      const el = inputElRef.current;
      if (el) {
        el.removeEventListener('input', handleInput);
        el.removeEventListener('paste', handlePaste as EventListener, { capture: true });
      }
      moRef.current?.disconnect(); moRef.current = null;
      roRef.current?.disconnect(); roRef.current = null;
      inputElRef.current = null;
      pastedRef.current = { chars: 0, tokens: 0 };
      setState(EMPTY_STATE);
    };

    // ── Attach to the chat input element ────────────────────────────────────
    const attach = (el: HTMLElement) => {
      if (inputElRef.current === el) return;
      detach();

      inputElRef.current = el;
      el.addEventListener('input', handleInput);
      el.addEventListener('paste', handlePaste as EventListener, { capture: true });

      // MutationObserver: keeps rect up-to-date when cards appear/disappear.
      // Does NOT clear pastedRef — that is handleInput's sole responsibility.
      const container = el.closest('form') ?? el.parentElement?.parentElement ?? el.parentElement;
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

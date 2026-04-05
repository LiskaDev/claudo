/**
 * useContextCounter.ts
 * Purpose: Estimates the total token count of all messages in the current
 *          Claude conversation by reading the DOM, so the user knows when
 *          the context window is getting full and a new chat is advisable.
 *
 * Approach:
 *   - Reads text from all message wrappers in the scroll container (same DOM
 *     that useTimeline.ts uses).
 *   - Triggered by a MutationObserver on the scroll container (childList only,
 *     not subtree) so it only re-scans after new messages arrive, NOT on every
 *     keystroke.  This keeps CPU cost near zero during normal typing.
 *   - Re-initialises on SPA navigation via a URL-change interval (same
 *     pattern used in useTimeline.ts).
 *
 * Thresholds (conservative — DOM-only estimation under-counts by ~10-30%
 * because images/attachments are not readable text):
 *   Green  :  0 – 40k estimated tokens  (~20 % of 200k)
 *   Yellow : 40k – 100k                 (~50 %)
 *   Red    : 100k+                       (60 %+ → start a new chat)
 *
 * Created: 2026-04-04
 */

import { useEffect, useRef, useState } from 'react';
import {
  AUTOSCROLL_CONTAINER_SELECTOR,
  MESSAGE_RENDER_WRAPPER_SELECTOR,
} from '@src/constants/selectors';

export type ContextLevel = 'green' | 'yellow' | 'red';

export interface ContextCounterState {
  estimatedTokens: number;
  level: ContextLevel;
}

const YELLOW_CTX =  80_000;
export const RED_CTX    = 150_000;
/** Ring arc fills to 100% at this value (Claude's context window size). */
export const MAX_CTX    = 200_000;

const EMPTY: ContextCounterState = { estimatedTokens: 0, level: 'green' };

function estimateTokens(text: string): number {
  if (!text) return 0;
  const cjk  = (text.match(/[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/g) ?? []).length;
  const rest  = text.length - cjk;
  return Math.round(cjk + rest / 3.5);
}

function calcLevel(tokens: number): ContextLevel {
  if (tokens >= RED_CTX)    return 'red';
  if (tokens >= YELLOW_CTX) return 'yellow';
  return 'green';
}

function scanContainer(container: HTMLElement): ContextCounterState {
  const wrappers = container.querySelectorAll(MESSAGE_RENDER_WRAPPER_SELECTOR);
  let total = 0;
  for (const el of Array.from(wrappers)) {
    total += estimateTokens(el.textContent ?? '');
  }
  return { estimatedTokens: total, level: calcLevel(total) };
}

export const useContextCounter = (): ContextCounterState => {
  const [state, setState] = useState<ContextCounterState>(EMPTY);
  const containerRef = useRef<HTMLElement | null>(null);
  const moRef        = useRef<MutationObserver | null>(null);
  const rafRef       = useRef<number>(0);

  useEffect(() => {
    let currentChatId = '';

    const scheduleRescan = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        const c = containerRef.current;
        if (c) setState(scanContainer(c));
      });
    };

    const attach = (container: HTMLElement) => {
      if (containerRef.current === container) return;
      moRef.current?.disconnect();

      containerRef.current = container;

      // Watch childList only (not subtree) so we only react to new messages
      // being inserted, not to every typing character inside the input.
      moRef.current = new MutationObserver(scheduleRescan);
      moRef.current.observe(container, { childList: true });

      scheduleRescan();
    };

    const getChatId = () => window.location.pathname.split('/chat/')?.[1] ?? '';

    // Poll for URL change + container change (SPA navigation)
    const poll = () => {
      const el = document.querySelector(AUTOSCROLL_CONTAINER_SELECTOR);
      if (!(el instanceof HTMLElement)) {
        setState(EMPTY);
        return;
      }

      const newChatId = getChatId();
      if (newChatId !== currentChatId) {
        // New conversation — hard reset then re-attach
        currentChatId = newChatId;
        moRef.current?.disconnect();
        moRef.current = null;
        containerRef.current = null;
        setState(EMPTY);
      }

      attach(el);
    };

    poll();
    const intervalId = window.setInterval(poll, 800);

    return () => {
      window.clearInterval(intervalId);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      moRef.current?.disconnect();
    };
  }, []);

  return state;
};

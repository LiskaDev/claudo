/**
 * useAutoScroll.ts
 * Purpose: Detects when the user scrolls away from the bottom and intercepts
 *          Claude's auto-scroll, exposing an isLocked flag and a jumpToBottom helper.
 */

import { useEffect, useRef, useState } from 'react';
import { AUTOSCROLL_CONTAINER_SELECTOR } from '@src/constants/selectors';

const BOTTOM_THRESHOLD = 80; // px — within this distance counts as "at bottom"

function findScrollContainer(): HTMLElement | null {
  return document.querySelector<HTMLElement>(AUTOSCROLL_CONTAINER_SELECTOR);
}

export function useAutoScroll(): {
  isLocked: boolean;
  jumpToBottom: () => void;
} {
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Ref mirrors isLocked so the overridden scrollTo closure always reads the latest value.
  const isLockedRef = useRef(false);
  const origScrollToRef = useRef<typeof HTMLElement.prototype.scrollTo | null>(null);

  // ── 1. Locate scroll container; re-find on SPA navigation ──────────────────
  useEffect(() => {
    const tryFind = () => {
      const el = findScrollContainer();
      if (el) { setScrollContainer(el); return true; }
      return false;
    };

    if (tryFind()) return;

    const mo = new MutationObserver(() => {
      if (tryFind()) mo.disconnect();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const handleNavigation = () => {
      setScrollContainer(null);
      setIsLocked(false);
      isLockedRef.current = false;
      setTimeout(() => {
        if (!tryFind()) mo.observe(document.body, { childList: true, subtree: true });
      }, 300);
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);

    return () => {
      mo.disconnect();
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, []);

  // ── 2. Attach scroll listener + intercept scrollTo ──────────────────────────
  useEffect(() => {
    const el = scrollContainer;
    if (!el) return;

    const isAtBottom = () =>
      el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;

    const orig = el.scrollTo.bind(el) as typeof el.scrollTo;
    origScrollToRef.current = orig;

    const intercepted: typeof el.scrollTo = function (
      xOrOptions?: number | ScrollToOptions,
      y?: number,
    ) {
      if (isLockedRef.current) return;
      if (typeof xOrOptions === 'object' || xOrOptions === undefined) {
        orig(xOrOptions as ScrollToOptions);
      } else {
        orig(xOrOptions as number, y as number);
      }
    } as typeof el.scrollTo;
    el.scrollTo = intercepted;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const atBottom = isAtBottom();
        if (atBottom && isLockedRef.current) {
          isLockedRef.current = false;
          setIsLocked(false);
        } else if (!atBottom && !isLockedRef.current) {
          isLockedRef.current = true;
          setIsLocked(true);
        }
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      if (origScrollToRef.current) {
        el.scrollTo = origScrollToRef.current;
        origScrollToRef.current = null;
      }
      isLockedRef.current = false;
      setIsLocked(false);
    };
  }, [scrollContainer]);

  // ── 3. jumpToBottom ─────────────────────────────────────────────────────────
  const jumpToBottom = () => {
    const el = scrollContainer;
    if (!el) return;
    isLockedRef.current = false;
    setIsLocked(false);
    const orig = origScrollToRef.current;
    if (orig) {
      orig({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  };

  return { isLocked, jumpToBottom };
}

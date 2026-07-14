/**
 * Tracks claude.ai message nodes and provides timeline navigation state.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AUTOSCROLL_CONTAINER_SELECTOR,
  CONVERSATION_LINK_SELECTOR,
  MESSAGE_RENDER_WRAPPER_SELECTOR,
  SIDEBAR_FALLBACK_CONTAINER_SELECTOR,
  SIDEBAR_NAV_SELECTOR,
  USER_MESSAGE_SELECTOR,
} from '@src/constants/selectors';

type MessageType = 'user';

type TimelineNode = {
  id: string;
  type: MessageType;
  element: Element;
  index: number;
  text: string;
};

type TimelineApi = {
  nodes: TimelineNode[];
  activeIndex: number;
  scrollToNode: (index: number) => void;
};

const SCROLL_OFFSET_PX = 80;
const CHAT_RESYNC_DELAY_MS = 800;
const CHAT_POLL_INTERVAL_MS = 500;
const SIDEBAR_RESYNC_DEBOUNCE_MS = 800;

const getChatId = (): string => window.location.pathname.split('/chat/')?.[1] ?? '';

const findSidebarContainer = (): HTMLElement | null => {
  const nav = document.querySelector(SIDEBAR_NAV_SELECTOR);
  if (nav instanceof HTMLElement) return nav;
  const fallback = document.querySelector(SIDEBAR_FALLBACK_CONTAINER_SELECTOR);
  return fallback instanceof HTMLElement ? fallback : null;
};

const mutationHasChatLink = (mutations: MutationRecord[]): boolean => {
  for (const m of mutations) {
    for (const node of Array.from(m.addedNodes)) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches(CONVERSATION_LINK_SELECTOR)) return true;
      if (node.querySelector(CONVERSATION_LINK_SELECTOR)) return true;
    }
    for (const node of Array.from(m.removedNodes)) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches(CONVERSATION_LINK_SELECTOR)) return true;
      if (node.querySelector(CONVERSATION_LINK_SELECTOR)) return true;
    }
  }
  return false;
};

/**
 * Restricts rescans to mutations that actually mount/unmount a message wrapper
 * (real virtualization or a new turn), ignoring the far more frequent mutations
 * caused by streaming text, hover states, etc. inside an already-mounted wrapper.
 */
const mutationHasMessageWrapper = (mutations: MutationRecord[]): boolean => {
  for (const m of mutations) {
    for (const node of Array.from(m.addedNodes)) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches(MESSAGE_RENDER_WRAPPER_SELECTOR)) return true;
      if (node.querySelector(MESSAGE_RENDER_WRAPPER_SELECTOR)) return true;
    }
    for (const node of Array.from(m.removedNodes)) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches(MESSAGE_RENDER_WRAPPER_SELECTOR)) return true;
      if (node.querySelector(MESSAGE_RENDER_WRAPPER_SELECTOR)) return true;
    }
  }
  return false;
};

/**
 * Resolves the scroll container that actually wraps the live message
 * wrappers, rather than blindly taking the first DOM match for the
 * selector. Long conversations can end up with more than one element
 * carrying `[data-autoscroll-container="true"]` (e.g. an outer page-level
 * shell alongside an inner virtualizer viewport); grabbing the wrong one
 * means our MutationObserver watches a subtree that never mutates, and the
 * timeline looks permanently frozen. Anchoring on `.closest()` from a real
 * message wrapper guarantees we get the element whose children actually
 * change as the conversation grows/scrolls.
 */
const findScrollContainer = (): HTMLElement | null => {
  const wrappers = document.querySelectorAll(MESSAGE_RENDER_WRAPPER_SELECTOR);
  const lastWrapper = wrappers[wrappers.length - 1];
  const anchored = lastWrapper?.closest(AUTOSCROLL_CONTAINER_SELECTOR);
  if (anchored instanceof HTMLElement) return anchored;

  const el = document.querySelector(AUTOSCROLL_CONTAINER_SELECTOR);
  return el instanceof HTMLElement ? el : null;
};

const getMessageType = (wrapper: Element): MessageType | null => {
  if (wrapper.querySelector(USER_MESSAGE_SELECTOR)) return 'user';
  return null;
};

const extractUserText = (wrapper: Element): string => {
  const el = wrapper.querySelector(USER_MESSAGE_SELECTOR);
  const text = el?.textContent ?? '';
  return text.replace(/\s+/g, ' ').trim();
};

/** One user-turn wrapper currently present in the DOM, in document order. */
type ScannedTurn = { element: Element; text: string };

/**
 * Scans the *currently mounted* user-message wrappers. Claude virtualizes long
 * conversations (see `data-test-render-count` — a per-slot render/recycle
 * counter), so this is only ever a window (or several windows) of the full
 * history, not the complete list. Callers must merge this against previously
 * seen turns via `mergeUserNodes` rather than treating it as the source of truth.
 */
const scanWrapperTexts = (scrollContainer: HTMLElement): ScannedTurn[] => {
  const wrappers = Array.from(scrollContainer.querySelectorAll(MESSAGE_RENDER_WRAPPER_SELECTOR));
  const out: ScannedTurn[] = [];
  for (const wrapper of wrappers) {
    if (!getMessageType(wrapper)) continue;
    out.push({ element: wrapper, text: extractUserText(wrapper) });
  }
  return out;
};

/**
 * Merges a freshly scanned (possibly partial) window of user turns into the
 * previously accumulated, full-history list — instead of replacing it — so
 * turns that scrolled out of the virtualized DOM stay in the timeline.
 *
 * Identity can't come from the DOM (recycled wrapper elements/render-count
 * get reused for different turns), so turns are matched by their text and
 * anchored against whichever known turn the batch overlaps with. Previously
 * unseen turns in the batch are inserted around that anchor, in DOM order.
 * IDs are assigned once, on first sighting, and never change afterwards.
 */
const mergeUserNodes = (
  known: TimelineNode[],
  batch: ScannedTurn[],
  makeId: () => string,
): TimelineNode[] => {
  if (batch.length === 0) return known;
  if (known.length === 0) {
    return batch.map((b, i) => ({ id: makeId(), type: 'user', element: b.element, index: i, text: b.text }));
  }

  const knownIdxByText = new Map<string, number>();
  known.forEach((n, i) => {
    if (!knownIdxByText.has(n.text)) knownIdxByText.set(n.text, i);
  });

  const firstMatch = batch.findIndex((b) => knownIdxByText.has(b.text));
  if (firstMatch === -1) {
    // No overlap with anything known — assume the batch is a newly appended
    // tail (typical case: a fresh reply just landed).
    const fresh = batch.map((b) => ({ id: makeId(), type: 'user' as const, element: b.element, index: 0, text: b.text }));
    return [...known, ...fresh];
  }

  const result = [...known];
  const newBefore = batch
    .slice(0, firstMatch)
    .map((b) => ({ id: makeId(), type: 'user' as const, element: b.element, index: 0, text: b.text }));
  const anchor = knownIdxByText.get(batch[firstMatch].text)!;
  result.splice(anchor, 0, ...newBefore);

  let cursor = anchor + newBefore.length;
  for (let i = firstMatch; i < batch.length; i += 1) {
    const b = batch[i];
    let idx = -1;
    for (let j = cursor; j < result.length; j += 1) {
      if (result[j].text === b.text) { idx = j; break; }
    }
    if (idx !== -1) {
      result[idx] = { ...result[idx], element: b.element };
      cursor = idx + 1;
    } else {
      result.splice(cursor, 0, { id: makeId(), type: 'user', element: b.element, index: 0, text: b.text });
      cursor += 1;
    }
  }

  return result.map((n, i) => ({ ...n, index: i }));
};

const computeActiveIndex = (nodes: TimelineNode[], container: HTMLElement | null): number => {
  if (nodes.length === 0) return -1;
  const containerTop = container ? container.getBoundingClientRect().top : 0;
  const threshold = containerTop + SCROLL_OFFSET_PX + 40;
  // Turns virtualized out of the DOM have no real bounding rect. Infer their
  // side of the viewport from their position relative to the mounted window:
  // turns before it already scrolled past (above), turns after it haven't
  // been reached yet (below).
  const firstConnected = nodes.findIndex((n) => n.element.isConnected);

  let active = -1;
  for (let i = 0; i < nodes.length; i += 1) {
    const n = nodes[i];
    let top: number;
    if (n.element.isConnected) {
      top = n.element.getBoundingClientRect().top;
    } else if (firstConnected === -1 || i < firstConnected) {
      top = -Infinity;
    } else {
      top = Infinity;
    }
    if (top <= threshold) active = i;
  }
  return Math.max(0, active);
};

export const useTimeline = (): TimelineApi => {
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
  const [nodes, setNodes] = useState<TimelineNode[]>([]);
  const nodesRef = useRef(nodes);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const resyncTimeoutRef = useRef<number | null>(null);
  const sidebarResyncTimeoutRef = useRef<number | null>(null);
  const idCounterRef = useRef(0);
  const makeId = () => `tl-${idCounterRef.current++}`;
  const scrollContainerRef = useRef(scrollContainer);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    scrollContainerRef.current = scrollContainer;
  }, [scrollContainer]);

  const refresh = useMemo((): (() => void) => {
    return () => {
      const container = findScrollContainer();
      setScrollContainer(container);
      if (!container) return;
      const merged = mergeUserNodes(nodesRef.current, scanWrapperTexts(container), makeId);
      setNodes(merged);
      setActiveIndex(computeActiveIndex(merged, container));
    };
  }, []);

  useEffect(() => {
    let currentChatId = getChatId();

    const timer = window.setInterval(() => {
      const newChatId = getChatId();
      if (newChatId !== currentChatId) {
        currentChatId = newChatId;

        setNodes([]);
        setActiveIndex(0);

        if (resyncTimeoutRef.current) window.clearTimeout(resyncTimeoutRef.current);
        resyncTimeoutRef.current = window.setTimeout(() => {
          resyncTimeoutRef.current = null;
          refresh();
        }, CHAT_RESYNC_DELAY_MS);
        return;
      }

      // Re-validate the held container reference on every tick. If Claude
      // ever re-parents or replaces the scrolling element under the message
      // list (observed on very long/active conversations), our
      // MutationObserver keeps listening on a now-inert node forever and the
      // timeline stops updating with no error to show for it. Re-resolving
      // here (same selector logic used everywhere else, just polled instead
      // of only running once at mount) detects that drift and re-subscribes.
      const liveContainer = findScrollContainer();
      if (liveContainer !== scrollContainerRef.current) {
        setScrollContainer(liveContainer);
      }
    }, CHAT_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      if (resyncTimeoutRef.current) window.clearTimeout(resyncTimeoutRef.current);
    };
  }, [refresh]);

  useEffect(() => {
    const sidebar = findSidebarContainer();
    if (!sidebar) return;

    const scheduleResync = () => {
      if (sidebarResyncTimeoutRef.current) window.clearTimeout(sidebarResyncTimeoutRef.current);
      sidebarResyncTimeoutRef.current = window.setTimeout(() => {
        sidebarResyncTimeoutRef.current = null;
        refresh();
      }, SIDEBAR_RESYNC_DEBOUNCE_MS);
    };

    const mo = new MutationObserver((mutations) => {
      if (!mutationHasChatLink(mutations)) return;
      scheduleResync();
    });

    mo.observe(sidebar, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      if (sidebarResyncTimeoutRef.current) window.clearTimeout(sidebarResyncTimeoutRef.current);
    };
  }, [refresh]);

  useEffect(() => {
    const initial = findScrollContainer();
    if (initial) setScrollContainer(initial);

    if (initial) return;

    const mo = new MutationObserver(() => {
      const next = findScrollContainer();
      if (!next) return;
      setScrollContainer(next);
      mo.disconnect();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollContainer;
    if (!el) return;

    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const merged = mergeUserNodes(nodesRef.current, scanWrapperTexts(el), makeId);
        setNodes(merged);
        setActiveIndex(computeActiveIndex(merged, el));
      });
    };

    schedule();
    const mo = new MutationObserver((mutations) => {
      if (!mutationHasMessageWrapper(mutations)) return;
      schedule();
    });
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      mo.disconnect();
    };
  }, [scrollContainer]);

  useEffect(() => {
    const el = scrollContainer;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setActiveIndex(computeActiveIndex(nodesRef.current, el));
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      el.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [scrollContainer]);

  const scrollToNode = useMemo(() => {
    return (index: number) => {
      const el = scrollContainer;
      const node = nodesRef.current[index];
      if (!el || !node) return;

      if (node.element.isConnected) {
        const containerRect = el.getBoundingClientRect();
        const nodeRect = node.element.getBoundingClientRect();
        const targetTop = nodeRect.top - containerRect.top + el.scrollTop - SCROLL_OFFSET_PX;
        el.scrollTo({ top: Math.max(0, targetTop), behavior: 'instant' });
        return;
      }

      // Turn has been virtualized out of the DOM — there's no real position
      // to read. Estimate it from its rank among all known turns and jump
      // there; once Claude mounts the real wrapper for that range, the
      // MutationObserver-driven rescan will pick it up and refine activeIndex.
      const total = nodesRef.current.length;
      const ratio = total > 1 ? index / (total - 1) : 0;
      const estimatedTop = ratio * (el.scrollHeight - el.clientHeight);
      el.scrollTo({ top: Math.max(0, estimatedTop), behavior: 'instant' });
    };
  }, [scrollContainer]);

  return { nodes, activeIndex, scrollToNode };
};

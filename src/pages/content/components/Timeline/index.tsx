/**
 * Renders a fixed-position timeline navigator for claude.ai messages.
 * Expanding Sidebar Style with Custom React Portal Tooltips and Dynamic Scroll Gradients.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTimeline } from '../../hooks/useTimeline';
import { AUTOSCROLL_CONTAINER_SELECTOR } from '@src/constants/selectors';

/** Fixed count of turns shown at once, centered on the active one. */
const WINDOW_SIZE = 9;
const WINDOW_HALF = 4;

/**
 * Slices `nodes` down to a fixed-size window centered on `activeIndex`.
 * Near either end of the conversation, where a full half-window doesn't
 * exist on one side, the window shifts toward the other side instead of
 * shrinking — so it always shows WINDOW_SIZE turns as long as that many exist.
 */
const computeVisibleWindow = <T,>(nodes: T[], activeIndex: number): T[] => {
  if (nodes.length <= WINDOW_SIZE) return nodes;

  const active = Math.max(0, activeIndex);
  let start = active - WINDOW_HALF;
  let end = active + WINDOW_HALF;

  if (start < 0) {
    end += -start;
    start = 0;
  }
  if (end > nodes.length - 1) {
    start -= end - (nodes.length - 1);
    end = nodes.length - 1;
  }
  start = Math.max(0, start);

  return nodes.slice(start, end + 1);
};

export default function Timeline() {
  const { nodes, activeIndex, scrollToNode } = useTimeline();
  const visibleNodes = useMemo(
    () => computeVisibleWindow(nodes, activeIndex),
    [nodes, activeIndex],
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<{ id: string; text: string; rect: DOMRect } | null>(null);
  const [scrollState, setScrollState] = useState({ isTop: true, isBottom: true });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Suppresses the auto-scroll-to-active-node effect while the user is
  // actively spinning the wheel over the timeline, so it doesn't fight/reset
  // their manual scroll. ---
  const userScrollingRef = useRef(false);
  const userScrollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const markUserScrolling = () => {
    userScrollingRef.current = true;
    if (userScrollingTimeoutRef.current) clearTimeout(userScrollingTimeoutRef.current);
    userScrollingTimeoutRef.current = setTimeout(() => {
      userScrollingRef.current = false;
    }, 600);
  };
  useEffect(() => {
    return () => {
      if (userScrollingTimeoutRef.current) clearTimeout(userScrollingTimeoutRef.current);
    };
  }, []);

  // --- Y-axis drag state ---
  const [dragY, setDragY] = useState(0);
  const dragStartRef = useRef<{ startY: number; initialY: number; pointerId: number } | null>(null);

  // --- Keeps the panel clear of the native scrollbar. Claude's outer
  // <html>/<body> don't scroll at all — the actual scrollable element (and
  // the one that paints the native scrollbar) is the chat's own
  // overflow-y-auto container, so that's what has to be measured, not
  // document.documentElement (which reports 0 here and silently no-ops).
  // Overlay scrollbars (macOS) report ~0px width, so this falls back to the
  // old fixed gap on that platform. ---
  const [rightGap, setRightGap] = useState(12);
  useEffect(() => {
    const measure = () => {
      const container = document.querySelector(AUTOSCROLL_CONTAINER_SELECTOR);
      if (!(container instanceof HTMLElement)) {
        setRightGap(12);
        return;
      }
      const rect = container.getBoundingClientRect();
      const scrollbarWidth = container.offsetWidth - container.clientWidth;
      const gapToViewportEdge = Math.max(0, window.innerWidth - rect.right);
      setRightGap(Math.max(12, gapToViewportEdge + scrollbarWidth + 8));
    };
    measure();
    window.addEventListener('resize', measure);
    // The container can appear after mount, resize (preview panel opening),
    // or its scrollbar can appear/disappear as content grows — cheap enough
    // to just re-check on an interval rather than wiring up every trigger.
    const interval = window.setInterval(measure, 1000);
    return () => {
      window.removeEventListener('resize', measure);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('claudo_timeline_y');
    if (saved) setDragY(Number(saved));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragStartRef.current || e.pointerId !== dragStartRef.current.pointerId) return;
      e.preventDefault();
      const dy = e.clientY - dragStartRef.current.startY;
      const vh2 = window.innerHeight / 2;
      const safeY = Math.max(-vh2 + 50, Math.min(vh2 - 50, dragStartRef.current.initialY + dy));
      setDragY(safeY);
    };
    const onUp = (e: PointerEvent) => {
      if (!dragStartRef.current || e.pointerId !== dragStartRef.current.pointerId) return;
      dragStartRef.current = null;
      localStorage.setItem('claudo_timeline_y', dragY.toString());
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  }, [dragY]);

  const onDragPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragStartRef.current = { startY: e.clientY, initialY: dragY, pointerId: e.pointerId };
  };

  const checkScroll = () => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const isTop = el.scrollTop <= 5;
    const isBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight - 5;
    setScrollState(p => (p.isTop === isTop && p.isBottom === isBottom ? p : { isTop, isBottom }));
  };

  useEffect(() => {
    if (isExpanded) {
      checkScroll();
      const frame = requestAnimationFrame(checkScroll);
      return () => cancelAnimationFrame(frame);
    }
  }, [isExpanded, visibleNodes]);

  /**
   * Auto-scrolls the timeline container so the active node stays visible.
   */
  useLayoutEffect(() => {
    if (activeIndex < 0) return;
    if (userScrollingRef.current) return;

    // Double frame buffer ensures DOM height layout reflow completed
    requestAnimationFrame(() => {
      if (userScrollingRef.current) return;
      const container = containerRef.current;
      if (!container) return;

      // Look up by aria-current rather than indexing into the rendered node
      // list — with a windowed subset rendered, DOM position no longer lines
      // up with the global activeIndex.
      const activeEl = container.querySelector<HTMLElement>('[data-timeline-node][aria-current="true"]');
      if (!activeEl) return;

      const containerRect = container.getBoundingClientRect();
      const nodeRect = activeEl.getBoundingClientRect();
      const nodeCenter = nodeRect.top + nodeRect.height / 2;
      const containerCenter = containerRect.top + containerRect.height / 2;

      const tolerance = containerRect.height * 0.3;
      if (Math.abs(nodeCenter - containerCenter) > tolerance) {
        const targetScroll =
          activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'instant' });
      }
      
      setTimeout(checkScroll, 100);
    });
  }, [activeIndex]);

  const handleScroll = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (hoveredNode) setHoveredNode(null);
    checkScroll();
  };

  if (nodes.length === 0) return null;

  return (
    <>
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(161, 161, 170, 0.4) transparent;
        }
        .dark .custom-scrollbar {
          scrollbar-color: rgba(82, 82, 91, 0.6) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(161, 161, 170, 0.4);
          border-radius: 3px;
          min-height: 32px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(82, 82, 91, 0.6);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(161, 161, 170, 0.8);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(113, 113, 122, 0.8);
        }
        .custom-scrollbar::-webkit-scrollbar-button,
        .custom-scrollbar::-webkit-scrollbar-corner {
          display: none;
          height: 0;
          width: 0;
        }
      `}</style>
      <div
        role="navigation"
        aria-label="Claude Context Timeline"
        className="fixed top-1/2 z-50 flex flex-col justify-center pointer-events-none min-h-0"
        style={{ right: rightGap, transform: `translateY(calc(-50% + ${dragY}px))` }}
      >
        <div
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => {
            setIsExpanded(false);
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setHoveredNode(null);
          }}
          className={`pointer-events-auto flex flex-col rounded-xl transition-all duration-300 min-h-0 border relative pt-4 pb-4 ${
            isExpanded
              ? 'bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md !border-[#e5e0d8] dark:!border-[#18181b] shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
              : 'bg-transparent !border-transparent shadow-none'
          }`}
        >
          {/* Top Drag Handle */}
          <div 
            onPointerDown={onDragPointerDown}
            className="w-full h-5 absolute top-0 left-0 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5 rounded-t-xl z-20"
            title="Drag to reposition"
            aria-hidden="true"
          >
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${isExpanded ? 'bg-black/20 dark:bg-white/20' : 'bg-transparent'}`} />
          </div>

          <div className="relative z-10 w-full min-h-0">
          <div
            ref={containerRef}
            role="list"
            onScroll={handleScroll}
            onWheel={markUserScrolling}
            className={`custom-scrollbar flex flex-col pb-4 pt-1 overflow-x-hidden max-h-[320px] min-h-0 w-full ${
              isExpanded ? 'overflow-y-auto' : 'overflow-y-hidden'
            }`}
          >
            {visibleNodes.map((n) => {
              const isActive = n.index === activeIndex;
              return (
                <div
                  key={n.id}
                    role="button"
                    tabIndex={0}
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={n.text || 'Timeline node'}
                    data-timeline-node
                    title=""
                    className={`flex items-center justify-end min-h-[26px] px-3 mx-2 my-px cursor-pointer transition-colors duration-200 shrink-0 rounded-md ${
                    isExpanded ? (isActive ? 'bg-zinc-200/80 dark:bg-white/10' : 'hover:bg-zinc-200/50 dark:hover:bg-white/5') : ''
                  }`}
                  onClick={() => scrollToNode(n.index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      scrollToNode(n.index);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (isExpanded) {
                      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const nId = n.id;
                      const nText = n.text;
                      hoverTimeoutRef.current = setTimeout(() => {
                        setHoveredNode({ id: nId, text: nText, rect });
                      }, 600);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    setHoveredNode((prev) => (prev?.id === n.id ? null : prev));
                  }}
                >
                  <div
                    title=""
                    className={`overflow-hidden transition-all duration-300 flex items-center justify-end select-none ${
                      isExpanded ? 'w-[13.5rem] opacity-100 mr-2' : 'w-0 opacity-0 mr-0'
                    }`}
                  >
                    <span
                      title=""
                      className={`block truncate text-[12px] max-w-full pointer-events-none ${
                        isActive ? '!text-zinc-900 dark:!text-zinc-200 font-medium' : '!text-[#374151] dark:!text-zinc-400'
                      }`}
                    >
                      {n.text || '...'}
                    </span>
                  </div>
                  <div
                    className={`w-[14px] shrink-0 h-[1.5px] rounded-full transition-all duration-300 ${
                      isActive ? '!bg-[#D97757] dark:!bg-[#D97757] shadow-[0_0_8px_rgba(217,119,87,0.5)]' : '!bg-black/20 dark:!bg-white/20'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Non-scrolling fade overlays. Kept as siblings of the scroll
             container (not a mask on it) — masking a scrollable element
             hides its native scrollbar in Chromium. */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-xl bg-gradient-to-b from-white/95 dark:from-[#18181b]/95 to-transparent transition-opacity duration-200 ${
              isExpanded && !scrollState.isTop ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-xl bg-gradient-to-t from-white/95 dark:from-[#18181b]/95 to-transparent transition-opacity duration-200 ${
              isExpanded && !scrollState.isBottom ? 'opacity-100' : 'opacity-0'
            }`}
          />
          </div>

          {/* Bottom Drag Handle */}
          <div 
            onPointerDown={onDragPointerDown}
            className="w-full h-5 absolute bottom-0 left-0 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5 rounded-b-xl z-20"
            title="Drag to reposition"
            aria-hidden="true"
          >
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${isExpanded ? 'bg-black/20 dark:bg-white/20' : 'bg-transparent'}`} />
          </div>

        </div>
      </div>

      {hoveredNode && isExpanded &&
        createPortal(
          <div
            className="fixed z-[99999] pointer-events-none px-3.5 py-2.5 text-[13px] !bg-white dark:!bg-zinc-900 !text-[#374151] dark:!text-zinc-100 rounded-[8px] border border-black/10 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
            style={{
              top: hoveredNode.rect.top + hoveredNode.rect.height / 2,
              left: hoveredNode.rect.left - 12,
              transform: 'translate(-100%, -50%)',
              width: 'max-content',
              maxWidth: '22rem',
              lineHeight: '1.5',
            }}
          >
            <div className="absolute left-full top-1/2 -translate-y-1/2 h-0 w-0 border-y-[6px] border-y-transparent border-l-[6px] border-l-black/10 dark:border-l-white/10" />
            <div className="absolute left-[calc(100%-1px)] top-1/2 -translate-y-1/2 h-0 w-0 border-y-[5px] border-y-transparent border-l-[5px] !border-l-white dark:!border-l-zinc-900" />
            <div
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 8,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                whiteSpace: 'normal',
              }}
            >
              {hoveredNode.text}
            </div>
          </div>,
          document.getElementById('__root-host')?.shadowRoot?.getElementById('__root') || 
          document.getElementById('__root-host')?.shadowRoot || 
          document.body
        )}
    </>
  );
}

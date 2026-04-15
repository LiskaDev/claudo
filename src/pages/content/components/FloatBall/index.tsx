/**
 * index.tsx
 * Purpose: Renders the floating action ball and toggles its utility panel.
 * Last updated: 2026-03-10
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeftRight, Settings, X, Download, BookText, Globe, Search, Keyboard, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { readStoredFloatBallPosition, writeStoredFloatBallPosition } from '@src/services/storage';
import { useDraggable } from '../../hooks/useDraggable';
import { useDomHealth } from '../../hooks/useDomHealth';
import { exportStore } from '../ExportHub/store';
import { searchStore } from '../SearchBar/store';
import { panels } from './panelRegistry';
import { useUsageRings } from './useUsageRings';
import { UsageRings } from './UsageRings';
import { useInputCounterEnabled } from '../../hooks/useInputCounterEnabled';

const ClaudeIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path
      d="M12 2v20M2 12h20"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round" />
    <path
      d="M5.5 5.5l13 13M18.5 5.5l-13 13"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round" />
  </svg>
);

type Point = { x: number; y: number };
type PanelSide = 'left' | 'right';

type PanelMenuProps = {
  side: PanelSide;
  onClose: () => void;
  onSelectPanel: (panelId: string) => void;
  ballY: number;
};

const panelIcons: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Download,
  BookText,
  Globe,
  Search,
  Keyboard,
};

const PanelMenu = ({ side, onClose, onSelectPanel, ballY }: PanelMenuProps) => {
  const { t } = useTranslation();
  const [inputCounterOn, toggleInputCounter] = useInputCounterEnabled();

  const percentage = (ballY + 20) / (typeof window !== 'undefined' ? window.innerHeight : 1000);
  const safeOffset = Math.max(-100, Math.min(0, -(percentage * 100)));
  const arrowTop = Math.max(5, Math.min(95, -safeOffset));

  const sideClass = side === 'left' ? 'right-full mr-3' : 'left-full ml-3';
  const arrowWrapperClass = side === 'left' ? 'left-full' : 'right-full';
  const arrowBorderClass = side === 'left' ? 'border-l-[#e5e0d8]' : 'border-r-[#e5e0d8]';
  const arrowFillClass = side === 'left' ? 'border-l-white' : 'border-r-white';
  const arrowBorderOffsetClass = side === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={`absolute top-1/2 ${sideClass} z-50`} style={{ transform: `translateY(${safeOffset}%)` }}>
      <div className="relative w-[14rem] rounded-xl border !border-zinc-200 dark:!border-zinc-700/50 !bg-white/95 dark:!bg-[#18181b]/95 backdrop-blur-md p-2 !text-zinc-800 dark:!text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="mb-1 flex items-center justify-between">
          <div className="text-[12px] font-medium">FloatBall</div>
          <button
            type="button"
            className="rounded p-1 text-[#6b7280] dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={t('common.cancel')}
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {panels.map((panel) => {
            const Icon = panel.icon ? panelIcons[panel.icon] : undefined;
            return (
              <button
                key={panel.id}
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label={t(panel.labelKey, panel.fallbackLabel || panel.labelKey)}
                onClick={() => {
                  if (panel.action) {
                    panel.action();
                    onClose();
                  } else {
                    onSelectPanel(panel.id);
                  }
                }}
              >
                {Icon ? <Icon className="h-4 w-4 text-[#6b7280] dark:text-zinc-400" aria-hidden="true" /> : null}
                <span className="truncate">{t(panel.labelKey, panel.fallbackLabel || panel.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* ── InputCounter toggle row ── */}
        <div className="mt-1 border-t border-zinc-200 dark:border-zinc-700/50 pt-1">
          <button
            type="button"
            role="switch"
            aria-checked={inputCounterOn}
            onClick={toggleInputCounter}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Activity className="h-4 w-4 flex-shrink-0 text-[#6b7280] dark:text-zinc-400" aria-hidden="true" />
            <span className="flex-1 truncate text-zinc-700 dark:text-zinc-300">
              {t('shortcutsPanel.inputCounter', '输入量指示圈')}
            </span>
            <span
              className={`relative inline-flex items-center h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
                inputCounterOn ? 'bg-[#1D9E75]' : '!bg-zinc-300 dark:!bg-zinc-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  inputCounterOn ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </span>
          </button>
        </div>

        <div className={`absolute -translate-y-1/2 ${arrowWrapperClass}`} style={{ top: `${arrowTop}%` }}>
          <div className={`h-0 w-0 border-y-[6px] border-y-transparent ${arrowBorderClass} ${side === 'left' ? 'border-l-[6px]' : 'border-r-[6px]'}`} />
          <div
            className={`absolute ${arrowBorderOffsetClass} top-1/2 -translate-y-1/2 h-0 w-0 border-y-[5px] border-y-transparent ${arrowFillClass} ${
              side === 'left' ? 'border-l-[5px]' : 'border-r-[5px]'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

const BALL_SIZE_REM = 2.6;
const BALL_SIZE_FALLBACK_PX = 24;
const BALL_RIGHT_PX = 16;

/**
 * Floating ball entry component
 * @returns JSX.Element
 *
 * Modification Notes:
 *   - 2026-03-10 Reduced ball size (~70%) for better visual balance.
 */
export default function FloatBall() {
  const { t } = useTranslation();
  const { isHealthy } = useDomHealth();
  const { usage, refresh: refreshUsage } = useUsageRings();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [loadedPosition, setLoadedPosition] = useState<Point | null>(null);
  const [hovered, setHovered] = useState(false);
  const [snapped, setSnapped] = useState<'left' | 'right' | null>(null);
  const [hoveringSnapped, setHoveringSnapped] = useState(false);

  const SNAP_THRESHOLD = 20;
  const SNAP_EXPOSE = 28;

  const closeAll = () => {
    setOpen(false);
    setActivePanelId(null);
  };

  useEffect(() => {
    void (async () => {
      // Restore last position if available.
      const stored = await readStoredFloatBallPosition();
      if (!stored) return;
      setLoadedPosition(stored);
    })();
  }, []);

  /**
   * Reads the rendered ball size for drag clamping and default positioning.
   * Falls back to a constant size before layout is ready.
   */
  const getSize = () => {
    const el = rootRef.current;
    if (!el) return { width: BALL_SIZE_FALLBACK_PX, height: BALL_SIZE_FALLBACK_PX };
    const rect = el.getBoundingClientRect();
    return { width: rect.width || BALL_SIZE_FALLBACK_PX, height: rect.height || BALL_SIZE_FALLBACK_PX };
  };

  /**
   * Default ball position: vertically centered and pinned to the right.
   */
  const defaultPosition = () => {
    const size = getSize();
    const x = Math.max(0, window.innerWidth - size.width - BALL_RIGHT_PX);
    const y = Math.max(0, (window.innerHeight - size.height) / 2);
    return { x, y };
  };

  const draggable = useDraggable({
    defaultPosition: () => loadedPosition ?? defaultPosition(),
    getSize,
    onClick: () => {
      if (snapped) {
        setSnapped(null);
        const screenW = window.innerWidth;
        const width = 64;
        const newX = snapped === 'left' ? 0 : screenW - width;
        setPosition({ ...position, x: newX });
        void writeStoredFloatBallPosition({ ...position, x: newX });
        return;
      }
      if (open) {
        closeAll();
        return;
      }
      refreshUsage(); // Soft refresh limits when user interacts
      setActivePanelId(null);
      setOpen(true);
    },
    onDragEnd: (pos) => void writeStoredFloatBallPosition(pos),
  });

  const { position, isDragging, containerStyle, onPointerDown, setPosition } = draggable;

  useEffect(() => {
    if (!loadedPosition) return;
    const screenW = window.innerWidth;
    const width = 64;
    // Check if initial position triggers edge snap
    if (loadedPosition.x <= SNAP_THRESHOLD || loadedPosition.x < 0) {
      setSnapped('left');
      setPosition({ ...loadedPosition, x: -width + SNAP_EXPOSE });
    } else if (loadedPosition.x + width >= screenW - SNAP_THRESHOLD || loadedPosition.x > screenW - width) {
      setSnapped('right');
      setPosition({ ...loadedPosition, x: screenW - SNAP_EXPOSE });
    } else {
      setPosition(loadedPosition);
    }
  }, [loadedPosition, setPosition]);

  const prevDragging = useRef(isDragging);
  useEffect(() => {
    if (prevDragging.current && !isDragging) {
      // Drag ended
      const screenW = window.innerWidth;
      const width = 64;
      if (position.x <= SNAP_THRESHOLD) {
        setSnapped('left');
        const newPos = { ...position, x: -width + SNAP_EXPOSE };
        setPosition(newPos);
        void writeStoredFloatBallPosition(newPos);
      } else if (position.x + width >= screenW - SNAP_THRESHOLD) {
        setSnapped('right');
        const newPos = { ...position, x: screenW - SNAP_EXPOSE };
        setPosition(newPos);
        void writeStoredFloatBallPosition(newPos);
      }
    } else if (isDragging && !prevDragging.current) {
      // Drag started
      setHoveringSnapped(false);
    }
    
    // Unsnap threshold checks dynamically while sliding out
    if (isDragging && snapped) {
      if (snapped === 'left' && position.x > -64 + SNAP_EXPOSE + 10) {
        setSnapped(null);
      } else if (snapped === 'right' && position.x < window.innerWidth - SNAP_EXPOSE - 10) {
        setSnapped(null);
      }
    }
    prevDragging.current = isDragging;
  }, [position, isDragging, snapped, setPosition]);

  const panelSide = useMemo<PanelSide>(() => {
    const size = getSize();
    const centerX = position.x + size.width / 2;
    return centerX >= window.innerWidth / 2 ? 'left' : 'right';
  }, [position]);

  const activePanel = useMemo(() => {
    if (!activePanelId) return null;
    return panels.find((p) => p.id === activePanelId) ?? null;
  }, [activePanelId]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.composedPath().includes(el)) return;
      // Close when clicking outside of the ball/panel region.
      closeAll();
    };
    window.addEventListener('mousedown', onDown, true);
    return () => window.removeEventListener('mousedown', onDown, true);
  }, [open]);

  // Global Centralized Shortcut Interceptor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.userAgent.includes('Mac');
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === 'Escape') {
        let handled = false;
        if (searchStore.getSnapshot().isOpen) {
          searchStore.close();
          handled = true;
        }
        if (exportStore.getSnapshot().isSelectionMode) {
          exportStore.setIsSelectionMode(false);
          handled = true;
        }
        if (open) {
          closeAll();
          handled = true;
        }
        if (handled) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'f') {
        if (!window.location.pathname.startsWith('/chat/')) return;
        e.preventDefault();
        e.stopPropagation();
        searchStore.open();
      }

      if (cmdOrCtrl && e.key === '/') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
        setActivePanelId('prompt');
      }

      if (e.altKey && e.key.toLowerCase() === 'x') {
        if (!window.location.pathname.startsWith('/chat/')) return;
        e.preventDefault();
        e.stopPropagation();
        exportStore.setIsSelectionMode(!exportStore.getSnapshot().isSelectionMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [open]);

  return (
    <div className="fixed z-50" style={containerStyle}>
      <div ref={rootRef} className="relative w-[64px] h-[64px] flex items-center justify-center">
        <button
          type="button"
          className={`relative z-10 flex items-center justify-center active:scale-95 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            width: `${BALL_SIZE_REM}rem`,
            height: `${BALL_SIZE_REM}rem`,
            borderRadius: '50%',
            backgroundColor: hovered ? '#c4694b' : '#D97757', // Authentic Claude Terracotta
            boxShadow: '0 4px 16px rgba(217,119,87,0.3)',
            opacity: snapped ? (hoveringSnapped ? 0.6 : 0.15) : 1,
            transition: 'opacity 0.3s ease, transform 0.3s ease, background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onPointerDown={onPointerDown}
          onMouseEnter={() => {
            setHovered(true);
            if (snapped) setHoveringSnapped(true);
          }}
          onMouseLeave={() => {
            setHovered(false);
            setHoveringSnapped(false);
          }}
          aria-label={t('widthControl.openAria')}
        >
          <ClaudeIcon className="pointer-events-none" style={{ width: '1.2rem', height: '1.2rem', color: '#ffffff' }} />
          {!isHealthy && (
            <div 
              className="absolute top-0 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#18181b] animate-pulse pointer-events-auto"
              title={t('floatBall.domUnhealthy')}
            />
          )}
        </button>

        {/* Dynamic Usage Rings mounted behind the core ball */}
        {!open && usage && !snapped && (
          <UsageRings
            fiveHour={usage.fiveHour}
            sevenDay={usage.sevenDay}
            fiveResetAt={usage.fiveResetAt}
            sevenResetAt={usage.sevenResetAt}
            ballX={position.x}
          />
        )}

        {open && !activePanel ? <PanelMenu side={panelSide} onClose={closeAll} onSelectPanel={setActivePanelId} ballY={position.y} /> : null}
        {open && activePanel && activePanel.component ? <activePanel.component side={panelSide} onClose={closeAll} ballY={position.y} /> : null}
      </div>
    </div>
  );
}

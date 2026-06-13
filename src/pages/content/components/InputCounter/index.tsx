/**
 * InputCounter/index.tsx
 * Purpose: A two-dimensional input indicator near the Claude chat input box.
 *
 *   Ring arc  (outer stroke, proportional) = conversation context level
 *   Center dot (solid fill, colour only)   = current input size
 *
 * Rendered via createPortal into a position:fixed container on document.body,
 * so the ring escapes the input fieldset's layout flow and is immune to
 * Claude's DOM mutations (toasts, alerts, etc.).
 *
 * Long-press drag (≥500 ms hold) to reposition; position persisted in
 * chrome.storage.local.  Default position: top-right corner of the fieldset.
 *
 * Hover 0.5 s → tooltip explains both dimensions in plain language.
 *
 * Because the portal target lives in Claude's DOM (outside our Shadow Root),
 * all styles are pure inline — Tailwind classes would not apply.
 *
 * Created: 2026-04-04
 * Updated: 2026-06-13 — position:fixed, long-press drag, storage persistence.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useInputCounter } from '../../hooks/useInputCounter';
import { useContextCounter, MAX_CTX } from '../../hooks/useContextCounter';
import { useInputCounterEnabled } from '../../hooks/useInputCounterEnabled';
import {
  readStoredInputCounterPosition,
  writeStoredInputCounterPosition,
} from '@src/services/storage';

// ─── Ring geometry ────────────────────────────────────────────────────────────
const RING_SIZE = 18;
const CX = RING_SIZE / 2;  // 9
const CY = RING_SIZE / 2;  // 9
const R = 7;
const STROKE_W = 2;
const CIRC = 2 * Math.PI * R;
const DOT_R = 3;

// ─── Input-size thresholds (for the centre dot) ──────────────────────────────
const INPUT_YELLOW = 5_000;
const INPUT_RED = 15_000;

// ─── Long-press threshold (ms) ────────────────────────────────────────────────
const LONG_PRESS_MS = 500;


type Level = 'green' | 'yellow' | 'red';

function inputLevel(tokens: number): Level {
  if (tokens >= INPUT_RED) return 'red';
  if (tokens >= INPUT_YELLOW) return 'yellow';
  return 'green';
}

const COLOR: Record<Level, string> = {
  green: '#1D9E75',
  yellow: '#EF9F27',
  red: '#E24B4A',
};

/** Detect Claude's dark mode from its <html> element */
function isDarkMode(): boolean {
  const html = document.documentElement;
  return (
    html.classList.contains('dark') ||
    html.getAttribute('data-mode') === 'dark' ||
    html.getAttribute('data-theme') === 'dark'
  );
}

// ─── Tooltip inline styles (no Tailwind — portal is outside Shadow DOM) ──────
function tooltipStyle(dark: boolean): React.CSSProperties {
  return {
    position: 'absolute',
    bottom: `${RING_SIZE + 6}px`,
    right: 0,
    whiteSpace: 'nowrap',
    background: dark ? 'rgba(30, 30, 30, 0.92)' : 'rgba(244, 244, 245, 1)',
    backdropFilter: 'blur(8px)',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(212,212,216,1)'}`,
    borderRadius: '12px',
    padding: '6px 10px',
    fontSize: '14px',
    lineHeight: '1',
    color: dark ? 'rgba(255,255,255,0.88)' : 'rgba(63,63,70,1)',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function InputCounter() {
  const { t } = useTranslation();
  const [enabled] = useInputCounterEnabled();
  const { chars, tokens: inputTokens, portalTarget } = useInputCounter();
  const { level: ctxLevel, estimatedTokens: ctxTokens } = useContextCounter();

  // ── Hover / tooltip state ─────────────────────────────────────────────────
  const [hovered, setHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Drag state ────────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const [dragCursor, setDragCursor] = useState<'grab' | 'grabbing'>('grab');
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    elemStartLeft: number;
    elemStartTop: number;
  } | null>(null);
  /** Latest clamped position, written to storage on drag-end. */
  const positionRef = useRef<{ left: number; top: number } | null>(null);

  // ── Restore saved position (or keep default) when portal container appears ─
  useEffect(() => {
    if (!portalTarget) return;

    let cancelled = false;
    void (async () => {
      const saved = await readStoredInputCounterPosition();
      if (cancelled || !portalTarget) return;
      if (saved) {
        // Clamp saved position into the current viewport
        const clampedLeft = Math.max(0, Math.min(saved.left, window.innerWidth - RING_SIZE));
        const clampedTop = Math.max(0, Math.min(saved.top, window.innerHeight - RING_SIZE));
        portalTarget.style.left = `${clampedLeft}px`;
        portalTarget.style.top = `${clampedTop}px`;
        positionRef.current = { left: clampedLeft, top: clampedTop };
      } else {
        // Keep hook's default placement; record it as the current position
        positionRef.current = {
          left: parseFloat(portalTarget.style.left) || 0,
          top: parseFloat(portalTarget.style.top) || 0,
        };
      }
    })();
    return () => { cancelled = true; };
  }, [portalTarget]);

  // ── Cleanup long-press timer on unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      if (longPressRef.current) clearTimeout(longPressRef.current);
    };
  }, []);

  // ── Hover handlers ────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    if (isDragging) return;
    hoverTimerRef.current = setTimeout(() => setHovered(true), 500);
  }, [isDragging]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
    setHovered(false);
  }, []);

  // ── Long-press / pointer handlers ─────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;        // left button only
    e.preventDefault();                 // suppress text selection

    longPressRef.current = setTimeout(() => {
      longPressRef.current = null;

      // Guard: portal target must exist to enter drag mode
      if (!portalTarget) return;

      // Enter drag mode
      setIsDragging(true);
      setDragCursor('grab');
      setHovered(false);               // hide tooltip while dragging

      const rect = portalTarget.getBoundingClientRect();
      dragStartRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        elemStartLeft: rect.left,
        elemStartTop: rect.top,
      };
    }, LONG_PRESS_MS);
  }, [portalTarget]);

  const handlePointerUp = useCallback((_e: React.PointerEvent) => {
    // Short click — cancel the pending long-press
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    // Only cancel the *pending* long-press; if drag is already active
    // the document-level listeners handle completion.
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    // Also cancel hover tooltip
    handleMouseLeave();
  }, [handleMouseLeave]);

  // ── Document-level drag move / end ────────────────────────────────────────
  useEffect(() => {
    if (!isDragging || !portalTarget) return;

    const onMove = (e: PointerEvent) => {
      const start = dragStartRef.current;
      if (!start || e.pointerId !== start.pointerId) return;
      e.preventDefault();

      setDragCursor('grabbing');

      const dx = e.clientX - start.startX;
      const dy = e.clientY - start.startY;

      let newLeft = start.elemStartLeft + dx;
      let newTop = start.elemStartTop + dy;

      // Clamp so the gauge stays fully inside the viewport
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - RING_SIZE));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - RING_SIZE));

      portalTarget.style.left = `${newLeft}px`;
      portalTarget.style.top = `${newTop}px`;
      positionRef.current = { left: newLeft, top: newTop };
    };

    const end = (e: PointerEvent) => {
      const start = dragStartRef.current;
      if (!start || e.pointerId !== start.pointerId) return;
      e.preventDefault();

      dragStartRef.current = null;
      setIsDragging(false);
      setDragCursor('grab');

      // Persist final position
      if (positionRef.current) {
        void writeStoredInputCounterPosition(positionRef.current);
      }
    };

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', end, true);
    document.addEventListener('pointercancel', end, true);
    return () => {
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', end, true);
      document.removeEventListener('pointercancel', end, true);
    };
  }, [isDragging, portalTarget]);

  // ── Guard: toggle off or portal not ready ─────────────────────────────────
  if (!enabled || !portalTarget) return null;

  // Ring = context level (the "fuel gauge")
  const ringColor = COLOR[ctxLevel];
  const fillPct = Math.min(ctxTokens / MAX_CTX, 1);
  const dashOffset = CIRC * (1 - fillPct);

  // Dot = input size (keystroke feedback)
  const dotLevel = inputLevel(inputTokens);
  const dotColor = COLOR[dotLevel];

  const dark = isDarkMode();

  const cursor = isDragging ? dragCursor : 'default';

  const content = (
    <div
      style={{
        overflow: 'visible',
        cursor,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* ── Tooltip ── */}
      {hovered && !isDragging && (
        <div style={tooltipStyle(dark)}>
          {t(`inputCounter.ctx_${ctxLevel}`)}
          <span style={{ margin: '0 5px', opacity: 0.35 }}>·</span>
          {t(`inputCounter.hint_${dotLevel}`)}
        </div>
      )}

      {/* ── SVG: ring (context) + centre dot (input) ── */}
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        aria-label={t(`inputCounter.ctx_${ctxLevel}`)}
        role="img"
      >
        {/* Ring background track */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth={STROKE_W}
          opacity={0.22}
        />
        {/* Ring filled arc (context level) */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth={STROKE_W}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: 'stroke-dashoffset 0.35s ease, stroke 0.3s ease' }}
        />
        {/* Centre dot (input size) */}
        <circle
          cx={CX} cy={CY} r={DOT_R}
          fill={dotColor}
          style={{ transition: 'fill 0.4s ease' }}
        />
      </svg>
    </div>
  );

  return createPortal(content, portalTarget);
}

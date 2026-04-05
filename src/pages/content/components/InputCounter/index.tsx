/**
 * InputCounter/index.tsx
 * Purpose: A two-dimensional input indicator near the Claude chat input box.
 *
 *   Ring arc  (outer stroke, proportional) = conversation context level
 *   Center dot (solid fill, colour only)   = current input size
 *
 * Rendered via createPortal into a container that the hook appends directly
 * inside Claude's fieldset element (position: absolute), so the ring is
 * permanently locked to the top-right corner regardless of input height.
 *
 * Hover 0.5 s → tooltip explains both dimensions in plain language.
 *
 * Because the portal target lives in Claude's DOM (outside our Shadow Root),
 * all styles are pure inline — Tailwind classes would not apply.
 *
 * Created: 2026-04-04
 */

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useInputCounter } from '../../hooks/useInputCounter';
import { useContextCounter, MAX_CTX } from '../../hooks/useContextCounter';
import { useInputCounterEnabled } from '../../hooks/useInputCounterEnabled';

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

  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setHovered(true), 500);
  };
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setHovered(false);
  };

  // Guard: toggle off or portal not ready
  if (!enabled || !portalTarget) return null;

  // Ring = context level (the "fuel gauge")
  const ringColor = COLOR[ctxLevel];
  const fillPct = Math.min(ctxTokens / MAX_CTX, 1);
  const dashOffset = CIRC * (1 - fillPct);

  // Dot = input size (keystroke feedback)
  const dotLevel = inputLevel(inputTokens);
  const dotColor = COLOR[dotLevel];

  const dark = isDarkMode();

  const content = (
    <div
      style={{
        overflow: 'visible',
        cursor: 'default',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Tooltip ── */}
      {hovered && (
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

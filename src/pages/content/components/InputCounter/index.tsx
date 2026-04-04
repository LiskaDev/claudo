/**
 * InputCounter/index.tsx
 * Purpose: A two-dimensional input indicator near the Claude chat input box.
 *
 *   Ring arc  (outer stroke, proportional) = conversation context level
 *   Center dot (solid fill, colour only)   = current input size
 *
 * Hover 0.5 s → tooltip explains both dimensions in plain language.
 * Adapts to light / dark theme via Tailwind dark: utilities.
 *
 * Created: 2026-04-04
 */

import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInputCounter } from '../../hooks/useInputCounter';
import { useContextCounter } from '../../hooks/useContextCounter';
import { useInputCounterEnabled } from '../../hooks/useInputCounterEnabled';

// ─── Ring geometry ────────────────────────────────────────────────────────────
// 18 px bounding box.  R=7, STROKE_W=2 → stroke/radius ratio = 29 %
// This gives a proper thin-ring look (vs. the previous fat blob).
// Outer edge: 7 + 1 = 8 px ≤ 9 (centre), 1 px margin — just fits.
const RING_SIZE = 18;
const CX = RING_SIZE / 2;  // 9
const CY = RING_SIZE / 2;  // 9
const R = 7;
const STROKE_W = 2;
const CIRC = 2 * Math.PI * R;
const DOT_R = 3;           // centre dot — R=3 fills ~50 % of the inner ring space

// ─── Input-size thresholds (for the centre dot) ──────────────────────────────
const INPUT_YELLOW = 5_000;
const INPUT_RED = 15_000;

// ─── Context threshold (for the ring arc) ────────────────────────────────────
const CTX_RED = 120_000; // matches RED_CTX in useContextCounter

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function InputCounter() {
  const { t } = useTranslation();
  const [enabled] = useInputCounterEnabled();
  const { chars, tokens: inputTokens, rect } = useInputCounter();
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

  // Guard: toggle off → never render
  if (!enabled) return null;
  // Guard: input box not found yet, or not yet laid out (rect is always a DOMRect
  // object even when the element is off-screen, so check height > 0 as well).
  if (!rect || rect.height === 0) return null;

  // Ring = context level (the "fuel gauge" — important, slow-changing)
  const ringColor = COLOR[ctxLevel];
  const fillPct = Math.min(ctxTokens / CTX_RED, 1);
  const dashOffset = CIRC * (1 - fillPct);

  // Dot = input size (fast-changing keystroke feedback)
  const dotLevel = inputLevel(inputTokens);
  const dotColor = COLOR[dotLevel];

  const right = window.innerWidth - rect.right + 14;
  // Inside the top-right corner of the input box border.
  const top = rect.top + 8;

  return (
    <div
      style={{
        position: 'fixed',
        right: `${right}px`,
        top: `${top}px`,
        zIndex: 9999,
        pointerEvents: 'auto',
        cursor: 'default',
        overflow: 'visible',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Tooltip ── */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: `${RING_SIZE + 6}px`,
            right: 0,
            whiteSpace: 'nowrap',
          }}
          className="
            bg-zinc-100 dark:bg-[#1e1e1e]/90
            backdrop-blur-sm
            border border-zinc-300 dark:border-white/10
            rounded-lg
            px-2.5 py-1.5
            text-[13px] leading-none
            text-zinc-700 dark:!text-white/88
            shadow-md
            pointer-events-none
            select-none
          "
        >
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
}

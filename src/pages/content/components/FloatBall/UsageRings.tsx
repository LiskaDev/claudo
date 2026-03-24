import React, { useState } from 'react';
import type { UsageData } from './useUsageRings';

interface Props extends UsageData {}

function getColor(pct: number): string {
  if (pct >= 80) return '#E24B4A'; // Red for warning
  if (pct >= 50) return '#EF9F27'; // Orange for caution
  return '#1D9E75'; // Green for healthy
}

function formatReset(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

const CX = 28, CY = 28;
const INNER_R = 25, OUTER_R = 30; // Reduced outer R slightly to fit exactly in 56px wrapper cleanly without clipping stroke
const INNER_CIRC = 2 * Math.PI * INNER_R;
const OUTER_CIRC = 2 * Math.PI * OUTER_R;

export const UsageRings: React.FC<Props> = ({ fiveHour, sevenDay, fiveResetAt, sevenResetAt }) => {
  const [hovered, setHovered] = useState(false);

  // Dashoffset: 0 = 100% full, CIRC = 0% full
  const innerOffset = INNER_CIRC * (1 - fiveHour / 100);
  const outerOffset = OUTER_CIRC * (1 - sevenDay / 100);

  return (
    <div 
      style={{ position: 'absolute', top: -6, left: -6, width: 56, height: 56, pointerEvents: 'none', zIndex: -1 }}
    >
      {hovered && (
        <div 
          className="absolute -top-[52px] left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] leading-[1.8] whitespace-nowrap text-white/75 pointer-events-none z-[9999] shadow-lg"
        >
          <div>会话阈值：已用 {fiveHour}% · 剩 {100 - fiveHour}%{fiveResetAt ? ` · 重置 ${formatReset(fiveResetAt)}` : ''}</div>
          <div>全局限免：已用 {sevenDay}% · 剩 {100 - sevenDay}%{sevenResetAt ? ` · 重置 ${formatReset(sevenResetAt)}` : ''}</div>
        </div>
      )}

      {/* SVG rings — background tracks first, then progress tracks */}
      <svg
        width={56} height={56}
        viewBox="0 0 56 56"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {/* Background Tracks */}
        <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2.5} />
        <circle cx={CX} cy={CY} r={INNER_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2.5} />

        {/* 外圈 7天，顺时针 */}
        <circle
          cx={CX} cy={CY} r={OUTER_R}
          fill="none"
          stroke={getColor(sevenDay)}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={OUTER_CIRC}
          strokeDashoffset={outerOffset}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
        {/* 内圈 5小时，顺时针 */}
        <circle
          cx={CX} cy={CY} r={INNER_R}
          fill="none"
          stroke={getColor(fiveHour)}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={INNER_CIRC}
          strokeDashoffset={innerOffset}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      </svg>

      {/* 鼠标悬停捕获层 (Invisible but captures pointers without blocking clicks on the ball) */}
      <div
        className="absolute inset-0 rounded-full pointer-events-auto cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
    </div>
  );
};

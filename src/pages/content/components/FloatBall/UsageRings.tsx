import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { UsageData } from './useUsageRings';
import type { TFunction } from 'i18next';

interface Props extends UsageData {
  ballX?: number;
}

function getColor(pct: number): string {
  if (pct >= 80) return '#E24B4A'; // Red for warning
  if (pct >= 50) return '#EF9F27'; // Orange for caution
  return '#1D9E75'; // Green for healthy
}

function formatReset(iso: string, t: TFunction): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours <= 0) return t('usageRings.resetSoon');
  if (diffHours < 24) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return t('usageRings.resetToday', { time: `${h}:${m}` });
  }
  if (diffDays < 2) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return t('usageRings.resetTomorrow', { time: `${h}:${m}` });
  }
  return t('usageRings.resetDays', { days: diffDays });
}

const CX = 32, CY = 32;
const INNER_R = 25, OUTER_R = 29; // 29 fits safely inside 32 (half of 64px canvas)
const INNER_CIRC = 2 * Math.PI * INNER_R;
const OUTER_CIRC = 2 * Math.PI * OUTER_R;

export const UsageRings: React.FC<Props> = ({ fiveHour, sevenDay, fiveResetAt, sevenResetAt, ballX = 0 }) => {
  const { t } = useTranslation();
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

  // Dashoffset: 0 = 100% full, CIRC = 0% full
  const innerOffset = INNER_CIRC * (1 - fiveHour / 100);
  const outerOffset = OUTER_CIRC * (1 - sevenDay / 100);

  const isLeftSide = typeof window !== 'undefined' && ballX < window.innerWidth / 2;
  const tooltipStyle: React.CSSProperties = {
    top: '50%',
    transform: 'translateY(-50%)',
    left: isLeftSide ? '110%' : 'auto',
    right: isLeftSide ? 'auto' : '110%',
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {hovered && (
        <div 
          className="absolute bg-[#1a1a1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] leading-[1.8] whitespace-nowrap text-white/75 pointer-events-none z-[9999] shadow-lg"
          style={tooltipStyle}
        >
          <div>{t('usageRings.currentSession')}: {t('usageRings.used')} {fiveHour}% · {t('usageRings.remaining')} {100 - fiveHour}%　{formatReset(fiveResetAt, t)}</div>
          <div>{t('usageRings.weeklyLimit')}: {t('usageRings.used')} {sevenDay}% · {t('usageRings.remaining')} {100 - sevenDay}%　{formatReset(sevenResetAt, t)}</div>
        </div>
      )}

      {/* SVG rings — progress tracks only */}
      <svg
        width={64} height={64}
        viewBox="0 0 64 64"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}

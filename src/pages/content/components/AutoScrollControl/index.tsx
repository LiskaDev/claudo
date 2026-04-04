/**
 * AutoScrollControl/index.tsx
 * Purpose: Floating "jump to bottom" button that appears when the user has
 *          scrolled away from the bottom of the chat, and intercepts Claude's
 *          auto-scroll until the user dismisses it.
 */

import { useState } from 'react';
import { ChevronsDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAutoScroll } from '../../hooks/useAutoScroll';

export default function AutoScrollControl() {
  const { t } = useTranslation();
  const { isLocked, jumpToBottom } = useAutoScroll();
  const [hovered, setHovered] = useState(false);

  if (!isLocked) return null;

  return (
    <button
      aria-label={t('autoScroll.jumpToBottom')}
      onClick={jumpToBottom}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        bottom: '5rem',
        right: '5rem',
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hovered ? '#c4694b' : '#D97757',
        color: '#ffffff',
        boxShadow: '0 4px 16px rgba(217,119,87,0.4)',
        transition: 'background-color 0.15s ease',
        zIndex: 9999,
      }}
    >
      <ChevronsDown size={20} strokeWidth={2.5} />
    </button>
  );
}

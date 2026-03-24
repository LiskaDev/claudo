import { Keyboard, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  side: 'left' | 'right';
  onClose: () => void;
  ballY: number;
};

export default function ShortcutsPanel({ side, onClose, ballY }: Props) {
  const { t } = useTranslation();

  const percentage = (ballY + 20) / (typeof window !== 'undefined' ? window.innerHeight : 1000);
  const safeOffset = Math.max(-100, Math.min(0, -(percentage * 100)));
  const arrowTop = Math.max(5, Math.min(95, -safeOffset));

  const sideClass = side === 'left' ? 'right-full mr-3' : 'left-full ml-3';
  const arrowWrapperClass = side === 'left' ? 'left-full' : 'right-full';
  const arrowBorderClass = side === 'left' ? 'border-l-zinc-200 dark:border-l-zinc-700/50' : 'border-r-zinc-200 dark:border-r-zinc-700/50';
  const arrowFillClass = side === 'left' ? 'border-l-white dark:border-l-[#18181b]' : 'border-r-white dark:border-r-[#18181b]';
  const arrowBorderOffsetClass = side === 'left' ? 'left-0' : 'right-0';

  const isMac = typeof window !== 'undefined' ? navigator.userAgent.includes('Mac OS X') : false;
  const commandKey = isMac ? '⌘' : 'Ctrl';
  const altKey = isMac ? '⌥' : 'Alt';

  const shortcuts = [
    { key: `${commandKey} + F`, desc: '对话内聚合搜索' },
    { key: `${commandKey} + /`, desc: '呼出提示词面板' },
    { key: `${altKey} + X`, desc: '开启/关闭框选导出' },
    { key: `Esc`, desc: '快速关闭所有的活动面板' },
  ];

  return (
    <div className={`absolute top-1/2 ${sideClass} z-50`} style={{ transform: `translateY(${safeOffset}%)` }}>
      <div className="relative w-[18rem] rounded-xl border !border-zinc-200 dark:!border-zinc-700/50 !bg-white/95 dark:!bg-[#18181b]/95 backdrop-blur-md p-3 !text-[#374151] dark:!text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.16)]">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            <div className="text-[13px] font-medium">快捷键绑定指南</div>
          </div>
          <button
            type="button"
            className="rounded p-1 text-[#6b7280] dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          {shortcuts.map(({ key, desc }) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-[12px] text-zinc-500 dark:text-zinc-400">{desc}</span>
              <kbd className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 font-semibold shadow-sm">
                {key}
              </kbd>
            </div>
          ))}
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
}

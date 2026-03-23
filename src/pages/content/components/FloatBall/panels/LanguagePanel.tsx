/**
 * LanguagePanel.tsx
 * Purpose: Allows the user to quickly switch the UI language of the extension.
 */

import { useTranslation } from 'react-i18next';
import { Globe, X } from 'lucide-react';
import { setLanguage } from '@src/services/i18n';
import type { Language } from '@src/types/settings';

type Props = {
  side: 'left' | 'right';
  onClose: () => void;
};

export default function LanguagePanel({ side, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const resolved = i18n.resolvedLanguage;
  const currentLanguage: Language = resolved === 'zh' ? 'zh' : resolved === 'zh-TW' ? 'zh-TW' : 'en';

  const handleLanguageChange = (lang: Language) => {
    void setLanguage(lang);
    void i18n.changeLanguage(lang);
  };

  const sideClass = side === 'left' ? 'right-full mr-3' : 'left-full ml-3';
  const arrowWrapperClass = side === 'left' ? 'left-full' : 'right-full';
  const arrowBorderOffsetClass = side === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={`absolute top-1/2 -translate-y-1/2 ${sideClass} z-50`}>
      <div className="relative w-[14rem] rounded-xl border border-zinc-700/50 bg-[#18181b]/95 backdrop-blur-md p-3 text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[12px] font-medium flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{t('popup.language') || 'Language'}</div>
          <button
            type="button"
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800"
            aria-label={t('common.cancel') || 'Cancel'}
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <select
          className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-[13px] text-zinc-200 border border-zinc-700 focus:outline-none focus:border-zinc-500"
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
        >
          <option value="en">{t('popup.languageEn') || 'English'}</option>
          <option value="zh">{t('popup.languageZh') || '简体中文'}</option>
        </select>
        
        <div className="mt-2 text-[11px] text-zinc-500 leading-snug">
          {t('popup.hint') || 'Language switch applies immediately.'}
        </div>

        <div className={`absolute top-1/2 -translate-y-1/2 ${arrowWrapperClass}`}>
          <div className={`h-0 w-0 border-y-[6px] border-y-transparent ${side === 'left' ? 'border-l-[6px] border-l-zinc-700/50' : 'border-r-[6px] border-r-zinc-700/50'}`} />
          <div
            className={`absolute ${arrowBorderOffsetClass} top-1/2 -translate-y-1/2 h-0 w-0 border-y-[5px] border-y-transparent ${
              side === 'left' ? 'border-l-[5px] border-l-[#18181b]' : 'border-r-[5px] border-r-[#18181b]'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

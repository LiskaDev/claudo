import { useEffect, useState, useRef, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchStore, searchStore, type SearchFilter } from './store';
import { executeDomSearch, isHighlightApiSupported } from './domSearch';

export default function SearchBar() {
  const { t } = useTranslation();
  const { isOpen, query, filter, matchCount, currentIndex } = useSearchStore();

  const [matches, setMatches] = useState<Range[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-run search whenever query, filter, or open state changes
  useEffect(() => {
    if (!isOpen) {
      if (isHighlightApiSupported()) {
        CSS.highlights?.delete('claudo-search');
        CSS.highlights?.delete('claudo-search-active');
      }
      return;
    }

    if (!query.trim()) {
      setMatches([]);
      searchStore.setMatchData(0, -1);
      if (isHighlightApiSupported()) {
        CSS.highlights?.delete('claudo-search');
        CSS.highlights?.delete('claudo-search-active');
      }
      return;
    }

    const timer = setTimeout(() => {
      const newMatches = executeDomSearch(query, filter);
      setMatches(newMatches);
      
      const newCount = newMatches.length;
      let newIndex = -1;
      
      if (newCount > 0) {
        // If there was a previous selection, try to maintain closest proportional index, otherwise start at 0
        newIndex = currentIndex >= 0 ? Math.min(currentIndex, newCount - 1) : 0;
      }
      
      searchStore.setMatchData(newCount, newIndex);

      if (isHighlightApiSupported()) {
        const highlight = new Highlight(...newMatches);
        CSS.highlights?.set('claudo-search', highlight);
        
        if (newIndex >= 0) {
          const activeHighlight = new Highlight(newMatches[newIndex]);
          CSS.highlights?.set('claudo-search-active', activeHighlight);
        } else {
          CSS.highlights?.delete('claudo-search-active');
        }
      }
    }, 150); // Debounce to prevent lag while typing

    return () => clearTimeout(timer);
  }, [isOpen, query, filter]); // Intentionally omitting currentIndex to prevent loop

  // Effect to navigate to the active match when currentIndex changes
  useEffect(() => {
    if (!isOpen || currentIndex < 0 || currentIndex >= matches.length) return;
    
    const activeRange = matches[currentIndex];
    
    if (isHighlightApiSupported()) {
      const activeHighlight = new Highlight(activeRange);
      CSS.highlights?.set('claudo-search-active', activeHighlight);
    }
    
    // Attempt to scroll into view
    const element = activeRange.startContainer.parentElement;
    if (element) {
      element.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  }, [currentIndex, matches, isOpen]);

  // Global Keyboard Shortcut Listener for Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only intercept on chat routes
      if (!window.location.pathname.startsWith('/chat/')) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchStore.open();
        // Delay focus slightly to ensure render
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      
      if (e.key === 'Escape' && searchStore.getSnapshot().isOpen) {
        e.preventDefault();
        searchStore.close();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  if (!isOpen) return null;

  const handleNext = () => {
    if (matchCount === 0) return;
    searchStore.setMatchData(matchCount, (currentIndex + 1) % matchCount);
  };

  const handlePrev = () => {
    if (matchCount === 0) return;
    searchStore.setMatchData(matchCount, (currentIndex - 1 + matchCount) % matchCount);
  };

  const cycleFilter = () => {
    const map: Record<SearchFilter, SearchFilter> = {
      all: 'user',
      user: 'claude',
      claude: 'all'
    };
    searchStore.setFilter(map[filter]);
  };

  const filterLabels: Record<SearchFilter, string> = {
    all: '全部消息',
    user: '我的消息',
    claude: 'Claude 回复'
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-xl flex items-center bg-zinc-800/90 backdrop-blur-md border border-zinc-700 p-1.5 min-w-[360px] animate-in slide-in-from-top-4 fade-in duration-200">
      <div className="flex items-center gap-2 px-2 flex-1">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => searchStore.setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.shiftKey ? handlePrev() : handleNext();
            }
          }}
          placeholder="在当前对话中搜索..."
          className="bg-transparent text-[13px] text-zinc-100 placeholder-zinc-500 outline-none flex-1 min-w-0"
        />
        {query && (
          <div className={`text-[12px] shrink-0 select-none mr-2 ${matchCount === 0 ? 'text-red-400 font-medium' : 'text-zinc-400'}`}>
            {matchCount > 0 ? `${currentIndex + 1} / ${matchCount}` : '无结果'}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 border-l border-zinc-700 pl-2 shrink-0">
        <button
          onClick={handlePrev}
          className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 active:scale-95 transition-all outline-none"
          title="上一个 (Shift+Enter)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 active:scale-95 transition-all outline-none"
          title="下一个 (Enter)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        
        <button
          onClick={cycleFilter}
          className="p-1 ml-1 rounded flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 active:scale-95 transition-all outline-none whitespace-nowrap"
          title={`过滤条件: ${filterLabels[filter]}`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="w-12 text-center">{filterLabels[filter]}</span>
        </button>

        <button
          onClick={searchStore.close}
          className="p-1 ml-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-700/50 active:scale-95 transition-all outline-none"
          title="关闭 (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

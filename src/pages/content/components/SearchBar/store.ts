import { useSyncExternalStore } from 'react';

export type SearchFilter = 'all' | 'user' | 'claude';

type SearchState = {
  isOpen: boolean;
  query: string;
  filter: SearchFilter;
  matchCount: number;
  currentIndex: number;
};

class SearchStore {
  private state: SearchState = {
    isOpen: false,
    query: '',
    filter: 'all',
    matchCount: 0,
    currentIndex: -1,
  };
  private listeners: Set<() => void> = new Set();

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public getSnapshot = () => this.state;

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public open = () => {
    if (this.state.isOpen) return;
    this.state = { ...this.state, isOpen: true, currentIndex: -1, matchCount: 0 };
    this.notify();
  };

  public close = () => {
    if (!this.state.isOpen) return;
    this.state = { ...this.state, isOpen: false, query: '' };
    this.notify();
  };

  public setQuery = (query: string) => {
    this.state = { ...this.state, query, currentIndex: -1, matchCount: 0 };
    this.notify();
  };

  public setFilter = (filter: SearchFilter) => {
    this.state = { ...this.state, filter, currentIndex: -1, matchCount: 0 };
    this.notify();
  };

  public setMatchData = (matchCount: number, currentIndex: number) => {
    this.state = { ...this.state, matchCount, currentIndex };
    this.notify();
  };
}

export const searchStore = new SearchStore();

export function useSearchStore() {
  return useSyncExternalStore(searchStore.subscribe, searchStore.getSnapshot);
}

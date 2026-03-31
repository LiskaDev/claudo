import { useSyncExternalStore } from 'react';
import { MESSAGE_RENDER_WRAPPER_SELECTOR, USER_MESSAGE_SELECTOR } from '@src/constants/selectors';

class ExportStore {
  private listeners = new Set<() => void>();
  public isSelectionMode = false;
  public selectedIds = new Set<string>();
  
  // React 18 strictly demands a brand new memory reference (immutable snapshot) to trigger repaints!
  private snapshot = { isSelectionMode: false, selectedIds: new Set<string>() };

  setIsSelectionMode(val: boolean) {
    this.isSelectionMode = val;
    if (!val) {
      this.selectedIds.clear();
    }
    this.updateSnapshot();
  }

  toggleId(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.updateSnapshot();
  }

  // Set all IDs in [startIdx, endIdx] to a fixed selected state (used by drag).
  setRangeState(startIdx: number, endIdx: number, selected: boolean) {
    const min = Math.min(startIdx, endIdx);
    const max = Math.max(startIdx, endIdx);
    for (let i = min; i <= max; i++) {
      const id = `cherry-msg-${i}`;
      if (selected) {
        this.selectedIds.add(id);
      } else {
        this.selectedIds.delete(id);
      }
    }
    this.updateSnapshot();
  }

  // Toggle a range: select all if any is unselected, deselect all if all selected (used by Shift+click).
  toggleRange(startIdx: number, endIdx: number) {
    const min = Math.min(startIdx, endIdx);
    const max = Math.max(startIdx, endIdx);
    let anyUnselected = false;
    for (let i = min; i <= max; i++) {
      if (!this.selectedIds.has(`cherry-msg-${i}`)) {
        anyUnselected = true;
        break;
      }
    }
    this.setRangeState(min, max, anyUnselected);
  }

  toggleBulk(type: 'user' | 'assistant' | 'all') {
    const allNodes = Array.from(document.querySelectorAll<HTMLElement>(MESSAGE_RENDER_WRAPPER_SELECTOR));
    let anyUnselected = false;
    const targetIds: string[] = [];

    allNodes.forEach(node => {
      const isUser = !!node.querySelector(USER_MESSAGE_SELECTOR);
      const id = node.getAttribute('data-cherry-id');
      if (!id) return;
      
      if (type === 'all' || (type === 'user' && isUser) || (type === 'assistant' && !isUser)) {
        targetIds.push(id);
        if (!this.selectedIds.has(id)) {
           anyUnselected = true;
        }
      }
    });

    if (anyUnselected) {
      targetIds.forEach(id => this.selectedIds.add(id));
    } else {
      targetIds.forEach(id => this.selectedIds.delete(id));
    }
    
    this.updateSnapshot();
  }

  private updateSnapshot() {
    this.snapshot = {
      isSelectionMode: this.isSelectionMode,
      selectedIds: new Set(this.selectedIds) // Deep copy guarantees pointer mutation!
    };
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;
}

export const exportStore = new ExportStore();

export function useExportStore() {
  return useSyncExternalStore(exportStore.subscribe, exportStore.getSnapshot);
}

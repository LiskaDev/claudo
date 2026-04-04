/**
 * useInputCounterEnabled.ts
 * Purpose: Persists the user's preference for showing/hiding the InputCounter
 *          ring via chrome.storage.local. Reacts to storage changes so multiple
 *          tabs stay in sync without a page reload.
 * Created: 2026-04-04
 */

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'inputCounterEnabled';
const DEFAULT = true;

/** Returns [enabled, toggle] */
export const useInputCounterEnabled = (): [boolean, () => void] => {
  const [enabled, setEnabled] = useState<boolean>(DEFAULT);

  useEffect(() => {
    // Initial read
    if (chrome?.storage?.local) {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        // If the key doesn't exist yet, treat as default (true)
        if (typeof result[STORAGE_KEY] === 'boolean') {
          setEnabled(result[STORAGE_KEY] as boolean);
        }
      });
    }

    // Listen for changes (keeps multiple tabs or popup in sync)
    const handler = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (STORAGE_KEY in changes) {
        const v = changes[STORAGE_KEY].newValue;
        if (typeof v === 'boolean') setEnabled(v);
      }
    };
    chrome?.storage?.onChanged?.addListener(handler);
    return () => chrome?.storage?.onChanged?.removeListener(handler);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    chrome?.storage?.local?.set({ [STORAGE_KEY]: next });
  };

  return [enabled, toggle];
};

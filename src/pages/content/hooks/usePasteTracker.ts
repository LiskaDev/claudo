/**
 * usePasteTracker.ts
 * Captures clipboard data on paste events and persists it in sessionStorage.
 * Returns a Map<lineCount, {chars, tokens}> that useInputCounter reads from.
 *
 * Separation rationale: useInputCounter was doing 5 things at once.
 * This module isolates paste capture + persistence into a single-responsibility unit.
 *
 * Created: 2026-04-05
 */

import { useRef } from 'react';

const PASTE_STORAGE_KEY = 'claudo_paste_data';

/** Regex to extract line count from PASTED card aria-label */
export const PASTED_LINES_RE = /(\d[\d,]*)\s*line/;

export type PasteEntry = { chars: number; tokens: number };
export type PasteDataMap = Map<number, PasteEntry>;

export function savePasteMap(map: PasteDataMap): void {
  try {
    const obj: Record<string, PasteEntry> = {};
    map.forEach((v, k) => { obj[k] = v; });
    sessionStorage.setItem(PASTE_STORAGE_KEY, JSON.stringify(obj));
  } catch { /* quota exceeded or disabled — ignore */ }
}

export function loadPasteMap(map: PasteDataMap): void {
  try {
    const raw = sessionStorage.getItem(PASTE_STORAGE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw) as Record<string, PasteEntry>;
    for (const [k, v] of Object.entries(obj)) {
      map.set(parseInt(k, 10), v);
    }
  } catch { /* corrupted data — ignore */ }
}

export function clearPasteStorage(): void {
  try { sessionStorage.removeItem(PASTE_STORAGE_KEY); } catch { /* ignore */ }
}

/** Creates a stable ref holding the paste data map. */
export function usePasteDataMap() {
  return useRef<PasteDataMap>(new Map());
}

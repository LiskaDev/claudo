import { USER_MESSAGE_SELECTOR, ASSISTANT_MESSAGE_SELECTOR } from '@src/constants/selectors';

export type SearchFilter = 'all' | 'user' | 'claude';

// Skip elements that break semantic text search (e.g., math formulas, scripts).
// PRE and CODE are intentionally NOT excluded so that bubble-style cards rendered
// inside <pre><code> blocks (e.g., Claude checklist cards) and inline code are searchable.
const IGNORED_TAGS = new Set(['MATH', 'SVG', 'STYLE', 'SCRIPT', 'NOSCRIPT']);

/**
 * Executes a case-insensitive native DOM search via TreeWalker.
 * Returns an array of `Range` objects representing the exact highlight bounds.
 */
export function executeDomSearch(query: string, filter: SearchFilter): Range[] {
  const matches: Range[] = [];
  if (!query.trim()) return matches;

  const rootNodes: Element[] = [];

  // Determine which message blocks to parse based on the active filter
  if (filter === 'all' || filter === 'user') {
    document.querySelectorAll(USER_MESSAGE_SELECTOR).forEach((el) => rootNodes.push(el));
  }
  if (filter === 'all' || filter === 'claude') {
    document.querySelectorAll(ASSISTANT_MESSAGE_SELECTOR).forEach((el) => rootNodes.push(el));
  }

  // Sort nodes by their vertical DOM position so arrow navigation follows reading order perfectly.
  rootNodes.sort((a, b) => {
    const pos = a.compareDocumentPosition(b);
    return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  const lowercaseQuery = query.toLowerCase();
  const queryLen = lowercaseQuery.length;

  for (const root of rootNodes) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        // Reject empty text
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        // Reject text inside ignored tags
        let parent = node.parentElement;
        while (parent && parent !== root) {
          if (IGNORED_TAGS.has(parent.tagName.toUpperCase())) return NodeFilter.FILTER_REJECT;
          parent = parent.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let textNode = walker.nextNode();
    while (textNode) {
      const text = textNode.textContent || '';
      const lowercaseText = text.toLowerCase();
      let startIndex = 0;

      while ((startIndex = lowercaseText.indexOf(lowercaseQuery, startIndex)) !== -1) {
        const range = document.createRange();
        range.setStart(textNode, startIndex);
        range.setEnd(textNode, startIndex + queryLen);
        matches.push(range);
        startIndex += queryLen;
      }
      textNode = walker.nextNode();
    }
  }

  return matches;
}

/**
 * Polyfill fallback for browsers lacking CSS Custom Highlight API.
 * In a real fallback, we might just scroll to the first element without highlighting.
 */
export const isHighlightApiSupported = () => 'highlights' in CSS;

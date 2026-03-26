import { useState, useEffect } from 'react';
import { CONVERSATION_LINK_SELECTOR, SIDEBAR_NAV_SELECTOR } from '@src/constants/selectors';

export interface Conversation {
  id: string;
  title: string;
  url: string;
  element: Element;
}

const CONV_SELECTOR = `${SIDEBAR_NAV_SELECTOR} ${CONVERSATION_LINK_SELECTOR}`;

export function useConversations(unnamedChatLabel: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const extractConversations = (): Conversation[] => {
      const els = document.querySelectorAll(CONV_SELECTOR);
      return Array.from(els).map(el => ({
        id: el.getAttribute('href') ?? '',
        title: el.textContent?.trim() ?? unnamedChatLabel,
        url: el.getAttribute('href') ?? '',
        element: el,
      }));
    };

    const refresh = () => setConversations(extractConversations());
    refresh();

    const observer = new MutationObserver(refresh);
    const nav = document.querySelector(SIDEBAR_NAV_SELECTOR);
    if (nav) {
      observer.observe(nav, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [unnamedChatLabel]);

  return conversations;
}

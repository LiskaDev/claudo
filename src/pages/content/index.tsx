/**
 * index.tsx
 * Purpose: Content script entry; only mounts the React root component.
 * Last updated: 2026-03-09
 */

import { createRoot } from 'react-dom/client';
import { i18n, initI18n, LANGUAGE_CHANGE_MESSAGE_TYPE } from '@src/services/i18n';
import { APP_ROOT_ID } from '@src/constants/selectors';
import contentStyleText from './style.css?inline';
import Timeline from './components/Timeline';
import FloatBall from './components/FloatBall';
import ExportHub from './components/ExportHub';
import SearchBar from './components/SearchBar';

const mount = async () => {
  await initI18n();

  chrome.runtime.onMessage.addListener((message: unknown) => {
    if (!message || typeof message !== 'object') return;
    const payload = message as { type?: string; lang?: string };
    if (payload.type !== LANGUAGE_CHANGE_MESSAGE_TYPE) return;
    if (payload.lang !== 'en' && payload.lang !== 'zh' && payload.lang !== 'zh-TW') return;
    void i18n.changeLanguage(payload.lang);
  });

  // Inject CSS Custom Highlight styles into the Host Document's <head>.
  // These MUST bypass the Shadow DOM because they target Claude's native text nodes.
  const hostStyle = document.createElement('style');
  hostStyle.id = 'claudo-highlight-styles';
  hostStyle.textContent = `
    ::highlight(claudo-search) {
      background-color: rgba(217, 119, 87, 0.4);
      color: inherit;
    }
    ::highlight(claudo-search-active) {
      background-color: #D97757;
      color: #ffffff;
    }
  `;
  if (!document.getElementById('claudo-highlight-styles')) {
    document.head.appendChild(hostStyle);
  }

  const host = document.createElement('div');
  host.id = `${APP_ROOT_ID}-host`;
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = contentStyleText;
  shadowRoot.appendChild(style);

  const rootContainer = document.createElement('div');
  rootContainer.id = APP_ROOT_ID;

  // Clone Claude's dark mode attributes to piece through the Shadow DOM
  const syncTheme = () => {
    const html = document.documentElement;
    rootContainer.className = html.className;
    ['data-theme', 'data-mode'].forEach(attr => {
      const val = html.getAttribute(attr);
      if (val) rootContainer.setAttribute(attr, val);
      else rootContainer.removeAttribute(attr);
    });
  };
  syncTheme();
  const themeObserver = new MutationObserver(syncTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'data-mode'] });

  shadowRoot.appendChild(rootContainer);

  // Stop keyboard events from bubbling out of the WebComponent and triggering Claude's global typing listeners.
  ['keydown', 'keyup', 'keypress'].forEach(eventType => {
    host.addEventListener(eventType, (e) => e.stopPropagation());
  });

  const root = createRoot(rootContainer);
  root.render(
    <>
      <Timeline />
      <FloatBall />
      <ExportHub />
      <SearchBar />
    </>,
  );
};

void mount();

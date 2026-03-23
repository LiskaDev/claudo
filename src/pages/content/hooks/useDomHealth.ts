import { useState, useEffect } from 'react';
import { CHAT_INPUT_SELECTOR, SIDEBAR_NAV_SELECTOR } from '@src/constants/selectors';

/**
 * Periodically verifies that critical Claude native DOM selectors still exist.
 * If they are consistently missing, it flags the extension as potentially incompatible.
 */
export function useDomHealth() {
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    let failCount = 0;

    const checkHealth = () => {
      let isMissing = false;

      // The sidebar `<nav>` should always exist globally
      if (!document.querySelector(SIDEBAR_NAV_SELECTOR)) {
        isMissing = true;
      }

      // The chat input should always exist when inside a specific chat route
      if (window.location.pathname.startsWith('/chat/')) {
        if (!document.querySelector(CHAT_INPUT_SELECTOR)) {
          isMissing = true;
        }
      }

      if (isMissing) {
        failCount++;
        // If missing consecutively for 15 seconds (3 checks * 5s), trigger warning
        if (failCount >= 3) {
          setIsHealthy(false);
        }
      } else {
        // Reset if healthy DOM is found
        failCount = 0;
        setIsHealthy(true);
      }
    };

    // Initial check after 3 seconds to allow Claude SPA to render
    const initialTimeout = setTimeout(() => {
      checkHealth();
      // Then poll every 5 seconds
      const interval = setInterval(checkHealth, 5000);
      return () => clearInterval(interval);
    }, 3000);

    return () => clearTimeout(initialTimeout);
  }, []);

  return { isHealthy };
}

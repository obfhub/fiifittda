import React, { useEffect, useRef, useState } from 'react';

export function TelegramLoginWidget({ nextPath = '/account' }) {
  const containerRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;

    if (!container) return undefined;

    const loadWidget = async () => {
      try {
        const response = await fetch('/api/telegram-config');
        const config = await response.json();

        if (!response.ok || !config?.botUsername) {
          throw new Error(config?.error || 'Telegram login is not configured.');
        }

        if (!isMounted || !containerRef.current) return;

        const redirectUrl = new URL(config.redirectUri || '/api/telegram-callback', window.location.origin);
        redirectUrl.searchParams.set('next', nextPath);
        containerRef.current.innerHTML = '';

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', config.botUsername);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '8');
        script.setAttribute('data-auth-url', redirectUrl.toString());
        script.setAttribute('data-request-access', 'write');

        containerRef.current.appendChild(script);
      } catch (widgetError) {
        if (isMounted) {
          setError(widgetError.message || 'Telegram login is not available.');
        }
      }
    };

    loadWidget();

    return () => {
      isMounted = false;
      if (container) container.innerHTML = '';
    };
  }, [nextPath]);

  if (error) {
    return (
      <p className="telegram-widget-error reveal-item" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="telegram-widget-shell reveal-item">
      <span className="telegram-widget-label">Conecteaza-te cu Telegram</span>
      <div ref={containerRef} className="telegram-widget-frame" />
    </div>
  );
}

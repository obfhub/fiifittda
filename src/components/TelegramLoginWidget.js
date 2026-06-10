import React, { useEffect, useRef, useState } from 'react';

export function TelegramLoginWidget({ nextPath = '/account' }) {
  const pollTimerRef = useRef(null);
  const [loginState, setLoginState] = useState({
    code: '',
    telegramUrl: '',
    status: 'idle',
    message: 'Deschide Telegram si apasa Start pentru conectare.'
  });

  useEffect(() => () => {
    if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
  }, []);

  const finishLogin = (data) => {
    if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);

    localStorage.setItem('fiifit_user', JSON.stringify(data.user));
    localStorage.setItem('fiifit_auth', JSON.stringify(data.auth));
    localStorage.removeItem('fiifit_session');
    window.location.assign(data.next || nextPath);
  };

  const pollLoginStatus = (code) => {
    if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);

    pollTimerRef.current = window.setInterval(async () => {
      try {
        const response = await fetch('/api/telegram-login-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code })
        });
        const data = await response.json();

        if (data?.status === 'authenticated') {
          finishLogin(data);
          return;
        }

        if (!response.ok || data?.status === 'expired') {
          throw new Error(data?.error || 'Telegram login a expirat. Incearca din nou.');
        }

        setLoginState((current) => ({
          ...current,
          status: 'pending',
          message: 'Astept confirmarea din Telegram...'
        }));
      } catch (error) {
        if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
        setLoginState((current) => ({
          ...current,
          status: 'error',
          message: error.message || 'Telegram login nu este disponibil.'
        }));
      }
    }, 1800);
  };

  const startTelegramLogin = async () => {
    try {
      setLoginState((current) => ({
        ...current,
        status: 'loading',
        message: 'Pregatim linkul Telegram...'
      }));

      const response = await fetch('/api/telegram-login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ next: nextPath })
      });
      const data = await response.json();

      if (!response.ok || !data?.code || !data?.telegramUrl) {
        throw new Error(data?.error || 'Nu am putut porni login-ul Telegram.');
      }

      setLoginState({
        code: data.code,
        telegramUrl: data.telegramUrl,
        status: 'pending',
        message: 'Apasa Start in Telegram. Te conectam automat dupa confirmare.'
      });
      pollLoginStatus(data.code);
      window.open(data.telegramUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setLoginState((current) => ({
        ...current,
        status: 'error',
        message: error.message || 'Telegram login nu este disponibil.'
      }));
    }
  };

  return (
    <div className="telegram-widget-shell reveal-item">
      <button
        className="telegram-deeplink-button"
        type="button"
        onClick={startTelegramLogin}
        disabled={loginState.status === 'loading'}
      >
        <span className="telegram-deeplink-icon" aria-hidden="true">
          <i className="fab fa-telegram-plane"></i>
        </span>
        {loginState.status === 'loading' ? 'Se pregateste...' : 'Conecteaza-te cu Telegram'}
      </button>
      <p className={`telegram-widget-message ${loginState.status === 'error' ? 'error' : ''}`} role="status">
        {loginState.message}
      </p>
      {loginState.telegramUrl && (
        <a className="telegram-widget-fallback" href={loginState.telegramUrl} target="_blank" rel="noreferrer">
          Redeschide Telegram
        </a>
      )}
    </div>
  );
}

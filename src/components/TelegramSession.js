import React, { useEffect, useState } from 'react';
import './Signup.css';

export function TelegramSession() {
  const [message, setMessage] = useState('Se conecteaza contul Telegram...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextPath = params.get('next') || '/account';
    const safeNextPath = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/account';

    const syncSession = async () => {
      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        const data = await response.json();

        if (!response.ok || !data?.authenticated || !data?.user) {
          throw new Error('Nu am putut confirma sesiunea Telegram.');
        }

        localStorage.setItem('fiifit_user', JSON.stringify(data.user));
        localStorage.setItem('fiifit_auth', JSON.stringify({ authenticated: true, expires_at: data.expires_at }));
        localStorage.removeItem('fiifit_session');
        window.location.replace(safeNextPath);
      } catch (error) {
        setMessage(error.message || 'Telegram login a esuat. Incearca din nou.');
        window.setTimeout(() => {
          window.location.replace('/login');
        }, 1800);
      }
    };

    syncSession();
  }, []);

  return (
    <main className="signup-page telegram-session-page">
      <section className="signup-form-side telegram-session-panel">
        <div className="signup-form">
          <div className="signup-title reveal-item">
            <span className="signup-kicker">Telegram</span>
            <h1>Conectare cont</h1>
            <p>{message}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

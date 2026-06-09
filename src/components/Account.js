import React, { useEffect, useState } from 'react';
import './Account.css';

function clearStoredAuth() {
  localStorage.removeItem('fiifit_user');
  localStorage.removeItem('fiifit_auth');
  localStorage.removeItem('fiifit_session');
}

function getStoredAuth() {
  try {
    const user = JSON.parse(localStorage.getItem('fiifit_user') || 'null');
    const auth = JSON.parse(localStorage.getItem('fiifit_auth') || 'null');
    const expiresAt = Number(auth?.expires_at || 0) * 1000;

    if (!user || !auth?.authenticated) return null;
    if (expiresAt && expiresAt < Date.now()) return null;

    return { user, auth };
  } catch (error) {
    return null;
  }
}

export function Account() {
  const [{ user, auth }, setAuth] = useState(() => getStoredAuth() || { user: null, auth: null });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const storedAuth = getStoredAuth();

      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        const data = await response.json();

        if (!response.ok || !data.authenticated) {
          if (storedAuth) {
            if (isMounted) {
              setAuth(storedAuth);
              setIsChecking(false);
            }
            return;
          }

          clearStoredAuth();
          window.location.replace('/login');
          return;
        }

        localStorage.setItem('fiifit_user', JSON.stringify(data.user));
        localStorage.setItem('fiifit_auth', JSON.stringify({ authenticated: true, expires_at: data.expires_at }));

        if (isMounted) {
          setAuth({ user: data.user, auth: { authenticated: true, expires_at: data.expires_at } });
          setIsChecking(false);
        }
      } catch (error) {
        if (storedAuth) {
          if (isMounted) {
            setAuth(storedAuth);
            setIsChecking(false);
          }
          return;
        }

        clearStoredAuth();
        window.location.replace('/login');
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      // Local logout still happens even if the network call fails.
    }

    clearStoredAuth();
    window.location.href = '/login';
  };

  if (isChecking || !user) {
    return (
      <main className="account-page">
        <p>Se verifica sesiunea...</p>
      </main>
    );
  }

  return (
    <main className="account-page">
      <a className="account-back" href="/" aria-label="Inapoi la pagina principala">
        <i className="fas fa-arrow-left"></i>
        FiiFit.online
      </a>

      <section className="account-shell">
        <div className="account-hero">
          <span className="account-kicker">Cont activ</span>
          <h1>Bine ai venit, {user.name || user.email}</h1>
          <p>Esti autentificat in contul tau FiiFit. De aici poti continua catre program si iti poti gestiona accesul.</p>
        </div>

        <div className="account-grid">
          <article className="account-card">
            <span>
              <i className="fas fa-user-check" aria-hidden="true"></i>
            </span>
            <h2>Date cont</h2>
            <p>{user.email}</p>
          </article>

          <article className="account-card">
            <span>
              <i className="fas fa-lock" aria-hidden="true"></i>
            </span>
            <h2>Sesiune</h2>
            <p>Autentificat pana la {new Date(Number(auth?.expires_at || 0) * 1000).toLocaleString()}.</p>
          </article>

          <article className="account-card">
            <span>
              <i className="fas fa-dumbbell" aria-hidden="true"></i>
            </span>
            <h2>Program</h2>
            <p>Zona de lectii pentru membri poate fi legata aici.</p>
          </article>
        </div>

        <div className="account-actions">
          <a href="/#lectii">Mergi la lectii</a>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </section>
    </main>
  );
}

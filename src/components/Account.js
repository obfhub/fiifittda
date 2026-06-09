import React, { useEffect, useState } from 'react';
import './Account.css';

function readStoredAuth() {
  try {
    const user = JSON.parse(localStorage.getItem('fiifit_user') || 'null');
    const auth = JSON.parse(localStorage.getItem('fiifit_auth') || 'null');
    const session = JSON.parse(localStorage.getItem('fiifit_session') || 'null');
    return { user, auth, session };
  } catch (error) {
    return { user: null, auth: null, session: null };
  }
}

function clearStoredAuth() {
  localStorage.removeItem('fiifit_user');
  localStorage.removeItem('fiifit_auth');
  localStorage.removeItem('fiifit_session');
}

export function Account() {
  const [{ user, auth }, setAuth] = useState(() => ({ user: null, auth: null, session: null }));

  useEffect(() => {
    const storedAuth = readStoredAuth();
    const expiresAt = Number(storedAuth.auth?.expires_at || storedAuth.session?.expires_at || 0) * 1000;
    const isExpired = expiresAt && expiresAt < Date.now();

    if (!storedAuth.user || !storedAuth.auth?.authenticated || isExpired) {
      window.location.href = '/login';
      return;
    }

    setAuth(storedAuth);
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    window.location.href = '/login';
  };

  if (!user) {
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

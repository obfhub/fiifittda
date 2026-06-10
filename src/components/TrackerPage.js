import React, { useEffect, useState } from 'react';
import { MacroTracker } from './MacroTracker';
import { getStoredAuth, getUserMembership } from '../utils/membership';
import './TrackerPage.css';

function clearStoredAuth() {
  localStorage.removeItem('fiifit_user');
  localStorage.removeItem('fiifit_auth');
  localStorage.removeItem('fiifit_session');
}

export function TrackerPage() {
  const [state, setState] = useState(() => ({
    checking: true,
    user: getStoredAuth()?.user || null,
    membership: null
  }));

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      const storedAuth = getStoredAuth();

      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        const data = await response.json();

        if (response.ok && data?.authenticated && data?.user) {
          localStorage.setItem('fiifit_user', JSON.stringify(data.user));
          localStorage.setItem('fiifit_auth', JSON.stringify({ authenticated: true, expires_at: data.expires_at }));

          if (!isMounted) return;
          setState({
            checking: false,
            user: data.user,
            membership: getUserMembership(data.user)
          });
          return;
        }
      } catch (error) {
        // Local auth fallback below keeps the app usable if the session endpoint is temporarily unavailable.
      }

      if (storedAuth) {
        if (!isMounted) return;
        setState({
          checking: false,
          user: storedAuth.user,
          membership: getUserMembership(storedAuth.user)
        });
        return;
      }

      clearStoredAuth();
      window.location.replace(`/login?next=${encodeURIComponent('/tracker')}`);
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state.checking && state.user && !state.membership) {
      window.location.replace('/account?locked=tracker');
    }
  }, [state]);

  if (state.checking || !state.user || !state.membership) {
    return (
      <main className="tracker-page">
        <a className="tracker-back" href="/account">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Cont FiiFit
        </a>
        <section className="tracker-loading">
          <span>Tracker membri</span>
          <h1>Se verifica accesul</h1>
          <p>Trackerul este disponibil pentru conturile cu plan activ.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="tracker-page">
      <a className="tracker-back" href="/account">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Cont FiiFit
      </a>
      <section className="tracker-member-hero">
        <span>Instrument pentru membri</span>
        <h1>Tracker nutritie</h1>
        <p>
          Inclus in planul {state.membership.plan.duration}. Foloseste-l pentru poze,
          text, portii si scorul de sanatate al meselor tale.
        </p>
      </section>
      <MacroTracker />
    </main>
  );
}

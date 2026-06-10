import React, { useEffect, useMemo, useState } from 'react';
import './Account.css';
import {
  getStoredAuth,
  getUserMembership,
  memberVideos,
  personalizedPlan,
  saveUserMembership
} from '../utils/membership';

const availablePlans = [
  {
    duration: '3 Luni',
    price: '175 EUR',
    description: '120 zile pentru stilul tau de viata sanatos',
    note: '+1 luna cadou'
  },
  {
    duration: '6 Luni',
    price: '275 EUR',
    description: '180 zile pentru stilul tau de viata sanatos',
    note: 'Cel mai popular'
  },
  {
    duration: '12 Luni',
    price: '365 EUR',
    description: '365 zile pentru stilul tau de viata sanatos',
    note: 'Transformare completa'
  }
];

function clearStoredAuth() {
  localStorage.removeItem('fiifit_user');
  localStorage.removeItem('fiifit_auth');
  localStorage.removeItem('fiifit_session');
}

export function Account() {
  const storedAuth = useMemo(() => getStoredAuth(), []);
  const [{ user, auth }, setAuth] = useState(() => storedAuth || { user: null, auth: null });
  const [membership, setMembership] = useState(() => (storedAuth?.user ? getUserMembership(storedAuth.user) : null));
  const [isChecking, setIsChecking] = useState(true);
  const isLockedFromTracker = new URLSearchParams(window.location.search).get('locked') === 'tracker';

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const fallbackAuth = getStoredAuth();

      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        const data = await response.json();

        if (!response.ok || !data.authenticated) {
          if (fallbackAuth) {
            if (isMounted) {
              setAuth(fallbackAuth);
              setMembership(getUserMembership(fallbackAuth.user));
              setIsChecking(false);
            }
            return;
          }

          clearStoredAuth();
          window.location.replace('/login');
          return;
        }

        const nextAuth = { authenticated: true, expires_at: data.expires_at };
        localStorage.setItem('fiifit_user', JSON.stringify(data.user));
        localStorage.setItem('fiifit_auth', JSON.stringify(nextAuth));

        if (isMounted) {
          setAuth({ user: data.user, auth: nextAuth });
          setMembership(getUserMembership(data.user));
          setIsChecking(false);
        }
      } catch (error) {
        if (fallbackAuth) {
          if (isMounted) {
            setAuth(fallbackAuth);
            setMembership(getUserMembership(fallbackAuth.user));
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

  const handleActivatePlan = (plan) => {
    const nextMembership = saveUserMembership(user, plan);
    if (nextMembership) {
      setMembership(nextMembership);
      window.history.replaceState({}, '', '/account');
    }
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
        {isLockedFromTracker && !membership && (
          <div className="account-alert">
            <i className="fas fa-lock" aria-hidden="true"></i>
            Trackerul este disponibil doar dupa activarea unui plan.
          </div>
        )}

        <div className="account-hero">
          <span className="account-kicker">{membership ? 'Membru activ' : 'Cont creat'}</span>
          <h1>Bine ai venit, {user.name || user.email}</h1>
          <p>
            Aici vezi planul tau, lectiile video, planul personalizat si instrumentele
            incluse in programul FiiFit.
          </p>
        </div>

        <div className="account-grid">
          <article className="account-card account-plan-card">
            <span>
              <i className="fas fa-crown" aria-hidden="true"></i>
            </span>
            <h2>Planul tau</h2>
            {membership ? (
              <>
                <strong>{membership.plan.duration}</strong>
                <p>{membership.plan.description}</p>
                <small>Activat pe {new Date(membership.startedAt).toLocaleDateString()}</small>
              </>
            ) : (
              <>
                <strong>Nu ai plan activ</strong>
                <p>Alege un abonament ca sa deblochezi lectiile, trackerul si planul personalizat.</p>
              </>
            )}
          </article>

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
        </div>

        {!membership && (
          <section id="account-plans" className="account-plan-picker">
            <div className="account-section-heading">
              <span>Activeaza accesul</span>
              <h2>Alege planul tau</h2>
              <p>
                Pentru test, activezi accesul direct fara plata. Mai tarziu putem lega
                acelasi pas de Stripe.
              </p>
            </div>

            <div className="account-plan-options">
              {availablePlans.map((plan) => (
                <article className={plan.duration === '6 Luni' ? 'featured' : ''} key={plan.duration}>
                  <span>{plan.note}</span>
                  <h3>{plan.duration}</h3>
                  <p>{plan.description}</p>
                  <strong>{plan.price}</strong>
                  <button type="button" onClick={() => handleActivatePlan(plan)}>
                    Activeaza planul
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className={`account-member-section ${!membership ? 'locked' : ''}`}>
          <div className="account-section-heading">
            <span>Video-uri</span>
            <h2>Lectiile tale</h2>
            <p>{membership ? `${memberVideos.length} lectii de start disponibile.` : 'Activeaza un plan pentru acces la lectii.'}</p>
          </div>

          <div className="account-video-grid">
            {memberVideos.map((video, index) => (
              <article className="account-video-card" key={video.title}>
                <div className="video-play">
                  <i className={`fas ${membership ? 'fa-play' : 'fa-lock'}`} aria-hidden="true"></i>
                </div>
                <span>{String(index + 1).padStart(2, '0')} / {video.type}</span>
                <h3>{video.title}</h3>
                <p>{video.duration}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`account-member-section ${!membership ? 'locked' : ''}`}>
          <div className="account-section-heading">
            <span>Plan personalizat</span>
            <h2>Saptamana ta FiiFit</h2>
            <p>
              {membership
                ? 'Un ghid simplu pentru antrenamente, mese, tracker si mentinerea ritmului.'
                : 'Planul saptamanal apare aici dupa activarea abonamentului.'}
            </p>
          </div>

          <div className="personal-plan-list">
            {personalizedPlan.map((item) => (
              <article key={item.day}>
                <strong>{item.day}</strong>
                <div>
                  <h3>{item.focus}</h3>
                  <p>{item.action}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="account-actions">
          {membership ? (
            <>
              <a href="/tracker">Deschide trackerul</a>
              <a href="/#lectii" className="account-secondary-action">Vezi lectiile publice</a>
            </>
          ) : (
            <a href="#account-plans">Alege un plan</a>
          )}
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </section>
    </main>
  );
}

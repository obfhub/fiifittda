import React, { useEffect, useMemo, useState } from 'react';
import './Admin.css';

const planOptions = ['3 Luni', '6 Luni', '12 Luni'];

function formatDate(value) {
  if (!value) return 'Niciodata';
  return new Date(value).toLocaleString();
}

function AnalyticsBar({ item, total }) {
  const percent = total ? Math.round((item.count / total) * 100) : 0;

  return (
    <div className="admin-analytics-bar">
      <div>
        <span>{item.label}</span>
        <strong>{item.count}</strong>
      </div>
      <div className="admin-bar-track" aria-hidden="true">
        <span style={{ width: `${percent}%` }}></span>
      </div>
    </div>
  );
}

function MiniUser({ user, label }) {
  return (
    <article className="admin-mini-user">
      <div className="admin-avatar small">{(user.name || user.email || '?').slice(0, 1).toUpperCase()}</div>
      <div>
        <strong>{user.name || user.email || 'Fara nume'}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}

export function Admin() {
  const [dashboard, setDashboard] = useState(null);
  const [selectedPlans, setSelectedPlans] = useState({});
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Se incarca adminul...');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState('');

  const loadDashboard = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin', { credentials: 'include' });
      const data = await response.json();

      if (response.status === 401) {
        window.location.replace(`/login?next=${encodeURIComponent('/admin')}`);
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Nu am putut incarca adminul.');
      }

      setDashboard(data);
      setStatus('Admin conectat.');
      setSelectedPlans(
        data.users.reduce((plans, user) => ({
          ...plans,
          [user.id]: user.membership?.plan?.duration || '6 Luni'
        }), {})
      );
    } catch (loadError) {
      setError(loadError.message || 'Nu am putut incarca adminul.');
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const users = dashboard?.users || [];

    if (!normalizedQuery) return users;

    return users.filter((user) => [
      user.email,
      user.name,
      user.provider,
      user.telegram_username,
      user.membership?.plan?.duration
    ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery)));
  }, [dashboard, query]);

  const updateUser = async (user, action) => {
    setUpdatingUserId(user.id);
    setError('');

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          action,
          plan: selectedPlans[user.id] || '6 Luni'
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Nu am putut actualiza utilizatorul.');
      }

      setDashboard((current) => {
        if (!current) return current;

        const users = current.users.map((item) => (item.id === user.id ? data.user : item));
        const activePlans = users.filter((item) => item.membership?.status === 'active').length;

        return {
          ...current,
          users,
          stats: {
            ...current.stats,
            activePlans
          }
        };
      });
      setStatus(action === 'grant-plan' ? 'Plan activat.' : 'Plan eliminat.');
    } catch (updateError) {
      setError(updateError.message || 'Nu am putut actualiza utilizatorul.');
    } finally {
      setUpdatingUserId('');
    }
  };

  if (isLoading) {
    return (
      <main className="admin-page">
        <p>{status}</p>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <a className="admin-back" href="/" aria-label="Inapoi la pagina principala">
        <i className="fas fa-arrow-left"></i>
        FiiFit.online
      </a>

      <section className="admin-shell">
        <div className="admin-hero">
          <div>
            <span>Panou admin</span>
            <h1>Control FiiFit</h1>
            <p>Utilizatori, planuri, acces tracker si status Telegram intr-un singur loc.</p>
          </div>
          <button type="button" onClick={loadDashboard}>Refresh</button>
        </div>

        {error && <div className="admin-alert">{error}</div>}
        {status && !error && <div className="admin-status">{status}</div>}

        {dashboard && (
          <>
            <section className="admin-stats-grid">
              <article>
                <span>Utilizatori</span>
                <strong>{dashboard.stats.users}</strong>
              </article>
              <article>
                <span>Planuri active</span>
                <strong>{dashboard.stats.activePlans}</strong>
              </article>
              <article>
                <span>Telegram</span>
                <strong>{dashboard.stats.telegramUsers}</strong>
              </article>
              <article>
                <span>Email</span>
                <strong>{dashboard.stats.emailUsers}</strong>
              </article>
            </section>

            <section className="admin-analytics-grid">
              <article className="admin-analytics-card primary">
                <span>Conversie plan</span>
                <strong>{dashboard.analytics.conversionRate}%</strong>
                <p>{dashboard.stats.activePlans} din {dashboard.stats.users} utilizatori au plan activ.</p>
              </article>

              <article className="admin-analytics-card">
                <span>Ultimele 7 zile</span>
                <strong>{dashboard.analytics.recentSignups}</strong>
                <p>conturi noi</p>
                <small>{dashboard.analytics.recentlyActive} utilizatori activi recent</small>
              </article>

              <article className="admin-analytics-card">
                <span>Telegram flow</span>
                <strong>{dashboard.analytics.telegramCompletionRate}%</strong>
                <p>{dashboard.telegram.used} login-uri finalizate din {dashboard.telegram.total} coduri.</p>
              </article>

              <article className="admin-distribution-card">
                <span>Mix planuri</span>
                {dashboard.analytics.planMix.map((item) => (
                  <AnalyticsBar item={item} total={dashboard.stats.activePlans} key={item.label} />
                ))}
              </article>

              <article className="admin-distribution-card">
                <span>Surse conturi</span>
                {dashboard.analytics.providerMix.map((item) => (
                  <AnalyticsBar item={item} total={dashboard.stats.users} key={item.label} />
                ))}
              </article>

              <article className="admin-ops-card">
                <span>Sanatate sistem</span>
                {dashboard.analytics.operations.map((item) => (
                  <div className={item.status === 'OK' ? 'ok' : 'bad'} key={item.label}>
                    <strong>{item.label}</strong>
                    <small>{item.status} · {item.detail}</small>
                  </div>
                ))}
              </article>
            </section>

            <section className="admin-activity-grid">
              <article>
                <div className="admin-activity-heading">
                  <span>Conturi noi</span>
                  <strong>Recent</strong>
                </div>
                {dashboard.analytics.newestUsers.map((user) => (
                  <MiniUser user={user} label={formatDate(user.created_at)} key={user.id} />
                ))}
              </article>

              <article>
                <div className="admin-activity-heading">
                  <span>Activitate</span>
                  <strong>Ultimele login-uri</strong>
                </div>
                {dashboard.analytics.activeRecently.length > 0 ? (
                  dashboard.analytics.activeRecently.map((user) => (
                    <MiniUser user={user} label={formatDate(user.last_sign_in_at)} key={user.id} />
                  ))
                ) : (
                  <p className="admin-empty-state">Nu exista login-uri recente inca.</p>
                )}
              </article>
            </section>

            <section className="admin-users-section">
              <div className="admin-section-heading">
                <div>
                  <span>Administrare acces</span>
                  <h2>Utilizatori</h2>
                </div>
                <input
                  type="search"
                  placeholder="Cauta dupa email, nume, plan..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <div className="admin-users-list">
                {filteredUsers.map((user) => {
                  const hasPlan = user.membership?.status === 'active';
                  const isUpdating = updatingUserId === user.id;

                  return (
                    <article className="admin-user-card" key={user.id}>
                      <div className="admin-user-main">
                        <div className="admin-avatar">{(user.name || user.email || '?').slice(0, 1).toUpperCase()}</div>
                        <div>
                          <h3>{user.name || 'Fara nume'}</h3>
                          <p>{user.email}</p>
                          <small>
                            {user.provider === 'telegram' || user.telegram_username
                              ? `Telegram ${user.telegram_username ? `@${user.telegram_username}` : ''}`
                              : 'Email'}
                          </small>
                        </div>
                      </div>

                      <div className="admin-user-meta">
                        <span className={hasPlan ? 'active' : ''}>
                          {hasPlan ? user.membership.plan.duration : 'Fara plan'}
                        </span>
                        <small>Creat: {formatDate(user.created_at)}</small>
                        <small>Ultimul login: {formatDate(user.last_sign_in_at)}</small>
                      </div>

                      <div className="admin-user-actions">
                        <select
                          value={selectedPlans[user.id] || '6 Luni'}
                          onChange={(event) => setSelectedPlans((current) => ({ ...current, [user.id]: event.target.value }))}
                          disabled={isUpdating}
                        >
                          {planOptions.map((plan) => (
                            <option value={plan} key={plan}>{plan}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => updateUser(user, 'grant-plan')} disabled={isUpdating}>
                          {hasPlan ? 'Schimba planul' : 'Activeaza'}
                        </button>
                        {hasPlan && (
                          <button className="danger" type="button" onClick={() => updateUser(user, 'remove-plan')} disabled={isUpdating}>
                            Revoca
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

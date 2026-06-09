import React, { useState } from 'react';
import './Signup.css';

const orbitIcons = [
  { icon: 'fa-envelope', label: 'Email sigur', radius: 105, delay: 0, size: 'small' },
  { icon: 'fa-key', label: 'Reset parola', radius: 105, delay: -10, size: 'small' },
  { icon: 'fa-lock', label: 'Acces protejat', radius: 165, delay: -4, reverse: true },
  { icon: 'fa-heart-pulse', label: 'FiiFit', radius: 165, delay: -14, reverse: true },
  { icon: 'fa-shield-halved', label: 'Siguranta', radius: 225, delay: -8 },
  { icon: 'fa-user-check', label: 'Contul tau', radius: 225, delay: -18 }
];

function OrbitIcon({ item }) {
  return (
    <span
      className={`signup-orbit ${item.reverse ? 'reverse' : ''}`}
      style={{
        '--orbit-radius': `${item.radius}px`,
        '--orbit-delay': `${item.delay}s`
      }}
    >
      <span className={`signup-orbit-icon ${item.size || ''}`} title={item.label}>
        <i className={`fas ${item.icon}`} aria-hidden="true"></i>
        <span className="sr-only">{item.label}</span>
      </span>
    </span>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSent(false);

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Introdu o adresa de email valida.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Nu am putut trimite emailul.');
      }

      setSent(true);
    } catch (requestError) {
      setError(requestError.message || 'Nu am putut trimite emailul.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-page">
      <a className="signup-back" href="/login" aria-label="Inapoi la login">
        <i className="fas fa-arrow-left"></i>
        Login
      </a>

      <section className="signup-visual" aria-label="Resetare parola">
        <div className="signup-ripples" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <span
              key={index}
              style={{
                '--ripple-size': `${120 + index * 72}px`,
                '--ripple-opacity': Math.max(0.05, 0.28 - index * 0.025),
                '--ripple-delay': `${index * -0.18}s`
              }}
            ></span>
          ))}
        </div>
        <div className="signup-orbit-display">
          <div className="signup-orbit-copy">
            <span>FiiFit</span>
            <strong>Recupereaza accesul in cont</strong>
          </div>
          {orbitIcons.map((item) => (
            <OrbitIcon item={item} key={item.label} />
          ))}
        </div>
      </section>

      <section className="signup-form-side">
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="signup-title reveal-item">
            <span className="signup-kicker">Ai uitat parola?</span>
            <h1>Trimite link de resetare</h1>
            <p>Introdu emailul contului tau si iti trimitem un link securizat pentru parola noua.</p>
          </div>

          <div className="signup-field reveal-item">
            <label htmlFor="forgot-email">
              Email <span>*</span>
            </label>
            <div className="signup-input-glow">
              <div className="signup-input-inner">
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  placeholder="Introdu adresa de email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                    setSent(false);
                  }}
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <span className="signup-error">{error || '\u00A0'}</span>
          </div>

          {sent && (
            <p className="signup-success" role="status">
              Daca exista un cont cu acest email, linkul de resetare a fost trimis.
            </p>
          )}

          <button className="signup-submit reveal-item" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Se trimite...' : 'Trimite link'} <span aria-hidden="true">→</span>
          </button>
        </form>
      </section>
    </main>
  );
}

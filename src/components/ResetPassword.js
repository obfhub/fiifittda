import React, { useState } from 'react';
import './Signup.css';

export function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (password.length < 6) nextErrors.password = 'Parola trebuie sa aiba cel putin 6 caractere.';
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Parolele nu coincid.';

    setErrors(nextErrors);
    setSuccess(false);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password })
      });
      const data = await response.json();

      if (!response.ok) {
        if (data?.field) {
          setErrors({ [data.field]: data.error || 'Nu am putut reseta parola.' });
        } else {
          setErrors({ form: data?.error || 'Nu am putut reseta parola.' });
        }
        return;
      }

      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrors({ form: error.message || 'Nu am putut reseta parola.' });
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

      <section className="signup-visual" aria-label="Parola noua">
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
            <strong>Alege o parola noua</strong>
          </div>
        </div>
      </section>

      <section className="signup-form-side">
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="signup-title reveal-item">
            <span className="signup-kicker">Resetare parola</span>
            <h1>Seteaza parola noua</h1>
            <p>Linkul este valabil o perioada limitata. Dupa resetare te poti autentifica normal.</p>
          </div>

          <div className="signup-field reveal-item">
            <label htmlFor="new-password">
              Parola noua <span>*</span>
            </label>
            <div className="signup-input-glow">
              <div className="signup-input-inner">
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Creeaza parola noua"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <span className="signup-error">{errors.password || '\u00A0'}</span>
          </div>

          <div className="signup-field reveal-item">
            <label htmlFor="confirm-password">
              Confirma parola <span>*</span>
            </label>
            <div className="signup-input-glow">
              <div className="signup-input-inner">
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeta parola noua"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <span className="signup-error">{errors.confirmPassword || '\u00A0'}</span>
          </div>

          {success && (
            <p className="signup-success" role="status">
              Parola a fost resetata. Te poti autentifica acum.
            </p>
          )}

          {errors.form && (
            <p className="signup-form-error reveal-item" role="alert">
              {errors.form}
            </p>
          )}

          <button className="signup-submit reveal-item" type="submit" disabled={isSubmitting || !email || !token}>
            {isSubmitting ? 'Se salveaza...' : 'Salveaza parola'} <span aria-hidden="true">→</span>
          </button>
        </form>
      </section>
    </main>
  );
}

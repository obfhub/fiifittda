import React, { useState } from 'react';
import './Signup.css';

const orbitIcons = [
  { icon: 'fa-lock', label: 'Acces securizat', radius: 105, delay: 0, size: 'small' },
  { icon: 'fa-user-check', label: 'Cont verificat', radius: 105, delay: -10, size: 'small' },
  { icon: 'fa-dumbbell', label: 'Fitness', radius: 165, delay: -4, reverse: true },
  { icon: 'fa-person-running', label: 'Miscare', radius: 165, delay: -14, reverse: true },
  { icon: 'fa-heart-pulse', label: 'Sanatate', radius: 225, delay: -8 },
  { icon: 'fa-bottle-water', label: 'Hidratare', radius: 225, delay: -18 },
  { icon: 'fa-seedling', label: 'Stil de viata', radius: 285, delay: -3, reverse: true },
  { icon: 'fa-star', label: 'Comunitate', radius: 285, delay: -13, reverse: true }
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

function LoginInput({ label, error, type = 'text', ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleMouseMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mouse-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--mouse-y', `${event.clientY - bounds.top}px`);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="signup-field reveal-item">
      <label htmlFor={props.id}>
        {label} <span>*</span>
      </label>
      <div className="signup-input-glow" onMouseMove={handleMouseMove}>
        <div className="signup-input-inner">
          <input type={inputType} {...props} />
          {type === 'password' && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ascunde parola' : 'Arata parola'}
            >
              <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
            </button>
          )}
        </div>
      </div>
      <span className="signup-error">{error || '\u00A0'}</span>
    </div>
  );
}

export function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '', form: '' }));
    setLoggedIn(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = 'Introdu adresa de email.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Adresa de email nu este valida.';
    }
    if (!formData.password) {
      nextErrors.password = 'Introdu parola.';
    }

    setErrors(nextErrors);
    setLoggedIn(false);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/login-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok) {
        if (data?.field && data.field !== 'form') {
          setErrors({ [data.field]: data.error || 'Nu am putut autentifica.' });
        } else {
          setErrors({ form: data?.error || 'Nu am putut autentifica.' });
        }
        return;
      }

      localStorage.setItem('fiifit_user', JSON.stringify(data.user));
      localStorage.setItem('fiifit_session', JSON.stringify(data.session));
      setLoggedIn(true);
      setFormData((current) => ({ ...current, password: '' }));
    } catch (error) {
      setErrors({ form: error.message || 'Nu am putut autentifica.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-page">
      <a className="signup-back" href="/" aria-label="Inapoi la pagina principala">
        <i className="fas fa-arrow-left"></i>
        FiiFit.online
      </a>

      <section className="signup-visual" aria-label="Login FiiFit">
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
            <strong>Bine ai revenit in program</strong>
          </div>
          {orbitIcons.map((item) => (
            <OrbitIcon item={item} key={item.label} />
          ))}
        </div>
      </section>

      <section className="signup-form-side">
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="signup-title reveal-item">
            <span className="signup-kicker">Acces membru</span>
            <h1>Autentifica-te</h1>
            <p>Intra in contul tau FiiFit si continua programul de transformare.</p>
          </div>

          <LoginInput
            label="Email"
            id="login-email"
            name="email"
            type="email"
            placeholder="Introdu adresa de email"
            value={formData.email}
            onChange={updateField}
            error={errors.email}
            autoComplete="email"
            disabled={isSubmitting}
          />
          <LoginInput
            label="Parola"
            id="login-password"
            name="password"
            type="password"
            placeholder="Introdu parola"
            value={formData.password}
            onChange={updateField}
            error={errors.password}
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          {loggedIn && (
            <p className="signup-success" role="status">
              Te-ai autentificat cu succes.
            </p>
          )}

          {errors.form && (
            <p className="signup-form-error reveal-item" role="alert">
              {errors.form}
            </p>
          )}

          <button className="signup-submit reveal-item" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Se autentifica...' : 'Autentifica-te'} <span aria-hidden="true">→</span>
          </button>

          <p className="signup-login reveal-item">
            Nu ai cont? <a href="/signup">Creeaza-ti contul</a>
          </p>
        </form>
      </section>
    </main>
  );
}

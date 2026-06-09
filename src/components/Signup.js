import React, { useState } from 'react';
import './Signup.css';

const orbitIcons = [
  { icon: 'fa-apple-whole', label: 'Nutriție', radius: 105, delay: 0, size: 'small' },
  { icon: 'fa-carrot', label: 'Alimentație sănătoasă', radius: 105, delay: -10, size: 'small' },
  { icon: 'fa-dumbbell', label: 'Fitness', radius: 165, delay: -4, reverse: true },
  { icon: 'fa-person-running', label: 'Mișcare', radius: 165, delay: -14, reverse: true },
  { icon: 'fa-heart-pulse', label: 'Sănătate', radius: 225, delay: -8 },
  { icon: 'fa-bottle-water', label: 'Hidratare', radius: 225, delay: -18 },
  { icon: 'fa-bicycle', label: 'Activitate fizică', radius: 285, delay: -3, reverse: true },
  { icon: 'fa-seedling', label: 'Stil de viață', radius: 285, delay: -13, reverse: true }
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

function SignupInput({ label, error, type = 'text', ...props }) {
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
              aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
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

export function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Introdu numele tău.';
    if (!formData.email.trim()) {
      nextErrors.email = 'Introdu adresa de email.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Adresa de email nu este validă.';
    }
    if (formData.password.length < 6) {
      nextErrors.password = 'Parola trebuie să aibă cel puțin 6 caractere.';
    }

    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  };

  return (
    <main className="signup-page">
      <a className="signup-back" href="/" aria-label="Înapoi la pagina principală">
        <i className="fas fa-arrow-left"></i>
        FiiFit.online
      </a>

      <section className="signup-visual" aria-label="Nutriție și fitness">
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
            <strong>Transformarea începe cu tine</strong>
          </div>
          {orbitIcons.map((item) => (
            <OrbitIcon item={item} key={item.label} />
          ))}
        </div>
      </section>

      <section className="signup-form-side">
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="signup-title reveal-item">
            <span className="signup-kicker">Bine ai venit în comunitate</span>
            <h1>Creează-ți contul</h1>
            <p>Începe călătoria către o versiune mai sănătoasă și mai puternică a ta.</p>
          </div>

          <button className="google-signup reveal-item" type="button">
            <span className="google-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </span>
            Continuă cu Google
          </button>

          <div className="signup-divider reveal-item">
            <span></span>
            <p>sau</p>
            <span></span>
          </div>

          <SignupInput
            label="Nume complet"
            id="signup-name"
            name="name"
            placeholder="Introdu numele tău"
            value={formData.name}
            onChange={updateField}
            error={errors.name}
            autoComplete="name"
          />
          <SignupInput
            label="Email"
            id="signup-email"
            name="email"
            type="email"
            placeholder="Introdu adresa de email"
            value={formData.email}
            onChange={updateField}
            error={errors.email}
            autoComplete="email"
          />
          <SignupInput
            label="Parolă"
            id="signup-password"
            name="password"
            type="password"
            placeholder="Creează o parolă"
            value={formData.password}
            onChange={updateField}
            error={errors.password}
            autoComplete="new-password"
          />

          {submitted && (
            <p className="signup-success" role="status">
              Contul este pregătit. Bine ai venit în FiiFit!
            </p>
          )}

          <button className="signup-submit reveal-item" type="submit">
            Creează contul <span aria-hidden="true">→</span>
          </button>

          <p className="signup-login reveal-item">
            Ai deja un cont? <button type="button">Autentifică-te</button>
          </p>
        </form>
      </section>
    </main>
  );
}

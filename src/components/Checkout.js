import { CreditCard, Gift, Lock } from 'lucide-react';
import React, { useEffect, useId, useState } from 'react';
import './Signup.css';
import './Checkout.css';
import Welcome from './ui/Welcome';

const orbitIcons = [
  { icon: 'fa-credit-card', label: 'Plata sigura', radius: 105, delay: 0, size: 'small' },
  { icon: 'fa-lock', label: 'Date protejate', radius: 105, delay: -10, size: 'small' },
  { icon: 'fa-dumbbell', label: 'Fitness', radius: 165, delay: -4, reverse: true },
  { icon: 'fa-person-running', label: 'Miscare', radius: 165, delay: -14, reverse: true },
  { icon: 'fa-heart-pulse', label: 'Sanatate', radius: 225, delay: -8 },
  { icon: 'fa-bottle-water', label: 'Hidratare', radius: 225, delay: -18 },
  { icon: 'fa-seedling', label: 'Stil de viata', radius: 285, delay: -3, reverse: true },
  { icon: 'fa-gift', label: 'Acces bonus', radius: 285, delay: -13, reverse: true }
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

function getSelectedPlan() {
  const params = new URLSearchParams(window.location.search);

  return {
    duration: params.get('plan') || 'FiiFit Online',
    price: params.get('price') || '275€',
    description: params.get('description') || 'Acces complet la program'
  };
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

export function Checkout() {
  const id = useId();
  const [plan] = useState(getSelectedPlan);
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [paid, setPaid] = useState(false);
  const [isCheckingAccount, setIsCheckingAccount] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccount() {
      if (getStoredAuth()) {
        if (isMounted) setIsCheckingAccount(false);
        return;
      }

      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        const data = await response.json();

        if (response.ok && data?.authenticated && data?.user) {
          localStorage.setItem('fiifit_user', JSON.stringify(data.user));
          localStorage.setItem('fiifit_auth', JSON.stringify({ authenticated: true, expires_at: data.expires_at }));
          if (isMounted) setIsCheckingAccount(false);
          return;
        }
      } catch (error) {
        // Redirect below when the session cannot be verified.
      }

      const nextPath = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    }

    verifyAccount();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePay = (event) => {
    event.preventDefault();
    setPaid(true);
  };

  if (isCheckingAccount) {
    return (
      <main className="signup-page checkout-page">
        <section className="signup-form-side checkout-form-side">
          <div className="checkout-form">
            <div className="signup-title reveal-item">
              <span className="signup-kicker">Verificare cont</span>
              <h1>Se verifica sesiunea</h1>
              <p>Ai nevoie de un cont autentificat pentru a cumpara un plan FiiFit.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (paid) {
    return <Welcome onContinue={() => { window.location.href = '/'; }} />;
  }

  return (
    <main className="signup-page checkout-page">
      <a className="signup-back" href="/" aria-label="Inapoi la pagina principala">
        <i className="fas fa-arrow-left"></i>
        FiiFit.online
      </a>

      <section className="signup-visual" aria-label="Plata FiiFit Online">
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
            <strong>Finalizeaza plata pentru programul tau</strong>
          </div>
          {orbitIcons.map((item) => (
            <OrbitIcon item={item} key={item.label} />
          ))}
        </div>
      </section>

      <section className="signup-form-side checkout-form-side">
        <form className="checkout-form" onSubmit={handlePay} noValidate>
          <div className="signup-title reveal-item">
            <span className="signup-kicker">Plata securizata</span>
            <h1>Finalizeaza inscrierea</h1>
            <p>Alege plata pentru planul selectat si primesti accesul pe email dupa confirmare.</p>
          </div>

          <div className="checkout-plan reveal-item">
            <div>
              <span>{plan.duration}</span>
              <strong>{plan.description}</strong>
            </div>
            <p>{plan.price}</p>
          </div>

          <div className="checkout-secure reveal-item">
            <Lock size={16} strokeWidth={2.2} aria-hidden="true" />
            Plata este securizata. Datele cardului sunt folosite doar pentru confirmarea platii.
          </div>

          <div className="checkout-field reveal-item">
            <label htmlFor={`card-name-${id}`}>Nume pe card</label>
            <input id={`card-name-${id}`} placeholder="Numele tau" autoComplete="cc-name" />
          </div>

          <div className="checkout-field reveal-item">
            <label htmlFor={`card-number-${id}`}>Numar card</label>
            <div className="checkout-input-icon">
              <input
                id={`card-number-${id}`}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                inputMode="numeric"
                autoComplete="cc-number"
              />
              <CreditCard size={17} strokeWidth={2.2} aria-hidden="true" />
            </div>
          </div>

          <div className="checkout-row reveal-item">
            <div className="checkout-field">
              <label htmlFor={`expiry-${id}`}>Expira</label>
              <input id={`expiry-${id}`} placeholder="MM/YY" maxLength={5} autoComplete="cc-exp" />
            </div>
            <div className="checkout-field">
              <label htmlFor={`cvc-${id}`}>CVC</label>
              <input id={`cvc-${id}`} placeholder="123" maxLength={4} inputMode="numeric" autoComplete="cc-csc" />
            </div>
          </div>

          {!showCouponInput ? (
            <button type="button" className="checkout-coupon reveal-item" onClick={() => setShowCouponInput(true)}>
              <Gift size={15} strokeWidth={2.2} aria-hidden="true" />
              Adauga cod de reducere
            </button>
          ) : (
            <div className="checkout-field reveal-item">
              <label htmlFor={`coupon-${id}`}>Cod reducere</label>
              <input
                id={`coupon-${id}`}
                placeholder="Introdu codul"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
              />
            </div>
          )}

          <button className="checkout-submit reveal-item" type="submit">
            Pay Now
          </button>

          <p className="checkout-note reveal-item">Prin plata confirmi accesul la programul FiiFit.online.</p>
        </form>
      </section>
    </main>
  );
}

import React, { useEffect } from 'react';
import './App.css';
import './i18n/config';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Problems } from './components/Problems';
import { About } from './components/About';
import { Expert } from './components/Expert';
import { Lessons } from './components/Lessons';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { Signup } from './components/Signup';
import { Login } from './components/Login';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { Checkout } from './components/Checkout';
import { Account } from './components/Account';
import { TrackerPage } from './components/TrackerPage';
import { Admin } from './components/Admin';

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

function redirectToLogin(nextPath) {
  window.location.href = `/login?next=${encodeURIComponent(nextPath)}`;
}

function App() {
  const currentPath = window.location.pathname;
  const isCheckoutPage = currentPath === '/checkout';
  const isSignupPage = currentPath === '/signup';
  const isLoginPage = currentPath === '/login';
  const isAccountPage = currentPath === '/account';
  const isTrackerPage = currentPath === '/tracker';
  const isAdminPage = currentPath === '/admin';
  const isForgotPasswordPage = currentPath === '/forgot-password';
  const isResetPasswordPage = currentPath === '/reset-password';

  const openPayment = async (plan = null) => {
    const params = new URLSearchParams();
    if (plan?.duration) params.set('plan', plan.duration);
    if (plan?.price) params.set('price', plan.price);
    if (plan?.description) params.set('description', plan.description);

    const checkoutPath = `/checkout${params.toString() ? `?${params.toString()}` : ''}`;

    if (getStoredAuth()) {
      window.location.href = checkoutPath;
      return;
    }

    try {
      const response = await fetch('/api/me', { credentials: 'include' });
      const data = await response.json();

      if (response.ok && data?.authenticated && data?.user) {
        localStorage.setItem('fiifit_user', JSON.stringify(data.user));
        localStorage.setItem('fiifit_auth', JSON.stringify({ authenticated: true, expires_at: data.expires_at }));
        window.location.href = checkoutPath;
        return;
      }
    } catch (error) {
      // Fall through to login when the session cannot be verified.
    }

    redirectToLogin(checkoutPath);
  };

  useEffect(() => {
    if (isCheckoutPage || isSignupPage || isLoginPage || isAccountPage || isTrackerPage || isAdminPage || isForgotPasswordPage || isResetPasswordPage) return undefined;

    // Initialize animations
    const observerOptions = {
      threshold: 0.04,
      rootMargin: '0px 0px 180px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealGroups = [
      { selector: '.problem-card, .feature, .pricing-card', duration: 0.42, distance: 24, stagger: 0.05, maxDelay: 0.18 },
      { selector: '.lectie-card', duration: 0.28, distance: 14, stagger: 0.018, maxDelay: 0.09 },
      { selector: '.faq-item', duration: 0.3, distance: 14, stagger: 0.03, maxDelay: 0.12 }
    ];

    revealGroups.forEach(({ selector, duration, distance, stagger, maxDelay }) => {
      document.querySelectorAll(selector).forEach((el, index) => {
        const delay = Math.min(index * stagger, maxDelay);
        el.style.opacity = '0';
        el.style.transform = `translateY(${distance}px)`;
        el.style.transition = `opacity ${duration}s ease ${delay}s, transform ${duration}s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s`;
        observer.observe(el);
      });
    });

    // Parallax effect
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const hero = document.querySelector('.hero');
      if (hero) {
        hero.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCheckoutPage, isSignupPage, isLoginPage, isAccountPage, isTrackerPage, isAdminPage, isForgotPasswordPage, isResetPasswordPage]);

  if (isCheckoutPage) {
    return <Checkout />;
  }

  if (isSignupPage) {
    return <Signup />;
  }

  if (isLoginPage) {
    return <Login />;
  }

  if (isAccountPage) {
    return <Account />;
  }

  if (isTrackerPage) {
    return <TrackerPage />;
  }

  if (isAdminPage) {
    return <Admin />;
  }

  if (isForgotPasswordPage) {
    return <ForgotPassword />;
  }

  if (isResetPasswordPage) {
    return <ResetPassword />;
  }

  return (
    <div className="App">
      <Header />
      <Hero onOpenPayment={openPayment} />
      <Problems />
      <About />
      <Expert />
      <Lessons />
      <Testimonials />
      <Pricing onOpenPayment={openPayment} />
      <FAQ onOpenPayment={openPayment} />
      <CTA onOpenPayment={openPayment} />
      <Footer />
    </div>
  );
}

export default App;

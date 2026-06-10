import React, { useEffect, useState } from 'react';
import './Header.css';

function getStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem('fiifit_user') || 'null');
    const auth = JSON.parse(localStorage.getItem('fiifit_auth') || 'null');
    const expiresAt = Number(auth?.expires_at || 0) * 1000;

    if (!user || !auth?.authenticated || (expiresAt && expiresAt < Date.now())) return null;

    return user;
  } catch (error) {
    return null;
  }
}

function storeServerUser(data) {
  if (!data?.authenticated || !data?.user) return null;

  const auth = { authenticated: true, expires_at: data.expires_at };
  localStorage.setItem('fiifit_user', JSON.stringify(data.user));
  localStorage.setItem('fiifit_auth', JSON.stringify(auth));

  return data.user;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signedInUser, setSignedInUser] = useState(getStoredUser);

  useEffect(() => {
    let isMounted = true;

    const syncStoredUser = async () => {
      const storedUser = getStoredUser();
      if (isMounted) setSignedInUser(storedUser);

      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        const data = await response.json();

        if (!isMounted) return;

        if (response.ok && data?.authenticated) {
          setSignedInUser(storeServerUser(data));
          return;
        }

        setSignedInUser(getStoredUser());
      } catch (error) {
        if (isMounted) setSignedInUser(getStoredUser());
      }
    };

    syncStoredUser();
    window.addEventListener('focus', syncStoredUser);
    window.addEventListener('pageshow', syncStoredUser);
    window.addEventListener('storage', syncStoredUser);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', syncStoredUser);
      window.removeEventListener('pageshow', syncStoredUser);
      window.removeEventListener('storage', syncStoredUser);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="header sticky">
      <div className="container">
        <div className="header-content">
          <div className="logo">FiiFit.online</div>

          <button
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`}>
            <a onClick={() => scrollToSection('home')} href="#home">Home</a>
            <a onClick={() => scrollToSection('program')} href="#program">Program</a>
            <a onClick={() => scrollToSection('lectii')} href="#lectii">Lectii</a>
            <a onClick={() => scrollToSection('transformari')} href="#transformari">Transformari</a>
            <a onClick={() => scrollToSection('tarife')} href="#tarife">Tarife</a>
            <a href="mailto:fiifitonline@gmail.com">Contact</a>
            {signedInUser ? (
              <a className="nav-account-link" href="/account">Cont</a>
            ) : (
              <a className="nav-account-link" href="/login">Login</a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

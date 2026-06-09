import React, { useState } from 'react';
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

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signedInUser, setSignedInUser] = useState(getStoredUser);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      // Local logout still happens even if the network call fails.
    }

    localStorage.removeItem('fiifit_user');
    localStorage.removeItem('fiifit_auth');
    localStorage.removeItem('fiifit_session');
    setSignedInUser(null);
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
            <a onClick={() => scrollToSection('macro-tracker')} href="#macro-tracker">Tracker</a>
            <a onClick={() => scrollToSection('transformari')} href="#transformari">Transformari</a>
            <a onClick={() => scrollToSection('tarife')} href="#tarife">Tarife</a>
            <a href="mailto:fiifitonline@gmail.com">Contact</a>
            {signedInUser ? (
              <>
                <a className="nav-account-link" href="/account">Cont</a>
                <button className="nav-auth-button" type="button" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <a className="nav-account-link" href="/login">Login</a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

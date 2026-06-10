import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { i18n, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [signedInUser, setSignedInUser] = useState(getStoredUser);

  const getLanguageFlag = (lng) => {
    const flags = { ro: '🇷🇴', en: '🇬🇧', ru: '🇷🇺' };
    return flags[lng] || '🌐';
  };

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
    window.addEventListener('storage', syncStoredUser);

    return () => {
      isMounted = false;
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

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('fiifit_language', lng);
    setLanguageDropdownOpen(false);
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
            <a onClick={() => scrollToSection('home')} href="#home">{t('header.home')}</a>
            <a onClick={() => scrollToSection('program')} href="#program">{t('header.program')}</a>
            <a onClick={() => scrollToSection('lectii')} href="#lectii">{t('header.lessons')}</a>
            <a onClick={() => scrollToSection('transformari')} href="#transformari">{t('header.transformations')}</a>
            <a onClick={() => scrollToSection('tarife')} href="#tarife">{t('header.pricing')}</a>
            <a href="mailto:fiifitonline@gmail.com">{t('header.contact')}</a>

            <div className={`language-dropdown ${languageDropdownOpen ? 'open' : ''}`}>
              <button
                className="language-dropdown-button"
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                aria-label="Select language"
              >
                <span className="language-flag">{getLanguageFlag(i18n.language)}</span>
                <span className="language-code">{i18n.language.toUpperCase()}</span>
              </button>
              <div className="language-dropdown-menu">
                <button
                  className={`language-option ${i18n.language === 'ro' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('ro')}
                >
                  <span>🇷🇴</span>
                  <span>RO</span>
                </button>
                <button
                  className={`language-option ${i18n.language === 'en' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  <span>🇬🇧</span>
                  <span>EN</span>
                </button>
                <button
                  className={`language-option ${i18n.language === 'ru' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('ru')}
                >
                  <span>🇷🇺</span>
                  <span>RU</span>
                </button>
              </div>
            </div>

            {signedInUser ? (
              <a className="nav-account-link" href="/account">{t('header.account')}</a>
            ) : (
              <a className="nav-account-link" href="/login">{t('header.login')}</a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

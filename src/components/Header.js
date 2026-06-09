import React, { useState } from 'react';
import './Header.css';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <a onClick={() => scrollToSection('lectii')} href="#lectii">Lecții</a>
            <a onClick={() => scrollToSection('transformari')} href="#transformari">Transformări</a>
            <a onClick={() => scrollToSection('tarife')} href="#tarife">Tarife</a>
            <a href="mailto:fiifitonline@gmail.com">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

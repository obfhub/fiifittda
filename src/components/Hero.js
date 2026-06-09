import React from 'react';
import './Hero.css';

const heroIcons = [
  { icon: 'fa-apple-whole', label: 'Nutriție', className: 'hero-icon-1' },
  { icon: 'fa-dumbbell', label: 'Fitness', className: 'hero-icon-2' },
  { icon: 'fa-heart-pulse', label: 'Sănătate', className: 'hero-icon-3' },
  { icon: 'fa-bottle-water', label: 'Hidratare', className: 'hero-icon-4' }
];

export function Hero() {
  const scrollToTarife = () => {
    document.getElementById('tarife').scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  return (
    <section id="home" className="hero">
      <div className="hero-decoration" aria-hidden="true">
        <span className="hero-line hero-line-1"></span>
        <span className="hero-line hero-line-2"></span>
        <span className="hero-line hero-line-3"></span>
        {heroIcons.map((item) => (
          <span className={`hero-fitness-icon ${item.className}`} key={item.label}>
            <i className={`fas ${item.icon}`}></i>
          </span>
        ))}
      </div>

      <div className="hero-content">
        <span className="hero-eyebrow">Program online de transformare</span>
        <h1>
          <span>Transformarea ta,</span>
          în ritmul tău
        </h1>
        <p>
          Educație, nutriție și mișcare într-un program construit pentru rezultate
          sănătoase și durabile.
        </p>
        <div className="hero-proof">
          <span><strong>6+</strong> ani experiență</span>
          <span><strong>4500+</strong> femei transformate</span>
        </div>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={handleCheckout}>
            <i className="fas fa-rocket"></i>
            Înscrie-te acum
          </button>
          <button className="btn btn-secondary" onClick={scrollToTarife}>
            Vezi tarifele
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}

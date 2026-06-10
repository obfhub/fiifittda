import React from 'react';
import './Hero.css';

const heroIcons = [
  { icon: 'fa-apple-whole', label: 'Nutritie', className: 'hero-icon-1' },
  { icon: 'fa-dumbbell', label: 'Fitness', className: 'hero-icon-2' },
  { icon: 'fa-heart-pulse', label: 'Sanatate', className: 'hero-icon-3' },
  { icon: 'fa-bottle-water', label: 'Hidratare', className: 'hero-icon-4' }
];

export function Hero({ onOpenPayment }) {
  const scrollToTarife = () => {
    document.getElementById('tarife')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckout = () => {
    onOpenPayment?.();
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
          <span>Fitness ghidat,</span>
          fara haos.
        </h1>
        <p>
          Antrenamente live, nutritie echilibrata, lectii clare si suport zilnic
          pentru femei care vor rezultate sanatoase, fara restrictii extreme.
        </p>
        <div className="hero-proof">
          <span><strong>4500+</strong> participante in comunitate</span>
          <span><strong>6+</strong> ani de experienta</span>
          <span><strong>-58 kg</strong> transformare reala</span>
        </div>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={handleCheckout}>
            <i className="fas fa-rocket"></i>
            Alege planul
          </button>
          <button className="btn btn-secondary" onClick={scrollToTarife}>
            Vezi ce primesti
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}

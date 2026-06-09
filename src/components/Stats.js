import React, { useEffect } from 'react';
import './Stats.css';

export function Stats() {
  const stats1 = [
    { number: '1040+', label: 'Antrenamente online' },
    { number: '250+', label: 'Live-uri educaționale' },
    { number: '1250+', label: 'Consultații' },
    { number: '4500+', label: 'Participante' }
  ];

  const stats2 = [
    { number: '40+', label: 'Țări' },
    { number: '50.000+', label: 'Kilograme slăbite' },
    { number: '81%', label: 'Ajung la scop' },
    { number: '97%', label: 'Se simt mai energice' }
  ];

  return (
    <section className="stats">
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '36px' }}>
          <i className="fas fa-trophy" style={{ marginRight: '15px' }}></i>6 ani de transformări incredibile!
        </h2>
        <p style={{ textAlign: 'center', fontSize: '18px', marginBottom: '60px', opacity: 0.95 }}>
          Peste 4500 de femei și-au schimbat viața alături de FiiFit Online
        </p>
        <div className="stats-grid">
          {stats1.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="stats-grid" style={{ marginTop: '40px' }}>
          {stats2.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import './Problems.css';

export function Problems() {
  const problems = [
    {
      icon: 'fa-mirror',
      title: 'Nu te mai recunoști în oglindă?',
      image: 'mirror.jpg'
    },
    {
      icon: 'fa-body',
      title: 'Corpul s-a schimbat. Tonusul a dispărut.',
      image: 'slabire.fara.infometare.jpg'
    },
    {
      icon: 'fa-shirt',
      title: 'Îți alegi hainele ca să ascunzi, nu ca să-ți placă.',
      image: 'dieta.webp'
    },
    {
      icon: 'fa-weight-scale',
      title: 'Ai 5, 10 sau 15 kg în plus... și nu mai pleacă.',
      image: 'motivatie.jpg'
    }
  ];

  return (
    <section className="problems">
      <div className="container">
        <h2>Ți se pare familiar?</h2>
        <div className="problems-grid">
          {problems.map((problem, idx) => (
            <div key={idx} className="problem-card">
              <img src={`/${problem.image}`} alt={problem.title} className="problem-image" />
              <h3>
                <i className={`fas ${problem.icon}`} style={{ marginRight: '10px', color: 'var(--primary)' }}></i>
                {problem.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

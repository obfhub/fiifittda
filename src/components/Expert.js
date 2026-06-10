import React from 'react';
import './Expert.css';

const highlights = [
  { value: '-58 kg', label: 'transformare personala' },
  { value: '6+ ani', label: 'experienta cu femei reale' },
  { value: '4500+', label: 'participante in comunitate' }
];

export function Expert() {
  return (
    <section className="expert-section">
      <div className="container expert-layout">
        <div className="expert-copy">
          <span className="expert-eyebrow">Ghidaj real, nu diete extreme</span>
          <h2>Tanya Goncear</h2>
          <p className="expert-role">Chimista, nutritionista si cofondatoare FiiFit Online.</p>
          <p>
            Tanya a trecut prin propria transformare si intelege cat de greu este sa
            construiesti disciplina cand ai familie, munca, emotii si obiceiuri vechi.
            De aceea programul FiiFit combina educatia cu pasi simpli, repetabili.
          </p>
          <p>
            Scopul nu este perfectiunea. Scopul este sa inveti ce mananci, cum te misti
            si cum iti pastrezi rezultatele fara sa revii la haos dupa cateva saptamani.
          </p>
        </div>

        <div className="expert-card">
          <div className="expert-card-icon">
            <i className="fas fa-star" aria-hidden="true"></i>
          </div>
          <h3>Ce face programul diferit</h3>
          <p>
            Ai antrenamente live, lectii scurte, meniu PDF, comunitate si intalniri cu
            Tanya ca sa nu ramai singura intre motivatie si rezultat.
          </p>
          <div className="expert-stats">
            {highlights.map((item) => (
              <div key={item.value}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

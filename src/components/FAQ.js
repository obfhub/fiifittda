import React, { useState } from 'react';
import './FAQ.css';

const faqs = [
  {
    question: 'Pentru cine este programul?',
    answer: 'Pentru oricine dorește să slăbească în mod sănătos și durabil, fără diete extreme.'
  },
  {
    question: 'Cât durează programul?',
    answer: 'Programul are 24 lecții pe care le poți urma în ritmul tău. Majoritatea membrilor finalizează în 3-6 luni.'
  },
  {
    question: 'Am nevoie de sală?',
    answer: 'Nu! Antrenamentele sunt pentru acasă, fără echipament. Doar corpul tău și voința de schimbare.'
  },
  {
    question: 'Cum primesc acces?',
    answer: 'După cumpărare, vei primi link-ul de acces instantaneu. Poți accesa programul de pe orice dispozitiv.'
  },
  {
    question: 'Plata este sigură?',
    answer: 'Da! Folosim procesatoare de plată securizate și criptate. Datele tale sunt protejate.'
  },
  {
    question: 'Pot urma programul de acasă?',
    answer: 'Absolut! Totul este online. Ai nevoie doar de internet și de determinare.'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  return (
    <section id="faq" className="faq">
      <div className="container">
        <div className="faq-layout">
          <aside className="faq-intro">
            <span>FAQ</span>
            <h2>Întrebări Frecvente</h2>
            <p>
              Răspunsuri rapide despre acces, durată, antrenamente și cum începi
              programul FiiFit.
            </p>

            <div className="faq-help">
              <div className="faq-help-icon">
                <i className="fas fa-message" aria-hidden="true"></i>
              </div>
              <h3>Mai ai o întrebare?</h3>
              <p>Scrie-ne sau înscrie-te și primești toate detaliile de acces.</p>
              <div className="faq-actions">
                <button onClick={handleCheckout}>Începe acum</button>
                <a href="mailto:fiifitonline@gmail.com">Contact</a>
              </div>
            </div>
          </aside>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <article className={`faq-item ${isOpen ? 'open' : ''}`} key={faq.question}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {faq.question}
                    <i className="fas fa-plus" aria-hidden="true"></i>
                  </button>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import './FAQ.css';

const faqs = [
  {
    question: 'Pentru cine este programul?',
    answer: 'Pentru femei care vor sa slabeasca sanatos, sa inteleaga mancarea si sa isi construiasca o rutina fara diete extreme.'
  },
  {
    question: 'Cat dureaza programul?',
    answer: 'Ai 24 de lectii si acces in functie de planul ales: 3 luni + 1 cadou, 6 luni sau 12 luni. Poti avansa in ritmul tau.'
  },
  {
    question: 'Am nevoie de sala sau echipament?',
    answer: 'Nu. Antrenamentele sunt gandite pentru acasa, cu variante pentru incepatoare si explicatii clare.'
  },
  {
    question: 'Ce primesc in fiecare varianta?',
    answer: 'Primesti antrenamente live, intalniri cu Tanya, lectii de nutritie, chat de suport, biblioteca de exercitii, meniu PDF si acces la comunitate.'
  },
  {
    question: 'Trebuie sa imi fac cont?',
    answer: 'Da. Contul pastreaza accesul la lectii, plan si zona ta de membru. Dupa signup ramai autentificata si poti continua spre checkout.'
  },
  {
    question: 'Cum primesc acces?',
    answer: 'Dupa confirmarea inscrierii, accesul este pregatit in contul tau si primesti detaliile importante pe email.'
  }
];

export function FAQ({ onOpenPayment }) {
  const [openIndex, setOpenIndex] = useState(0);

  const handleCheckout = () => {
    onOpenPayment?.();
  };

  return (
    <section id="faq" className="faq">
      <div className="container">
        <div className="faq-layout">
          <aside className="faq-intro">
            <span>FAQ</span>
            <h2>Intrebari frecvente</h2>
            <p>
              Raspunsuri rapide despre acces, abonamente, antrenamente si cum incepi
              programul FiiFit.
            </p>

            <div className="faq-help">
              <div className="faq-help-icon">
                <i className="fas fa-message" aria-hidden="true"></i>
              </div>
              <h3>Mai ai o intrebare?</h3>
              <p>Scrie-ne sau alege un plan si primesti toate detaliile de acces.</p>
              <div className="faq-actions">
                <button onClick={handleCheckout}>Alege planul</button>
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

import React from 'react';
import './CTA.css';

export function CTA({ onOpenPayment }) {
  const handleCheckout = () => {
    onOpenPayment?.();
  };

  return (
    <section id="payment" className="cta-final">
      <div className="container">
        <span className="cta-eyebrow">Pregatita sa incepi?</span>
        <h2>Cel mai important proiect esti tu.</h2>
        <p>
          Alege planul FiiFit si intra intr-un program cu structura, suport si
          pasi clari pentru un corp mai sanatos.
        </p>
        <button className="btn btn-large" onClick={handleCheckout}>Alege planul</button>
      </div>
    </section>
  );
}

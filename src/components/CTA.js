import React from 'react';
import './CTA.css';

export function CTA({ onOpenPayment }) {
  const handleCheckout = () => {
    onOpenPayment?.();
  };

  return (
    <section id="payment" className="cta-final">
      <div className="container">
        <h2>Cel mai bun proiect la care vei lucra vreodată ești TU</h2>
        <p>Începe transformarea cu FiiFit.online și fă primul pas spre un corp mai sănătos.</p>
        <button className="btn btn-large" onClick={handleCheckout}>Înscrie-te acum</button>
      </div>
    </section>
  );
}

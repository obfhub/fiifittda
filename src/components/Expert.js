import React from 'react';
import './Expert.css';

export function Expert() {
  return (
    <section className="expert-section">
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '10px' }}>
            <i className="fas fa-star" style={{ marginRight: '12px', color: 'var(--primary)' }}></i>
            Experta Clubului
          </h2>
          <h3 style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '30px' }}>Tanya Goncear</h3>
          <p style={{ fontSize: '18px', color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '30px' }}>
            Chimistă, nutriționistă și cofondatoare Fiifit Online
          </p>
          <p style={{ fontSize: '16px', color: 'var(--text)', lineHeight: '1.8', marginBottom: '20px' }}>
            Tatiana Goncear este chimistă și nutriționistă și de peste 6 ani ajută femeile să își schimbe stilul de viață și să ajungă la o greutate în care se simt bine în propriul corp.
          </p>
          <div style={{ background: 'rgba(0, 208, 132, 0.05)', padding: '30px', borderRadius: '12px', borderLeft: '4px solid var(--primary)', margin: '30px 0' }}>
            <p style={{ fontSize: '16px', color: 'var(--text)', lineHeight: '1.8' }}>
              <strong>Experiența ei nu este doar profesională, ci și personală.</strong> Tatiana a slăbit 58 de kilograme, iar acest proces i-a oferit o înțelegere profundă a dificultăților prin care trece o femeie care se confruntă cu kilograme în plus — de la lupta cu obiceiurile alimentare până la provocările emoționale care apar pe parcurs.
            </p>
          </div>
          <p style={{ fontSize: '16px', color: 'var(--text)', lineHeight: '1.8' }}>
            Această experiență a stat la baza programelor create în Fiifit Online, unde transformarea nu se bazează pe diete restrictive sau soluții rapide. Prin această abordare, femeile nu doar slăbesc, ci învață cum să își mențină rezultatele și să își construiască un stil de viață echilibrat pe termen lung.
          </p>
        </div>
      </div>
    </section>
  );
}

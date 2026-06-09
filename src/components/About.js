import React from 'react';
import './About.css';

const features = [
  {
    icon: 'fa-book-open',
    title: 'Educație Nutrițională',
    description: 'Înțelegi cum funcționează alimentația și înveți să faci alegeri bune fără diete extreme.',
    href: '#lectii'
  },
  {
    icon: 'fa-dumbbell',
    title: 'Antrenamente Simple',
    description: 'Exerciții eficiente pentru acasă, adaptate nivelului tău și fără echipament complicat.',
    href: '#lectii'
  },
  {
    icon: 'fa-heart-pulse',
    title: 'Suport Zilnic',
    description: 'Primești ghidare, motivație și răspunsuri atunci când ai nevoie să continui.',
    href: '#faq'
  },
  {
    icon: 'fa-users',
    title: 'Comunitate',
    description: 'Nu treci singură prin transformare. Ai alături femei cu aceleași obiective ca tine.',
    href: '#transformari'
  },
  {
    icon: 'fa-chart-line',
    title: 'Progres Durabil',
    description: 'Construiești obiceiuri care rămân și după terminarea programului, în ritmul tău.',
    href: '#transformari'
  },
  {
    icon: 'fa-medal',
    title: 'Rezultate Reale',
    description: 'Un sistem testat de mii de femei, bazat pe consecvență, echilibru și susținere.',
    href: '#tarife'
  }
];

export function About() {
  return (
    <section id="program" className="about">
      <div className="container">
        <div className="about-heading">
          <span>Tot ce ai nevoie într-un singur program</span>
          <h2>Despre FiiFit.online</h2>
          <p>
            O transformare sănătoasă construită pe educație, mișcare, obiceiuri
            alimentare și sprijin constant.
          </p>
        </div>

        <div className="about-features">
          {features.map((feature, index) => (
            <article className={`feature feature-${index + 1}`} key={feature.title}>
              <div className="feature-shader" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="feature-content">
                <div className="feature-icon">
                  <i className={`fas ${feature.icon}`} aria-hidden="true"></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <a href={feature.href}>
                  Află mai mult
                  <i className="fas fa-arrow-right" aria-hidden="true"></i>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

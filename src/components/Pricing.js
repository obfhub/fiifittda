import React from 'react';
import './Pricing.css';

const plans = [
  {
    duration: '3 Luni',
    badge: 'Start',
    description: '120 zile de acces',
    original: '250€',
    price: '175€',
    discount: '+1 lună cadou',
    icon: 'fa-shield-alt'
  },
  {
    duration: '6 Luni',
    badge: 'Cel mai popular',
    description: '180 zile de acces',
    original: '369€',
    price: '275€',
    discount: 'Economisești 25%',
    icon: 'fa-users',
    featured: true
  },
  {
    duration: '12 Luni',
    badge: 'Transformare',
    description: '365 zile de acces',
    original: '499€',
    price: '365€',
    discount: 'Economisești 27%',
    icon: 'fa-rocket'
  }
];

const features = [
  {
    label: 'Perioada programului',
    values: ['3 luni + 1 cadou', '6 luni', '12 luni']
  },
  {
    label: 'Antrenamente live săptămânale',
    values: ['2 + 1 înregistrat', '2 + 1 înregistrat', '2 + 1 înregistrat']
  },
  {
    label: 'Întâlniri săptămânale cu Tanya',
    values: [true, true, true]
  },
  {
    label: 'Lecții Bazele Nutriției',
    values: ['3 lecții', '3 lecții', '3 lecții']
  },
  {
    label: 'Comunitate și suport zilnic în chat',
    values: [true, true, true]
  },
  {
    label: 'Biblioteca de exerciții',
    values: [true, true, true]
  },
  {
    label: 'Meniu PDF FiiFit pentru 7 zile',
    values: [true, true, true]
  },
  {
    label: 'Curs „Nutriționistul familiei tale”',
    values: ['22 lecții', '22 lecții', '22 lecții']
  },
  {
    label: 'Webinar „Slăbește inteligent”',
    values: [true, true, true]
  },
  {
    label: 'Instagram, Facebook și Telegram',
    values: [true, true, true]
  }
];

function FeatureValue({ value }) {
  if (value === true) {
    return <i className="fas fa-check pricing-check" aria-label="Inclus"></i>;
  }

  if (value === false) {
    return <i className="fas fa-minus pricing-minus" aria-label="Neinclus"></i>;
  }

  return value;
}

export function Pricing({ onOpenPayment }) {
  return (
    <section id="tarife" className="pricing">
      <div className="pricing-pattern" aria-hidden="true"></div>
      <div className="container">
        <div className="pricing-heading">
          <span className="pricing-eyebrow">Investește în tine</span>
          <h2>Alege Planul Tău</h2>
          <p>Același program complet, cu timpul de care ai nevoie pentru transformarea ta.</p>
        </div>

        <div className="pricing-table-wrap">
          <table className="pricing-table">
            <thead>
              <tr>
                {plans.map((plan) => (
                  <th key={plan.duration}>
                    <div className={`pricing-plan ${plan.featured ? 'featured' : ''}`}>
                      {plan.featured && <span className="popular-label">Recomandat</span>}
                      <div className="plan-title-row">
                        <span className="plan-icon">
                          <i className={`fas ${plan.icon}`} aria-hidden="true"></i>
                        </span>
                        <h3>{plan.duration}</h3>
                        <span className="plan-badge">{plan.badge}</span>
                      </div>
                      <p className="plan-description">{plan.description}</p>
                      <div className="plan-price">
                        <strong>{plan.price}</strong>
                        <del>{plan.original}</del>
                      </div>
                      <p className="plan-discount">{plan.discount}</p>
                      <button className="pricing-button" onClick={() => onOpenPayment?.(plan)}>
                        Pay Now
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.label}>
                  {feature.values.map((value, index) => (
                    <td
                      key={`${feature.label}-${plans[index].duration}`}
                      className={plans[index].featured ? 'featured-cell' : ''}
                      aria-label={feature.label}
                    >
                      <span className="mobile-feature-label">{feature.label}</span>
                      <FeatureValue value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pricing-scroll-hint">
          <i className="fas fa-arrows-alt-h" aria-hidden="true"></i>
          Glisează pentru a compara planurile
        </p>
      </div>
    </section>
  );
}

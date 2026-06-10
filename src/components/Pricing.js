import React from 'react';
import './Pricing.css';

const plans = [
  {
    duration: '3 Luni',
    badge: 'Start',
    description: '120 zile pentru stilul tau de viata sanatos',
    original: '250 EUR',
    price: '175 EUR',
    discount: '+1 luna cadou',
    icon: 'fa-shield-alt'
  },
  {
    duration: '6 Luni',
    badge: 'Cel mai popular',
    description: '180 zile pentru stilul tau de viata sanatos',
    original: '369 EUR',
    price: '275 EUR',
    discount: 'Economisesti 25%',
    icon: 'fa-users',
    featured: true
  },
  {
    duration: '12 Luni',
    badge: 'Transformare',
    description: '365 zile pentru stilul tau de viata sanatos',
    original: '499 EUR',
    price: '365 EUR',
    discount: 'Economisesti 27%',
    icon: 'fa-rocket'
  }
];

const features = [
  {
    label: 'Perioada programului',
    values: ['3 luni + 1 cadou', '6 luni', '12 luni']
  },
  {
    label: 'Antrenamente live saptamanale',
    values: ['2 live + 1 inregistrat', '2 live + 1 inregistrat', '2 live + 1 inregistrat']
  },
  {
    label: 'Intalniri saptamanale cu Tanya',
    values: [true, true, true]
  },
  {
    label: '14 live-uri educationale: FAQ si studii de caz',
    values: [true, true, true]
  },
  {
    label: '24 lectii pentru nutritie, rutina si mentinere',
    values: [true, true, true]
  },
  {
    label: 'Lectii Bazele Nutritiei',
    values: ['3 lectii', '3 lectii', '3 lectii']
  },
  {
    label: 'Comunitate si suport zilnic in chat',
    values: [true, true, true]
  },
  {
    label: 'Biblioteca de exercitii',
    values: [true, true, true]
  },
  {
    label: 'Sedinte de consiliere psiho-emotionala in grup',
    values: [true, true, true]
  },
  {
    label: 'Sesiuni live despre nutritie personalizata',
    values: ['2 sesiuni', '2 sesiuni', '2 sesiuni']
  },
  {
    label: 'Video: Indexul glicemic al alimentelor',
    values: [true, true, true]
  },
  {
    label: 'Meniu PDF FiiFit pentru 7 zile',
    values: [true, true, true]
  },
  {
    label: 'Monitorizare zilnica a alimentatiei',
    values: [true, true, true]
  },
  {
    label: 'Mini-curs "De la intentii la actiuni"',
    values: [true, true, true]
  },
  {
    label: 'Curs "Nutritionistul familiei tale"',
    values: ['22 lectii', '22 lectii', '22 lectii']
  },
  {
    label: 'Webinar "Slabeste inteligent"',
    values: [true, true, true]
  },
  {
    label: 'Instagram, Facebook si Telegram',
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
          <span className="pricing-eyebrow">Alege durata potrivita</span>
          <h2>Abonamente FiiFit Online</h2>
          <p>
            Toate variantele includ acelasi program complet: antrenamente, lectii,
            comunitate, suport si resurse pentru rezultate pe termen lung.
          </p>
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
                        Alege planul
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
        <p className="pricing-note">
          Ai nevoie de cont pentru checkout. Accesul este pregatit in cont dupa confirmarea inscrierii.
        </p>
        <p className="pricing-scroll-hint">
          <i className="fas fa-arrows-alt-h" aria-hidden="true"></i>
          Gliseaza pentru a compara planurile
        </p>
      </div>
    </section>
  );
}

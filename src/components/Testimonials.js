import React from 'react';
import { Marquee } from './Marquee';
import './Testimonials.css';

const testimonials = [
  {
    name: 'Natalia',
    weight: '-21 kg',
    quote: 'Înainte evitam oglinzile. Acum mă uit și zâmbesc. N-a fost ușor, dar nici greu. A fost clar, blând, constant. Nu e un program - e o transformare cu suflet.',
    image: '/Natalia.png'
  },
  {
    name: 'Cristina',
    weight: '-31 kg',
    quote: 'E primul program la care nu am renunțat. Pentru că n-a fost despre perfecțiune. Ci despre consecvență, sprijin și încredere. Am slăbit 31 kg fără să simt că sacrific ceva.'
  },
  {
    name: 'Galina',
    weight: '-40 kg',
    quote: 'Am început fără să cred că voi ajunge până la capăt. Dar pașii mici, mesajele zilnice și grupul m-au ținut pe drum. 40 kg în minus, dar cel mai important - am recâștigat respectul pentru mine.'
  },
  {
    name: 'Tanya Goncear',
    weight: '-58 kg',
    quote: 'Am trăit ani de zile în rușine și haine largi. Când am decis să mă pun pe primul loc, mi-am promis că nu voi renunța. Acum sunt aici pentru tine - ca să reușești și tu.'
  },
  {
    name: 'Irina',
    weight: '-12 kg',
    quote: 'Nu am avut mult de dat jos, dar voiam să ies din haos. Am găsit ordine, claritate și un ritm care mă liniștește. Acum am o rutină care chiar îmi place.',
    image: '/Irina.png'
  },
  {
    name: 'Olga',
    weight: '-4 kg',
    quote: 'Am slăbit 4 kg într-o singură lună! Rezultatul se vede nu doar pe cântar, ci și în oglindă. Corpul s-a tonifiat vizibil, iar eu am căpătat încredere că pot mai mult.',
    image: '/olga-4kg-transformation.jpg'
  }
];

function TestimonialCard({ testimonial }) {
  return (
    <article className="testimonial-card">
      <div className="testimonial-person">
        <div className="testimonial-avatar">
          {testimonial.image ? (
            <img src={testimonial.image} alt="" loading="lazy" />
          ) : (
            <span>{testimonial.name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h3>{testimonial.name}</h3>
          <p className="weight">{testimonial.weight}</p>
        </div>
      </div>
      <blockquote>{testimonial.quote}</blockquote>
    </article>
  );
}

export function Testimonials() {
  const columns = [
    testimonials,
    [...testimonials.slice(2), ...testimonials.slice(0, 2)],
    [...testimonials.slice(4), ...testimonials.slice(0, 4)],
    [...testimonials.slice(1), ...testimonials.slice(0, 1)]
  ];

  return (
    <section id="transformari" className="testimonials">
      <div className="container">
        <h2>
          <i className="fas fa-heart" aria-hidden="true"></i>
          Transformări Reale
        </h2>
        <p className="testimonials-intro">
          <span>Fii următoarea femeie care a reușit!</span>
          Poveștile lor, transformarea ta
        </p>

        <div className="testimonials-stage" aria-label="Povești de transformare">
          <div className="testimonials-marquee">
            <Marquee
              className="testimonial-marquee-column"
              vertical
              repeat={3}
              pauseOnHover
            >
              {columns[0].map((testimonial) => (
                <TestimonialCard key={testimonial.name} testimonial={testimonial} />
              ))}
            </Marquee>
            <Marquee
              className="testimonial-marquee-column"
              vertical
              repeat={3}
              pauseOnHover
              reverse
            >
              {columns[1].map((testimonial) => (
                <TestimonialCard key={testimonial.name} testimonial={testimonial} />
              ))}
            </Marquee>
            <Marquee
              className="testimonial-marquee-column"
              vertical
              repeat={3}
              pauseOnHover
            >
              {columns[2].map((testimonial) => (
                <TestimonialCard key={testimonial.name} testimonial={testimonial} />
              ))}
            </Marquee>
            <Marquee
              className="testimonial-marquee-column"
              vertical
              repeat={3}
              pauseOnHover
              reverse
            >
              {columns[3].map((testimonial) => (
                <TestimonialCard key={testimonial.name} testimonial={testimonial} />
              ))}
            </Marquee>
          </div>
          <div className="testimonial-fade fade-top"></div>
          <div className="testimonial-fade fade-bottom"></div>
          <div className="testimonial-fade fade-left"></div>
          <div className="testimonial-fade fade-right"></div>
        </div>
      </div>
    </section>
  );
}

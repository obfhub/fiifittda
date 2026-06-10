import React from 'react';
import { Marquee } from './Marquee.tsx';
import './Testimonials.css';

const testimonials = [
  {
    name: 'Natalia',
    weight: '-21 kg',
    quote: 'Inainte evitam oglinzile. Acum ma uit si zambesc. A fost clar, bland si constant. Nu e doar un program, e o transformare cu suflet.',
    image: '/Natalia.png'
  },
  {
    name: 'Cristina',
    weight: '-31 kg',
    quote: 'E primul program la care nu am renuntat. N-a fost despre perfectiune, ci despre consecventa, sprijin si incredere.'
  },
  {
    name: 'Galina',
    weight: '-40 kg',
    quote: 'Am inceput fara sa cred ca voi ajunge pana la capat. Pasii mici, mesajele zilnice si grupul m-au tinut pe drum.'
  },
  {
    name: 'Tanya Goncear',
    weight: '-58 kg',
    quote: 'Cand am decis sa ma pun pe primul loc, mi-am promis ca nu voi renunta. Acum sunt aici pentru tine, ca sa reusesti si tu.'
  },
  {
    name: 'Irina',
    weight: '-12 kg',
    quote: 'Nu am avut mult de dat jos, dar voiam sa ies din haos. Am gasit ordine, claritate si o rutina care chiar imi place.',
    image: '/Irina.png'
  },
  {
    name: 'Olga',
    weight: '-4 kg',
    quote: 'Am slabit 4 kg intr-o singura luna. Rezultatul se vede nu doar pe cantar, ci si in oglinda. Am prins incredere ca pot mai mult.',
    image: '/olga-4kg-transformation.jpg'
  },
  {
    name: 'Alina',
    weight: '-16 kg',
    quote: 'Pentru prima data am simtit ca cineva imi explica simplu ce am de facut. Mancarea, miscarea si disciplina au devenit normale.'
  },
  {
    name: 'Diana',
    weight: '-9 kg',
    quote: 'Mi-a placut ca nu m-am simtit judecata. Am primit suport, exemple clare si motivatie exact cand aveam nevoie.'
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
  const firstRow = testimonials.slice(0, 4);
  const secondRow = testimonials.slice(4);

  return (
    <section id="transformari" className="testimonials">
      <div className="container">
        <h2>
          <i className="fas fa-heart" aria-hidden="true"></i>
          Transformari Reale
        </h2>
        <p className="testimonials-intro">
          <span>Fii urmatoarea femeie care a reusit!</span>
          Povestile lor, transformarea ta
        </p>

        <div className="testimonials-stage" aria-label="Povesti de transformare">
          <Marquee className="testimonial-marquee-row" repeat={4} pauseOnHover ariaLabel="Rezultate cliente FiiFit">
            {firstRow.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </Marquee>
          <Marquee className="testimonial-marquee-row" repeat={4} pauseOnHover reverse ariaLabel="Alte rezultate cliente FiiFit">
            {secondRow.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </Marquee>

          <div className="testimonial-fade fade-top"></div>
          <div className="testimonial-fade fade-bottom"></div>
          <div className="testimonial-fade fade-left"></div>
          <div className="testimonial-fade fade-right"></div>
        </div>
      </div>
    </section>
  );
}

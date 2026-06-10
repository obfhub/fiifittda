import React, { useCallback, useEffect, useRef } from 'react';
import './CTA.css';

const podcasts = [
  {
    id: 'GN3l8BkfPwU',
    title: 'Despre slabit, genetica si sustinere',
    source: 'Interviu UnuPlusUnu'
  },
  {
    id: 'C7qHbp3Blmo',
    title: 'Tanya Goncear -57 kg. Mancat compulsiv, ispite si limite',
    source: 'Podcast'
  },
  {
    id: 'ZMpfAbEQp5g',
    title: 'Programul de slabit explicat in cateva minute',
    source: 'Retelele sociale'
  },
  {
    id: 'TBrI0IBuY8w',
    title: 'De la obezitate la forma fizica de invidiat',
    source: 'Transformarea sa'
  },
  {
    id: 'rz5k5x_yi9M',
    title: 'Despre diete, dezamagiri si revenire',
    source: 'Experienta ei'
  },
  {
    id: 'pVj357y9izc',
    title: 'Slabit fara dieta restrictiva',
    source: 'Metoda ei'
  },
  {
    id: 'ZfTPFbZCjUo',
    title: 'Motivatia pentru a slabi si a ramane in forma',
    source: 'Interviu'
  },
  {
    id: 'ro7znuAWkVI',
    title: 'Despre critica oamenilor si cum e sa fii gras in Moldova',
    source: 'Podcast'
  }
];

export function CTA() {
  const carouselRef = useRef(null);

  const getCardStep = useCallback(() => {
    const carousel = carouselRef.current;
    const firstCard = carousel?.querySelector('.podcast-card');
    if (!carousel || !firstCard) return 0;

    const styles = window.getComputedStyle(carousel);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;

    return firstCard.getBoundingClientRect().width + gap;
  }, []);

  const scrollCarousel = useCallback((direction) => {
    const carousel = carouselRef.current;
    const step = getCardStep();
    if (!carousel || !step) return;

    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
    const atEnd = carousel.scrollLeft >= maxScrollLeft - step * 0.5;
    const atStart = carousel.scrollLeft <= step * 0.5;
    let nextLeft = carousel.scrollLeft + direction * step;

    if (direction > 0 && atEnd) nextLeft = 0;
    if (direction < 0 && atStart) nextLeft = maxScrollLeft;

    carousel.scrollTo({
      left: nextLeft,
      behavior: 'smooth'
    });
  }, [getCardStep]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const timer = window.setInterval(() => {
      scrollCarousel(1);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [scrollCarousel]);

  return (
    <section id="podcasturi" className="podcasts-section">
      <div className="container">
        <div className="podcasts-heading">
          <span className="podcasts-eyebrow">Podcasturi si emisiuni TV</span>
          <div className="podcast-controls" aria-label="Navigare podcasturi">
            <button type="button" onClick={() => scrollCarousel(-1)} aria-label="Podcast anterior">
              <i className="fas fa-arrow-left" aria-hidden="true"></i>
            </button>
            <button type="button" onClick={() => scrollCarousel(1)} aria-label="Podcast urmator">
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div className="podcasts-carousel" ref={carouselRef}>
          {podcasts.map((podcast) => (
            <article className="podcast-card" key={podcast.id}>
              <div className="podcast-frame">
                <iframe
                  src={`https://www.youtube.com/embed/${podcast.id}?mute=1`}
                  title={`Tanya Goncear - ${podcast.title}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="podcast-meta">
                <span>{podcast.source}</span>
                <h3>{podcast.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

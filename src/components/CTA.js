import React from 'react';
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
  return (
    <section id="podcasturi" className="podcasts-section">
      <div className="container">
        <div className="podcasts-heading">
          <span className="podcasts-eyebrow">Podcasturi si emisiuni TV</span>
          <h2>Tanya Goncear in conversatii reale</h2>
          <p>
            Interviuri despre slabit, motivatie, obiceiuri, presiune sociala si ce
            inseamna o transformare care ramane.
          </p>
        </div>

        <div className="podcasts-grid">
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

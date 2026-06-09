import React from 'react';
import './Lessons.css';

const modules = [
  {
    number: '01',
    icon: 'fa-compass',
    title: 'Fundamentele',
    description: 'Înțelegi procesul și construiești o bază sănătoasă.',
    lessons: [
      'Introducere în slăbirea sănătoasă',
      'Cum funcționează caloriile',
      'Alimentația echilibrată',
      'Greșeli frecvente în slăbire',
      'Cum citești etichetele produselor',
      'Proteine, carbohidrați și grăsimi'
    ]
  },
  {
    number: '02',
    icon: 'fa-utensils',
    title: 'Rutina Zilnică',
    description: 'Organizezi alimentația și mișcarea fără haos.',
    lessons: [
      'Controlul poftelor',
      'Organizarea meselor',
      'Hidratarea corectă',
      'Mișcare pentru începători',
      'Antrenamente acasă',
      'Motivație și disciplină'
    ]
  },
  {
    number: '03',
    icon: 'fa-brain',
    title: 'Minte și Echilibru',
    description: 'Depășești blocajele fizice și emoționale.',
    lessons: [
      'Cum treci peste stagnare',
      'Somnul și slăbirea',
      'Stresul și alimentația',
      'Mâncatul emoțional',
      'Planificarea săptămânii',
      'Mese sănătoase rapide'
    ]
  },
  {
    number: '04',
    icon: 'fa-flag-checkered',
    title: 'Menținerea',
    description: 'Transformi rezultatul într-un stil de viață.',
    lessons: [
      'Cum mănânci în oraș',
      'Cum eviți efectul yo-yo',
      'Monitorizarea progresului',
      'Menținerea rezultatului',
      'Construirea unui stil de viață',
      'Transformarea finală'
    ]
  }
];

export function Lessons() {
  let lessonNumber = 0;

  return (
    <section id="lectii" className="lectii">
      <div className="container">
        <div className="lessons-heading">
          <div>
            <span>Curriculum complet</span>
            <h2>24 de lecții.<br />Un drum clar.</h2>
          </div>
          <p>
            De la primele principii până la menținerea rezultatului, fiecare modul
            te duce firesc spre următorul pas.
          </p>
        </div>

        <div className="lessons-modules">
          {modules.map((module) => (
            <article className="lesson-module" key={module.number}>
              <header className="module-header">
                <div className="module-icon">
                  <i className={`fas ${module.icon}`} aria-hidden="true"></i>
                </div>
                <div>
                  <span>Modulul {module.number}</span>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>
              </header>

              <ol className="module-lessons">
                {module.lessons.map((lesson) => {
                  lessonNumber += 1;
                  const currentNumber = lessonNumber;

                  return (
                    <li className="lectie-card" key={lesson}>
                      <span>{String(currentNumber).padStart(2, '0')}</span>
                      <p>{lesson}</p>
                      <i className="fas fa-check" aria-hidden="true"></i>
                    </li>
                  );
                })}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

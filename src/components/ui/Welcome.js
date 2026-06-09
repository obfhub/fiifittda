import confetti from 'canvas-confetti';
import { Check, Home } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import './Welcome.css';

export default function Welcome({ onContinue }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const canvasRef = useCallback((canvas) => {
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true
    });

    myConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
      return;
    }

    window.location.reload();
  };

  return (
    <div className="welcome-screen" role="status" aria-live="polite">
      {showConfetti && <canvas className="welcome-confetti" ref={canvasRef} />}

      <div className="welcome-card">
        <div className="welcome-check">
          <Check size={34} strokeWidth={2.4} aria-hidden="true" />
        </div>

        <div className="welcome-copy">
          <h1>Multumesc!</h1>
          <p>Plata a fost inregistrata. Vei primi accesul si detaliile programului pe email.</p>
        </div>

        <button className="welcome-button" onClick={handleContinue} type="button" aria-label="Continua">
          <span>Inapoi la program</span>
          <Home size={17} strokeWidth={2.2} aria-hidden="true" />
        </button>

        <p className="welcome-footnote">Bine ai venit in comunitatea FiiFit.online.</p>
      </div>
    </div>
  );
}

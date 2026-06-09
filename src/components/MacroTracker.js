import React, { useState } from 'react';
import './MacroTracker.css';

const exampleMeal = '2 eggs, 100g rice, 150g chicken breast and a banana';

export function MacroTracker() {
  const [meal, setMeal] = useState('');
  const [parsedMeal, setParsedMeal] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    const mealText = meal.trim();

    if (!mealText) {
      setError('Scrie ce ai mâncat înainte de analiză.');
      setParsedMeal(null);
      return;
    }

    setIsLoading(true);
    setError('');
    setParsedMeal(null);

    try {
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal: mealText })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Nu am putut analiza masa.');
      }

      setParsedMeal(data);
    } catch (requestError) {
      setError(requestError.message || 'A apărut o eroare la analiză.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillExample = () => {
    setMeal(exampleMeal);
    setError('');
  };

  return (
    <section id="macro-tracker" className="macro-tracker">
      <div className="container">
        <div className="macro-layout">
          <div className="macro-copy">
            <span className="macro-eyebrow">AI assisted lookup</span>
            <h2>AI Calorie & Macro Tracker</h2>
            <p>
              Scrie masa în engleză. AI-ul o transformă doar în termeni de căutare,
              iar caloriile și macronutrienții sunt calculați pe server din potriviri reale USDA sau Open Food Facts.
            </p>
            <div className="macro-guardrail">
              <i className="fas fa-shield-heart" aria-hidden="true"></i>
              Claude nu calculează calorii, proteină, carbohidrați sau grăsimi.
            </div>
          </div>

          <div className="macro-panel">
            <label htmlFor="meal-input">Ce ai mâncat?</label>
            <textarea
              id="meal-input"
              value={meal}
              onChange={(event) => setMeal(event.target.value)}
              placeholder={`Example: ${exampleMeal}`}
              rows="5"
            />
            <div className="macro-actions">
              <button type="button" onClick={handleAnalyze} disabled={isLoading}>
                {isLoading ? 'Analizăm...' : 'Analyze'}
              </button>
              <button type="button" className="macro-example" onClick={fillExample}>
                Folosește exemplul
              </button>
            </div>
            {error && <p className="macro-error">{error}</p>}
            <p className="macro-disclaimer">
              Estimated values only. Food recognition is AI-assisted, but nutrition values come from real food database matches.
            </p>
          </div>
        </div>

        {parsedMeal && (
          <div className="macro-results" aria-live="polite">
            <div className="macro-total-card">
              <span>Calories</span>
              <strong>{parsedMeal.totals.calories}</strong>
              <small>kcal</small>
            </div>
            <div className="macro-total-card">
              <span>Protein</span>
              <strong>{parsedMeal.totals.protein}</strong>
              <small>g</small>
            </div>
            <div className="macro-total-card">
              <span>Carbs</span>
              <strong>{parsedMeal.totals.carbs}</strong>
              <small>g</small>
            </div>
            <div className="macro-total-card">
              <span>Fat</span>
              <strong>{parsedMeal.totals.fat}</strong>
              <small>g</small>
            </div>
          </div>
        )}

        {parsedMeal && (
          <div className="detected-foods">
            <div className="detected-heading">
              <h3>Detected foods</h3>
              <p>Nutrition values below are calculated from real food database matches only.</p>
            </div>
            <div className="detected-list">
              {parsedMeal.items.map((item, index) => (
                <article className={`detected-item ${item.matched ? '' : 'unmatched'}`} key={`${item.original}-${index}`}>
                  <div>
                    <span>{item.original}</span>
                    <strong>{item.matched ? item.matched_food : 'Unmatched food'}</strong>
                    <p>
                      {item.grams || 0}g used for calculation
                      {item.source ? ` · source ${item.source}` : ''}
                    </p>
                  </div>
                  {item.matched ? (
                    <ul>
                      <li>{item.calories} kcal</li>
                      <li>{item.protein}g protein</li>
                      <li>{item.carbs}g carbs</li>
                      <li>{item.fat}g fat</li>
                    </ul>
                  ) : (
                    <p className="unmatched-warning">No database match yet. Add this food before trusting totals.</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

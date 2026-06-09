import React, { useState } from 'react';
import './MacroTracker.css';

const exampleMeal = '2 eggs, 100g rice, 150g chicken breast and a banana';
const roundMacro = (value) => Math.round((Number(value) || 0) * 10) / 10;

function calculateItemWithAmount(item, amount) {
  const grams = Math.max(Number(amount || 0), 0);
  const multiplier = grams / 100;

  return {
    ...item,
    grams,
    calories: Math.round(Number(item.calories_per_100g || 0) * multiplier),
    protein: roundMacro(Number(item.protein_per_100g || 0) * multiplier),
    carbs: roundMacro(Number(item.carbs_per_100g || 0) * multiplier),
    fat: roundMacro(Number(item.fat_per_100g || 0) * multiplier)
  };
}

function calculateTotals(items) {
  return items.reduce(
    (sum, item) => ({
      calories: sum.calories + Number(item.calories || 0),
      protein: roundMacro(sum.protein + Number(item.protein || 0)),
      carbs: roundMacro(sum.carbs + Number(item.carbs || 0)),
      fat: roundMacro(sum.fat + Number(item.fat || 0))
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function calculateHealthScore(items, totals) {
  const matchedItems = items.filter((item) => item.matched);
  const matchedRatio = items.length ? matchedItems.length / items.length : 0;
  const names = matchedItems.map((item) => `${item.original} ${item.matched_food}`.toLowerCase()).join(' ');
  let score = 5;
  const positives = [];
  const cautions = [];

  if (matchedRatio >= 0.9) {
    score += 0.8;
    positives.push('most foods matched real nutrition data');
  } else if (matchedRatio < 0.6) {
    score -= 1.2;
    cautions.push('some foods were not matched');
  }

  if (totals.calories > 0) {
    const proteinDensity = totals.protein / (totals.calories / 100);
    const fatRatio = (totals.fat * 9) / totals.calories;

    if (proteinDensity >= 5) {
      score += 1.1;
      positives.push('good protein density');
    } else if (proteinDensity < 2.2) {
      score -= 0.8;
      cautions.push('low protein for the calories');
    }

    if (fatRatio > 0.45) {
      score -= 0.8;
      cautions.push('fat is a large share of the meal');
    }
  }

  if (/banana|apple|berry|orange|vegetable|salad|broccoli|spinach|tomato|rice|chicken|egg|oat|beans|lentil|fish|yogurt/.test(names)) {
    score += 1.2;
    positives.push('includes whole-food ingredients');
  }

  if (/chips|fries|fried|pizza|burger|cake|cookie|candy|soda|donut|processed|breaded|pudding/.test(names)) {
    score -= 1.4;
    cautions.push('contains processed or calorie-dense foods');
  }

  if (totals.calories > 900) {
    score -= 0.6;
    cautions.push('large calorie load');
  } else if (totals.calories >= 350 && totals.calories <= 750) {
    score += 0.4;
    positives.push('reasonable meal-sized energy range');
  }

  const finalScore = Math.min(Math.max(roundMacro(score), 1), 10);

  return {
    score: finalScore,
    label: finalScore >= 8 ? 'Great' : finalScore >= 6 ? 'Good' : finalScore >= 4 ? 'Okay' : 'Needs work',
    positives: positives.slice(0, 2),
    cautions: cautions.slice(0, 2)
  };
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 1280;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };

      image.onerror = () => reject(new Error('Could not read this image.'));
      image.src = reader.result;
    };

    reader.onerror = () => reject(new Error('Could not read this image.'));
    reader.readAsDataURL(file);
  });
}

export function MacroTracker() {
  const [meal, setMeal] = useState('');
  const [mealImage, setMealImage] = useState('');
  const [parsedMeal, setParsedMeal] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const items = parsedMeal?.items || [];
  const totals = parsedMeal ? calculateTotals(items) : null;
  const healthScore = parsedMeal ? calculateHealthScore(items, totals) : null;

  const handleAnalyze = async () => {
    const mealText = meal.trim();

    if (!mealText && !mealImage) {
      setError('Add meal text or upload a photo first.');
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
        body: JSON.stringify({ meal: mealText, image: mealImage })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Could not analyze this meal.');
      }

      setParsedMeal(data);
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong while analyzing.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillExample = () => {
    setMeal(exampleMeal);
    setError('');
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    try {
      const dataUrl = await compressImage(file);
      setMealImage(dataUrl);
    } catch (imageError) {
      setError(imageError.message || 'Could not use this image.');
    }
  };

  const updateItemAmount = (index, amount) => {
    setParsedMeal((current) => {
      if (!current) return current;

      const nextItems = current.items.map((item, itemIndex) =>
        itemIndex === index ? calculateItemWithAmount(item, amount) : item
      );

      return {
        ...current,
        items: nextItems,
        totals: calculateTotals(nextItems)
      };
    });
  };

  return (
    <section id="macro-tracker" className="macro-tracker">
      <div className="container">
        <div className="macro-layout">
          <div className="macro-copy">
            <span className="macro-eyebrow">AI assisted lookup</span>
            <h2>AI Calorie & Macro Tracker</h2>
            <p>
              Write what you ate or upload a meal photo. AI detects foods and estimates portions,
              then calories and macros are calculated from USDA or Open Food Facts matches.
            </p>
            <div className="macro-guardrail">
              <i className="fas fa-shield-heart" aria-hidden="true"></i>
              AI detects foods only. Nutrition values come from real food databases.
            </div>
          </div>

          <div className="macro-panel">
            <label htmlFor="meal-input">What did you eat?</label>
            <textarea
              id="meal-input"
              value={meal}
              onChange={(event) => setMeal(event.target.value)}
              placeholder={`Example: ${exampleMeal}`}
              rows="5"
            />

            <div className="macro-photo-row">
              <label className="macro-photo-button" htmlFor="meal-photo">
                <i className="fas fa-camera" aria-hidden="true"></i>
                Add meal photo
              </label>
              <input id="meal-photo" type="file" accept="image/*" capture="environment" onChange={handleImageChange} />
              {mealImage && (
                <button type="button" className="macro-remove-photo" onClick={() => setMealImage('')}>
                  Remove photo
                </button>
              )}
            </div>

            {mealImage && (
              <div className="macro-photo-preview">
                <img src={mealImage} alt="Meal preview" />
                <span>Photo ready for AI food detection</span>
              </div>
            )}

            <div className="macro-actions">
              <button type="button" onClick={handleAnalyze} disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
              <button type="button" className="macro-example" onClick={fillExample}>
                Use example
              </button>
            </div>
            {error && <p className="macro-error">{error}</p>}
            <p className="macro-disclaimer">
              Estimates only. Edit detected portions below to make totals more accurate.
            </p>
          </div>
        </div>

        {parsedMeal && (
          <>
            <div className="macro-results" aria-live="polite">
              <div className="macro-total-card health-card">
                <span>Health score</span>
                <strong>{healthScore.score}/10</strong>
                <small>{healthScore.label}</small>
              </div>
              <div className="macro-total-card">
                <span>Calories</span>
                <strong>{totals.calories}</strong>
                <small>kcal</small>
              </div>
              <div className="macro-total-card">
                <span>Protein</span>
                <strong>{totals.protein}</strong>
                <small>g</small>
              </div>
              <div className="macro-total-card">
                <span>Carbs</span>
                <strong>{totals.carbs}</strong>
                <small>g</small>
              </div>
              <div className="macro-total-card">
                <span>Fat</span>
                <strong>{totals.fat}</strong>
                <small>g</small>
              </div>
            </div>

            <div className="health-notes">
              <strong>Why this score</strong>
              <p>{healthScore.positives.concat(healthScore.cautions).join(' · ') || 'Not enough matched foods yet.'}</p>
            </div>
          </>
        )}

        {parsedMeal && (
          <div className="detected-foods">
            <div className="detected-heading">
              <h3>Detected foods</h3>
              <p>Nutrition values below are calculated from real food database matches only.</p>
            </div>
            <div className="detected-list">
              {items.map((item, index) => (
                <article className={`detected-item ${item.matched ? '' : 'unmatched'}`} key={`${item.original}-${index}`}>
                  <div>
                    <span>{item.original}</span>
                    <strong>{item.matched ? item.matched_food : 'Unmatched food'}</strong>
                    <p>
                      {item.grams || 0}
                      {item.unit === 'ml' ? 'ml' : 'g'} used for calculation
                      {item.source ? ` · source ${item.source}` : ''}
                    </p>
                    <label className="portion-edit">
                      <span>Portion</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.grams || 0}
                        onChange={(event) => updateItemAmount(index, event.target.value)}
                      />
                      <em>{item.unit === 'ml' ? 'ml' : 'g'}</em>
                    </label>
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

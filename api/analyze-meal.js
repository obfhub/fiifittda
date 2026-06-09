const CLAUDE_SYSTEM_PROMPT = `You are a food and meal parser.
Convert natural English meal descriptions and/or meal photos into structured food database search objects.
Do NOT calculate calories.
Do NOT calculate protein.
Do NOT calculate carbs.
Do NOT calculate fat.
Do NOT invent nutrition values.
Your output will be used to search a real food database.
For photos, identify visible foods and estimate portions conservatively in grams or ml.
Return ONLY valid JSON.
No markdown.
No explanations.

Return this exact JSON structure:

{
  "items": [
    {
      "original": "original phrase from user",
      "food_query": "clean food database search query",
      "quantity": 0,
      "unit": "g | ml | piece | cup | tbsp | tsp | serving | unknown",
      "estimated_grams": 0,
      "preparation": "raw | cooked | grilled | fried | baked | boiled | unknown",
      "brand": null,
      "confidence": "low | medium | high"
    }
  ],
  "missing_info": [],
  "note": "Parsed for database lookup only. Nutrition must come from a real food database."
}`;

const USDA_NUTRIENTS = {
  calories: ['Energy'],
  protein: ['Protein'],
  carbs: ['Carbohydrate, by difference'],
  fat: ['Total lipid (fat)', 'Total Fat']
};

const USDA_DATA_TYPE_SCORE = {
  Foundation: 60,
  'SR Legacy': 55,
  'Survey (FNDDS)': 45,
  Branded: 5
};

function getRequestBody(req) {
  if (typeof req.body !== 'string') return req.body || {};

  try {
    return JSON.parse(req.body || '{}');
  } catch (error) {
    return {};
  }
}

function parseClaudeJson(content) {
  const cleaned = String(content || '')
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned);
}

function normalizeParsedMeal(parsed) {
  const items = Array.isArray(parsed.items) ? parsed.items : [];

  return {
    items: items.map((item) => ({
      original: String(item.original || ''),
      food_query: String(item.food_query || ''),
      quantity: Number(item.quantity || 0),
      unit: String(item.unit || 'unknown'),
      estimated_grams: Number(item.estimated_grams || 0),
      preparation: String(item.preparation || 'unknown'),
      brand: item.brand ? String(item.brand) : null,
      confidence: ['low', 'medium', 'high'].includes(item.confidence) ? item.confidence : 'low'
    })),
    missing_info: Array.isArray(parsed.missing_info) ? parsed.missing_info : [],
    note: 'Parsed for database lookup only. Nutrition must come from a real food database.'
  };
}

function roundMacro(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getUsdaNutrient(food, names, preferredUnit = '') {
  const nutrients = food.foodNutrients || [];
  const matches = nutrients.filter((entry) =>
    names.some((name) => normalizeText(entry.nutrientName) === normalizeText(name))
  );

  const preferred = preferredUnit
    ? matches.find((entry) => normalizeText(entry.unitName) === normalizeText(preferredUnit))
    : null;
  const nutrient = preferred || matches[0];

  return Number(nutrient?.value || 0);
}

function mapUsdaFood(food) {
  if (!food) return null;

  const calories = getUsdaNutrient(food, USDA_NUTRIENTS.calories, 'KCAL');
  const protein = getUsdaNutrient(food, USDA_NUTRIENTS.protein);
  const carbs = getUsdaNutrient(food, USDA_NUTRIENTS.carbs);
  const fat = getUsdaNutrient(food, USDA_NUTRIENTS.fat);

  if (calories <= 0 || ![protein, carbs, fat].some((value) => value > 0)) return null;

  return {
    name: food.description || food.lowercaseDescription || 'USDA food',
    calories_per_100g: calories,
    protein_per_100g: protein,
    carbs_per_100g: carbs,
    fat_per_100g: fat,
    source: 'USDA',
    source_id: String(food.fdcId || '')
  };
}

function getUsdaSearchQueries(item) {
  const query = normalizeText(item.food_query);
  const preparation = normalizeText(item.preparation);
  const queries = [];

  if (query === 'egg' || query === 'eggs') queries.push('egg whole raw');
  if (query === 'banana' || query === 'bananas') queries.push('banana raw');
  if (query === 'rice') queries.push(preparation === 'raw' ? 'rice raw' : 'rice cooked');
  if (query === 'chicken breast') {
    queries.push(preparation === 'raw' || preparation === 'unknown' ? 'chicken breast raw' : 'chicken breast cooked');
  }

  queries.push(item.food_query);

  return [...new Set(queries.filter(Boolean))];
}

function scoreUsdaFood(item, food, mappedFood) {
  const description = normalizeText(food.description || food.lowercaseDescription);
  const query = normalizeText(item.food_query);
  const preparation = normalizeText(item.preparation);
  const tokens = query.split(' ').filter(Boolean);
  let score = USDA_DATA_TYPE_SCORE[food.dataType] || 0;

  for (const token of tokens) {
    if (description.includes(token)) score += 10;
  }

  if (description.includes(query)) score += 15;
  if (food.dataType === 'Branded') score -= 40;

  if (query === 'egg' || query === 'eggs') {
    if (description.includes('whole')) score += 20;
    if (description.includes('raw') || description.includes('fresh')) score += 10;
    if (description.includes('white') || description.includes('yolk')) score -= 25;
    if (mappedFood.calories_per_100g > 250) score -= 35;
  }

  if (query === 'banana' || query === 'bananas') {
    if (description.includes('raw')) score += 25;
    if (/dehydrated|powder|chips|pudding|split|nectar/.test(description)) score -= 50;
    if (mappedFood.calories_per_100g > 160) score -= 35;
  }

  if (query === 'rice') {
    if (description.includes('cooked')) score += preparation === 'raw' ? -10 : 20;
    if (/noodles|cracker|dressing|dirty/.test(description)) score -= 35;
  }

  if (query.includes('chicken breast')) {
    if (/boneless|skinless|skin not eaten/.test(description)) score += 20;
    if (preparation !== 'unknown' && description.includes(preparation)) score += 15;
    if (/breaded|tenders|patty|nugget/.test(description)) score -= 35;
  }

  return score;
}

function mapOpenFoodFactsProduct(product) {
  const nutriments = product?.nutriments || {};
  const calories =
    Number(nutriments['energy-kcal_100g']) ||
    Number(nutriments['energy-kcal']) ||
    (Number(nutriments.energy_100g) ? Number(nutriments.energy_100g) / 4.184 : 0);

  const protein = Number(nutriments.proteins_100g || nutriments.proteins || 0);
  const carbs = Number(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0);
  const fat = Number(nutriments.fat_100g || nutriments.fat || 0);

  if (![calories, protein, carbs, fat].some((value) => value > 0)) return null;

  return {
    name: product.product_name || product.generic_name || 'Open Food Facts product',
    calories_per_100g: calories,
    protein_per_100g: protein,
    carbs_per_100g: carbs,
    fat_per_100g: fat,
    source: 'Open Food Facts',
    source_id: product.code || product._id || ''
  };
}

async function parseMealWithClaude(meal) {
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY is not configured. Add it in Vercel environment variables.');
  }

  const imageDataUrl = arguments[1];
  const userContent = [
    {
      type: 'text',
      text: meal || 'Analyze this meal photo. Identify visible foods and estimate portions conservatively.'
    }
  ];

  if (imageDataUrl) {
    userContent.push({
      type: 'image_url',
      image_url: { url: imageDataUrl }
    });
  }

  const response = await fetch('https://claude.ai-platform.space/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CLAUDE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonnet',
      messages: [
        { role: 'system', content: CLAUDE_SYSTEM_PROMPT },
        { role: 'user', content: imageDataUrl ? userContent : meal }
      ],
      temperature: 0,
      max_tokens: 1000
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Claude parsing request failed.');
  }

  return normalizeParsedMeal(parseClaudeJson(data?.choices?.[0]?.message?.content));
}

async function searchUsdaFood(item) {
  let bestMatch = null;
  let bestScore = -Infinity;

  for (const query of getUsdaSearchQueries(item)) {
    const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
    url.searchParams.set('api_key', process.env.USDA_API_KEY || 'DEMO_KEY');
    url.searchParams.set('query', query);
    url.searchParams.set('pageSize', '12');

    const response = await fetch(url);
    if (!response.ok) continue;

    const data = await response.json();
    const foods = Array.isArray(data.foods) ? data.foods : [];

    for (const food of foods) {
      const mapped = mapUsdaFood(food);
      if (!mapped) continue;

      const score = scoreUsdaFood(item, food, mapped);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = mapped;
      }
    }
  }

  return bestMatch;
}

async function searchOpenFoodFacts(item) {
  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
  url.searchParams.set('search_terms', item.food_query);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', '5');
  url.searchParams.set('fields', 'code,_id,product_name,generic_name,nutriments');

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FiiFitOnline/1.0 (https://fiifittda.vercel.app)'
    }
  });
  if (!response.ok) return null;

  const data = await response.json();
  const products = Array.isArray(data.products) ? data.products : [];

  for (const product of products) {
    const mapped = mapOpenFoodFactsProduct(product);
    if (mapped) return mapped;
  }

  return null;
}

async function searchFoodDatabase(item) {
  const usdaMatch = await searchUsdaFood(item);
  if (usdaMatch) return usdaMatch;

  return searchOpenFoodFacts(item);
}

function calculateItemMacros(item, matchedFood) {
  const grams = Math.max(Number(item.estimated_grams || 0), 0);

  if (!matchedFood || grams <= 0) {
    return {
      original: item.original,
      parsed_food_query: item.food_query,
      matched_food: null,
      grams,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      source: null,
      source_id: null,
      unit: item.unit,
      quantity: item.quantity,
      calories_per_100g: 0,
      protein_per_100g: 0,
      carbs_per_100g: 0,
      fat_per_100g: 0,
      matched: false
    };
  }

  const multiplier = grams / 100;

  return {
    original: item.original,
    parsed_food_query: item.food_query,
    matched_food: matchedFood.name,
    grams,
    calories: Math.round(matchedFood.calories_per_100g * multiplier),
    protein: roundMacro(matchedFood.protein_per_100g * multiplier),
    carbs: roundMacro(matchedFood.carbs_per_100g * multiplier),
    fat: roundMacro(matchedFood.fat_per_100g * multiplier),
    source: matchedFood.source,
    source_id: matchedFood.source_id,
    unit: item.unit,
    quantity: item.quantity,
    calories_per_100g: matchedFood.calories_per_100g,
    protein_per_100g: matchedFood.protein_per_100g,
    carbs_per_100g: matchedFood.carbs_per_100g,
    fat_per_100g: matchedFood.fat_per_100g,
    matched: true
  };
}

function calculateHealthScore(items, totals) {
  const matchedItems = items.filter((item) => item.matched);
  const matchedRatio = items.length ? matchedItems.length / items.length : 0;
  const calories = Number(totals.calories || 0);
  const protein = Number(totals.protein || 0);
  const carbs = Number(totals.carbs || 0);
  const fat = Number(totals.fat || 0);
  const names = matchedItems
    .map((item) => normalizeText(`${item.original} ${item.matched_food}`))
    .join(' ');
  let score = 5;
  const positives = [];
  const cautions = [];

  if (matchedRatio >= 0.9) {
    score += 0.8;
    positives.push('most foods matched a nutrition database');
  } else if (matchedRatio < 0.6) {
    score -= 1.2;
    cautions.push('some foods were not matched');
  }

  if (calories > 0) {
    const proteinDensity = protein / (calories / 100);
    if (proteinDensity >= 5) {
      score += 1.1;
      positives.push('solid protein density');
    } else if (proteinDensity < 2.2) {
      score -= 0.8;
      cautions.push('low protein for the calories');
    }

    const fatCaloriesRatio = (fat * 9) / calories;
    if (fatCaloriesRatio > 0.45) {
      score -= 0.8;
      cautions.push('fat is a large share of the meal');
    }
  }

  if (/banana|apple|berry|berries|orange|vegetable|salad|broccoli|spinach|tomato|rice|chicken|egg|oat|beans|lentil|fish|yogurt/.test(names)) {
    score += 1.2;
    positives.push('includes whole-food ingredients');
  }

  if (/chips|fries|fried|pizza|burger|cake|cookie|candy|soda|donut|processed|breaded|pudding|split/.test(names)) {
    score -= 1.4;
    cautions.push('contains more processed or calorie-dense foods');
  }

  if (calories > 900) {
    score -= 0.6;
    cautions.push('large total calorie load');
  } else if (calories >= 350 && calories <= 750) {
    score += 0.4;
    positives.push('reasonable meal-sized energy range');
  }

  const finalScore = roundMacro(clamp(score, 1, 10));

  return {
    score: finalScore,
    label: finalScore >= 8 ? 'Great' : finalScore >= 6 ? 'Good' : finalScore >= 4 ? 'Okay' : 'Needs work',
    positives: positives.slice(0, 3),
    cautions: cautions.slice(0, 3),
    note: 'Health score is an estimate from macros, portion size, match quality, and food names. It is not medical advice.'
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const body = getRequestBody(req);
  const meal = typeof body?.meal === 'string' ? body.meal.trim() : '';
  const image = typeof body?.image === 'string' && body.image.startsWith('data:image/') ? body.image : '';

  if (!meal && !image) {
    return res.status(400).json({ error: 'Meal text or photo is required.' });
  }

  try {
    const parsedMeal = await parseMealWithClaude(meal, image);
    const itemResults = await Promise.all(
      parsedMeal.items.map(async (item) => {
        const matchedFood = await searchFoodDatabase(item);
        return calculateItemMacros(item, matchedFood);
      })
    );

    const totals = itemResults.reduce(
      (sum, item) => ({
        calories: sum.calories + item.calories,
        protein: sum.protein + item.protein,
        carbs: sum.carbs + item.carbs,
        fat: sum.fat + item.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return res.status(200).json({
      items: itemResults,
      totals: {
        calories: Math.round(totals.calories),
        protein: roundMacro(totals.protein),
        carbs: roundMacro(totals.carbs),
        fat: roundMacro(totals.fat)
      },
      health_score: calculateHealthScore(itemResults, totals),
      unmatched_items: itemResults.filter((item) => !item.matched),
      missing_info: parsedMeal.missing_info,
      note: 'Nutrition values come from food database matches. Results may vary by brand, preparation, and portion size.'
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Could not analyze meal with real food database matches.'
    });
  }
};

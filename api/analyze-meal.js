const CLAUDE_SYSTEM_PROMPT = `You are a food text parser.
Convert natural English meal descriptions into structured food database search objects.
Do NOT calculate calories.
Do NOT calculate protein.
Do NOT calculate carbs.
Do NOT calculate fat.
Do NOT invent nutrition values.
Your output will be used to search a real food database.
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

  if (![calories, protein, carbs, fat].some((value) => value > 0)) return null;

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
        { role: 'user', content: meal }
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
  const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
  url.searchParams.set('api_key', process.env.USDA_API_KEY || 'DEMO_KEY');
  url.searchParams.set('query', item.food_query);
  url.searchParams.set('pageSize', '10');

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const foods = Array.isArray(data.foods) ? data.foods : [];

  for (const food of foods) {
    const mapped = mapUsdaFood(food);
    if (mapped) return mapped;
  }

  return null;
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
    matched: true
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const body = getRequestBody(req);
  const meal = typeof body?.meal === 'string' ? body.meal.trim() : '';

  if (!meal) {
    return res.status(400).json({ error: 'Meal text is required.' });
  }

  try {
    const parsedMeal = await parseMealWithClaude(meal);
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

const SYSTEM_PROMPT = `You are a food text parser.
Your job is to convert natural English meal descriptions into structured food database search objects.
Do NOT calculate calories.
Do NOT calculate protein.
Do NOT calculate carbs.
Do NOT calculate fat.
Do NOT invent nutrition data.
Return ONLY valid JSON.
No markdown.
No explanations.

Return this exact JSON format:

{
  "items": [
    {
      "original": "original user phrase",
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
  "note": "Food was parsed for database lookup only. Nutrition values must come from the food database."
}`;

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
    note: 'Food was parsed for database lookup only. Nutrition values must come from the food database.'
  };
}

function getRequestBody(req) {
  if (typeof req.body !== 'string') return req.body || {};

  try {
    return JSON.parse(req.body || '{}');
  } catch (error) {
    return {};
  }
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

  if (!process.env.CLAUDE_API_KEY) {
    return res.status(500).json({
      error: 'CLAUDE_API_KEY is not configured. Add it in Vercel environment variables.'
    });
  }

  try {
    const response = await fetch('https://claude.ai-platform.space/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLAUDE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonnet',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: meal }
        ],
        temperature: 0,
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Claude parsing request failed.'
      });
    }

    const content = data?.choices?.[0]?.message?.content;
    const parsed = normalizeParsedMeal(parseClaudeJson(content));

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: 'Could not parse meal text into food database search items.'
    });
  }
};

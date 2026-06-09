const foodDatabase = [
  { name: 'egg', aliases: ['eggs', 'whole egg'], calories_per_100g: 143, protein_per_100g: 12.6, carbs_per_100g: 0.7, fat_per_100g: 9.5 },
  { name: 'cooked white rice', aliases: ['white rice', 'rice'], calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28.2, fat_per_100g: 0.3 },
  { name: 'cooked brown rice', aliases: ['brown rice'], calories_per_100g: 123, protein_per_100g: 2.7, carbs_per_100g: 25.6, fat_per_100g: 1 },
  { name: 'chicken breast', aliases: ['chicken', 'grilled chicken breast'], calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 },
  { name: 'banana', aliases: ['medium banana'], calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 22.8, fat_per_100g: 0.3 },
  { name: 'oats', aliases: ['oatmeal', 'rolled oats'], calories_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66.3, fat_per_100g: 6.9 },
  { name: 'milk', aliases: ['whole milk'], calories_per_100g: 61, protein_per_100g: 3.2, carbs_per_100g: 4.8, fat_per_100g: 3.3 },
  { name: 'greek yogurt', aliases: ['greek yoghurt', 'plain greek yogurt'], calories_per_100g: 59, protein_per_100g: 10.3, carbs_per_100g: 3.6, fat_per_100g: 0.4 },
  { name: 'apple', aliases: ['medium apple'], calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 13.8, fat_per_100g: 0.2 },
  { name: 'potato', aliases: ['boiled potato', 'baked potato'], calories_per_100g: 87, protein_per_100g: 1.9, carbs_per_100g: 20.1, fat_per_100g: 0.1 },
  { name: 'pasta', aliases: ['cooked pasta'], calories_per_100g: 158, protein_per_100g: 5.8, carbs_per_100g: 30.9, fat_per_100g: 0.9 },
  { name: 'beef', aliases: ['lean beef', 'cooked beef'], calories_per_100g: 250, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 15 },
  { name: 'salmon', aliases: ['cooked salmon'], calories_per_100g: 208, protein_per_100g: 20.4, carbs_per_100g: 0, fat_per_100g: 13.4 },
  { name: 'tuna', aliases: ['canned tuna'], calories_per_100g: 132, protein_per_100g: 28, carbs_per_100g: 0, fat_per_100g: 1.3 },
  { name: 'cheese', aliases: ['cheddar cheese'], calories_per_100g: 402, protein_per_100g: 25, carbs_per_100g: 1.3, fat_per_100g: 33 },
  { name: 'bread', aliases: ['white bread', 'slice bread'], calories_per_100g: 265, protein_per_100g: 9, carbs_per_100g: 49, fat_per_100g: 3.2 },
  { name: 'peanut butter', aliases: ['peanut spread'], calories_per_100g: 588, protein_per_100g: 25, carbs_per_100g: 20, fat_per_100g: 50 },
  { name: 'olive oil', aliases: ['extra virgin olive oil'], calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 },
  { name: 'avocado', aliases: ['raw avocado'], calories_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 8.5, fat_per_100g: 14.7 }
];

function normalizeFoodName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestMatch(foodQuery) {
  const normalizedQuery = normalizeFoodName(foodQuery);

  if (!normalizedQuery) return null;

  return foodDatabase.find((food) => {
    const names = [food.name, ...(food.aliases || [])].map(normalizeFoodName);
    return names.some((name) => name === normalizedQuery || name.includes(normalizedQuery) || normalizedQuery.includes(name));
  }) || null;
}

function calculateFoodMacros(food, grams) {
  const multiplier = grams / 100;

  return {
    calories: food.calories_per_100g * multiplier,
    protein: food.protein_per_100g * multiplier,
    carbs: food.carbs_per_100g * multiplier,
    fat: food.fat_per_100g * multiplier
  };
}

function roundMacro(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function calculateMacros(parsedItems = []) {
  const results = parsedItems.map((item) => {
    const matchedFood = findBestMatch(item.food_query);
    const grams = Math.max(Number(item.estimated_grams || 0), 0);

    if (!matchedFood || grams <= 0) {
      return {
        ...item,
        matched: false,
        matched_food_name: matchedFood ? matchedFood.name : null,
        grams_used: grams,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
    }

    const macros = calculateFoodMacros(matchedFood, grams);

    return {
      ...item,
      matched: true,
      matched_food_name: matchedFood.name,
      grams_used: grams,
      calories: roundMacro(macros.calories),
      protein: roundMacro(macros.protein),
      carbs: roundMacro(macros.carbs),
      fat: roundMacro(macros.fat)
    };
  });

  const totals = results.reduce(
    (sum, item) => ({
      calories: sum.calories + item.calories,
      protein: sum.protein + item.protein,
      carbs: sum.carbs + item.carbs,
      fat: sum.fat + item.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    items: results,
    totals: {
      calories: Math.round(totals.calories),
      protein: roundMacro(totals.protein),
      carbs: roundMacro(totals.carbs),
      fat: roundMacro(totals.fat)
    },
    unmatchedItems: results.filter((item) => !item.matched)
  };
}

module.exports = {
  foodDatabase,
  findBestMatch,
  calculateMacros
};

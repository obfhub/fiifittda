function getRequestBody(req) {
  if (typeof req.body !== 'string') return req.body || {};

  try {
    return JSON.parse(req.body || '{}');
  } catch (error) {
    return {};
  }
}

function mapProduct(product) {
  const nutriments = product?.nutriments || {};
  const calories =
    Number(nutriments['energy-kcal_100g']) ||
    Number(nutriments['energy-kcal']) ||
    (Number(nutriments.energy_100g) ? Number(nutriments.energy_100g) / 4.184 : 0);

  return {
    product_name: product?.product_name || '',
    brand: product?.brands || '',
    calories_per_100g: calories,
    protein_per_100g: Number(nutriments.proteins_100g || nutriments.proteins || 0),
    carbs_per_100g: Number(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0),
    fat_per_100g: Number(nutriments.fat_100g || nutriments.fat || 0),
    source: 'Open Food Facts'
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const body = getRequestBody(req);
  const barcode = String(body?.barcode || '').trim();

  if (!barcode) {
    return res.status(400).json({ error: 'Barcode is required.' });
  }

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`, {
      headers: {
        'User-Agent': 'FiiFitOnline/1.0 (https://fiifittda.vercel.app)'
      }
    });

    const data = await response.json();

    if (!response.ok || data.status !== 1 || !data.product) {
      return res.status(404).json({ error: 'Product not found in Open Food Facts.' });
    }

    return res.status(200).json(mapProduct(data.product));
  } catch (error) {
    return res.status(500).json({ error: 'Could not look up barcode in Open Food Facts.' });
  }
};

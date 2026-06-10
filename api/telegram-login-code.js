const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

function getRequestBody(req) {
  if (typeof req.body !== 'string') return req.body || {};

  try {
    return JSON.parse(req.body || '{}');
  } catch (error) {
    return {};
  }
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const botUsername = (process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '').trim();

    if (!botUsername) {
      return res.status(500).json({ error: 'Telegram login is not configured. Add TELEGRAM_BOT_USERNAME in Vercel.' });
    }

    const body = getRequestBody(req);
    const nextPath = typeof body?.next === 'string' && body.next.startsWith('/') && !body.next.startsWith('//')
      ? body.next
      : '/account';
    const code = `login_${crypto.randomBytes(18).toString('base64url')}`;
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('telegram_login_codes')
      .insert({
        code,
        next_path: nextPath
      });

    if (error) throw error;

    return res.status(200).json({
      code,
      botUsername,
      telegramUrl: `https://t.me/${botUsername}?start=${encodeURIComponent(code)}`
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Could not create Telegram login code.'
    });
  }
};

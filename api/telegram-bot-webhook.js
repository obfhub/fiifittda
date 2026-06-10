const { createClient } = require('@supabase/supabase-js');

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

async function sendTelegramMessage(chatId, text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !chatId) return;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  }).catch(() => {});
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const update = getRequestBody(req);
    const message = update.message || update.edited_message;
    const from = message?.from;
    const chatId = message?.chat?.id;
    const text = typeof message?.text === 'string' ? message.text.trim() : '';
    const code = text.split(/\s+/)[1] || '';

    if (!text.startsWith('/start') || !code.startsWith('login_') || !from?.id) {
      return res.status(200).json({ ok: true });
    }

    const supabase = getSupabaseAdminClient();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: loginCode, error: findError } = await supabase
      .from('telegram_login_codes')
      .select('code, used_at, created_at')
      .eq('code', code)
      .gte('created_at', tenMinutesAgo)
      .maybeSingle();

    if (findError) throw findError;

    if (!loginCode || loginCode.used_at) {
      await sendTelegramMessage(chatId, 'Linkul de conectare a expirat. Te rugam sa incerci din nou de pe site.');
      return res.status(200).json({ ok: true });
    }

    const { error: updateError } = await supabase
      .from('telegram_login_codes')
      .update({
        telegram_id: String(from.id),
        telegram_username: from.username || '',
        first_name: from.first_name || '',
        last_name: from.last_name || '',
        confirmed_at: new Date().toISOString()
      })
      .eq('code', code);

    if (updateError) throw updateError;

    await sendTelegramMessage(chatId, 'Telegram conectat. Revino pe site, te autentificam automat acum.');

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(200).json({ ok: false });
  }
};

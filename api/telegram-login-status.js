const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const AUTH_COOKIE_NAME = 'fiifit_auth';

function getRequestBody(req) {
  if (typeof req.body !== 'string') return req.body || {};

  try {
    return JSON.parse(req.body || '{}');
  } catch (error) {
    return {};
  }
}

function signValue(value) {
  const secret = process.env.AUTH_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function createAuthCookie(user, expiresAt) {
  const payload = base64UrlEncode(JSON.stringify({ user, expires_at: expiresAt }));
  const signature = signValue(payload);
  const maxAge = Math.max(expiresAt - Math.floor(Date.now() / 1000), 0);

  return [
    `${AUTH_COOKIE_NAME}=${payload}.${signature}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    `Max-Age=${maxAge}`
  ].join('; ');
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

async function findSupabaseUserByTelegramId(supabase, telegramId, email) {
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    const found = data.users.find((user) => {
      const metadata = user.user_metadata || {};
      return String(metadata.telegram_id || '') === telegramId || user.email === email;
    });

    if (found) return found;
    if (data.users.length < 100) break;
    page += 1;
  }

  return null;
}

async function getOrCreateTelegramUser(supabase, loginCode) {
  const telegramId = String(loginCode.telegram_id || '');
  if (!telegramId) throw new Error('Telegram user is not confirmed yet.');

  const name = [loginCode.first_name, loginCode.last_name].filter(Boolean).join(' ')
    || loginCode.telegram_username
    || 'Telegram user';
  const email = `telegram-${telegramId}@fiifit.local`;
  const existingUser = await findSupabaseUserByTelegramId(supabase, telegramId, email);

  if (existingUser) {
    return {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.user_metadata?.full_name || existingUser.user_metadata?.name || name
    };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: crypto.randomBytes(32).toString('base64url'),
    email_confirm: true,
    user_metadata: {
      full_name: name,
      name,
      telegram_id: telegramId,
      telegram_username: loginCode.telegram_username || '',
      provider: 'telegram'
    }
  });

  if (error) throw error;

  return {
    id: data.user?.id,
    email: data.user?.email,
    name
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = getRequestBody(req);
    const code = typeof body?.code === 'string' ? body.code : '';

    if (!code.startsWith('login_')) {
      return res.status(400).json({ error: 'Invalid Telegram login code.' });
    }

    const supabase = getSupabaseAdminClient();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: loginCode, error } = await supabase
      .from('telegram_login_codes')
      .select('*')
      .eq('code', code)
      .gte('created_at', tenMinutesAgo)
      .maybeSingle();

    if (error) throw error;

    if (!loginCode || loginCode.used_at) {
      return res.status(410).json({ status: 'expired', error: 'Telegram login expired. Try again.' });
    }

    if (!loginCode.telegram_id || !loginCode.confirmed_at) {
      return res.status(200).json({ status: 'pending' });
    }

    const user = await getOrCreateTelegramUser(supabase, loginCode);
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const nextPath = typeof loginCode.next_path === 'string' && loginCode.next_path.startsWith('/') && !loginCode.next_path.startsWith('//')
      ? loginCode.next_path
      : '/account';

    await supabase
      .from('telegram_login_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('code', code);

    res.setHeader('Set-Cookie', createAuthCookie(user, expiresAt));

    return res.status(200).json({
      status: 'authenticated',
      user,
      auth: {
        authenticated: true,
        expires_at: expiresAt
      },
      next: nextPath
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Could not finish Telegram login.'
    });
  }
};

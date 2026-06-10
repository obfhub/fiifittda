const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const AUTH_COOKIE_NAME = 'fiifit_auth';
const TELEGRAM_FIELDS = ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date'];

function getBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || (host?.includes('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

function signValue(value) {
  const secret = process.env.AUTH_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left || '', 'hex');
  const rightBuffer = Buffer.from(right || '', 'hex');

  if (leftBuffer.length !== rightBuffer.length || leftBuffer.length === 0) return false;

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
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

function normalizeQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getTelegramProfile(query) {
  return TELEGRAM_FIELDS.reduce((profile, field) => {
    const value = normalizeQueryValue(query[field]);
    if (typeof value === 'string' && value) profile[field] = value;
    return profile;
  }, {});
}

function verifyTelegramLogin(query) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const receivedHash = normalizeQueryValue(query.hash);
  const profile = getTelegramProfile(query);

  if (!botToken) throw new Error('Telegram login is not configured. Add TELEGRAM_BOT_TOKEN in Vercel.');
  if (!receivedHash || !profile.id || !profile.auth_date) return null;

  const authAgeSeconds = Math.floor(Date.now() / 1000) - Number(profile.auth_date);
  if (!Number.isFinite(authAgeSeconds) || authAgeSeconds > 60 * 60 * 24) {
    throw new Error('Telegram login expired. Try again.');
  }

  const dataCheckString = Object.keys(profile)
    .sort()
    .map((key) => `${key}=${profile[key]}`)
    .join('\n');
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (!safeCompare(receivedHash, computedHash)) return null;

  return profile;
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

async function getOrCreateTelegramUser(profile) {
  const supabase = getSupabaseAdminClient();
  const telegramId = String(profile.id || '');

  if (!telegramId) throw new Error('Telegram profile is missing an ID.');

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
    || profile.username
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
      telegram_username: profile.username || '',
      telegram_photo_url: profile.photo_url || '',
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
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const profile = verifyTelegramLogin(req.query || {});

    if (!profile) {
      return res.status(401).send('Telegram login verification failed.');
    }

    const user = await getOrCreateTelegramUser(profile);
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const nextPath = typeof req.query?.next === 'string' && req.query.next.startsWith('/') && !req.query.next.startsWith('//')
      ? req.query.next
      : '/account';

    res.setHeader('Set-Cookie', createAuthCookie(user, expiresAt));

    return res.redirect(302, `${getBaseUrl(req)}/telegram-session?next=${encodeURIComponent(nextPath)}`);
  } catch (error) {
    return res.status(500).send(error.message || 'Telegram login failed.');
  }
};

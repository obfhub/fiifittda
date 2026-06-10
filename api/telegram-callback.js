const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const AUTH_COOKIE_NAME = 'fiifit_auth';
const TELEGRAM_STATE_COOKIE = 'fiifit_telegram_oauth';

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').map((part) => part.trim());
  const cookie = cookies.find((part) => part.startsWith(`${name}=`));
  return cookie ? cookie.slice(name.length + 1) : '';
}

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
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');

  if (leftBuffer.length !== rightBuffer.length || leftBuffer.length === 0) return false;

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function readTelegramStateCookie(req) {
  const cookieValue = getCookie(req, TELEGRAM_STATE_COOKIE);
  const [payload, signature] = cookieValue.split('.');

  if (!payload || !signature || !safeCompare(signature, signValue(payload))) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const isExpired = Number(decoded.created_at || 0) + 10 * 60 * 1000 < Date.now();

    if (!decoded.state || !decoded.code_verifier || isExpired) return null;

    return decoded;
  } catch (error) {
    return null;
  }
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

function clearTelegramCookie() {
  return `${TELEGRAM_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
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

async function exchangeCodeForTokens(code, codeVerifier, redirectUri) {
  const credentials = Buffer.from(`${process.env.TELEGRAM_CLIENT_ID}:${process.env.TELEGRAM_CLIENT_SECRET}`).toString('base64');
  const response = await fetch('https://oauth.telegram.org/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: process.env.TELEGRAM_CLIENT_ID,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.id_token) {
    throw new Error(data.error_description || data.error || 'Telegram login failed.');
  }

  return data;
}

async function verifyTelegramIdToken(idToken) {
  const { createRemoteJWKSet, jwtVerify } = await import('jose');
  const jwks = createRemoteJWKSet(new URL('https://oauth.telegram.org/.well-known/jwks.json'));

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: 'https://oauth.telegram.org',
    audience: process.env.TELEGRAM_CLIENT_ID
  });

  return payload;
}

async function findSupabaseUserByTelegramId(supabase, telegramId, email) {
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    const found = data.users.find((user) => {
      const metadata = user.user_metadata || {};
      return metadata.telegram_id === telegramId || user.email === email;
    });

    if (found) return found;
    if (data.users.length < 100) break;
    page += 1;
  }

  return null;
}

async function getOrCreateTelegramUser(profile) {
  const supabase = getSupabaseAdminClient();
  const telegramId = String(profile.sub || profile.id || '');

  if (!telegramId) throw new Error('Telegram profile is missing an ID.');

  const name = [profile.given_name, profile.family_name].filter(Boolean).join(' ')
    || profile.name
    || profile.preferred_username
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
      telegram_username: profile.preferred_username || '',
      telegram_photo_url: profile.picture || profile.photo_url || '',
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
    const code = typeof req.query?.code === 'string' ? req.query.code : '';
    const state = typeof req.query?.state === 'string' ? req.query.state : '';
    const storedState = readTelegramStateCookie(req);

    if (!code || !state || !storedState || state !== storedState.state) {
      return res.status(400).send('Telegram login session expired. Try again.');
    }

    const redirectUri = process.env.TELEGRAM_REDIRECT_URI || `${getBaseUrl(req)}/api/telegram-callback`;
    const tokens = await exchangeCodeForTokens(code, storedState.code_verifier, redirectUri);
    const profile = await verifyTelegramIdToken(tokens.id_token);
    const user = await getOrCreateTelegramUser(profile);
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const nextPath = storedState.next || '/account';

    res.setHeader('Set-Cookie', [
      createAuthCookie(user, expiresAt),
      clearTelegramCookie()
    ]);

    return res.redirect(302, nextPath);
  } catch (error) {
    return res.status(500).send(error.message || 'Telegram login failed.');
  }
};

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

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function getSupabaseAuthClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const authKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !authKey) {
    throw new Error('Supabase login is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel.');
  }

  return createClient(supabaseUrl, authKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function signValue(value) {
  const secret = process.env.AUTH_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const body = getRequestBody(req);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!isValidEmail(email)) {
    return res.status(400).json({ field: 'email', error: 'Enter a valid email address.' });
  }

  if (!password) {
    return res.status(400).json({ field: 'password', error: 'Enter your password.' });
  }

  try {
    const supabase = getSupabaseAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        field: 'form',
        error: 'Email or password is incorrect.'
      });
    }

    const fallbackExpiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

    const user = {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || ''
      };
    const expiresAt = data.session?.expires_at || fallbackExpiresAt;

    res.setHeader('Set-Cookie', createAuthCookie(user, expiresAt));

    return res.status(200).json({
      user,
      auth: {
        authenticated: true,
        expires_at: expiresAt
      },
      session: {
        access_token: data.session?.access_token || null,
        refresh_token: data.session?.refresh_token || null,
        expires_at: expiresAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Could not log in.'
    });
  }
};

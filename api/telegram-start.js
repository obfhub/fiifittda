const crypto = require('crypto');

const TELEGRAM_STATE_COOKIE = 'fiifit_telegram_oauth';

function getBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || (host?.includes('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

function signValue(value) {
  const secret = process.env.AUTH_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function createSignedCookie(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${signValue(encoded)}`;
}

function base64Url(buffer) {
  return Buffer.from(buffer).toString('base64url');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const clientId = process.env.TELEGRAM_CLIENT_ID;

  if (!clientId) {
    return res.status(500).send('Telegram login is not configured. Add TELEGRAM_CLIENT_ID in Vercel.');
  }

  const nextPath = typeof req.query?.next === 'string' ? req.query.next : '/account';
  const safeNextPath = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/account';
  const state = base64Url(crypto.randomBytes(24));
  const codeVerifier = base64Url(crypto.randomBytes(32));
  const codeChallenge = base64Url(crypto.createHash('sha256').update(codeVerifier).digest());
  const redirectUri = process.env.TELEGRAM_REDIRECT_URI || `${getBaseUrl(req)}/api/telegram-callback`;

  const cookieValue = createSignedCookie({
    state,
    code_verifier: codeVerifier,
    next: safeNextPath,
    created_at: Date.now()
  });

  res.setHeader('Set-Cookie', [
    `${TELEGRAM_STATE_COOKIE}=${cookieValue}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    'Max-Age=600'
  ].join('; '));

  const authUrl = new URL('https://oauth.telegram.org/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  return res.redirect(302, authUrl.toString());
};

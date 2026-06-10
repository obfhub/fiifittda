const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const AUTH_COOKIE_NAME = 'fiifit_auth';

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').map((part) => part.trim());
  const cookie = cookies.find((part) => part.startsWith(`${name}=`));
  return cookie ? cookie.slice(name.length + 1) : '';
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

function readAuthCookie(req) {
  const cookieValue = getCookie(req, AUTH_COOKIE_NAME);
  const [payload, signature] = cookieValue.split('.');

  if (!payload || !signature || !safeCompare(signature, signValue(payload))) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const expiresAt = Number(decoded.expires_at || 0);

    if (!decoded.user || !expiresAt || expiresAt < Math.floor(Date.now() / 1000)) return null;

    return decoded;
  } catch (error) {
    return null;
  }
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function enrichUserFromSupabase(user) {
  const supabase = getSupabaseAdminClient();
  if (!supabase || !user?.id) return user;

  const { data, error } = await supabase.auth.admin.getUserById(user.id);
  if (error || !data?.user) return user;

  const metadata = data.user.user_metadata || {};

  return {
    id: data.user.id,
    email: data.user.email || user.email,
    name: metadata.full_name || metadata.name || user.name || '',
    membership: metadata.membership || null,
    provider: metadata.provider || 'email',
    telegram_username: metadata.telegram_username || ''
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const auth = readAuthCookie(req);

  if (!auth) {
    return res.status(401).json({ authenticated: false });
  }

  const user = await enrichUserFromSupabase(auth.user);

  return res.status(200).json({
    authenticated: true,
    user,
    expires_at: auth.expires_at
  });
};

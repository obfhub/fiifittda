const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

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

function getAdminEmails() {
  return String(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
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

function assertAdmin(req) {
  const auth = readAuthCookie(req);
  const adminEmails = getAdminEmails();
  const email = String(auth?.user?.email || '').toLowerCase();

  if (!auth) {
    const error = new Error('Not authenticated.');
    error.status = 401;
    throw error;
  }

  if (!adminEmails.includes(email)) {
    const error = new Error(adminEmails.length ? 'Not allowed.' : 'Admin access is not configured. Add ADMIN_EMAILS in Vercel.');
    error.status = 403;
    throw error;
  }

  return auth.user;
}

async function listAllUsers(supabase) {
  const users = [];
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    users.push(...data.users);
    if (data.users.length < 100) break;
    page += 1;
  }

  return users;
}

async function getTelegramLoginStats(supabase) {
  const { data, error } = await supabase
    .from('telegram_login_codes')
    .select('code, telegram_id, confirmed_at, used_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return {
      available: false,
      total: 0,
      confirmed: 0,
      used: 0,
      recent: []
    };
  }

  return {
    available: true,
    total: data.length,
    confirmed: data.filter((item) => item.confirmed_at).length,
    used: data.filter((item) => item.used_at).length,
    recent: data.slice(0, 8)
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const adminUser = assertAdmin(req);
    const supabase = getSupabaseAdminClient();
    const [users, telegramStats] = await Promise.all([
      listAllUsers(supabase),
      getTelegramLoginStats(supabase)
    ]);

    const normalizedUsers = users
      .map((user) => {
        const metadata = user.user_metadata || {};
        return {
          id: user.id,
          email: user.email,
          name: metadata.full_name || metadata.name || '',
          provider: metadata.provider || 'email',
          telegram_username: metadata.telegram_username || '',
          membership: metadata.membership || null,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at
        };
      })
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));

    const activePlans = normalizedUsers.filter((user) => user.membership?.status === 'active').length;
    const telegramUsers = normalizedUsers.filter((user) => user.provider === 'telegram' || user.telegram_username).length;

    return res.status(200).json({
      admin: {
        email: adminUser.email,
        name: adminUser.name || adminUser.email
      },
      stats: {
        users: normalizedUsers.length,
        activePlans,
        telegramUsers,
        emailUsers: normalizedUsers.length - telegramUsers
      },
      users: normalizedUsers,
      telegram: telegramStats,
      config: {
        telegramBot: Boolean(process.env.TELEGRAM_BOT_USERNAME && process.env.TELEGRAM_BOT_TOKEN),
        supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
      }
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || 'Could not load admin dashboard.'
    });
  }
};

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const AUTH_COOKIE_NAME = 'fiifit_auth';
const plans = {
  '3 Luni': {
    duration: '3 Luni',
    price: '175 EUR',
    description: '120 zile pentru stilul tau de viata sanatos'
  },
  '6 Luni': {
    duration: '6 Luni',
    price: '275 EUR',
    description: '180 zile pentru stilul tau de viata sanatos'
  },
  '12 Luni': {
    duration: '12 Luni',
    price: '365 EUR',
    description: '365 zile pentru stilul tau de viata sanatos'
  }
};

function getRequestBody(req) {
  if (typeof req.body !== 'string') return req.body || {};

  try {
    return JSON.parse(req.body || '{}');
  } catch (error) {
    return {};
  }
}

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
    assertAdmin(req);

    const body = getRequestBody(req);
    const userId = typeof body?.userId === 'string' ? body.userId : '';
    const action = typeof body?.action === 'string' ? body.action : '';

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID.' });
    }

    const supabase = getSupabaseAdminClient();
    const { data: currentUser, error: getError } = await supabase.auth.admin.getUserById(userId);
    if (getError || !currentUser?.user) throw getError || new Error('User not found.');

    const currentMetadata = currentUser.user.user_metadata || {};
    let membership = currentMetadata.membership || null;

    if (action === 'grant-plan') {
      const plan = plans[body.plan] || plans['6 Luni'];
      membership = {
        status: 'active',
        plan,
        startedAt: new Date().toISOString(),
        videosUnlocked: 5,
        trackerAccess: true,
        grantedBy: 'admin'
      };
    } else if (action === 'remove-plan') {
      membership = null;
    } else {
      return res.status(400).json({ error: 'Unknown action.' });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...currentMetadata,
        membership
      }
    });

    if (error) throw error;

    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
        provider: data.user.user_metadata?.provider || 'email',
        telegram_username: data.user.user_metadata?.telegram_username || '',
        membership: data.user.user_metadata?.membership || null,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at
      }
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || 'Could not update user.'
    });
  }
};

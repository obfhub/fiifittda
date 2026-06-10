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

  return auth.user;
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

function normalizeUser(user) {
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
}

function isWithinDays(value, days) {
  if (!value) return false;
  return Date.now() - new Date(value).getTime() <= days * 24 * 60 * 60 * 1000;
}

async function getWebsiteStats(supabase) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get all page views in last 30 days
    const { data: pageViews, error: pvError } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', thirtyDaysAgo);

    // Get all sessions in last 30 days
    const { data: sessions, error: sessError } = await supabase
      .from('sessions')
      .select('*')
      .gte('first_page_at', thirtyDaysAgo);

    if (pvError || sessError) {
      // Fall back to mock data if tables don't exist yet
      return getMockWebsiteStats();
    }

    const pv = pageViews || [];
    const sess = sessions || [];

    // Calculate total views
    const totalViews = pv.length;

    // Calculate unique visitors
    const uniqueVisitors = new Set(sess.map(s => s.session_id)).size;

    // Calculate bounce rate (sessions with only 1 page view)
    const bounceSessions = sess.filter(s => s.page_count === 1).length;
    const bounceRate = sess.length > 0 ? Math.round((bounceSessions / sess.length) * 100 * 10) / 10 : 0;

    // Calculate average session duration (in minutes)
    const durations = sess
      .filter(s => s.last_page_at && s.first_page_at)
      .map(s => (new Date(s.last_page_at) - new Date(s.first_page_at)) / 1000 / 60);
    const avgSessionDuration = durations.length > 0
      ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
      : 0;

    // Get top pages
    const pageMap = {};
    pv.forEach(view => {
      if (!pageMap[view.page_path]) {
        pageMap[view.page_path] = { path: view.page_path, title: view.page_title || view.page_path, views: 0 };
      }
      pageMap[view.page_path].views += 1;
    });

    const topPages = Object.values(pageMap)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((page, index, arr) => ({
        ...page,
        percentage: totalViews > 0 ? Math.round((page.views / totalViews) * 100 * 10) / 10 : 0
      }));

    // Get top referrers
    const referrerMap = {};
    pv.forEach(view => {
      const referrer = view.referrer || 'Direct';
      const domain = referrer === 'Direct' ? 'direct' : (new URL(referrer).hostname || referrer);
      const source = referrer === 'Direct' ? 'Direct' : domain.replace('www.', '');

      if (!referrerMap[source]) {
        referrerMap[source] = { source, domain, count: 0 };
      }
      referrerMap[source].count += 1;
    });

    const topReferrers = Object.values(referrerMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(ref => ({
        ...ref,
        percentage: totalViews > 0 ? Math.round((ref.count / totalViews) * 100 * 10) / 10 : 0
      }));

    // Get device stats
    const deviceMap = {};
    sess.forEach(session => {
      const device = session.device_type || 'Unknown';
      if (!deviceMap[device]) {
        deviceMap[device] = { type: device, count: 0 };
      }
      deviceMap[device].count += 1;
    });

    const deviceStats = Object.values(deviceMap)
      .sort((a, b) => b.count - a.count)
      .map(device => ({
        ...device,
        percentage: uniqueVisitors > 0 ? Math.round((device.count / uniqueVisitors) * 100 * 10) / 10 : 0
      }));

    return {
      totalViews,
      uniqueVisitors,
      bounceRate,
      avgSessionDuration,
      topPages,
      topReferrers,
      deviceStats
    };
  } catch (error) {
    console.error('Error fetching website stats:', error);
    // Fall back to mock data on any error
    return getMockWebsiteStats();
  }
}

function getMockWebsiteStats() {
  // Mock website stats - returned when tables don't exist or query fails
  return {
    totalViews: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    topReferrers: [],
    deviceStats: []
  };
}

function calculateAnalytics(users, telegramStats) {
  const activeUsers = users.filter((user) => user.membership?.status === 'active');
  const telegramUsers = users.filter((user) => user.provider === 'telegram' || user.telegram_username);
  const planMix = Object.keys(plans).map((duration) => ({
    label: duration,
    count: activeUsers.filter((user) => user.membership?.plan?.duration === duration).length
  }));
  const recentSignups = users.filter((user) => isWithinDays(user.created_at, 7)).length;
  const recentlyActive = users.filter((user) => isWithinDays(user.last_sign_in_at, 7)).length;
  const conversionRate = users.length ? Math.round((activeUsers.length / users.length) * 100) : 0;
  const telegramCompletionRate = telegramStats.total ? Math.round((telegramStats.used / telegramStats.total) * 100) : 0;
  const newestUsers = users
    .slice()
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, 5);
  const activeRecently = users
    .filter((user) => user.last_sign_in_at)
    .sort((left, right) => new Date(right.last_sign_in_at) - new Date(left.last_sign_in_at))
    .slice(0, 5);

  return {
    conversionRate,
    recentSignups,
    recentlyActive,
    planMix,
    providerMix: [
      { label: 'Telegram', count: telegramUsers.length },
      { label: 'Email', count: users.length - telegramUsers.length }
    ],
    telegramCompletionRate,
    newestUsers,
    activeRecently,
    operations: [
      {
        label: 'Supabase',
        status: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) ? 'OK' : 'Lipseste',
        detail: 'Auth si metadata utilizatori'
      },
      {
        label: 'Telegram bot',
        status: Boolean(process.env.TELEGRAM_BOT_USERNAME && process.env.TELEGRAM_BOT_TOKEN) ? 'OK' : 'Lipseste',
        detail: 'Deep-link login si webhook'
      },
      {
        label: 'Webhook table',
        status: telegramStats.available ? 'OK' : 'Lipseste',
        detail: telegramStats.available ? `${telegramStats.used}/${telegramStats.total} coduri folosite` : 'Creeaza tabelul telegram_login_codes'
      }
    ]
  };
}

async function handleDashboard(req, res, supabase, adminUser) {
  const [users, telegramStats, websiteStats] = await Promise.all([
    listAllUsers(supabase),
    getTelegramLoginStats(supabase),
    getWebsiteStats(supabase)
  ]);

  const normalizedUsers = users
    .map(normalizeUser)
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));

  const activePlans = normalizedUsers.filter((user) => user.membership?.status === 'active').length;
  const telegramUsers = normalizedUsers.filter((user) => user.provider === 'telegram' || user.telegram_username).length;
  const analytics = calculateAnalytics(normalizedUsers, telegramStats);

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
    analytics,
    website: websiteStats,
    config: {
      telegramBot: Boolean(process.env.TELEGRAM_BOT_USERNAME && process.env.TELEGRAM_BOT_TOKEN),
      supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    }
  });
}

async function handleUpdate(req, res, supabase) {
  const body = getRequestBody(req);
  const userId = typeof body?.userId === 'string' ? body.userId : '';
  const action = typeof body?.action === 'string' ? body.action : '';

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID.' });
  }

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
    user: normalizeUser(data.user)
  });
}

module.exports = async function handler(req, res) {
  try {
    const adminUser = assertAdmin(req);
    const supabase = getSupabaseAdminClient();

    if (req.method === 'GET') {
      return handleDashboard(req, res, supabase, adminUser);
    }

    if (req.method === 'POST') {
      return handleUpdate(req, res, supabase);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || 'Admin request failed.'
    });
  }
};

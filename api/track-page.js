const { createClient } = require('@supabase/supabase-js');

// Rate limiting: store request counts per session in memory
// In production, use Redis or similar for distributed rate limiting
const requestCounts = new Map();
const RATE_LIMIT = 100; // max requests per session per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function getRequestBody(req) {
  if (typeof req.body !== 'string') return req.body || {};
  try {
    return JSON.parse(req.body || '{}');
  } catch (error) {
    return {};
  }
}

function isValidPagePath(path) {
  // Must start with /, alphanumeric, hyphens, underscores, slashes
  return typeof path === 'string' && /^\/[\w\-\.\~\/]*$/.test(path);
}

function isValidSessionId(sessionId) {
  // Must be alphanumeric with underscores
  return typeof sessionId === 'string' && /^session_[\w]+$/.test(sessionId);
}

function detectDeviceType(userAgent) {
  if (!userAgent) return null;

  const ua = userAgent.toLowerCase();
  if (/ipad|android(?!.*mobile)/.test(ua)) return 'tablet';
  if (/mobile|android|iphone|ipod|windows phone/.test(ua)) return 'mobile';
  if (/windows|linux|mac|cros/.test(ua)) return 'desktop';

  return null;
}

function checkRateLimit(sessionId) {
  const now = Date.now();
  const key = `${sessionId}:${Math.floor(now / RATE_WINDOW)}`;

  const count = (requestCounts.get(key) || 0) + 1;
  requestCounts.set(key, count);

  // Clean up old entries (older than 2 hours)
  for (const [k] of requestCounts) {
    const [_, window] = k.split(':');
    if (Math.floor(now / RATE_WINDOW) - parseInt(window) > 1) {
      requestCounts.delete(k);
    }
  }

  return count <= RATE_LIMIT;
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase is not configured.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function handlePageView(req, res, supabase) {
  const body = getRequestBody(req);
  const sessionId = String(body?.session_id || '').trim();
  const pagePath = String(body?.page_path || '').trim();
  const pageTitle = String(body?.page_title || '').trim() || null;
  const deviceType = String(body?.device_type || '').trim() || detectDeviceType(req.headers['user-agent']);
  const referrer = String(body?.referrer || '').trim() || null;

  // Validate required fields
  if (!sessionId || !isValidSessionId(sessionId)) {
    return res.status(400).json({ error: 'Invalid or missing session_id.' });
  }

  if (!pagePath || !isValidPagePath(pagePath)) {
    return res.status(400).json({ error: 'Invalid or missing page_path.' });
  }

  // Check rate limit
  if (!checkRateLimit(sessionId)) {
    return res.status(429).json({ error: 'Too many requests. Rate limit exceeded.' });
  }

  try {
    // Insert page view
    const { error: insertError } = await supabase
      .from('page_views')
      .insert([
        {
          session_id: sessionId,
          page_path: pagePath,
          page_title: pageTitle,
          device_type: deviceType,
          referrer: referrer,
          user_agent: req.headers['user-agent']
        }
      ]);

    if (insertError) throw insertError;

    // Update or create session record
    const { data: existingSession, error: selectError } = await supabase
      .from('sessions')
      .select('page_count, last_page_at')
      .eq('session_id', sessionId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected for new sessions)
      throw selectError;
    }

    if (existingSession) {
      // Update existing session
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          page_count: existingSession.page_count + 1,
          last_page_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (updateError) throw updateError;
    } else {
      // Create new session
      const { error: createError } = await supabase
        .from('sessions')
        .insert([
          {
            session_id: sessionId,
            first_page_path: pagePath,
            first_referrer: referrer,
            device_type: deviceType,
            page_count: 1
          }
        ]);

      if (createError) throw createError;
    }

    // Return 204 No Content for successful tracking
    return res.status(204).end();
  } catch (error) {
    console.error('Page tracking error:', error);
    // Don't expose error details to prevent fingerprinting
    return res.status(204).end();
  }
}

module.exports = async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const supabase = getSupabaseAdminClient();
    return handlePageView(req, res, supabase);
  } catch (error) {
    console.error('Track page request failed:', error);
    // Return 204 even on error to prevent blocking frontend
    return res.status(204).end();
  }
};

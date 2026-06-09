const { createClient } = require('@supabase/supabase-js');

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

    return res.status(200).json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || ''
      },
      auth: {
        authenticated: true,
        expires_at: data.session?.expires_at || fallbackExpiresAt
      },
      session: {
        access_token: data.session?.access_token || null,
        refresh_token: data.session?.refresh_token || null,
        expires_at: data.session?.expires_at || fallbackExpiresAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Could not log in.'
    });
  }
};

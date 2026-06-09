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

  const body = getRequestBody(req);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (name.length < 2) {
    return res.status(400).json({ field: 'name', error: 'Enter your full name.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ field: 'email', error: 'Enter a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ field: 'password', error: 'Password must be at least 6 characters.' });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        name
      }
    });

    if (error) {
      const message = /already|exists|registered/i.test(error.message)
        ? 'An account with this email already exists.'
        : error.message;

      return res.status(400).json({ field: 'email', error: message });
    }

    return res.status(201).json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.full_name || name
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Could not create account.'
    });
  }
};

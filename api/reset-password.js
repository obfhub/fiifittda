const crypto = require('crypto');
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
    throw new Error('Supabase is not configured.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function findUserByEmail(supabase, email) {
  const normalizedEmail = email.toLowerCase();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    const users = data?.users || [];
    const user = users.find((item) => item.email?.toLowerCase() === normalizedEmail);
    if (user) return user;
    if (users.length < 100) return null;
    page += 1;
  }

  return null;
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left || '', 'hex');
  const rightBuffer = Buffer.from(right || '', 'hex');

  if (leftBuffer.length !== rightBuffer.length || leftBuffer.length === 0) return false;

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const body = getRequestBody(req);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const token = typeof body?.token === 'string' ? body.token.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!isValidEmail(email) || !token) {
    return res.status(400).json({ error: 'Reset link is invalid.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ field: 'password', error: 'Password must be at least 6 characters.' });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const user = await findUserByEmail(supabase, email);
    const metadata = user?.app_metadata || {};
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const storedHash = metadata.password_reset_token_hash;
    const expiresAt = metadata.password_reset_expires_at ? new Date(metadata.password_reset_expires_at).getTime() : 0;

    if (!user || !safeCompare(tokenHash, storedHash) || !expiresAt || expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Reset link is invalid or expired.' });
    }

    const nextAppMetadata = { ...metadata };
    delete nextAppMetadata.password_reset_token_hash;
    delete nextAppMetadata.password_reset_expires_at;

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      app_metadata: nextAppMetadata
    });

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Could not reset password.'
    });
  }
};

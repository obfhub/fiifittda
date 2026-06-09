const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const RESET_TOKEN_TTL_MINUTES = 30;

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

function getSiteUrl(req) {
  const configuredUrl = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configuredUrl) {
    return configuredUrl.startsWith('http') ? configuredUrl : `https://${configuredUrl}`;
  }

  const host = req.headers.host;
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
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

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

function buildResetEmail(resetUrl) {
  return {
    subject: 'Reseteaza parola FiiFit.online',
    text: [
      'Ai cerut resetarea parolei pentru contul tau FiiFit.online.',
      '',
      `Deschide linkul de mai jos pentru a seta o parola noua. Linkul expira in ${RESET_TOKEN_TTL_MINUTES} minute.`,
      resetUrl,
      '',
      'Daca nu ai cerut aceasta resetare, poti ignora acest email.'
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17211c">
        <h2>Reseteaza parola FiiFit.online</h2>
        <p>Ai cerut resetarea parolei pentru contul tau.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#00D084;color:#071b13;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px">
            Seteaza o parola noua
          </a>
        </p>
        <p>Linkul expira in ${RESET_TOKEN_TTL_MINUTES} minute.</p>
        <p style="color:#66736d;font-size:13px">Daca nu ai cerut aceasta resetare, poti ignora acest email.</p>
      </div>
    `
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const body = getRequestBody(req);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!isValidEmail(email)) {
    return res.status(400).json({ field: 'email', error: 'Enter a valid email address.' });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const user = await findUserByEmail(supabase, email);

    // Do not reveal whether the email exists.
    if (!user) {
      return res.status(200).json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...(user.app_metadata || {}),
        password_reset_token_hash: tokenHash,
        password_reset_expires_at: expiresAt
      }
    });

    if (updateError) throw updateError;

    const resetUrl = `${getSiteUrl(req)}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
    const transporter = getTransporter();
    const emailContent = buildResetEmail(resetUrl);

    await transporter.sendMail({
      from: `"FiiFit.online" <${process.env.SMTP_USER}>`,
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Could not send reset email.'
    });
  }
};

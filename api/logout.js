module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  res.setHeader('Set-Cookie', 'fiifit_auth=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0');
  return res.status(200).json({ ok: true });
};

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const botUsername = (process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '').trim();
  const redirectUri = process.env.TELEGRAM_REDIRECT_URI || '/api/telegram-callback';

  if (!botUsername) {
    return res.status(500).json({ error: 'Telegram login is not configured. Add TELEGRAM_BOT_USERNAME in Vercel.' });
  }

  return res.status(200).json({
    botUsername,
    redirectUri
  });
};

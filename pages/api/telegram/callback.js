import crypto from 'crypto';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function checkSignature(data) {
  const { hash, ...rest } = data;
  const checkString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('\n');
  
  const secretKey = crypto
    .createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();
  
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');
  
  return hmac === hash;
}

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.query;
    
    // Verify the authentication data
    if (!checkSignature(data)) {
      console.error('Invalid authentication data');
      return res.status(401).json({ error: 'Invalid authentication data' });
    }

    // Check if the auth_date is not too old (within last hour)
    const authDate = parseInt(data.auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 3600) {
      console.error('Authentication data is too old');
      return res.status(401).json({ error: 'Authentication data is too old' });
    }

    // Store the session
    const session = {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      photo_url: data.photo_url,
      auth_date: data.auth_date
    };

    // Store in session storage and redirect to scheduler
    res.redirect(`/scheduler?telegramSession=${encodeURIComponent(JSON.stringify(session))}`);
  } catch (error) {
    console.error('Telegram callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
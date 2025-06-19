import crypto from 'crypto';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Add debug logging
console.log('Bot token available:', !!TELEGRAM_BOT_TOKEN);
if (!TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

function checkSignature(data) {
  const { hash, ...rest } = data;
  const checkString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('\n');
  
  console.log('Checking signature for data:', rest);
  console.log('Check string:', checkString);
  
  const secretKey = crypto
    .createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();
  
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');
  
  console.log('Generated HMAC:', hmac);
  console.log('Received hash:', hash);
  console.log('Signature match:', hmac === hash);
  
  return hmac === hash;
}

export default async function handler(req, res) {
  console.log('Received callback request:', {
    method: req.method,
    query: req.query,
    headers: req.headers,
    url: req.url
  });

  // Handle webhook updates (POST requests)
  if (req.method === 'POST') {
    try {
      const update = req.body;
      console.log('Received webhook update:', update);
      
      // For now, just acknowledge receipt
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error processing webhook update:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handle login callbacks (GET requests)
  if (req.method === 'GET') {
    try {
      const data = req.query;
      
      // Check if we have the required data
      if (!data.id || !data.first_name || !data.hash) {
        console.error('Missing required data:', { 
          hasId: !!data.id, 
          hasFirstName: !!data.first_name, 
          hasHash: !!data.hash 
        });
        return res.status(400).json({ 
          error: 'Missing required authentication data',
          received: Object.keys(data)
        });
      }
      
      // Verify the authentication data
      if (!checkSignature(data)) {
        console.error('Invalid authentication data - signature mismatch');
        return res.status(401).json({ 
          error: 'Invalid authentication data',
          details: 'Signature verification failed'
        });
      }

      // Check if the auth_date is not too old (within last hour)
      const authDate = parseInt(data.auth_date);
      const now = Math.floor(Date.now() / 1000);
      const timeDiff = now - authDate;
      
      console.log('Auth date check:', { authDate, now, timeDiff, maxAllowed: 3600 });
      
      if (timeDiff > 3600) {
        console.error('Authentication data is too old:', timeDiff, 'seconds');
        return res.status(401).json({ 
          error: 'Authentication data is too old',
          details: `Auth was ${timeDiff} seconds ago, max allowed is 3600 seconds`
        });
      }

      // Store the session
      const session = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name || null,
        username: data.username || null,
        photo_url: data.photo_url || null,
        auth_date: data.auth_date
      };

      console.log('Authentication successful, session data:', session);

      // Store in session storage and redirect to scheduler
      const redirectUrl = `/scheduler?telegramSession=${encodeURIComponent(JSON.stringify(session))}`;
      console.log('Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Telegram callback error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Reject other methods
  return res.status(405).json({ error: 'Method not allowed' });
} 
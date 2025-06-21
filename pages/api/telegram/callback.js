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
  console.log('=== TELEGRAM CALLBACK RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Full URL:', req.headers.host + req.url);
  console.log('User Agent:', req.headers['user-agent']);
  console.log('Referer:', req.headers.referer);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query params:', JSON.stringify(req.query, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Environment check:');
  console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
  console.log('- VERCEL_URL:', process.env.VERCEL_URL);
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('================================');

  // If no query parameters, return a test response
  if (Object.keys(req.query).length === 0) {
    console.log('No query parameters received - this might be a test visit');
    return res.status(200).json({
      message: 'Telegram callback endpoint is reachable',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      note: 'This endpoint expects Telegram authentication data as query parameters',
      debug: {
        headers: req.headers,
        environment: {
          TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET',
          VERCEL_URL: process.env.VERCEL_URL
        }
      }
    });
  }

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
      console.log('Processing GET request with data:', data);
      console.log('Data keys received:', Object.keys(data));
      
      // Check if we have the required data
      if (!data.id || !data.first_name || !data.hash) {
        console.error('Missing required data:', { 
          hasId: !!data.id, 
          hasFirstName: !!data.first_name, 
          hasHash: !!data.hash,
          receivedKeys: Object.keys(data),
          receivedValues: data
        });
        return res.status(400).json({ 
          error: 'Missing required authentication data',
          received: Object.keys(data),
          receivedValues: data,
          expected: ['id', 'first_name', 'hash', 'auth_date', 'username', 'photo_url', 'last_name']
        });
      }
      
      console.log('All required data present, checking signature...');
      
      // Verify the authentication data
      if (!checkSignature(data)) {
        console.error('Invalid authentication data - signature mismatch');
        return res.status(401).json({ 
          error: 'Invalid authentication data',
          details: 'Signature verification failed'
        });
      }

      console.log('Signature verified successfully');

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
  console.log('Method not allowed:', req.method);
  return res.status(405).json({ error: 'Method not allowed' });
} 
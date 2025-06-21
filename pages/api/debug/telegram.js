export default function handler(req, res) {
  console.log('=== TELEGRAM DEBUG ENDPOINT ===');
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET',
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_ENV: process.env.VERCEL_ENV
    },
    botInfo: {
      botName: 'distromedia_bot',
      expectedRedirectUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/telegram/callback` : 'Unknown'
    }
  };

  console.log('Debug info:', JSON.stringify(debugInfo, null, 2));

  res.status(200).json({
    message: 'Telegram debug information',
    ...debugInfo
  });
} 
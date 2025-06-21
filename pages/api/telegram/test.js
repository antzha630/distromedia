export default function handler(req, res) {
  console.log('=== TELEGRAM TEST ENDPOINT HIT ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('================================');

  res.status(200).json({ 
    message: 'Telegram test endpoint is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
} 
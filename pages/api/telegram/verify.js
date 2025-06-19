export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(500).json({ error: 'Bot token not configured' });
  }

  try {
    // Try to get bot info
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const data = await response.json();
    
    if (!data.ok) {
      return res.status(400).json({ error: 'Invalid bot token', details: data });
    }

    // Try to get webhook info
    const webhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();

    return res.status(200).json({ 
      success: true,
      bot: data.result,
      webhook: webhookData.result
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to verify bot',
      details: error.message 
    });
  }
} 
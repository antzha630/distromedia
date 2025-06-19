export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const VERCEL_URL = process.env.VERCEL_URL;
  
  const debugInfo = {
    botTokenConfigured: !!TELEGRAM_BOT_TOKEN,
    botTokenLength: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.length : 0,
    vercelUrl: VERCEL_URL,
    currentDomain: req.headers.host,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  };

  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(200).json({
      success: false,
      error: 'Bot token not configured',
      debugInfo,
      instructions: [
        '1. Go to your Vercel dashboard',
        '2. Navigate to your project settings',
        '3. Go to Environment Variables',
        '4. Add TELEGRAM_BOT_TOKEN with your bot token from BotFather'
      ]
    });
  }

  try {
    // Test bot API
    const botResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const botData = await botResponse.json();
    
    if (!botData.ok) {
      return res.status(200).json({
        success: false,
        error: 'Invalid bot token',
        debugInfo,
        botResponse: botData,
        instructions: [
          '1. Check your bot token in BotFather',
          '2. Make sure the token is correct and the bot is active',
          '3. Update the TELEGRAM_BOT_TOKEN in Vercel environment variables'
        ]
      });
    }

    // Test webhook info
    const webhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();

    // Check if domain is configured correctly
    const currentDomain = VERCEL_URL || req.headers.host;
    const domainCheck = {
      currentDomain,
      isHttps: currentDomain.includes('https') || currentDomain.includes('vercel.app'),
      botUsername: botData.result.username
    };

    return res.status(200).json({
      success: true,
      debugInfo,
      bot: botData.result,
      webhook: webhookData.result,
      domainCheck,
      instructions: [
        '1. Make sure your bot (@' + botData.result.username + ') is configured with the correct domain',
        '2. In BotFather, use /setdomain and set it to: ' + currentDomain,
        '3. The domain should be accessible via HTTPS',
        '4. Try the login widget again after configuring the domain'
      ]
    });

  } catch (error) {
    return res.status(200).json({
      success: false,
      error: 'Failed to verify bot',
      debugInfo,
      errorDetails: error.message,
      instructions: [
        '1. Check your internet connection',
        '2. Verify the bot token is correct',
        '3. Make sure the bot is not blocked or deleted'
      ]
    });
  }
} 
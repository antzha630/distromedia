export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const VERCEL_URL = process.env.VERCEL_URL;
  
  const debugInfo = {
    botTokenConfigured: !!TELEGRAM_BOT_TOKEN,
    botTokenLength: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.length : 0,
    botTokenPrefix: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.substring(0, 10) + '...' : 'Not set',
    vercelUrl: VERCEL_URL,
    currentDomain: req.headers.host,
    protocol: req.headers['x-forwarded-proto'] || 'http',
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
        '4. Add TELEGRAM_BOT_TOKEN with your bot token from BotFather',
        '5. The token should look like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz'
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
          '1. Check your bot token in BotFather (/mybots -> Select your bot -> API Token)',
          '2. Make sure the token is correct and the bot is active',
          '3. Update the TELEGRAM_BOT_TOKEN in Vercel environment variables',
          '4. Redeploy your application after updating environment variables'
        ]
      });
    }

    // Test webhook info
    const webhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();

    // Check if domain is configured correctly
    const currentDomain = VERCEL_URL || req.headers.host;
    const isHttps = currentDomain.includes('https') || currentDomain.includes('vercel.app') || currentDomain.includes('localhost');
    
    const domainCheck = {
      currentDomain,
      isHttps,
      botUsername: botData.result.username,
      expectedDomain: isHttps ? `https://${currentDomain.replace('https://', '')}` : `http://${currentDomain}`
    };

    // Test if the domain is accessible
    let domainAccessible = false;
    try {
      const domainTestResponse = await fetch(`${domainCheck.expectedDomain}/api/telegram/verify`);
      domainAccessible = domainTestResponse.ok;
    } catch (error) {
      console.log('Domain accessibility test failed:', error.message);
    }

    return res.status(200).json({
      success: true,
      debugInfo,
      bot: botData.result,
      webhook: webhookData.result,
      domainCheck: {
        ...domainCheck,
        accessible: domainAccessible
      },
      instructions: [
        '1. Make sure your bot (@' + botData.result.username + ') is configured with the correct domain',
        '2. In BotFather, use /setdomain and set it to: ' + currentDomain,
        '3. The domain should be accessible via HTTPS',
        '4. Try the login widget again after configuring the domain',
        '5. If using localhost, make sure you&apos;re using HTTPS or configure for development'
      ],
      troubleshooting: [
        'If the widget doesn\'t appear: Check browser console for errors',
        'If login fails: Verify the bot domain is set correctly in BotFather',
        'If you get "Invalid authentication data": Check that the bot token is correct',
        'If you get "Authentication data is too old": Try logging in again'
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
        '3. Make sure the bot is not blocked or deleted',
        '4. Try accessing https://api.telegram.org/bot[YOUR_TOKEN]/getMe directly'
      ]
    });
  }
} 
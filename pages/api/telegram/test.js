export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(200).json({
      success: false,
      error: 'Bot token not configured',
      instructions: [
        '1. Set TELEGRAM_BOT_TOKEN in your environment variables',
        '2. Get your bot token from @BotFather on Telegram',
        '3. The token should look like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz'
      ]
    });
  }

  try {
    // Test basic bot API
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const data = await response.json();
    
    if (!data.ok) {
      return res.status(200).json({
        success: false,
        error: 'Bot API test failed',
        details: data,
        instructions: [
          '1. Check if your bot token is correct',
          '2. Make sure your bot is not deleted or blocked',
          '3. Try creating a new bot with @BotFather if needed'
        ]
      });
    }

    // Test webhook info
    const webhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();

    return res.status(200).json({
      success: true,
      bot: data.result,
      webhook: webhookData.result,
      message: 'Bot is working correctly! You can now configure the domain in BotFather.'
    });

  } catch (error) {
    return res.status(200).json({
      success: false,
      error: 'Failed to test bot',
      details: error.message
    });
  }
} 
// Simple test script for Telegram bot
// Run this after setting your bot token: node test-bot.js

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.log('❌ TELEGRAM_BOT_TOKEN not set in environment variables');
  console.log('Please set it in Vercel dashboard or locally with:');
  console.log('export TELEGRAM_BOT_TOKEN="your_bot_token_here"');
  process.exit(1);
}

async function testBot() {
  try {
    console.log('🔍 Testing bot configuration...');
    
    // Test bot info
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Bot is working!');
      console.log('Bot name:', data.result.first_name);
      console.log('Bot username:', '@' + data.result.username);
      console.log('Bot ID:', data.result.id);
      
      // Test webhook info
      const webhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
      const webhookData = await webhookResponse.json();
      
      console.log('\n📡 Webhook info:');
      console.log('URL:', webhookData.result.url || 'Not set');
      console.log('Has custom certificate:', webhookData.result.has_custom_certificate);
      console.log('Pending update count:', webhookData.result.pending_update_count);
      
    } else {
      console.log('❌ Bot test failed:', data);
    }
  } catch (error) {
    console.log('❌ Error testing bot:', error.message);
  }
}

testBot(); 
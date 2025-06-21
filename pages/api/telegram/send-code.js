import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

const apiId = parseInt(process.env.TELEGRAM_API_ID || '');
const apiHash = process.env.TELEGRAM_API_HASH || '';

if (!apiId || !apiHash) {
  console.error('CRITICAL: TELEGRAM_API_ID and TELEGRAM_API_HASH are not defined in environment variables.');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  if (!apiId || !apiHash) {
    return res.status(500).json({ success: false, error: 'Telegram API credentials are not configured on the server.' });
  }

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required.' });
  }

  const stringSession = new StringSession(''); // We don't need to save the session here
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 3,
  });

  try {
    await client.connect();
    
    const result = await client.sendCode(
      { apiId, apiHash },
      phone
    );

    // The session string contains the state needed for the next step.
    const sessionString = client.session.save();

    await client.disconnect();

    return res.status(200).json({
      success: true,
      phoneCodeHash: result.phoneCodeHash,
      sessionString: sessionString, // Pass the session state to the client
    });

  } catch (error) {
    console.error(`[Telegram Send Code Error] for phone ${phone}:`, error);
    
    // Attempt to disconnect even if there was an error
    try { await client.disconnect(); } catch (e) { /* ignore */ }
    
    const errorMessage = error.message || 'An unknown error occurred.';

    if (errorMessage.includes('PHONE_NUMBER_INVALID')) {
      return res.status(400).json({ success: false, error: 'The phone number is invalid. Please use international format (e.g., +1...)' });
    }
    if (errorMessage.includes('FLOOD_WAIT')) {
      return res.status(429).json({ success: false, error: 'You are trying too often. Please wait a few minutes and try again.' });
    }

    return res.status(500).json({ success: false, error: 'Failed to send verification code.' });
  }
} 
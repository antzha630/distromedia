import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram';

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

  const { phone, code, phoneCodeHash, sessionString } = req.body;

  if (!phone || !code || !phoneCodeHash || !sessionString) {
    return res.status(400).json({ success: false, error: 'Phone, code, hash, and sessionString are required.' });
  }

  // Restore the session from the string provided by the client
  const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 3,
  });

  try {
    await client.connect();

    await client.invoke(new Api.auth.SignIn({
      phoneNumber: phone,
      phoneCodeHash: phoneCodeHash,
      phoneCode: code,
    }));
    
    const me = await client.getMe();

    await client.disconnect();

    if (!me) {
      throw new Error('Could not retrieve user information after login.');
    }

    const session = {
      id: me.id.toString(),
      isBot: me.bot,
      firstName: me.firstName,
      lastName: me.lastName,
      username: me.username,
      phone: me.phone,
      photoUrl: me.photo ? me.photo.photoBig.localPath : null, // Note: photo access needs more work
      authDate: Math.floor(Date.now() / 1000),
    };
    
    return res.status(200).json({
      success: true,
      session: session,
    });

  } catch (error) {
    console.error(`[Telegram Verify Code Error] for phone ${phone}:`, error);

    try { await client.disconnect(); } catch (e) { /* ignore */ }

    const errorMessage = error.message || 'An unknown error occurred.';

    if (errorMessage.includes('PHONE_CODE_INVALID')) {
      return res.status(400).json({ success: false, error: 'The verification code is invalid.' });
    }
    if (errorMessage.includes('PHONE_CODE_EXPIRED')) {
      return res.status(400).json({ success: false, error: 'The verification code has expired. Please request a new one.' });
    }
    if (errorMessage.includes('SESSION_PASSWORD_NEEDED')) {
      return res.status(400).json({ success: false, error: 'Your account has Two-Step Verification enabled. Please disable it temporarily to log in.' });
    }

    return res.status(500).json({ success: false, error: 'Failed to verify code.' });
  }
} 
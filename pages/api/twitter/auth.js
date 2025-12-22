import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate Twitter API credentials
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;

  if (!apiKey) {
    console.error('TWITTER_API_KEY is missing or empty');
    return res.status(500).json({ error: 'Twitter API Key (Consumer Key) is not configured' });
  }

  if (!apiSecret) {
    console.error('TWITTER_API_SECRET is missing or empty');
    return res.status(500).json({ error: 'Twitter API Secret (Consumer Secret) is not configured' });
  }

  // Log first few characters for debugging (without exposing full keys)
  console.log('Twitter API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
  console.log('Twitter API Secret (first 10 chars):', apiSecret.substring(0, 10) + '...');
  console.log('Twitter API Key length:', apiKey.length);
  console.log('Twitter API Secret length:', apiSecret.length);

  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
  });

  try {
    const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink(
      process.env.TWITTER_CALLBACK_URL || 'https://distromedia.vercel.app/api/twitter/callback',
      { forceLogin: true }
    );
    // Store oauth_token_secret in a cookie for later use in callback
    res.setHeader('Set-Cookie', `twitter_oauth_token_secret=${oauth_token_secret}; Path=/; HttpOnly; SameSite=Lax`);
    res.redirect(url);
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    if (error.message && error.message.includes('Invalid consumer tokens')) {
      return res.status(500).json({ 
        error: 'Invalid Twitter API credentials. Please check your TWITTER_API_KEY and TWITTER_API_SECRET in your environment variables. These should be your Consumer Key and Consumer Secret from the Twitter Developer Portal.',
        details: 'The Consumer Key (API Key) and Consumer Secret (API Secret) are incorrect or have been revoked.'
      });
    }
    
    res.status(500).json({ error: 'Failed to start Twitter OAuth', details: error.message });
  }
} 
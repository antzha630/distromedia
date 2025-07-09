import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
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
    res.status(500).json({ error: 'Failed to start Twitter OAuth' });
  }
} 
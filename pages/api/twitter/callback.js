import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  const { oauth_token, oauth_verifier } = req.query;
  const oauth_token_secret = req.cookies.twitter_oauth_token_secret;

  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    return res.status(400).json({ error: 'Missing OAuth parameters' });
  }

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: oauth_token,
    accessSecret: oauth_token_secret,
  });

  try {
    const { client: loggedClient, accessToken, accessSecret, userId, screenName } = await client.login(oauth_verifier);
    // Pass session info to frontend (e.g., as query params or session storage)
    const session = {
      accessToken,
      accessSecret,
      userId,
      screenName,
    };
    // Redirect to scheduler with session info
    const redirectUrl = `/scheduler?twitterSession=${encodeURIComponent(JSON.stringify(session))}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Twitter callback error:', error);
    res.status(500).json({ error: 'Failed to complete Twitter OAuth' });
  }
} 
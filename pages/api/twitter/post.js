import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, accessToken, accessSecret } = req.body;
  if (!text || !accessToken || !accessSecret) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken,
    accessSecret,
  });

  try {
    await client.v2.tweet(text);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Twitter post error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to post tweet' });
  }
} 
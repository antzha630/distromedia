import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tweet } = req.body;

  if (!tweet || tweet.length === 0) {
    return res.status(400).json({ error: 'Tweet is required' });
  }

  try {
    await client.v2.tweet(tweet);
    res.status(200).json({ message: 'Tweet posted successfully' });
  } catch (error) {
    console.error('Tweet error:', error);
    res.status(500).json({ error: 'Failed to post tweet' });
  }
}

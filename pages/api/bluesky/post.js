import { BskyAgent } from '@atproto/api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, accessJwt, did } = req.body;

  if (!text || !accessJwt || !did) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const agent = new BskyAgent({ service: 'https://bsky.social' });

  try {
    // Proper way to restore session
    await agent.resumeSession({ accessJwt, did });

    // Post to Bluesky
    const response = await agent.post({
      text,
    });

    res.status(200).json({ success: true, response });
  } catch (err) {
    console.error('Bluesky post failed:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Post failed',
    });
  }
}

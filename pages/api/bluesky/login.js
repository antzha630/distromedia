import { BskyAgent } from '@atproto/api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier, appPassword } = req.body;

  if (!identifier || !appPassword) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const agent = new BskyAgent({ service: 'https://bsky.social' });

  try {
    const result = await agent.login({
      identifier,
      password: appPassword,
    });

    res.status(200).json({
      success: true,
      session: result.data,
    });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Login failed',
    });
  }
}

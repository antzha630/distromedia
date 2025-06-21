import { BskyAgent } from '@atproto/api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier, appPassword } = req.body;

  if (!identifier || !appPassword) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  // Sanitize the identifier
  let cleanIdentifier = identifier.trim().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/^@/, '').replace(/[.\s]+$/, '');

  const response = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: cleanIdentifier,
      password: appPassword,
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    return res.status(500).json({ 
      success: false, 
      error: data.message || data.error 
    });
  }

  return res.status(200).json({
    success: true,
    session: {
      accessJwt: data.accessJwt,
      refreshJwt: data.refreshJwt,
      handle: data.handle,
      did: data.did,
    },
    avatarUrl: data.avatarUrl || null,
  });
}

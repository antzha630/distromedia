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

  const res = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: cleanIdentifier,
      password: appPassword,
    }),
  });

  const data = await res.json();
  
  if (data.error) {
    throw new Error(data.message || data.error);
  }

  return {
    success: true,
    session: {
      accessJwt: data.accessJwt,
      refreshJwt: data.refreshJwt,
      handle: data.handle,
      did: data.did,
    },
    avatarUrl: data.avatarUrl || null,
  };
}

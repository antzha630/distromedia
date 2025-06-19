import { BskyAgent } from '@atproto/api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier, appPassword } = req.body;

  if (!identifier || !appPassword) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  // Log the identifier format for debugging (without the password)
  console.log('Login attempt with identifier:', identifier);
  console.log('App password length:', appPassword.length);
  console.log('App password format check:', appPassword.includes('-'));

  const agent = new BskyAgent({ service: 'https://bsky.social' });

  try {
    const result = await agent.login({
      identifier,
      password: appPassword,
    });

    // Fetch the user's profile to get the avatar URL
    let avatarUrl = '';
    try {
      const profile = await agent.api.app.bsky.actor.getProfile({ actor: identifier });
      avatarUrl = profile.data.avatar || '';
    } catch (e) {
      avatarUrl = '';
    }

    res.status(200).json({
      success: true,
      session: result.data,
      avatarUrl,
    });
  } catch (err) {
    console.error('Login failed:', err);
    console.error('Error details:', {
      message: err.message,
      error: err.error,
      status: err.status,
      headers: err.headers
    });
    
    // Provide more specific error messages
    let errorMessage = 'Login failed';
    if (err.error === 'AuthenticationRequired') {
      errorMessage = 'Invalid identifier or app password. Please check your credentials.';
    } else if (err.status === 401) {
      errorMessage = 'Authentication failed. Please verify your username and app password.';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: {
        error: err.error,
        status: err.status
      }
    });
  }
}

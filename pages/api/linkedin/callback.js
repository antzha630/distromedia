export default async function handler(req, res) {
  const { code, state, error } = req.query;

  // Check for OAuth errors
  if (error) {
    console.error('LinkedIn OAuth error:', error);
    return res.redirect(`/?error=${encodeURIComponent(error)}`);
  }

  // Verify state to prevent CSRF attacks
  const savedState = req.cookies.linkedin_oauth_state;
  if (!state || state !== savedState) {
    console.error('Invalid OAuth state:', { received: state, saved: savedState });
    return res.redirect(`/?error=${encodeURIComponent('Invalid OAuth state')}`);
  }

  if (!code) {
    return res.redirect(`/?error=${encodeURIComponent('No authorization code provided')}`);
  }

  try {
    // Get the same redirect URI as used in auth
    const redirectUri = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/api/linkedin/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    // Get user profile using OpenID Connect userinfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error('Profile fetch failed:', profileData);
      throw new Error('Failed to get user profile');
    }

    // Store the session data
    const session = {
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      userId: profileData.sub,
      name: profileData.name || `${profileData.given_name} ${profileData.family_name}`,
      email: profileData.email
    };

    // Clear the state cookie
    res.setHeader('Set-Cookie', 'linkedin_oauth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');

    // Redirect back to the app with the session data
    res.redirect(`/?linkedin=${encodeURIComponent(JSON.stringify(session))}`);
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.redirect(`/?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
  }
} 
export default async function handler(req, res) {
  const { code, state, error } = req.query;

  // The redirect URI must EXACTLY match the one registered in the LinkedIn Developer Console.
  const redirectUri = 'https://distromedia.vercel.app/api/linkedin/callback';

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
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      console.error('Response status:', tokenResponse.status);
      console.error('Redirect URI used:', redirectUri);
      console.error('Client ID present:', !!process.env.LINKEDIN_CLIENT_ID);
      console.error('Client Secret present:', !!process.env.LINKEDIN_CLIENT_SECRET);
      return res.redirect(`/?error=${encodeURIComponent('Failed to get access token')}`);
    }

    // Get user profile using OpenID Connect userinfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileResponse.json();

    if (!profileData.sub) {
      console.error('Profile fetch failed (userinfo):', profileData);
      return res.redirect(`/?error=${encodeURIComponent('Failed to get user profile')}`);
    }

    // Create session object from OpenID Connect data
    const session = {
      accessToken: tokenData.access_token,
      userId: profileData.sub,
      name: profileData.name,
      profileImageUrl: profileData.picture || '',
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
    };

    // Redirect to frontend with session data
    const redirectUrl = `/?linkedin=${encodeURIComponent(JSON.stringify(session))}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.redirect(`/?error=${encodeURIComponent('Internal server error')}`);
  }
} 
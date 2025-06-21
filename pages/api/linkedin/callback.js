export default async function handler(req, res) {
  const { code, state, error } = req.query;

  // Determine the base URL for redirects
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;

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
        redirect_uri: `${baseUrl}/api/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return res.redirect(`/?error=${encodeURIComponent('Failed to get access token')}`);
    }

    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    const profileData = await profileResponse.json();

    if (!profileData.id) {
      console.error('Profile fetch failed:', profileData);
      return res.redirect(`/?error=${encodeURIComponent('Failed to get user profile')}`);
    }

    // Get profile picture
    let profileImageUrl = '';
    try {
      const pictureResponse = await fetch('https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~:playableStreams))', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });
      const pictureData = await pictureResponse.json();
      if (pictureData.profilePicture && pictureData.profilePicture['displayImage~'] && pictureData.profilePicture['displayImage~'].elements) {
        const elements = pictureData.profilePicture['displayImage~'].elements;
        const largestImage = elements.reduce((largest, current) => {
          return (current.data['com.linkedin.digitalmedia.mediaartifact.StillImage'].storageSize.width > largest.data['com.linkedin.digitalmedia.mediaartifact.StillImage'].storageSize.width) ? current : largest;
        });
        profileImageUrl = largestImage.identifiers[0].identifier;
      }
    } catch (error) {
      // Profile picture is optional, continue without it
    }

    // Create session object
    const session = {
      accessToken: tokenData.access_token,
      userId: profileData.id,
      name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
      profileImageUrl,
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
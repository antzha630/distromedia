import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  const { oauth_token, oauth_verifier } = req.query;
  const oauth_token_secret = req.cookies.twitter_oauth_token_secret;

  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    return res.status(400).json({ error: 'Missing OAuth parameters' });
  }

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: oauth_token,
    accessSecret: oauth_token_secret,
  });

  try {
    const { client: loggedClient, accessToken, accessSecret, userId, screenName } = await client.login(oauth_verifier);
    // Fetch user profile to get profile image URL
    let profileImageUrl = '';
    try {
      const user = await loggedClient.v2.me({ 'user.fields': 'profile_image_url' });
      profileImageUrl = user.data?.profile_image_url || '';
    } catch (e) {
      console.error('Failed to fetch Twitter profile image:', e);
    }
    // Pass session info to frontend (e.g., as query params or session storage)
    const session = {
      accessToken,
      accessSecret,
      userId,
      screenName,
      profileImageUrl,
    };
    
    // Return HTML that communicates with the original window and closes this one
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitter Login Success</title>
        </head>
        <body>
          <script>
            try {
              // Store session in localStorage for the original window
              localStorage.setItem('twitterSession', JSON.stringify(${JSON.stringify(session)}));
              
              // If this window was opened from another window, close it and refresh the original
              if (window.opener) {
                // Refresh the original window to pick up the new session
                window.opener.location.reload();
                // Close this window
                window.close();
              } else {
                // Fallback: redirect to main page with session data
                window.location.href = '/?twitterSession=${encodeURIComponent(JSON.stringify(session))}';
              }
            } catch (error) {
              console.error('Error handling OAuth callback:', error);
              // Fallback redirect
              window.location.href = '/?twitterSession=${encodeURIComponent(JSON.stringify(session))}';
            }
          </script>
          <p>Twitter login successful! This window will close automatically...</p>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Twitter callback error:', error);
    res.status(500).json({ error: 'Failed to complete Twitter OAuth' });
  }
} 
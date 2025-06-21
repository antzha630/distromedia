import { stringify } from 'querystring';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Generate a random state value
      const state = Math.random().toString(36).substring(7);
      
      // Store state in a cookie for verification
      res.setHeader('Set-Cookie', `linkedin_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax`);

      // The redirect URI must EXACTLY match the one registered in the LinkedIn Developer Console.
      const redirectUri = 'https://distromedia.vercel.app/api/linkedin/callback';

      // Validate client ID
      if (!process.env.LINKEDIN_CLIENT_ID) {
        throw new Error('LinkedIn client ID is not configured');
      }

      // LinkedIn OAuth parameters
      const params = {
        response_type: 'code',
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: redirectUri,
        state: state,
        scope: 'openid profile email w_member_social',
      };

      console.log('LinkedIn OAuth Parameters:', {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        redirectUri,
        state,
      });

      const url = `https://www.linkedin.com/oauth/v2/authorization?${stringify(params)}`;
      res.redirect(url);
    } catch (error) {
      console.error('LinkedIn auth error:', error);
      res.redirect(`/?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 
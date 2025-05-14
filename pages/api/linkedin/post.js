export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, url, accessToken } = req.body;

  if (!text || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create the share content
    const shareContent = {
      author: `urn:li:person:${req.body.userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text
          },
          shareMediaCategory: url ? 'ARTICLE' : 'NONE',
          media: url ? [{
            status: 'READY',
            originalUrl: url,
          }] : undefined
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(shareContent)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to post to LinkedIn');
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('LinkedIn post error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to post to LinkedIn'
    });
  }
} 
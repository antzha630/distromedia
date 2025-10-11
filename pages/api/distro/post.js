export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      user_info, 
      more_info_url, 
      source, 
      cost, 
      preview, 
      title, 
      content 
    } = req.body;

    // Validate required fields
    if (!user_info || !more_info_url || !preview || !title || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_info, more_info_url, preview, title, and content are required' 
      });
    }

    // Prepare payload for Distro API
    const payload = {
      user_info: user_info || { name: "Distro Scout User" },
      more_info_url: more_info_url,
      source: source || "DistroMedia",
      cost: cost || 10,
      preview: preview,
      title: title,
      content: content
    };

    console.log('Sending to Distro API:', payload);

    // Send to Distro API
    const apiKey = process.env.DISTRO_API_KEY || '<aF+{:R>+lULOYbykL.z8s3m$zd;M,@A';
    const apiEndpoint = process.env.DISTRO_API_ENDPOINT || 'https://pulse-chain-dc452eb2642a.herokuapp.com/api/external/news';

    const distroResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!distroResponse.ok) {
      const errorText = await distroResponse.text();
      console.error('Distro API error:', errorText);
      return res.status(distroResponse.status).json({ 
        error: `Distro API error: ${distroResponse.status} - ${errorText}` 
      });
    }

    const distroData = await distroResponse.json();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Successfully sent to Distro',
      distro_response: distroData
    });

  } catch (error) {
    console.error('Error sending to Distro:', error);
    return res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
}

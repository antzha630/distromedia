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

    // Clean the strings to remove any formatting issues
    const cleanPreview = typeof preview === 'string' ? preview.replace(/\n\s*\+\s*'/g, '').replace(/'/g, '').trim() : preview;
    const cleanContent = typeof content === 'string' ? content.replace(/\n\s*\+\s*'/g, '').replace(/'/g, '').trim() : content;
    const cleanTitle = typeof title === 'string' ? title.trim() : title;

    // Prepare payload for Distro API
    const payload = {
      user_info: user_info || { name: "Distro Scout User" },
      more_info_url: more_info_url,
      source: source || "DistroMedia",
      cost: cost || 10,
      preview: cleanPreview,
      title: cleanTitle,
      content: cleanContent
    };

    console.log('Sending to Distro API:', JSON.stringify(payload, null, 2));

    // Send to Distro API
    if (!process.env.DISTRO_API_KEY) {
      return res.status(500).json({ 
        error: 'DISTRO_API_KEY environment variable is not configured' 
      });
    }
    const apiKey = process.env.DISTRO_API_KEY;
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

    console.log('Distro API response status:', distroResponse.status);
    console.log('Distro API response headers:', Object.fromEntries(distroResponse.headers.entries()));

    if (!distroResponse.ok) {
      const errorText = await distroResponse.text();
      console.error('Distro API error:', errorText);
      return res.status(distroResponse.status).json({ 
        error: `Distro API error: ${distroResponse.status} - ${errorText}` 
      });
    }

    const distroData = await distroResponse.json();
    console.log('Distro API response data:', JSON.stringify(distroData, null, 2));
    
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

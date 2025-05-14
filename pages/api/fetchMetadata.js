import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch URL: ${response.statusText}` });
    }

    const body = await response.text();
    const $ = cheerio.load(body);

    // Try to get metadata from OpenGraph tags first, then fall back to regular meta tags
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('title').text() || 
                 'No title available';

    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || 
                       'No description available';

    const image = $('meta[property="og:image"]').attr('content') || 
                 $('meta[name="twitter:image"]').attr('content') ||
                 $('img[itemprop="image"]').attr('src') ||
                 null;

    // Make sure image URL is absolute
    const finalImage = image ? new URL(image, url).toString() : null;

    return res.status(200).json({ 
      title, 
      description, 
      url, 
      image: finalImage 
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return res.status(500).json({ error: error.message });
  }
}

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

    // --- Improved Article scraping logic ---
    let articleText = '';
    // 1. Try to find the main article container
    let article = $('article');
    if (!article.length) {
      // Fallback: look for main content divs
      article = $('[class*="article"], [class*="content"], [class*="main"]');
    }
    if (!article.length) article = $.root();

    // Remove unwanted elements
    article.find('nav, aside, footer, header, .share, .author, .newsletter, script, style, [class*="sidebar"], [class*="footer"], [class*="nav"], [class*="share"], [class*="author"], [class*="newsletter"], [class*="subscribe"], [class*="icon"], [id*="share"], [id*="nav"], [id*="footer"], [id*="sidebar"]').remove();
    article.find('script, style, [type="application/ld+json"], [style*="display:none"]').remove();

    // Get only text from paragraphs, headings, and lists
    let text = '';
    article.find('p, h2, h3, ul, ol, li').each((i, el) => {
      const t = $(el).text().trim();
      if (
        t &&
        !t.match(/Share this article|Copy link|Sign up|Subscribe|X icon|@context|schema.org|newsletter|privacy policy|terms of use|cookie|author bio|about us|contact us|advertise|system status|disclosure|policies|logo|editor's picks|shorts|sitemap|do not sell my info|masthead|careers|press releases|sponsored by|back to menu|see all newsletters|sign me up|copyright|all rights reserved|\{.*@context.*\}/i)
      ) {
        text += t + '\n\n';
      }
    });

    // Fallback: if nothing found, get all <p> tags
    if (!text.trim()) {
      $('p').each((i, el) => {
        const t = $(el).text().trim();
        if (t) text += t + '\n\n';
      });
    }

    // Remove excessive whitespace
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    articleText = text;

    // Fallback: if articleText is empty, use all <p> tags
    if (!articleText) {
      articleText = $('p').map((i, el) => $(el).text()).get().join('\n\n').trim();
    }

    return res.status(200).json({ 
      title, 
      description, 
      url, 
      image: finalImage,
      articleText
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return res.status(500).json({ error: error.message });
  }
}

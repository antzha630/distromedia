import { BskyAgent } from '@atproto/api';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, accessJwt, did, embed } = req.body;

  if (!text || !accessJwt || !did) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const agent = new BskyAgent({ service: 'https://bsky.social' });

  try {
    // Proper way to restore session
    await agent.resumeSession({ accessJwt, did });

    // Format the embed properly for Bluesky
    let postEmbed = undefined;
    if (embed?.external) {
      const embedData = {
        uri: embed.external.uri,
        title: embed.external.title,
        description: embed.external.description || '',
      };

      // Only add thumb if there's an image URL
      if (embed.external.thumb) {
        try {
          // Fetch the image
          const imageResponse = await fetch(embed.external.thumb);
          if (!imageResponse.ok) throw new Error('Failed to fetch image');
          
          const imageBuffer = await imageResponse.buffer();
          
          // Upload image to Bluesky
          const uploadResult = await agent.uploadBlob(imageBuffer, { encoding: 'image/jpeg' });
          
          if (uploadResult?.data?.blob) {
            embedData.thumb = uploadResult.data.blob;
          }
        } catch (imageError) {
          console.error('Failed to process image:', imageError);
          // Continue without the image if it fails
        }
      }

      postEmbed = {
        $type: 'app.bsky.embed.external',
        external: embedData
      };
    }

    // Post to Bluesky with optional embed
    const postParams = {
      text: text.trim(),
      embed: postEmbed
    };

    console.log('Posting to Bluesky with params:', JSON.stringify(postParams, null, 2));

    const response = await agent.post(postParams);

    res.status(200).json({ success: true, response });
  } catch (err) {
    console.error('Bluesky post failed:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Post failed',
      details: err
    });
  }
}

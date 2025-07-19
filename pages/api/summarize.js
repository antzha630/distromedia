import OpenAI from 'openai';

// Initialize OpenAI client using the API key from environment variables
const openai = new OpenAI({
  apiKey: "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",
});

// Platform-specific prompts
const platformPrompts = {
  linkedin: {
    role: "You are a professional LinkedIn content creator. Write business-focused, thought-provoking posts that demonstrate expertise and industry knowledge. Use a formal, professional tone suitable for B2B audiences. Focus on insights, trends, and professional value. Keep posts under 1200 characters to leave room for URL. No emojis or hashtags.",
    maxLength: 1200
  },
  bluesky: {
    role: "You are a Bluesky content creator. Write casual, conversational posts that feel personal and authentic. Use a friendly, approachable tone that encourages engagement and discussion. Bluesky users appreciate genuine, thoughtful content. Keep posts under 250 characters to leave room for URL. No emojis or hashtags.",
    maxLength: 250
  },
  telegram: {
    role: "You are a Telegram content creator. Write concise, direct posts that get straight to the point. Telegram users prefer clear, actionable information. Use a straightforward, informative tone that works well for quick reading. Keep posts under 4000 characters to leave room for URL. No emojis or hashtags.",
    maxLength: 4000
  },
  twitter: {
    role: "You are a Twitter (X) content creator. Write concise, engaging tweets that spark conversation. Use a friendly, approachable tone. Keep tweets under 250 characters to leave room for URL. No emojis or hashtags.",
    maxLength: 250
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { text, platform = 'linkedin', url } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required in the request body' });
  }

  // Get platform-specific settings
  const platformConfig = platformPrompts[platform] || platformPrompts.linkedin;

  console.log(`Generating ${platform} content for:`, text.substring(0, 100) + '...');

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: platformConfig.role
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error('No summary generated from OpenAI');
      return res.status(500).json({ error: 'Failed to generate summary' });
    }

    let summary = completion.choices[0].message.content.trim();
    
    // Remove any remaining emojis or hashtags that might have been generated
    summary = summary.replace(/[#️⃣🔍📰💡🚀🔥✨💯🎯📈📊]/g, '');
    summary = summary.replace(/#\w+/g, '');
    summary = summary.replace(/[^\w\s.,!?-]/g, '');
    
    // For Twitter/X, ensure the summary is <= 280 characters (leave space for URL on frontend)
    if (platform === 'twitter' && summary.length > platformConfig.maxLength) {
      summary = summary.substring(0, platformConfig.maxLength - 3) + '...';
    }
    // Ensure the summary is under the platform's character limit
    if (summary.length > platformConfig.maxLength) {
      summary = summary.substring(0, platformConfig.maxLength - 3) + '...';
    }

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
} 
import OpenAI from 'openai';

// Initialize OpenAI client using the API key from environment variables
const openai = new OpenAI({
  apiKey: "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",
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required in the request body' });
  }

  console.log('Received text to summarize:', text.substring(0, 100) + '...');

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates engaging social media posts. Create a concise, engaging summary that would work well on social media platforms. Keep it under 280 characters for Twitter/Bluesky compatibility. Make it informative but also engaging and shareable."
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
    
    // Ensure the summary is under 280 characters
    if (summary.length > 280) {
      summary = summary.substring(0, 277) + '...';
    }

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
} 
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

  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not found. Make sure OPENAI_API_KEY is set in your .env file.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use the specified model
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes text into a concise tweet.' },
        { role: 'user', content: `Summarize the following text into a tweet (max 280 characters):

${text}` },
      ],
      max_tokens: 70, // Limit response length suitable for a tweet
      temperature: 0.5, // Adjust creativity level if needed
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('Failed to generate summary from OpenAI.');
    }

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
} 
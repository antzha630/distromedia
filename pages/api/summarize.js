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
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a social media post summarizer. Create EXTREMELY concise summaries under 200 characters. Never exceed this limit. Focus on the most important point only. Always end with a complete sentence.' 
        },
        { 
          role: 'user', 
          content: `Create an extremely concise summary (STRICT 200 character limit) of this text. Must end with a complete sentence:\n\n${text}` 
        },
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    console.log('OpenAI response:', completion);

    let summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      console.error('No summary generated from OpenAI');
      return res.status(400).json({ error: 'Failed to generate summary from OpenAI' });
    }

    // Find the last complete sentence if we need to truncate
    if (summary.length > 200) {
      const sentences = summary.match(/[^.!?]+[.!?]+/g) || [];
      summary = '';
      for (let sentence of sentences) {
        if ((summary + sentence).length <= 197) { // Leave room for ellipsis
          summary += sentence;
        } else {
          break;
        }
      }
      summary = summary.trim() + '...';
    }

    console.log('Final summary:', summary);
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate summary',
      details: error.response?.data || error.toString()
    });
  }
} 
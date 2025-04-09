import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai'; // Updated import statement

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/summarize', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Summarize this into a tweet (280 characters max):\n\n${text}`,
        },
      ],
    });

    const summary = response.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error('Error from OpenAI:', error.message);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

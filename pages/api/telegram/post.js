import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chat_id, text, link } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return res.status(500).json({ success: false, error: 'Bot token not configured' });
  }
  if (!chat_id || !text) {
    return res.status(400).json({ success: false, error: 'Missing chat_id or text' });
  }

  try {
    // If a link is provided, append it to the message
    const message = link ? `${text}\n\n${link}` : text;
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });
    const tgData = await tgRes.json();
    if (tgData.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false, error: tgData.description });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
} 
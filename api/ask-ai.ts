import type { VercelRequest, VercelResponse } from '@vercel/node';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { question, type } = req.body;
  if (!question || !type) {
    res.status(400).json({ error: 'Missing question or type' });
    return;
  }
  try {
    let apiRes;
    if (type === 'perplexity') {
      apiRes = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: question }],
        }),
      });
    } else if (type === 'openai') {
      apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: question }],
        }),
      });
    } else {
      res.status(400).json({ error: 'Invalid type' });
      return;
    }
    const data = await apiRes.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'AI API request failed' });
  }
} 
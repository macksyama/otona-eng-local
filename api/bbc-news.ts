import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const BBC_RSS_URL = 'https://feeds.bbci.co.uk/news/rss.xml';
  try {
    const response = await fetch(BBC_RSS_URL);
    const xml = await response.text();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch BBC RSS' });
  }
} 
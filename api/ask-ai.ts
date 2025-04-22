import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonrepair } from 'jsonrepair';

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
    console.log('ask-ai APIリクエスト:', { question, type });
    let apiRes;
    let response_format = undefined;
    // 設問生成か評価かを判定し、json_schemaを付与
    const isQuestionGen = question.includes('From the following article, generate the following:');
    const isEval = question.includes('You are an English teacher. Please evaluate');
    if (isQuestionGen) {
      response_format = {
        type: 'json_schema',
        json_schema: {
          schema: {
            type: 'object',
            properties: {
              summary: {
                type: 'object',
                properties: { question: { type: 'string' } },
                required: ['question']
              },
              vocab: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    word: { type: 'string' },
                    task: { type: 'string' }
                  },
                  required: ['word', 'task']
                }
              },
              comprehension: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { question: { type: 'string' } },
                  required: ['question']
                }
              },
              discussion: {
                type: 'object',
                properties: { point: { type: 'string' } },
                required: ['point']
              }
            },
            required: ['summary', 'vocab', 'comprehension', 'discussion']
          }
        }
      };
    } else if (isEval) {
      if (type === 'perplexity') {
        response_format = undefined;
      } else {
        response_format = {
          type: 'json_schema',
          json_schema: {
            schema: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                mistakes: { type: 'string' },
                advice: { type: 'string' },
                correction: { type: 'string' },
                model_answer: { type: 'string' }
              },
              required: ['score', 'mistakes', 'advice', 'correction', 'model_answer']
            }
          }
        };
      }
    }
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
          ...(response_format ? { response_format } : {}),
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
    console.log('ask-ai 外部APIレスポンス:', JSON.stringify(data, null, 2));
    if (data && data.choices && data.choices[0]) {
      console.log('ask-ai choices[0].message:', JSON.stringify(data.choices[0].message, null, 2));
      if (data.choices[0].message && data.choices[0].message.content !== undefined) {
        console.log('ask-ai choices[0].message.content:', data.choices[0].message.content);
      }
    }
    // Perplexityのchoices[0].message.contentが壊れている場合はjsonrepairで修復
    if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      try {
        data.choices[0].message.content = jsonrepair(data.choices[0].message.content);
      } catch {}
    }
    res.status(200).json(data);
  } catch (e) {
    console.error('ask-ai APIエラー:', e);
    res.status(500).json({ error: 'AI API request failed', detail: e instanceof Error ? e.message : String(e) });
  }
} 
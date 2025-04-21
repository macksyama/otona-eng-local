import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { jsonrepair } from 'jsonrepair';

// .env読み込み
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// API種別の切り替え用（Perplexity/OpenAI）
let apiType: 'openai' | 'perplexity' = 'perplexity';

function createWindow() {
  // メインウィンドウ生成
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Vite開発サーバー or ビルド成果物をロード
  const rendererIndex = path.resolve(__dirname, 'renderer/index.html');
  console.log('process.cwd():', process.cwd());
  console.log('__dirname:', __dirname);
  console.log('renderer/index.html:', rendererIndex);
  win.loadFile(rendererIndex);

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Window failed to load:', errorCode, errorDescription);
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- AIリクエスト処理 ---
async function askAI(question: string): Promise<string> {
  if (apiType === 'perplexity') {
    try {
      const isQuestionGen = question.includes('From the following article, generate the following:');
      const isEval = question.includes('You are an English teacher. Please evaluate');
      let response_format: any = undefined;
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
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
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
      const data: any = await res.json();
      console.log('Perplexity API response:', data);
      try {
        console.log('choices[0].message:', JSON.stringify(data.choices?.[0]?.message, null, 2));
      } catch (e) {
        console.log('choices[0].message: (stringify error)', data.choices?.[0]?.message);
      }
      fs.writeFileSync('perplexity_api_last_response.json', JSON.stringify(data, null, 2));
      if (!data) {
        return 'NO DATA';
      }
      let content = data.choices?.[0]?.message?.content;
      if (!content) {
        return JSON.stringify(data);
      }
      try {
        content = jsonrepair(content);
      } catch (e) {
        console.error('jsonrepair error:', e);
      }
      return content || 'No response';
    } catch (e) {
      console.error('Perplexity API fetch error:', e);
      return 'APIリクエスト失敗';
    }
  } else {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
      const data: any = await res.json();
      console.log('OpenAI API response:', data);
      return data.choices?.[0]?.message?.content || 'No response';
    } catch (e) {
      console.error('OpenAI API fetch error:', e);
      return 'APIリクエスト失敗';
    }
  }
}

// --- IPC ---
ipcMain.handle('set-api-type', (event, type) => {
  apiType = type;
});
ipcMain.handle('ask-ai', async (event, question: string) => {
  return await askAI(question);
});
// Perplexity APIの直近レスポンスを返すIPC
ipcMain.handle('get-last-perplexity-response', async () => {
  try {
    const filePath = path.resolve(process.cwd(), 'perplexity_api_last_response.json');
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    } else {
      return '';
    }
  } catch (e) {
    return '';
  }
}); 
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const jsonrepair_1 = require("jsonrepair");
// .env読み込み
const envPath = path_1.default.resolve(process.cwd(), '.env');
if (fs_1.default.existsSync(envPath)) {
    dotenv_1.default.config({ path: envPath });
}
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// API種別の切り替え用（Perplexity/OpenAI）
let apiType = 'perplexity';
function createWindow() {
    // メインウィンドウ生成
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path_1.default.resolve(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    // Vite開発サーバー or ビルド成果物をロード
    const rendererIndex = path_1.default.resolve(__dirname, 'renderer/index.html');
    console.log('process.cwd():', process.cwd());
    console.log('__dirname:', __dirname);
    console.log('renderer/index.html:', rendererIndex);
    win.loadFile(rendererIndex);
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Window failed to load:', errorCode, errorDescription);
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// --- AIリクエスト処理 ---
async function askAI(question) {
    if (apiType === 'perplexity') {
        try {
            const isQuestionGen = question.includes('From the following article, generate the following:');
            const isEval = question.includes('You are an English teacher. Please evaluate');
            let response_format = undefined;
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
            }
            else if (isEval) {
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
            const res = await (0, node_fetch_1.default)('https://api.perplexity.ai/chat/completions', {
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
            const data = await res.json();
            console.log('Perplexity API response:', data);
            try {
                console.log('choices[0].message:', JSON.stringify(data.choices?.[0]?.message, null, 2));
            }
            catch (e) {
                console.log('choices[0].message: (stringify error)', data.choices?.[0]?.message);
            }
            fs_1.default.writeFileSync('perplexity_api_last_response.json', JSON.stringify(data, null, 2));
            if (!data) {
                return 'NO DATA';
            }
            let content = data.choices?.[0]?.message?.content;
            if (!content) {
                return JSON.stringify(data);
            }
            try {
                content = (0, jsonrepair_1.jsonrepair)(content);
            }
            catch (e) {
                console.error('jsonrepair error:', e);
            }
            return content || 'No response';
        }
        catch (e) {
            console.error('Perplexity API fetch error:', e);
            return 'APIリクエスト失敗';
        }
    }
    else {
        try {
            const res = await (0, node_fetch_1.default)('https://api.openai.com/v1/chat/completions', {
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
            const data = await res.json();
            console.log('OpenAI API response:', data);
            return data.choices?.[0]?.message?.content || 'No response';
        }
        catch (e) {
            console.error('OpenAI API fetch error:', e);
            return 'APIリクエスト失敗';
        }
    }
}
// --- IPC ---
electron_1.ipcMain.handle('set-api-type', (event, type) => {
    apiType = type;
});
electron_1.ipcMain.handle('ask-ai', async (event, question) => {
    return await askAI(question);
});
// 外部リンクを開くIPC
electron_1.ipcMain.handle('shell-open-external', (event, url) => {
    return electron_1.shell.openExternal(url);
});
// Perplexity APIの直近レスポンスを返すIPC
electron_1.ipcMain.handle('get-last-perplexity-response', async () => {
    try {
        const filePath = path_1.default.resolve(process.cwd(), 'perplexity_api_last_response.json');
        if (fs_1.default.existsSync(filePath)) {
            return fs_1.default.readFileSync(filePath, 'utf-8');
        }
        else {
            return '';
        }
    }
    catch (e) {
        return '';
    }
});
// 履歴まとめ・アドバイス生成IPC
electron_1.ipcMain.handle('generate-history-summary', async (event, histories) => {
    // プロンプト組み立て
    const prompt = `あなたは英語学習の専門家です。以下はユーザーの過去のレッスン履歴（設問・回答・AIフィードバック・日時）です。\n- 学んだ内容の要約\n- 得意な分野・苦手な分野・ミスの傾向\n- 目標達成度（例：TOEICスコアや語彙数など任意指標でOK）\n- 目標達成までの差分と、次のステップのアドバイス\nを日本語で簡潔にまとめてください。\n\n【履歴データ】\n${JSON.stringify(histories, null, 2)}`;
    return await askAI(prompt);
});
// PWA対応: service-worker.jsをpublicに配置すること
// VercelやNetlifyではpublic配下がそのまま公開されるため、src/service-worker.jsをpublic/service-worker.jsにコピーしてください
// 例: cp src/service-worker.js public/service-worker.js 

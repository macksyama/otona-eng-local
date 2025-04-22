import React, { useState, useEffect } from 'react';
import type { Page } from './App';
import Summary from './Summary';
import { saveLessonHistory } from './history';

const ipcRenderer = window.electronAPI?.ipcRenderer;

interface Props {
  article: string;
  setPage: (page: Page) => void;
  setSummaryData: (data: any) => void;
}

// 設問タイプ
interface GeneratedQuestions {
  summary: { question: string };
  vocab: { word: string; task: string }[];
  comprehension: { question: string }[];
  discussion: { point: string };
}

// チャットメッセージ型
type ChatMessage =
  | { role: 'ai'; text: string }
  | { role: 'user'; text: string }
  | { role: 'ai-feedback'; text: string; score: number; modelAnswer?: string; mistakes?: string; correction?: string; advice?: string };

// 一括設問生成プロンプト
function buildAllQuestionsPrompt(article: string) {
  return `#Order\nFrom the following article, generate the following:\n1. One summary question (in Japanese, e.g. \"この記事を要約してください。\")\n2. Two different English words (not too easy or too difficult, suitable for upper-intermediate learners) for vocabulary sentence tasks. The two words must be different.\n3. Two open-ended comprehension questions about the article.\n4. One discussion point related to the article's theme.\n\n#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):\n{\n  \"summary\": {\"question\": \"この記事を要約してください。\"},\n  \"vocab\": [\n    {\"word\": \"XXXX\", \"task\": \"Compose a sentence using the word 'XXXX'.\"},\n    {\"word\": \"YYYY\", \"task\": \"Compose a sentence using the word 'YYYY'.\"}\n  ],\n  \"comprehension\": [\n    {\"question\": \"What is ...?\"},\n    {\"question\": \"Why did ...?\"}\n  ],\n  \"discussion\": {\"point\": \"Discuss the implications of ...\"}\n}\n#Input\nArticle: ${article}`;
}

// サマリー生成プロンプト
function buildSummaryPrompt(article: string, chat: ChatMessage[]) {
  // チャット履歴を時系列でテキスト化
  const log = chat.map(msg => {
    if (msg.role === 'ai') return `AI: ${msg.text}`;
    if (msg.role === 'user') return `User: ${msg.text}`;
    if (msg.role === 'ai-feedback') return `AI評価: スコア:${msg.score} ${msg.text}`;
    return '';
  }).join('\n');
  return `#Order\nYou are an English teacher. Please summarize the following English lesson for the student.\n\n#Input\n- Article: ${article}\n- Lesson log:\n${log}\n\n#Task\n- Output a summary of the lesson in JSON ONLY (no explanation, no code block, no extra text, NO code block markers like \"\`\`\`json\" or \"\`\`\`\", NO trailing comma, NO explanation, NO extra text. Output ONLY valid JSON object!).\n- The JSON must include the following fields:\n  1. \"vocab_phrases\": 学んだキーワード・フレーズ5つ（英語＋日本語訳、必ず5つ返す）例: [{\"word\": \"broker a deal\", \"meaning\": \"取引をまとめる\"}, ...]\n  2. \"praise\": ユーザーの回答で良かった点（日本語で2-3文）\n  3. \"improvement\": もっと頑張るべき点（日本語で2-3文）\n  4. \"advice\": 建設的なアドバイス（日本語で1-2文）\n\n#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text, NO code block markers like \"\`\`\`json\" or \"\`\`\`\", NO trailing comma. Output ONLY valid JSON object!):\n{\n  \"vocab_phrases\": [\n    {\"word\": \"broker a deal\", \"meaning\": \"取引をまとめる\"},\n    ...\n  ],\n  \"praise\": \"...\",\n  \"improvement\": \"...\",\n  \"advice\": \"...\"\n}\n`;
}

// 先生アイコン（リアル写真・相対パス）
const TeacherIcon = (
  <img
    src="./teacher-avatar.png"
    alt="Teacher"
    className="w-10 h-10 rounded-full object-cover border border-blue-200 bg-white"
    draggable={false}
  />
);
// ユーザーアイコン（user.png画像）
const UserIcon = (
  <img
    src="./user.png"
    alt="User"
    className="w-10 h-10 rounded-full object-cover border border-gray-300 bg-white"
    draggable={false}
  />
);

// AIリクエスト共通関数
async function askAIWeb(prompt: string): Promise<any> {
  const res = await fetch('/api/ask-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: prompt, type: 'perplexity' })
  });
  return await res.json();
}

const Lesson: React.FC<Props> = ({ article, setPage, setSummaryData }) => {
  const [step, setStep] = useState(0); // 現在の設問インデックス
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GeneratedQuestions | null>(null);
  // ディスカッション用サブステップと履歴
  const [discussionSubStep, setDiscussionSubStep] = useState(0); // 0:最初, 1:深掘り, 2:評価
  const [discussionHistory, setDiscussionHistory] = useState<{ user1: string; aiFollow: string; user2: string }>({ user1: '', aiFollow: '', user2: '' });
  // サマリー生成ボタン押下時の処理
  const [summaryLoading, setSummaryLoading] = useState(false);

  // 記事入力時に一括で設問生成
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const prompt = buildAllQuestionsPrompt(article);
      const res = ipcRenderer
        ? await ipcRenderer.invoke('ask-ai', prompt)
        : await askAIWeb(prompt);
      let content = '';
      let parsed: any = null;
      try {
        const resObj = typeof res === 'string' ? JSON.parse(res) : res;
        // 1. 直接設問JSONの場合
        if (resObj && typeof resObj === 'object' && 'summary' in resObj && 'vocab' in resObj && 'comprehension' in resObj && 'discussion' in resObj) {
          parsed = resObj;
        } else {
          // 2. これまで通りchoices[0].message.contentから抽出
          console.log('設問生成AI応答 message:', JSON.stringify(resObj?.choices?.[0]?.message));
          content = resObj?.choices?.[0]?.message?.content || '';
          console.log('設問生成AI応答 content:', content);
          const jsonMatches = content.match(/\{[\s\S]*?\}/g);
          if (jsonMatches) {
            for (const jsonStr of jsonMatches) {
              try {
                parsed = JSON.parse(jsonStr);
                if (parsed && parsed.vocab && parsed.comprehension && parsed.discussion) break;
              } catch {}
            }
          }
          if (!parsed || Object.keys(parsed).length === 0) {
            // パース失敗時もRawデータをconsole.logし、再度JSON抽出を試みる
            console.log('設問生成AI応答Raw:', content);
            // 追加の自動パースロジック（例：改行・余計なテキスト除去など）
            const altMatch = content.replace(/```[\s\S]*?```/g, '').match(/\{[\s\S]*\}/);
            if (altMatch) {
              try {
                parsed = JSON.parse(altMatch[0]);
                if (parsed && parsed.vocab && parsed.comprehension && parsed.discussion) {
                  setQuestions(parsed);
                  setChat([{ role: 'ai', text: parsed.summary?.question || '要約問題' }]);
                  setLoading(false);
                  return;
                }
              } catch {}
            }
            // ここでperplexity_api_last_response.jsonの内容を自動取得
            if (ipcRenderer) {
              ipcRenderer.invoke('get-last-perplexity-response').then((fileContent: string) => {
                console.log('perplexity_api_last_response.json:', fileContent);
                // JSONとしてパースし、構造ヒントも自動表示
                let hint = '';
                let recovered = null;
                try {
                  const obj = JSON.parse(fileContent);
                  const contentStr = obj.choices?.[0]?.message?.content;
                  let jsonStr = contentStr;
                  // 1. ```json ... ``` 形式
                  let codeBlockMatch = contentStr.match(/```json\s*([\s\S]*?)\s*```/);
                  if (codeBlockMatch) {
                    jsonStr = codeBlockMatch[1].trim();
                  } else {
                    // 2. ``` ... ``` 形式
                    codeBlockMatch = contentStr.match(/```\s*([\s\S]*?)\s*```/);
                    if (codeBlockMatch) {
                      jsonStr = codeBlockMatch[1].trim();
                    } else if (contentStr.trim().startsWith('{') && contentStr.trim().endsWith('}')) {
                      // 3. 純粋なJSONのみの場合
                      jsonStr = contentStr.trim();
                    } else {
                      // 4. 本文中の最初のJSONブロック
                      const jsonMatches = contentStr.match(/\{[\s\S]*?\}/g);
                      if (jsonMatches) {
                        jsonStr = jsonMatches[0];
                      }
                    }
                  }
                  if (jsonStr) {
                    recovered = JSON.parse(jsonStr);
                    if (recovered.vocab && recovered.comprehension && recovered.discussion) {
                      setQuestions(recovered);
                      setChat([{ role: 'ai', text: recovered.summary?.question || '要約問題' }]);
                      setLoading(false);
                      return;
                    }
                  }
                } catch {}
                if (!recovered) {
                  hint = '\nヒント: ファイル内容がJSONとしてパースできません。';
                }
                setError('設問生成AI応答の解析に失敗しました。\nRaw: ' + content + '\n[perplexity_api_last_response.json]\n' + fileContent + hint);
                setLoading(false);
              });
              return;
            }
            setError('設問生成AI応答の解析に失敗しました。\nRaw content: ' + content + '\nAPIレスポンス全体: ' + JSON.stringify(res));
            setLoading(false);
            return;
          }
        }
        setQuestions(parsed);
        setChat([{ role: 'ai', text: parsed.summary?.question || '要約問題' }]);
      } catch (e) {
        console.log('設問生成AI応答Raw:', content);
        setError('設問生成AI応答の解析に失敗しました。\nRaw: ' + content);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article]);

  // 設問の合計数を計算
  const totalQuestions = questions
    ? 1
      + (Array.isArray(questions.vocab) ? questions.vocab.length : 0)
      + (Array.isArray(questions.comprehension) ? questions.comprehension.length : 0)
      + 1 // summary+vocab+comprehension+discussion
    : 0;

  // 現在の設問内容を取得
  let currentQuestion: { type: string; text: string } | null = null;
  if (questions) {
    if (step === 0 && questions.summary && questions.summary.question) {
      currentQuestion = {
        type: 'summary',
        text: questions.summary.question,
      };
    } else if (step === 1 && Array.isArray(questions.vocab) && questions.vocab[0] && questions.vocab[0].word) {
      currentQuestion = {
        type: 'vocab',
        text: `記事に出てきた「${questions.vocab[0].word}」を使って短文を作ってください。`,
      };
    } else if (step === 2 && Array.isArray(questions.vocab) && questions.vocab[1] && questions.vocab[1].word) {
      currentQuestion = {
        type: 'vocab',
        text: `記事に出てきた「${questions.vocab[1].word}」を使って短文を作ってください。`,
      };
    } else if (step === 3 && Array.isArray(questions.comprehension) && questions.comprehension[0] && questions.comprehension[0].question) {
      currentQuestion = {
        type: 'comprehension',
        text: questions.comprehension[0].question,
      };
    } else if (step === 4 && Array.isArray(questions.comprehension) && questions.comprehension[1] && questions.comprehension[1].question) {
      currentQuestion = {
        type: 'comprehension',
        text: questions.comprehension[1].question,
      };
    } else if (step === 5 && questions.discussion && questions.discussion.point) {
      currentQuestion = {
        type: 'discussion',
        text: questions.discussion.point,
      };
    }
  }

  // 回答送信
  const handleSend = async () => {
    if (!questions || !currentQuestion) return;
    if (!currentQuestion.text || !article || !input.trim()) {
      setError('送信内容に不備があります（設問・記事・回答のいずれかが空です）。');
      return;
    }
    setLoading(true);
    setError(null);
    setChat(prev => [...prev, { role: 'user', text: input }]);

    // ディスカッション特別処理
    if (currentQuestion.type === 'discussion') {
      console.log('ディスカッション分岐に入りました', discussionSubStep);
      if (discussionSubStep === 0) {
        setDiscussionHistory(h => ({ ...h, user1: input }));
        // 深掘りプロンプト生成
        const followPrompt = `#Order\nYou are an English teacher. Based on the following student's discussion answer, ask a follow-up question to deepen the discussion.\nIf the answer is too short or vague, still ask a relevant open-ended follow-up question to encourage more explanation.\nAlways return exactly one English question.\n\n#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):\n{\n  \"followup\": \"（英語の深掘り質問文）\"\n}\n\n#Input\nArticle: ${article}\nDiscussion point: ${questions.discussion.point}\nStudent answer: ${input}\n#Output`;
        const res = ipcRenderer ? await ipcRenderer.invoke('ask-ai', followPrompt) : null;
        let followContent = '';
        let rawContent = '';
        try {
          const resObj = typeof res === 'string' ? JSON.parse(res) : res;
          let message;
          if (resObj?.choices?.[0]?.message) {
            message = resObj.choices[0].message;
          } else if (typeof resObj === 'string') {
            message = resObj;
          } else if (typeof resObj === 'object' && 'content' in resObj) {
            message = resObj;
          } else {
            message = resObj;
          }
          console.log('message:', message, 'typeof:', typeof message);

          // followupキーがある場合
          if (message && typeof message === 'object' && 'followup' in message && typeof message.followup === 'string') {
            followContent = message.followup.trim();
            rawContent = message.followup;
          } else if (message && typeof message === 'object' && 'content' in message && typeof message.content === 'string') {
            rawContent = message.content;
            console.log('message.content:', message.content, 'typeof:', typeof message.content);
            // JSON形式で返す（{"followup": "..."}）
            try {
              const parsed = JSON.parse(rawContent);
              followContent = parsed.followup?.trim() || '';
            } catch {
              followContent = rawContent.trim();
            }
          } else if (typeof message === 'string') {
            rawContent = message;
            followContent = message.trim();
          } else if (Array.isArray(message)) {
            rawContent = message.join(' ');
            followContent = rawContent.trim();
          } else {
            rawContent = '';
            followContent = '';
          }
          console.log('デバッグ: followContent, rawContent:', followContent, rawContent);
        } catch (e) {
          followContent = typeof rawContent === 'string' ? rawContent.trim() : '';
          console.log('catch節デバッグ: followContent, rawContent:', followContent, rawContent);
        }
        console.log('最終的に表示する深掘り質問:', followContent, rawContent);
        setChat(prev => [...prev, { role: 'ai', text: followContent || rawContent || '深掘り質問の生成に失敗しました' }]);
        setDiscussionHistory(h => ({ ...h, aiFollow: followContent || rawContent || '' }));
        setInput('');
        setDiscussionSubStep(1);
        setLoading(false);
        return;
      } else if (discussionSubStep === 1) {
        // 2回目ユーザー回答→AI評価
        setDiscussionHistory(h => ({ ...h, user2: input }));
        // 評価プロンプト生成（2回分まとめて）
        const evalPrompt = `#Order\nYou are an English teacher. Please evaluate the following student's discussion, including their follow-up answer.\n\n#Task\n- Score the discussion out of 30 points.\n- Point out any mistakes and provide corrections.\n- Give advice on how to improve the discussion.\n- Provide a model answer.\n- All output should be in English.\n\n#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):\n{\n  "score": 25,\n  "mistakes": "The discussion lacks ...",\n  "advice": "Try to elaborate ...",\n  "correction": "A better discussion would be ...",\n  "model_answer": "..."\n}\n\n#Input\nArticle: ${article}\nDiscussion point: ${questions.discussion.point}\nStudent answer 1: ${discussionHistory.user1}\nAI follow-up: ${discussionHistory.aiFollow}\nStudent answer 2: ${input}`;
        // 以降は通常のAI評価処理
        // ...既存のAI評価処理をここに挿入...
        // 既存のhandleSendのAI評価部分を関数化して呼び出すのが理想だが、ここでは既存の評価処理をそのまま使う
        // 既存のAI評価処理のtry~catch部分をここにコピペしてもOK
        // ここでは既存のAI評価処理を呼び出す形で省略
        await handleDiscussionEval(evalPrompt);
        setInput('');
        setDiscussionSubStep(2);
        setLoading(false);
        return;
      }
      // discussionSubStep===2のときは何もしない
    }

    // AI評価プロンプト生成
    let evalPrompt = '';
    if (currentQuestion.type === 'summary') {
      evalPrompt = `#Order\nYou are an English teacher. Please evaluate the following student's summary of the article.\n\n#Task\n- Score the answer out of 15 points.\n- Point out any mistakes and provide corrections.\n- Give advice on how to improve the summary.\n- Provide a model answer.\n- All output should be in English.\n\n#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):\n{\n  \"score\": 12,\n  \"mistakes\": \"The summary missed ...\",\n  \"advice\": \"Try to include ...\",\n  \"correction\": \"A better summary would be ...\",\n  \"model_answer\": \"...\"\n}\n\n#Input\nArticle: ${article}\nStudent summary: ${input}`;
    } else if (currentQuestion.type === 'vocab') {
      evalPrompt = `#Order\nYou are an English teacher. Please evaluate the following student's sentence using a specified word from the article.\n\n#Task\n- Score the answer out of 10 points.\n- Point out any mistakes and provide corrections.\n- Give advice on how to improve the sentence.\n- Provide a model answer.\n- All output should be in English.\n\n#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):\n{\n  \"score\": 8,\n  \"mistakes\": \"The word was used incorrectly ...\",\n  \"advice\": \"Try to use the word in a different context ...\",\n  \"correction\": \"A better sentence would be ...\",\n  \"model_answer\": \"...\"\n}\n\n#Input\nArticle: ${article}\nQuestion: ${currentQuestion.text}\nStudent answer: ${input}`;
    } else if (currentQuestion.type === 'comprehension') {
      evalPrompt = `#Order\nYou are an English teacher. Please evaluate the following student's answer to a comprehension question based on the article.\n\n#Task\n- Score the answer out of 15 points.\n- Point out any mistakes and provide corrections.\n- Give advice on how to improve the answer.\n- Provide a model answer.\n- All output should be in English.\n\n#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):\n{\n  \"score\": 12,\n  \"mistakes\": \"The answer missed ...\",\n  \"advice\": \"Try to explain ...\",\n  \"correction\": \"A better answer would be ...\",\n  \"model_answer\": \"...\"\n}\n\n#Input\nArticle: ${article}\nQuestion: ${currentQuestion.text}\nStudent answer: ${input}`;
    } else if (currentQuestion.type === 'discussion') {
      evalPrompt = `#Order\nYou are an English teacher. Please evaluate the following student's discussion answer based on the article.\n\n#Task\n- Score the answer out of 30 points.\n- Point out any mistakes and provide corrections.\n- Give advice on how to improve the answer.\n- Provide a model answer.\n- All output should be in English.\n\n#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):\n{\n  \"score\": 25,\n  \"mistakes\": \"The discussion lacks ...\",\n  \"advice\": \"Try to elaborate ...\",\n  \"correction\": \"A better discussion would be ...\",\n  \"model_answer\": \"...\"\n}\n\n#Input\nArticle: ${article}\nQuestion: ${currentQuestion.text}\nStudent answer: ${input}`;
    }
    if (!evalPrompt.trim()) {
      setError('AI評価プロンプトが空です。設問・記事・回答の内容を確認してください。');
      setLoading(false);
      return;
    }
    // 送信プロンプトを自動で確認
    console.log('送信プロンプト:', evalPrompt);
    // AI評価リクエスト
    const res = ipcRenderer ? await ipcRenderer.invoke('ask-ai', evalPrompt) : null;
    let content = '';
    let lastRawContent = '';
    let parsed: any = null;
    try {
      let match = typeof res === 'string' ? res.match(/\{[\s\S]*\}/) : null;
      let jsonStr = match ? match[0] : res;
      // バッククォートや```json, ```を除去
      if (typeof jsonStr === 'string') {
        jsonStr = jsonStr.replace(/```json[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, '').trim();
        // 先頭・末尾のバッククォートや改行も除去
        jsonStr = jsonStr.replace(/^`+|`+$/g, '').trim();
        // 末尾カンマを自動除去
        jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
        // 最初のJSONブロックのみ抽出
        const firstJson = jsonStr.match(/\{[\s\S]*\}/);
        if (firstJson) jsonStr = firstJson[0];
      }
      parsed = JSON.parse(jsonStr);
      // messageオブジェクトの詳細を出力
      console.log('AI評価APIレスポンス全体:', JSON.stringify(parsed));
      // 1. 直接評価JSONの場合
      if (parsed && typeof parsed === 'object' && 'score' in parsed) {
        // ...既存の処理...
      } else {
        // 2. これまで通りchoices[0].message.contentから抽出
        console.log('AI評価応答 message:', JSON.stringify(parsed?.choices?.[0]?.message));
        content = parsed?.choices?.[0]?.message?.content || '';
        lastRawContent = content;
        console.log('AI評価応答 content:', content);
        // コードブロックや説明文付きのAI応答にも対応
        let jsonStr = '';
        // 1. ```json ... ``` 形式
        let codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
        } else {
          // 2. ``` ... ``` 形式
          codeBlockMatch = content.match(/```\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1].trim();
          } else if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
            // 3. 純粋なJSONのみの場合
            jsonStr = content.trim();
          } else {
            // 4. 本文中の最初のJSONブロック
            const jsonMatches = content.match(/\{[\s\S]*?\}/g);
            if (jsonMatches) {
              jsonStr = jsonMatches[0];
            }
          }
        }
        if (jsonStr) {
          try {
            parsed = JSON.parse(jsonStr);
          } catch (e) {
            setError('AI応答のJSONパースに失敗しました。\nRaw content: ' + content + '\nError: ' + e + '\nAPIレスポンス全体: ' + JSON.stringify(parsed));
            setLoading(false);
            return;
          }
        } else {
          setError('AI応答のJSON抽出に失敗しました。\nRaw content: ' + content + '\nAPIレスポンス全体: ' + JSON.stringify(parsed));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.log('AI評価レスポンスのパースに失敗:', res);
    }
    let score = 0;
    let modelAnswer = '';
    let feedbackText = '';
    try {
      if (!parsed || Object.keys(parsed).length === 0) {
        // パース失敗時はperplexity_api_last_response.jsonのchoices[0].message.contentを自動で再パース
        if (ipcRenderer) {
          await ipcRenderer.invoke('get-last-perplexity-response').then((fileContent: string) => {
            let rawInfo = '';
            let alreadySet = false;
            try {
              const obj = JSON.parse(fileContent);
              const contentStr = obj.choices?.[0]?.message?.content;
              rawInfo = contentStr || '';
              let jsonStr = contentStr;
              // 1. ```json ... ``` 形式
              let codeBlockMatch = contentStr.match(/```json\s*([\s\S]*?)\s*```/);
              if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1].trim();
              } else {
                // 2. ``` ... ``` 形式
                codeBlockMatch = contentStr.match(/```\s*([\s\S]*?)\s*```/);
                if (codeBlockMatch) {
                  jsonStr = codeBlockMatch[1].trim();
                } else if (contentStr.trim().startsWith('{') && contentStr.trim().endsWith('}')) {
                  // 3. 純粋なJSONのみの場合
                  jsonStr = contentStr.trim();
                } else {
                  // 4. 本文中の最初のJSONブロック
                  const jsonMatches = contentStr.match(/\{[\s\S]*?\}/g);
                  if (jsonMatches) {
                    jsonStr = jsonMatches[0];
                  }
                }
              }
              if (jsonStr) {
                const recovered = JSON.parse(jsonStr);
                if (recovered && recovered.score !== undefined) {
                  score = typeof recovered.score === 'number' ? recovered.score : Number(recovered.score) || 0;
                  modelAnswer = recovered.model_answer || '';
                  feedbackText = `スコア: ${score}\n間違い: ${recovered.mistakes || ''}\n修正例: ${recovered.correction || ''}\nアドバイス: ${recovered.advice || ''}\n模範解答: ${modelAnswer}`;
                  setChat(prev => [...prev, {
                    role: 'ai-feedback',
                    text: feedbackText,
                    score,
                    modelAnswer: parsed && parsed.model_answer ? parsed.model_answer : '',
                    mistakes: parsed && parsed.mistakes ? parsed.mistakes : '',
                    correction: parsed && parsed.correction ? parsed.correction : '',
                    advice: parsed && parsed.advice ? parsed.advice : ''
                  }]);
                  setTotalScore(s => s + score);
                  setInput('');
                  // 次の設問へ
                  if (step + 1 < totalQuestions) {
                    setStep(step + 1);
                    if (questions) {
                      let nextQ: string = '';
                      if (step + 1 === 0) {
                        nextQ = questions.summary.question;
                      } else if (step + 1 === 1) {
                        nextQ = `記事に出てきた「${questions.vocab[0].word}」を使って短文を作ってください。`;
                      } else if (step + 1 === 2) {
                        nextQ = `記事に出てきた「${questions.vocab[1].word}」を使って短文を作ってください。`;
                      } else if (step + 1 === 3) {
                        nextQ = questions.comprehension[0].question;
                      } else if (step + 1 === 4) {
                        nextQ = questions.comprehension[1].question;
                      } else if (step + 1 === 5) {
                        nextQ = questions.discussion.point;
                      }
                      setChat(prev => [...prev, { role: 'ai', text: nextQ }]);
                    }
                  } else {
                    setShowResult(true);
                  }
                  setLoading(false);
                  alreadySet = true;
                  throw new Error('auto-recovered');
                }
              }
            } catch {}
            // 失敗時はRaw情報も必ずUIに1回だけ表示
            if (!alreadySet) {
              feedbackText = 'AI応答の解析に失敗しました。\nRaw: ' + rawInfo;
              setChat(prev => [...prev, {
                role: 'ai-feedback',
                text: feedbackText,
                score: 0,
                modelAnswer: '',
                mistakes: '',
                correction: '',
                advice: ''
              }]);
              setLoading(false);
            }
          });
        }
        throw new Error('No valid JSON block');
      }
      score = typeof parsed.score === 'number' ? parsed.score : Number(parsed.score) || 0;
      modelAnswer = parsed.model_answer || '';
      feedbackText = `スコア: ${score}\n間違い: ${parsed.mistakes || ''}\n修正例: ${parsed.correction || ''}\nアドバイス: ${parsed.advice || ''}\n模範解答: ${modelAnswer}`;
    } catch (e) {
      if (e instanceof Error && e.message === 'auto-recovered') return;
      feedbackText = 'AI応答の解析に失敗しました。\nRaw: ' + lastRawContent;
    }
    setChat(prev => [...prev, {
      role: 'ai-feedback',
      text: feedbackText,
      score,
      modelAnswer: parsed && parsed.model_answer ? parsed.model_answer : '',
      mistakes: parsed && parsed.mistakes ? parsed.mistakes : '',
      correction: parsed && parsed.correction ? parsed.correction : '',
      advice: parsed && parsed.advice ? parsed.advice : ''
    }]);
    setTotalScore(s => s + score);
    setInput('');
    // 次の設問へ
    if (step + 1 < totalQuestions) {
      setStep(step + 1);
      // 次の設問をチャットに表示
      if (questions) {
        let nextQ: string = '';
        if (step + 1 === 0) {
          nextQ = questions.summary.question;
        } else if (step + 1 === 1) {
          nextQ = `記事に出てきた「${questions.vocab[0].word}」を使って短文を作ってください。`;
        } else if (step + 1 === 2) {
          nextQ = `記事に出てきた「${questions.vocab[1].word}」を使って短文を作ってください。`;
        } else if (step + 1 === 3) {
          nextQ = questions.comprehension[0].question;
        } else if (step + 1 === 4) {
          nextQ = questions.comprehension[1].question;
        } else if (step + 1 === 5) {
          nextQ = questions.discussion.point;
        }
        setChat(prev => [...prev, { role: 'ai', text: nextQ }]);
      }
    } else {
      setShowResult(true);
    }
    setLoading(false);
  };

  // ディスカッション評価用のAI評価処理
  async function handleDiscussionEval(evalPrompt: string) {
    const res = ipcRenderer ? await ipcRenderer.invoke('ask-ai', evalPrompt) : null;
    let content = '';
    let lastRawContent = '';
    let parsed: any = null;
    try {
      const resObj = typeof res === 'string' ? JSON.parse(res) : res;
      if (resObj && typeof resObj === 'object' && 'score' in resObj) {
        parsed = resObj;
      } else {
        content = resObj?.choices?.[0]?.message?.content || '';
        let jsonStr = '';
        let codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
        } else {
          codeBlockMatch = content.match(/```\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1].trim();
          } else if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
            jsonStr = content.trim();
          } else {
            const jsonMatches = content.match(/\{[\s\S]*?\}/g);
            if (jsonMatches) {
              jsonStr = jsonMatches[0];
            }
          }
        }
        if (jsonStr) {
          try {
            parsed = JSON.parse(jsonStr);
          } catch (e) {}
        }
      }
    } catch (e) {}
    let score = 0;
    let modelAnswer = '';
    let feedbackText = '';
    try {
      score = typeof parsed.score === 'number' ? parsed.score : Number(parsed.score) || 0;
      modelAnswer = parsed.model_answer || '';
      feedbackText = `スコア: ${score}\n間違い: ${parsed.mistakes || ''}\n修正例: ${parsed.correction || ''}\nアドバイス: ${parsed.advice || ''}\n模範解答: ${modelAnswer}`;
    } catch (e) {}
    setChat(prev => [...prev, {
      role: 'ai-feedback',
      text: feedbackText,
      score,
      modelAnswer: parsed && parsed.model_answer ? parsed.model_answer : '',
      mistakes: parsed && parsed.mistakes ? parsed.mistakes : '',
      correction: parsed && parsed.correction ? parsed.correction : '',
      advice: parsed && parsed.advice ? parsed.advice : ''
    }]);
    setTotalScore(s => s + score);
  }

  // サマリー生成ボタン押下時の処理
  const handleSummary = async () => {
    setSummaryLoading(true);
    const prompt = buildSummaryPrompt(article, chat);
    const res = ipcRenderer ? await ipcRenderer.invoke('ask-ai', prompt) : null;
    let parsed = null;
    try {
      const match = typeof res === 'string' ? res.match(/\{[\s\S]*\}/) : null;
      const jsonStr = match ? match[0] : res;
      parsed = JSON.parse(jsonStr);

      // スコア情報をchatから抽出
      const scores: Record<string, number> = {};
      let idx = 0;
      for (const msg of chat) {
        if (msg.role === 'ai-feedback' && typeof msg.score === 'number') {
          let key = '';
          if (idx === 0) key = 'summary';
          else if (idx === 1) key = 'vocab1';
          else if (idx === 2) key = 'vocab2';
          else if (idx === 3) key = 'comprehension1';
          else if (idx === 4) key = 'comprehension2';
          else if (idx === 5) key = 'discussion';
          scores[key] = msg.score;
          idx++;
        }
      }
      const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

      setSummaryData({
        ...parsed,
        scores,
        totalScore,
      });
      // 履歴保存
      try {
        saveLessonHistory({
          lessonId: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          article,
          questions,
          answers: chat
            .filter(msg => msg.role === 'user' || msg.role === 'ai-feedback')
            .map((msg, idx) => {
              if (msg.role === 'user') {
                // 対応するフィードバックを探す
                const feedback = chat.slice(idx + 1).find(m => m.role === 'ai-feedback');
                return { questionType: '', answer: msg.text, feedback };
              } else {
                return null;
              }
            })
            .filter((x): x is { questionType: string; answer: string; feedback: any } => x !== null),
          summary: parsed,
        });
      } catch (e) { /* 保存失敗時は無視 */ }
    } catch (e) {
      setSummaryData({ error: 'AIサマリー生成のパースに失敗: ' + (res || '') + '\nAI応答のJSONに不備がある可能性があります。AIプロンプトやAI応答内容を見直してください。' });
    }
    setSummaryLoading(false);
    setPage('summary');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 上部：記事表示 */}
      <div className="flex-1 overflow-auto p-4 border-b bg-white">
        <h2 className="font-bold mb-2">入力記事</h2>
        <div className="whitespace-pre-wrap text-gray-800">{article}</div>
      </div>
      {/* 下部：AIチャットインターフェース */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-2">
          {chat.map((msg, i) => (
            <div key={i} className="mb-2">
              {msg.role === 'ai' && (
                <div className="flex items-start">
                  <div className="mr-2 flex-shrink-0">{TeacherIcon}</div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow text-blue-700 font-bold max-w-[70%]">
                    AI: {msg.text}
                  </div>
                </div>
              )}
              {msg.role === 'user' && (
                <div className="flex items-start justify-end">
                  <div className="bg-blue-600 text-white rounded-lg px-4 py-2 shadow max-w-[70%] text-right">
                    あなた: {msg.text}
                  </div>
                  <div className="ml-2 flex-shrink-0">{UserIcon}</div>
                </div>
              )}
              {msg.role === 'ai-feedback' && (
                <div className="flex items-start">
                  <div className="mr-2 flex-shrink-0">{TeacherIcon}</div>
                  <div className="bg-green-50 rounded-lg px-4 py-2 shadow text-green-700 max-w-[70%]">
                    {/* エラー文の場合はそのまま表示 */}
                    {typeof msg.score === 'number' && (msg.modelAnswer !== undefined || msg.mistakes !== undefined || msg.correction !== undefined || msg.advice !== undefined) && !msg.text?.startsWith('AI応答の解析に失敗しました') ? (
                      <div>
                        <div><b>スコア:</b> {msg.score}点</div>
                        {(msg.mistakes ?? '') !== '' && <div><b>間違い:</b> {msg.mistakes}</div>}
                        {(msg.correction ?? '') !== '' && <div><b>修正例:</b> {msg.correction}</div>}
                        {(msg.advice ?? '') !== '' && <div><b>アドバイス:</b> {msg.advice}</div>}
                        {(msg.modelAnswer ?? '') !== '' && <div><b>模範解答:</b> {msg.modelAnswer}</div>}
                      </div>
                    ) : (
                      <div>AI評価: {msg.text} <span className="ml-2 font-bold">+{msg.score}点</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {error && <div className="text-red-600 whitespace-pre-wrap">{error}</div>}
        </div>
        {!showResult && currentQuestion && (
          <div className="flex flex-col">
            {/* ディスカッション2往復時は入力欄を制御 */}
            {!(currentQuestion.type === 'discussion' && discussionSubStep === 2) && (
              <>
                <textarea
                  className="w-full h-24 p-2 border rounded mb-2"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="あなたの回答を入力してください"
                  disabled={loading}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded self-end disabled:opacity-50"
                  onClick={handleSend}
                  disabled={!input.trim() || loading || !currentQuestion || !currentQuestion.text}
                >
                  {loading ? '送信中...' : '回答送信'}
                </button>
              </>
            )}
            <div className="mt-2 text-sm text-gray-500">{step + 1} / {totalQuestions} 問</div>
            {/* ディスカッション評価後にSummaryボタン表示 */}
            {currentQuestion.type === 'discussion' && discussionSubStep === 2 && (
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded" onClick={handleSummary} disabled={summaryLoading}>
                {summaryLoading ? 'サマリー生成中...' : 'Summary'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

declare global {
  interface Window {
    electronAPI?: {
      ipcRenderer: {
        invoke: (...args: any[]) => Promise<any>;
        on: (...args: any[]) => void;
      };
    };
  }
}

export default Lesson; 
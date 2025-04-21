import React, { useState } from 'react';
import type { Page } from './App';

interface Props {
  setPage: (page: Page) => void;
  setArticle: (article: string) => void;
}

const Home: React.FC<Props> = ({ setPage, setArticle }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 記事整形プロンプト
  function buildCleanPrompt(article: string) {
    return `#Order\n以下の英語記事テキストから、本文以外の余分な情報（ナビゲーション、広告、フッター、著作権表示、関連記事リスト等）をすべて除去し、「記事本文」だけを抽出してください。本文そのものの内容・文は一切改変しないでください。\n\n#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):\n{\n  "cleaned_article": "（本文のみ）"\n}\n#Input\n${article}`;
  }

  // 記事入力後、LLMで整形→レッスン画面へ遷移
  const handleStart = async () => {
    setLoading(true);
    setError(null);
    const prompt = buildCleanPrompt(input);
    try {
      const res = window.electronAPI?.ipcRenderer ? await window.electronAPI.ipcRenderer.invoke('ask-ai', prompt) : null;
      let cleaned = '';
      if (res) {
        try {
          const match = typeof res === 'string' ? res.match(/\{[\s\S]*\}/) : null;
          const jsonStr = match ? match[0] : res;
          const parsed = JSON.parse(jsonStr);
          cleaned = parsed.cleaned_article || '';
        } catch {}
      }
      if (cleaned && cleaned.length > 50) {
        setArticle(cleaned);
      } else {
        setError('記事本文の抽出に失敗したため、元の入力で進みます');
        setArticle(input);
      }
    } catch (e) {
      setError('記事整形プロセスでエラーが発生したため、元の入力で進みます');
      setArticle(input);
    }
    setLoading(false);
    setPage('lesson');
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">記事を入力してください</h1>
      <textarea
        className="w-full h-40 p-2 border rounded mb-4"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="ここにBBCニュース記事を貼り付けてください"
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleStart}
        disabled={!input.trim() || loading}
      >
        {loading ? '整形中...' : 'レッスン開始'}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default Home; 
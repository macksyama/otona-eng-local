import React, { useState } from 'react';
import type { Page } from './App';

interface Props {
  setPage: (page: Page) => void;
  setArticle: (article: string) => void;
}

const Home: React.FC<Props> = ({ setPage, setArticle }) => {
  const [input, setInput] = useState('');

  // 記事入力後、レッスン画面へ遷移
  const handleStart = () => {
    setArticle(input);
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
        disabled={!input.trim()}
      >
        レッスン開始
      </button>
    </div>
  );
};

export default Home; 
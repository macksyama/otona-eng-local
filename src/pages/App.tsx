import React, { useState } from 'react';
import Home from './Home';
import Lesson from './Lesson';
import Summary from './Summary';
import Settings from './Settings';
import NewsList from './NewsList';

// 画面遷移用の状態
export type Page = 'news' | 'home' | 'lesson' | 'summary' | 'settings';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('news');
  const [article, setArticle] = useState<string>('');
  const [summaryData, setSummaryData] = useState<any>(null);

  // Heroicons Cog8Tooth outline（中央がずれない）
  const GearIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="32" height="32">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.01c1.527-.878 3.286.88 2.408 2.408a1.724 1.724 0 0 0 1.01 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.01 2.573c.878 1.527-.88 3.286-2.408 2.408a1.724 1.724 0 0 0-2.573 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.01c-1.527.878-3.286-.88-2.408-2.408a1.724 1.724 0 0 0-1.01-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.01-2.573c-.878-1.527.88-3.286 2.408-2.408.879.527 2.04.062 2.24-.909z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* 右上に歯車アイコン */}
      <button
        onClick={() => setPage('settings')}
        style={{ position: 'absolute', top: 16, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        aria-label="設定"
      >
        {GearIcon}
      </button>
      {page === 'settings' ? (
        <div>
          <Settings />
          <button
            onClick={() => setPage('home')}
            style={{ position: 'absolute', top: 16, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, zIndex: 10 }}
          >
            ← 戻る
          </button>
        </div>
      ) : (
        <>
          {page === 'news' && <NewsList onSelect={() => setPage('home')} />}
          {page === 'home' && <Home setPage={setPage} setArticle={setArticle} />}
          {page === 'lesson' && <Lesson article={article} setPage={setPage} setSummaryData={setSummaryData} />}
          {page === 'summary' && <Summary setPage={setPage} summaryData={summaryData} />}
        </>
      )}
    </div>
  );
};

export default App; 
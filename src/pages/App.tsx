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

  // 歯車アイコン（SVG）
  const GearIcon = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-settings">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 0 1 4 0v.09c0 .38.22.72.55.9.33.18.72.22 1.09.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .38.22.72.55.9.33.18.72.22 1.09.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .38.22.72.55.9.33.18.72.22 1.09.09z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* 右上に歯車アイコン */}
      <button
        onClick={() => setPage('settings')}
        style={{ position: 'absolute', top: 16, right: 24, background: 'none', border: 'none', cursor: 'pointer' }}
        aria-label="設定"
      >
        {GearIcon}
      </button>
      {page === 'settings' ? (
        <div>
          <Settings />
          <button
            onClick={() => setPage('home')}
            style={{ position: 'absolute', top: 16, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
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
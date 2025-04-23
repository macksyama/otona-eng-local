import React, { useState, useRef } from 'react';
import Home from './Home';
import Lesson from './Lesson';
import Summary from './Summary';
import Settings from './Settings';
import NewsList from './NewsList';
import HistoryList from './HistoryList';
import Login from './Login';

// 画面遷移用の状態
export type Page = 'news' | 'home' | 'lesson' | 'summary' | 'settings' | 'history';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('news');
  const [article, setArticle] = useState<string>('');
  const [summaryData, setSummaryData] = useState<any>(null);
  const prevPage = useRef<Page>('news');
  const [authed, setAuthed] = useState(() => localStorage.getItem('otona-auth') === '1');

  // ページ遷移時に直前のページを記憶
  const handleSetPage = (next: Page) => {
    if (next === 'settings') {
      prevPage.current = page;
    }
    setPage(next);
  };

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('otona-auth');
    setAuthed(false);
  };

  // Heroicons Cog8Tooth outline（中央がずれない）
  const GearIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="32" height="32">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.01c1.527-.878 3.286.88 2.408 2.408a1.724 1.724 0 0 0 1.01 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.01 2.573c.878 1.527-.88 3.286-2.408 2.408a1.724 1.724 0 0 0-2.573 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.01c-1.527.878-3.286-.88-2.408-2.408a1.724 1.724 0 0 0-1.01-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.01-2.573c-.878-1.527.88-3.286 2.408-2.408.879.527 2.04.062 2.24-.909z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );

  // Homeアイコン（家）
  const HomeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="32" height="32">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21a1.5 1.5 0 001.5 1.5h3A1.5 1.5 0 0010.5 21V16.5a1.5 1.5 0 011.5-1.5h0a1.5 1.5 0 011.5 1.5V21a1.5 1.5 0 001.5 1.5h3A1.5 1.5 0 0019.5 21V10.5" />
    </svg>
  );

  // 履歴アイコン（Time Machine風: 円形矢印＋時計）
  const HistoryIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" width="32" height="32">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 1 0-2.34 5.66" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M20 12v4h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );

  // Heroicons ArrowRightOnRectangle（ログアウトアイコン）
  const LogoutIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="32" height="32">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* 右上ナビゲーションアイコン群 */}
      <div style={{ position: 'absolute', top: 16, right: 96, display: 'flex', gap: 8, zIndex: 20 }}>
        {/* Homeアイコン */}
        <button
          onClick={() => handleSetPage('news')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          aria-label="ホーム"
        >
          {HomeIcon}
        </button>
        {/* 履歴アイコン */}
        <button
          onClick={() => handleSetPage('history')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          aria-label="履歴"
        >
          {HistoryIcon}
        </button>
      </div>
      {/* 設定アイコン */}
      <button
        onClick={() => handleSetPage('settings')}
        style={{ position: 'absolute', top: 16, right: 48, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        aria-label="設定"
      >
        {GearIcon}
      </button>
      {/* ログアウトアイコンボタン */}
      <button
        onClick={handleLogout}
        style={{ position: 'absolute', top: 16, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f00' }}
        aria-label="ログアウト"
      >
        {LogoutIcon}
      </button>
      {page === 'settings' ? (
        <div>
          <Settings />
          <button
            onClick={() => setPage(prevPage.current)}
            style={{ position: 'absolute', top: 16, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, zIndex: 10 }}
          >
            ← 戻る
          </button>
        </div>
      ) : (
        <>
          {page === 'news' && <NewsList onSelect={() => handleSetPage('home')} />}
          {page === 'home' && <Home setPage={handleSetPage} setArticle={setArticle} />}
          {page === 'lesson' && <Lesson article={article} setPage={handleSetPage} setSummaryData={setSummaryData} />}
          {page === 'summary' && <Summary setPage={handleSetPage} summaryData={summaryData} />}
          {page === 'history' && <HistoryList setPage={handleSetPage} reloadKey={page} showBackToSummary={false} />}
        </>
      )}
    </div>
  );
};

export default App; 
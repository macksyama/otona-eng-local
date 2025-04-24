import React, { useState, useRef } from 'react';
import Home from './Home';
import Lesson from './Lesson';
import Summary from './Summary';
import Settings from './Settings';
import NewsList from './NewsList';
import HistoryList from './HistoryList';
import Login from './Login';
import AuthChoice from './AuthChoice';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { migrateLocalToFirestore } from '../utils/historyManager';

// 画面遷移用の状態
export type Page = 'news' | 'home' | 'lesson' | 'summary' | 'settings' | 'history';

type AuthState = 'none' | 'password' | 'google' | 'guest';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('news');
  const [article, setArticle] = useState<string>('');
  const [summaryData, setSummaryData] = useState<any>(null);
  const prevPage = useRef<Page>('news');
  // 認証状態をlocalStorageから復元
  const [authState, setAuthState] = useState<AuthState>(() => {
    const v = localStorage.getItem('otona-auth');
    if (v === 'google') return 'google';
    if (v === 'guest') return 'guest';
    if (v === '1') return 'password';
    return 'none';
  });

  // ページ遷移時に直前のページを記憶
  const handleSetPage = (next: Page) => {
    if (next === 'settings') {
      prevPage.current = page;
    }
    setPage(next);
  };

  // パスワード認証後
  if (authState === 'none') {
    return <Login onLogin={() => setAuthState('password')} />;
  }

  // Googleログイン/ゲスト選択画面
  if (authState === 'password') {
    const handleGoogleLogin = async () => {
      try {
        await signInWithPopup(auth, provider);
        await migrateLocalToFirestore();
        localStorage.setItem('otona-auth', 'google');
        setAuthState('google');
      } catch (e) {
        alert('Googleログインに失敗しました');
      }
    };
    const handleGuest = () => {
      localStorage.setItem('otona-auth', 'guest');
      setAuthState('guest');
    };
    return <AuthChoice onGoogleLogin={handleGoogleLogin} onGuest={handleGuest} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('otona-auth');
    setAuthState('none');
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

  // 履歴アイコン（時計マーク: 丸＋時計針のみ、枠は細め、矢印なし）
  const HistoryIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" width="32" height="32">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      {/* 画面上部ナビゲーションバー */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 30, background: 'rgba(255,255,255,0.97)', borderBottom: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, padding: '0 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1, flex: 1 }}>Otona English</div>
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
          {/* 設定アイコン */}
          <button
            onClick={() => handleSetPage('settings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            aria-label="設定"
          >
            {GearIcon}
          </button>
          {/* ログアウトアイコンボタン（黒色） */}
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#222' }}
            aria-label="ログアウト"
          >
            {LogoutIcon}
          </button>
        </div>
      </div>
      {/* 上部バーの高さ分余白を追加 */}
      <div style={{ height: 64 }} />
      {/* メイン画面 */}
      {page === 'settings' ? (
        <div>
          <Settings />
          <button
            onClick={() => setPage(prevPage.current)}
            style={{ position: 'absolute', top: 80, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, zIndex: 10 }}
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
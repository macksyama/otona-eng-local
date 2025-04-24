import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
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
const App = () => {
    const [page, setPage] = useState('news');
    const [article, setArticle] = useState('');
    const [summaryData, setSummaryData] = useState(null);
    const prevPage = useRef('news');
    // 認証状態をlocalStorageから復元
    const [authState, setAuthState] = useState(() => {
        const v = localStorage.getItem('otona-auth');
        if (v === 'google')
            return 'google';
        if (v === 'guest')
            return 'guest';
        if (v === '1')
            return 'password';
        return 'none';
    });
    // ページ遷移時に直前のページを記憶
    const handleSetPage = (next) => {
        if (next === 'settings') {
            prevPage.current = page;
        }
        setPage(next);
    };
    // パスワード認証後
    if (authState === 'none') {
        return _jsx(Login, { onLogin: () => setAuthState('password') });
    }
    // Googleログイン/ゲスト選択画面
    if (authState === 'password') {
        const handleGoogleLogin = async () => {
            try {
                await signInWithPopup(auth, provider);
                await migrateLocalToFirestore();
                localStorage.setItem('otona-auth', 'google');
                setAuthState('google');
            }
            catch (e) {
                alert('Googleログインに失敗しました');
            }
        };
        const handleGuest = () => {
            localStorage.setItem('otona-auth', 'guest');
            setAuthState('guest');
        };
        return _jsx(AuthChoice, { onGoogleLogin: handleGoogleLogin, onGuest: handleGuest });
    }
    const handleLogout = () => {
        localStorage.removeItem('otona-auth');
        setAuthState('none');
    };
    // Heroicons Cog8Tooth outline（中央がずれない）
    const GearIcon = (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.01c1.527-.878 3.286.88 2.408 2.408a1.724 1.724 0 0 0 1.01 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.01 2.573c.878 1.527-.88 3.286-2.408 2.408a1.724 1.724 0 0 0-2.573 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.01c-1.527.878-3.286-.88-2.408-2.408a1.724 1.724 0 0 0-1.01-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.01-2.573c-.878-1.527.88-3.286 2.408-2.408.879.527 2.04.062 2.24-.909z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" })] }));
    // Homeアイコン（家）
    const HomeIcon = (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 12l9-9 9 9M4.5 10.5V21a1.5 1.5 0 001.5 1.5h3A1.5 1.5 0 0010.5 21V16.5a1.5 1.5 0 011.5-1.5h0a1.5 1.5 0 011.5 1.5V21a1.5 1.5 0 001.5 1.5h3A1.5 1.5 0 0019.5 21V10.5" }) }));
    // 履歴アイコン（Time Machine風: 円形矢印＋時計）
    const HistoryIcon = (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: [_jsx("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", fill: "none" }), _jsx("path", { d: "M12 7v5l3 3", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M20 12a8 8 0 1 0-2.34 5.66", stroke: "currentColor", strokeWidth: "2", fill: "none", strokeLinecap: "round" }), _jsx("path", { d: "M20 12v4h-4", stroke: "currentColor", strokeWidth: "2", fill: "none", strokeLinecap: "round" })] }));
    // Heroicons ArrowRightOnRectangle（ログアウトアイコン）
    const LogoutIcon = (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M18 12H9m0 0l3-3m-3 3l3 3" })] }));
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 relative", children: [_jsxs("div", { style: { position: 'absolute', top: 16, right: 96, display: 'flex', gap: 8, zIndex: 20 }, children: [_jsx("button", { onClick: () => handleSetPage('news'), style: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 }, "aria-label": "\u30DB\u30FC\u30E0", children: HomeIcon }), _jsx("button", { onClick: () => handleSetPage('history'), style: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 }, "aria-label": "\u5C65\u6B74", children: HistoryIcon })] }), _jsx("button", { onClick: () => handleSetPage('settings'), style: { position: 'absolute', top: 16, right: 48, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }, "aria-label": "\u8A2D\u5B9A", children: GearIcon }), _jsx("button", { onClick: handleLogout, style: { position: 'absolute', top: 16, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f00' }, "aria-label": "\u30ED\u30B0\u30A2\u30A6\u30C8", children: LogoutIcon }), page === 'settings' ? (_jsxs("div", { children: [_jsx(Settings, {}), _jsx("button", { onClick: () => setPage(prevPage.current), style: { position: 'absolute', top: 16, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, zIndex: 10 }, children: "\u2190 \u623B\u308B" })] })) : (_jsxs(_Fragment, { children: [page === 'news' && _jsx(NewsList, { onSelect: () => handleSetPage('home') }), page === 'home' && _jsx(Home, { setPage: handleSetPage, setArticle: setArticle }), page === 'lesson' && _jsx(Lesson, { article: article, setPage: handleSetPage, setSummaryData: setSummaryData }), page === 'summary' && _jsx(Summary, { setPage: handleSetPage, summaryData: summaryData }), page === 'history' && _jsx(HistoryList, { setPage: handleSetPage, reloadKey: page, showBackToSummary: false })] }))] }));
};
export default App;

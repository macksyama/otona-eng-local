import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import Home from './Home';
import Lesson from './Lesson';
import Summary from './Summary';
import Settings from './Settings';
import NewsList from './NewsList';
import HistoryList from './HistoryList';
import Login from './Login';
const App = () => {
    const [page, setPage] = useState('news');
    const [article, setArticle] = useState('');
    const [summaryData, setSummaryData] = useState(null);
    const prevPage = useRef('news');
    const [authed, setAuthed] = useState(() => localStorage.getItem('otona-auth') === '1');
    // ページ遷移時に直前のページを記憶
    const handleSetPage = (next) => {
        if (next === 'settings') {
            prevPage.current = page;
        }
        setPage(next);
    };
    if (!authed) {
        return _jsx(Login, { onLogin: () => setAuthed(true) });
    }
    const handleLogout = () => {
        localStorage.removeItem('otona-auth');
        setAuthed(false);
    };
    // Heroicons Cog8Tooth outline（中央がずれない）
    const GearIcon = (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.01c1.527-.878 3.286.88 2.408 2.408a1.724 1.724 0 0 0 1.01 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.01 2.573c.878 1.527-.88 3.286-2.408 2.408a1.724 1.724 0 0 0-2.573 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.01c-1.527.878-3.286-.88-2.408-2.408a1.724 1.724 0 0 0-1.01-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.01-2.573c-.878-1.527.88-3.286 2.408-2.408.879.527 2.04.062 2.24-.909z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" })] }));
    // Heroicons ArrowRightOnRectangle（ログアウトアイコン）
    const LogoutIcon = (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M18 12H9m0 0l3-3m-3 3l3 3" })] }));
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 relative", children: [_jsx("button", { onClick: () => handleSetPage('settings'), style: { position: 'absolute', top: 16, right: 48, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }, "aria-label": "\u8A2D\u5B9A", children: GearIcon }), _jsx("button", { onClick: handleLogout, style: { position: 'absolute', top: 16, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f00' }, "aria-label": "\u30ED\u30B0\u30A2\u30A6\u30C8", children: LogoutIcon }), page === 'settings' ? (_jsxs("div", { children: [_jsx(Settings, {}), _jsx("button", { onClick: () => setPage(prevPage.current), style: { position: 'absolute', top: 16, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, zIndex: 10 }, children: "\u2190 \u623B\u308B" })] })) : (_jsxs(_Fragment, { children: [page === 'news' && _jsx(NewsList, { onSelect: () => handleSetPage('home') }), page === 'home' && _jsx(Home, { setPage: handleSetPage, setArticle: setArticle }), page === 'lesson' && _jsx(Lesson, { article: article, setPage: handleSetPage, setSummaryData: setSummaryData }), page === 'summary' && _jsx(Summary, { setPage: handleSetPage, summaryData: summaryData }), page === 'history' && _jsx(HistoryList, { setPage: handleSetPage })] }))] }));
};
export default App;

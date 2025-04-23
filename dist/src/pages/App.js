"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Home_1 = __importDefault(require("./Home"));
const Lesson_1 = __importDefault(require("./Lesson"));
const Summary_1 = __importDefault(require("./Summary"));
const Settings_1 = __importDefault(require("./Settings"));
const NewsList_1 = __importDefault(require("./NewsList"));
const HistoryList_1 = __importDefault(require("./HistoryList"));
const Login_1 = __importDefault(require("./Login"));
const App = () => {
    const [page, setPage] = (0, react_1.useState)('news');
    const [article, setArticle] = (0, react_1.useState)('');
    const [summaryData, setSummaryData] = (0, react_1.useState)(null);
    const prevPage = (0, react_1.useRef)('news');
    const [authed, setAuthed] = (0, react_1.useState)(() => localStorage.getItem('otona-auth') === '1');
    // ページ遷移時に直前のページを記憶
    const handleSetPage = (next) => {
        if (next === 'settings') {
            prevPage.current = page;
        }
        setPage(next);
    };
    if (!authed) {
        return (0, jsx_runtime_1.jsx)(Login_1.default, { onLogin: () => setAuthed(true) });
    }
    const handleLogout = () => {
        localStorage.removeItem('otona-auth');
        setAuthed(false);
    };
    // Heroicons Cog8Tooth outline（中央がずれない）
    const GearIcon = ((0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: [(0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.01c1.527-.878 3.286.88 2.408 2.408a1.724 1.724 0 0 0 1.01 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.01 2.573c.878 1.527-.88 3.286-2.408 2.408a1.724 1.724 0 0 0-2.573 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.01c-1.527.878-3.286-.88-2.408-2.408a1.724 1.724 0 0 0-1.01-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.01-2.573c-.878-1.527.88-3.286 2.408-2.408.879.527 2.04.062 2.24-.909z" }), (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" })] }));
    // Homeアイコン（家）
    const HomeIcon = ((0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 12l9-9 9 9M4.5 10.5V21a1.5 1.5 0 001.5 1.5h3A1.5 1.5 0 0010.5 21V16.5a1.5 1.5 0 011.5-1.5h0a1.5 1.5 0 011.5 1.5V21a1.5 1.5 0 001.5 1.5h3A1.5 1.5 0 0019.5 21V10.5" }) }));
    // 履歴アイコン（Time Machine風: 円形矢印＋時計）
    const HistoryIcon = ((0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", fill: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7v5l3 3", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), (0, jsx_runtime_1.jsx)("path", { d: "M20 12a8 8 0 1 0-2.34 5.66", stroke: "currentColor", strokeWidth: "2", fill: "none", strokeLinecap: "round" }), (0, jsx_runtime_1.jsx)("path", { d: "M20 12v4h-4", stroke: "currentColor", strokeWidth: "2", fill: "none", strokeLinecap: "round" })] }));
    // Heroicons ArrowRightOnRectangle（ログアウトアイコン）
    const LogoutIcon = ((0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: [(0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" }), (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M18 12H9m0 0l3-3m-3 3l3 3" })] }));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50 relative", children: [(0, jsx_runtime_1.jsxs)("div", { style: { position: 'absolute', top: 16, right: 96, display: 'flex', gap: 8, zIndex: 20 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleSetPage('news'), style: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 }, "aria-label": "\u30DB\u30FC\u30E0", children: HomeIcon }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleSetPage('history'), style: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 }, "aria-label": "\u5C65\u6B74", children: HistoryIcon })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleSetPage('settings'), style: { position: 'absolute', top: 16, right: 48, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }, "aria-label": "\u8A2D\u5B9A", children: GearIcon }), (0, jsx_runtime_1.jsx)("button", { onClick: handleLogout, style: { position: 'absolute', top: 16, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f00' }, "aria-label": "\u30ED\u30B0\u30A2\u30A6\u30C8", children: LogoutIcon }), page === 'settings' ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Settings_1.default, {}), (0, jsx_runtime_1.jsx)("button", { onClick: () => setPage(prevPage.current), style: { position: 'absolute', top: 16, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, zIndex: 10 }, children: "\u2190 \u623B\u308B" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [page === 'news' && (0, jsx_runtime_1.jsx)(NewsList_1.default, { onSelect: () => handleSetPage('home') }), page === 'home' && (0, jsx_runtime_1.jsx)(Home_1.default, { setPage: handleSetPage, setArticle: setArticle }), page === 'lesson' && (0, jsx_runtime_1.jsx)(Lesson_1.default, { article: article, setPage: handleSetPage, setSummaryData: setSummaryData }), page === 'summary' && (0, jsx_runtime_1.jsx)(Summary_1.default, { setPage: handleSetPage, summaryData: summaryData }), page === 'history' && (0, jsx_runtime_1.jsx)(HistoryList_1.default, { setPage: handleSetPage, reloadKey: page })] }))] }));
};
exports.default = App;

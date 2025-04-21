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
const App = () => {
    const [page, setPage] = (0, react_1.useState)('news');
    const [article, setArticle] = (0, react_1.useState)('');
    const [summaryData, setSummaryData] = (0, react_1.useState)(null);
    // 歯車アイコン（SVG）
    const GearIcon = ((0, jsx_runtime_1.jsxs)("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "feather feather-settings", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "3" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 0 1 4 0v.09c0 .38.22.72.55.9.33.18.72.22 1.09.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .38.22.72.55.9.33.18.72.22 1.09.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .38.22.72.55.9.33.18.72.22 1.09.09z" })] }));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50 relative", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setPage('settings'), style: { position: 'absolute', top: 16, right: 24, background: 'none', border: 'none', cursor: 'pointer' }, "aria-label": "\u8A2D\u5B9A", children: GearIcon }), page === 'settings' ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Settings_1.default, {}), (0, jsx_runtime_1.jsx)("button", { onClick: () => setPage('home'), style: { position: 'absolute', top: 16, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }, children: "\u2190 \u623B\u308B" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [page === 'news' && (0, jsx_runtime_1.jsx)(NewsList_1.default, { onSelect: () => setPage('home') }), page === 'home' && (0, jsx_runtime_1.jsx)(Home_1.default, { setPage: setPage, setArticle: setArticle }), page === 'lesson' && (0, jsx_runtime_1.jsx)(Lesson_1.default, { article: article, setPage: setPage, setSummaryData: setSummaryData }), page === 'summary' && (0, jsx_runtime_1.jsx)(Summary_1.default, { setPage: setPage, summaryData: summaryData })] }))] }));
};
exports.default = App;

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
    // Heroicons Cog8Tooth outline（中央がずれない）
    const GearIcon = ((0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", width: "32", height: "32", children: [(0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.01c1.527-.878 3.286.88 2.408 2.408a1.724 1.724 0 0 0 1.01 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.01 2.573c.878 1.527-.88 3.286-2.408 2.408a1.724 1.724 0 0 0-2.573 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.01c-1.527.878-3.286-.88-2.408-2.408a1.724 1.724 0 0 0-1.01-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.01-2.573c-.878-1.527.88-3.286 2.408-2.408.879.527 2.04.062 2.24-.909z" }), (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" })] }));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50 relative", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setPage('settings'), style: { position: 'absolute', top: 16, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }, "aria-label": "\u8A2D\u5B9A", children: GearIcon }), page === 'settings' ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Settings_1.default, {}), (0, jsx_runtime_1.jsx)("button", { onClick: () => setPage('home'), style: { position: 'absolute', top: 16, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, zIndex: 10 }, children: "\u2190 \u623B\u308B" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [page === 'news' && (0, jsx_runtime_1.jsx)(NewsList_1.default, { onSelect: () => setPage('home') }), page === 'home' && (0, jsx_runtime_1.jsx)(Home_1.default, { setPage: setPage, setArticle: setArticle }), page === 'lesson' && (0, jsx_runtime_1.jsx)(Lesson_1.default, { article: article, setPage: setPage, setSummaryData: setSummaryData }), page === 'summary' && (0, jsx_runtime_1.jsx)(Summary_1.default, { setPage: setPage, summaryData: summaryData })] }))] }));
};
exports.default = App;

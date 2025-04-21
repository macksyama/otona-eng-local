"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const history_1 = require("./history");
const HistoryList = ({ setPage }) => {
    const histories = (0, history_1.getLessonHistories)().slice().reverse();
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6 bg-gray-50 min-h-screen", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold mb-4", children: "\u30EC\u30C3\u30B9\u30F3\u5C65\u6B74\u4E00\u89A7" }), (0, jsx_runtime_1.jsx)("button", { className: "mb-4 px-4 py-2 bg-blue-600 text-white rounded", onClick: () => setPage('summary'), children: "\u30B5\u30DE\u30EA\u30FC\u306B\u623B\u308B" }), histories.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-gray-500", children: "\u5C65\u6B74\u304C\u3042\u308A\u307E\u305B\u3093\u3002" })) : ((0, jsx_runtime_1.jsx)("ul", { className: "space-y-4", children: histories.map((h, i) => ((0, jsx_runtime_1.jsxs)("li", { className: "bg-white rounded shadow p-4 flex flex-col", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500", children: new Date(h.timestamp).toLocaleString() }), (0, jsx_runtime_1.jsxs)("div", { className: "font-bold mt-1 mb-2", children: [h.article.slice(0, 40), h.article.length > 40 ? '...' : ''] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-blue-700 font-bold", children: ["\u5408\u8A08\u30B9\u30B3\u30A2: ", h.summary?.scores ? Object.values(h.summary.scores).reduce((a, b) => a + b, 0) : '-'] })] }, h.lessonId))) }))] }));
};
exports.default = HistoryList;

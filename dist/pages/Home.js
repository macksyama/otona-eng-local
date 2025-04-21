"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Home = ({ setPage, setArticle }) => {
    const [input, setInput] = (0, react_1.useState)('');
    // 記事入力後、レッスン画面へ遷移
    const handleStart = () => {
        setArticle(input);
        setPage('lesson');
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-2xl mx-auto py-12", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold mb-4", children: "\u8A18\u4E8B\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" }), (0, jsx_runtime_1.jsx)("textarea", { className: "w-full h-40 p-2 border rounded mb-4", value: input, onChange: e => setInput(e.target.value), placeholder: "\u3053\u3053\u306BBBC\u30CB\u30E5\u30FC\u30B9\u8A18\u4E8B\u3092\u8CBC\u308A\u4ED8\u3051\u3066\u304F\u3060\u3055\u3044" }), (0, jsx_runtime_1.jsx)("button", { className: "bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50", onClick: handleStart, disabled: !input.trim(), children: "\u30EC\u30C3\u30B9\u30F3\u958B\u59CB" })] }));
};
exports.default = Home;

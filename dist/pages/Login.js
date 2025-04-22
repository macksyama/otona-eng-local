"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const PASSWORD = 'otona2024';
const Login = ({ onLogin }) => {
    const [password, setPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === PASSWORD) {
            localStorage.setItem('otona-auth', '1');
            onLogin();
        }
        else {
            setError('パスワードが違います');
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-col items-center justify-center min-h-screen bg-gray-100", children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "bg-white p-6 rounded shadow-md w-80", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl mb-4", children: "\u30ED\u30B0\u30A4\u30F3" }), (0, jsx_runtime_1.jsx)("input", { type: "password", placeholder: "\u30D1\u30B9\u30EF\u30FC\u30C9", value: password, onChange: e => setPassword(e.target.value), className: "border p-2 w-full mb-4" }), error && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 mb-2", children: error }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "bg-blue-500 text-white px-4 py-2 rounded w-full", children: "\u30ED\u30B0\u30A4\u30F3" })] }) }));
};
exports.default = Login;

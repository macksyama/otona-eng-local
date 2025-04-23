import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // Vite環境変数は関数内で参照
    const PASSWORD = import.meta.env.VITE_LOGIN_PASSWORD || '';
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
    return (_jsx("div", { className: "flex flex-col items-center justify-center min-h-screen bg-gray-100", children: _jsxs("form", { onSubmit: handleSubmit, className: "bg-white p-6 rounded shadow-md w-80", children: [_jsx("h2", { className: "text-xl mb-4", children: "\u30ED\u30B0\u30A4\u30F3" }), _jsx("input", { type: "password", placeholder: "\u30D1\u30B9\u30EF\u30FC\u30C9", value: password, onChange: e => setPassword(e.target.value), className: "border p-2 w-full mb-4" }), error && _jsx("div", { className: "text-red-500 mb-2", children: error }), _jsx("button", { type: "submit", className: "bg-blue-500 text-white px-4 py-2 rounded w-full", children: "\u30ED\u30B0\u30A4\u30F3" })] }) }));
};
export default Login;

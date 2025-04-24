import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const AuthChoice = ({ onGoogleLogin, onGuest }) => {
    return (_jsx("div", { className: "flex flex-col items-center justify-center min-h-screen bg-gray-100", children: _jsxs("div", { className: "bg-white p-6 rounded shadow-md w-80 flex flex-col gap-4", children: [_jsx("h2", { className: "text-xl mb-4", children: "\u30ED\u30B0\u30A4\u30F3\u65B9\u6CD5\u3092\u9078\u629E" }), _jsxs("button", { onClick: onGoogleLogin, className: "bg-red-500 text-white px-4 py-2 rounded w-full mb-2 flex items-center justify-center gap-2", children: [_jsx("img", { src: "/google-icon.png", alt: "Google", className: "w-5 h-5" }), "Google\u3067\u30ED\u30B0\u30A4\u30F3"] }), _jsx("button", { onClick: onGuest, className: "bg-gray-400 text-white px-4 py-2 rounded w-full", children: "\u30ED\u30B0\u30A4\u30F3\u305B\u305A\u306B\u59CB\u3081\u308B\uFF08\u30B2\u30B9\u30C8\uFF09" })] }) }));
};
export default AuthChoice;

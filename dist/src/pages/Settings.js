import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
const API_TYPES = [
    { label: 'Perplexity', value: 'perplexity' },
    { label: 'OpenAI', value: 'openai' },
];
const DEFAULT_GOAL = 'ネイティブスピーカーと、時事問題に関してネイティブと同じように深い議論ができること。';
const Settings = () => {
    const [apiType, setApiType] = useState('perplexity');
    const [goal, setGoal] = useState(() => localStorage.getItem('learning-goal') || DEFAULT_GOAL);
    useEffect(() => {
        // 初期値をメインプロセスに通知
        if (ipcRenderer) {
            ipcRenderer.invoke('set-api-type', apiType);
        }
    }, []);
    const handleChange = (e) => {
        const value = e.target.value;
        setApiType(value);
        if (ipcRenderer) {
            ipcRenderer.invoke('set-api-type', value);
        }
    };
    const handleGoalChange = (e) => {
        setGoal(e.target.value);
        localStorage.setItem('learning-goal', e.target.value);
    };
    return (_jsxs("div", { style: { padding: 24, paddingTop: 72 }, children: [_jsx("h2", { children: "API\u8A2D\u5B9A" }), _jsx("div", { children: API_TYPES.map((type) => (_jsxs("label", { style: { marginRight: 16 }, children: [_jsx("input", { type: "radio", name: "apiType", value: type.value, checked: apiType === type.value, onChange: handleChange }), type.label] }, type.value))) }), _jsxs("div", { style: { marginTop: 32 }, children: [_jsx("h2", { children: "\u5B66\u7FD2\u76EE\u6A19" }), _jsx("textarea", { value: goal, onChange: handleGoalChange, rows: 3, style: { width: '100%', minHeight: 60, fontSize: 16, padding: 8 }, placeholder: "\u4F8B: \u30CD\u30A4\u30C6\u30A3\u30D6\u30B9\u30D4\u30FC\u30AB\u30FC\u3068\u3001\u6642\u4E8B\u554F\u984C\u306B\u95A2\u3057\u3066\u30CD\u30A4\u30C6\u30A3\u30D6\u3068\u540C\u3058\u3088\u3046\u306B\u6DF1\u3044\u8B70\u8AD6\u304C\u3067\u304D\u308B\u3053\u3068\u3002" })] })] }));
};
export default Settings;

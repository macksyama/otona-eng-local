import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
const API_TYPES = [
    { label: 'Perplexity', value: 'perplexity' },
    { label: 'OpenAI', value: 'openai' },
];
const Settings = () => {
    const [apiType, setApiType] = useState('perplexity');
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
    return (_jsxs("div", { style: { padding: 24, paddingTop: 72 }, children: [_jsx("h2", { children: "API\u8A2D\u5B9A" }), _jsx("div", { children: API_TYPES.map((type) => (_jsxs("label", { style: { marginRight: 16 }, children: [_jsx("input", { type: "radio", name: "apiType", value: type.value, checked: apiType === type.value, onChange: handleChange }), type.label] }, type.value))) })] }));
};
export default Settings;

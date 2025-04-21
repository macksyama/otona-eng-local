"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
const API_TYPES = [
    { label: 'Perplexity', value: 'perplexity' },
    { label: 'OpenAI', value: 'openai' },
];
const Settings = () => {
    const [apiType, setApiType] = (0, react_1.useState)('perplexity');
    (0, react_1.useEffect)(() => {
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
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 24, paddingTop: 72 }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "API\u8A2D\u5B9A" }), (0, jsx_runtime_1.jsx)("div", { children: API_TYPES.map((type) => ((0, jsx_runtime_1.jsxs)("label", { style: { marginRight: 16 }, children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", name: "apiType", value: type.value, checked: apiType === type.value, onChange: handleChange }), type.label] }, type.value))) })] }));
};
exports.default = Settings;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("react-dom/client");
require("./index.css"); // TailwindCSS用
const App_1 = __importDefault(require("./pages/App"));
// React 18以降の新しいroot API
const root = (0, client_1.createRoot)(document.getElementById('root'));
root.render((0, jsx_runtime_1.jsx)(App_1.default, {}));

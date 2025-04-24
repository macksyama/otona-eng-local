import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import './index.css'; // TailwindCSS用
import App from './pages/App';
// React 18以降の新しいroot API
const root = createRoot(document.getElementById('root'));
root.render(_jsx(App, {}));

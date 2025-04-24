import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const Home = ({ setPage, setArticle }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // 記事整形プロンプト
    function buildCleanPrompt(article) {
        return `#Order\n以下の英語記事テキストから、本文以外の余分な情報（ナビゲーション、広告、フッター、著作権表示、関連記事リスト等）をすべて除去し、「記事本文」だけを抽出してください。本文そのものの内容・文は一切改変しないでください。\n\n#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):\n{\n  "cleaned_article": "（本文のみ）"\n}\n#Input\n${article}`;
    }
    // 記事入力後、LLMで整形→レッスン画面へ遷移
    const handleStart = async () => {
        setLoading(true);
        setError(null);
        const prompt = buildCleanPrompt(input);
        try {
            let cleaned = '';
            if (window.electronAPI?.ipcRenderer) {
                const res = await window.electronAPI.ipcRenderer.invoke('ask-ai', prompt);
                if (res) {
                    try {
                        const match = typeof res === 'string' ? res.match(/\{[\s\S]*\}/) : null;
                        const jsonStr = match ? match[0] : res;
                        const parsed = JSON.parse(jsonStr);
                        cleaned = parsed.cleaned_article || '';
                    }
                    catch { }
                }
            }
            else {
                // PWA/Web: /api/ask-ai経由で記事整形
                const res = await fetch('/api/ask-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: prompt, type: 'perplexity' })
                });
                const data = await res.json();
                let content = data?.choices?.[0]?.message?.content || '';
                try {
                    if (typeof content === 'string' && content.trim().startsWith('{')) {
                        const parsed = JSON.parse(content);
                        cleaned = parsed.cleaned_article || '';
                    }
                }
                catch { }
            }
            if (cleaned && cleaned.length > 50) {
                setArticle(cleaned);
            }
            else {
                setError('記事本文の抽出に失敗したため、元の入力で進みます');
                setArticle(input);
            }
        }
        catch (e) {
            setError('記事整形プロセスでエラーが発生したため、元の入力で進みます');
            setArticle(input);
        }
        setLoading(false);
        setPage('lesson');
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto py-12", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "\u8A18\u4E8B\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("textarea", { className: "w-full h-40 p-2 border rounded mb-4", value: input, onChange: e => setInput(e.target.value), placeholder: "\u3053\u3053\u306BBBC\u30CB\u30E5\u30FC\u30B9\u8A18\u4E8B\u3092\u8CBC\u308A\u4ED8\u3051\u3066\u304F\u3060\u3055\u3044" }), _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50", onClick: handleStart, disabled: !input.trim() || loading, children: loading ? '整形中...' : 'レッスン開始' }), error && _jsx("div", { className: "text-red-600 mt-2", children: error })] }));
};
export default Home;

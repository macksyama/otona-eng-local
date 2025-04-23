"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const history_1 = require("./history");
// カレンダー用ユーティリティ
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
function pad2(n) { return n < 10 ? '0' + n : n; }
const HistoryList = ({ setPage, reloadKey }) => {
    const histories = (0, history_1.getLessonHistories)().slice().reverse();
    // 学習日（YYYY-MM-DD）一覧
    const learnedDays = new Set(histories.map(h => new Date(h.timestamp).toISOString().slice(0, 10)));
    // カレンダー表示月のstate
    const today = new Date();
    const [calendarYear, setCalendarYear] = (0, react_1.useState)(today.getFullYear());
    const [calendarMonth, setCalendarMonth] = (0, react_1.useState)(today.getMonth()); // 0-indexed
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const todayStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
    // 月切り替え
    const prevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarYear(y => y - 1);
            setCalendarMonth(11);
        }
        else {
            setCalendarMonth(m => m - 1);
        }
    };
    const nextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarYear(y => y + 1);
            setCalendarMonth(0);
        }
        else {
            setCalendarMonth(m => m + 1);
        }
    };
    // 翌月ボタンの活性判定
    const isNextMonthActive = calendarYear < today.getFullYear() || (calendarYear === today.getFullYear() && calendarMonth < today.getMonth());
    // --- まとめ・アドバイス用 ---
    const [summary, setSummary] = (0, react_1.useState)('');
    const [loadingSummary, setLoadingSummary] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        async function fetchSummary() {
            setLoadingSummary(true);
            const recent = (0, history_1.getRecentLessonSummaries)(100);
            const goal = localStorage.getItem('learning-goal') || 'ネイティブスピーカーと、時事問題に関してネイティブと同じように深い議論ができること。';
            let result = '';
            if (window.electron?.invoke) {
                // Electron
                result = await window.electron.invoke('generate-history-summary', { histories: recent, goal });
            }
            else {
                // PWA/Web: /api/ask-ai経由でAIまとめ取得
                const prompt = `あなたは英語学習の専門家です。以下はユーザーの過去のレッスン履歴（設問・回答・AIフィードバック・日時）です。\n- 学習目標: ${goal}\n- 学んだ内容の要約\n- 得意な分野・苦手な分野・ミスの傾向\n- 目標達成度（学習目標に対してどの程度到達しているか、差分は何か）\n- 目標達成までの差分と、次のステップのアドバイス\nを日本語でカテゴリごとにJSON形式で返してください。各カテゴリはkey（例: summary, strengths, weaknesses, mistakes, achievement, advice）で分けてください。\n「次のステップのアドバイス」では、ユーザーに対する具体的な提案や練習方法、改善ポイントを必ず含めてください。まとめは必ずユーザーへの直接的なアドバイスとなるようにしてください。\n\n【履歴データ】\n${JSON.stringify(recent, null, 2)}`;
                const res = await fetch('/api/ask-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: prompt, type: 'perplexity' })
                });
                const data = await res.json();
                result = data?.choices?.[0]?.message?.content || '';
            }
            setSummary(result || 'まとめの取得に失敗しました');
            setLoadingSummary(false);
        }
        fetchSummary();
    }, [reloadKey]);
    // カテゴリごとに整形して表示（Markdown風記法対応・ノイズ除去）
    function renderSummary(summary) {
        if (!summary)
            return null;
        // 配列で返ってきて2番目がJSONオブジェクトの場合はそれを使う
        try {
            const arr = JSON.parse(summary);
            if (Array.isArray(arr) && typeof arr[1] === 'object' && arr[1] !== null) {
                const obj = arr[1];
                const keyToTitle = {
                    goal: '学習目標',
                    summary: '学んだ内容の要約',
                    strengths: '得意な分野',
                    weaknesses: '苦手な分野',
                    mistakes: 'ミスの傾向',
                    achievement: '目標達成度',
                    advice: '目標達成までの差分と次のステップのアドバイス',
                };
                return ((0, jsx_runtime_1.jsx)("div", { children: Object.entries(obj).map(([key, value], i) => ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("h3", { className: "mt-4 mb-1 text-lg font-bold text-green-800", children: keyToTitle[key] || key }), typeof value === 'object' && value !== null ? (Array.isArray(value) ? ((0, jsx_runtime_1.jsx)("ul", { className: "ml-6 list-disc", children: value.map((v, j) => (0, jsx_runtime_1.jsx)("li", { children: String(v) }, j)) })) : ((0, jsx_runtime_1.jsx)("ul", { className: "ml-6 list-disc", children: Object.entries(value).map(([k, v], idx) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsxs)("strong", { children: [k, ":"] }), " ", String(v)] }, idx))) }))) : ((0, jsx_runtime_1.jsx)("div", { style: { whiteSpace: 'pre-wrap' }, children: String(value) }))] }, key))) }));
            }
        }
        catch { }
        // 0や空行などノイズ除去
        const clean = summary
            .replace(/^0+$/gm, '') // 行頭の0のみ
            .replace(/^\s*\n/gm, '') // 空行
            .replace(/^-\s*0+\s*/gm, '-') // 箇条書きの頭に0が入る場合
            .replace(/\n{2,}/g, '\n'); // 連続改行を1つに
        // Markdown風パース
        const lines = clean.split(/\r?\n/);
        return ((0, jsx_runtime_1.jsx)("div", { children: lines.map((line, i) => {
                if (/^###?\s*\*\*(.+)\*\*/.test(line)) {
                    // ### **見出し**
                    const m = line.match(/^###?\s*\*\*(.+)\*\*/);
                    return (0, jsx_runtime_1.jsx)("h3", { className: "mt-4 mb-1 text-lg font-bold text-green-800", children: m ? m[1] : line }, i);
                }
                else if (/^###?\s*(.+)/.test(line)) {
                    // ### 見出し
                    const m = line.match(/^###?\s*(.+)/);
                    return (0, jsx_runtime_1.jsx)("h3", { className: "mt-4 mb-1 text-lg font-bold text-green-800", children: m ? m[1] : line }, i);
                }
                else if (/^\*\*(.+)\*\*/.test(line)) {
                    // **太字**（行全体）
                    const m = line.match(/^\*\*(.+)\*\*/);
                    return (0, jsx_runtime_1.jsx)("div", { className: "font-semibold text-green-700 mt-2", children: (0, jsx_runtime_1.jsx)("strong", { children: m ? m[1] : line }) }, i);
                }
                else if (/^---+$/.test(line)) {
                    // 区切り線
                    return (0, jsx_runtime_1.jsx)("hr", { className: "my-2" }, i);
                }
                else if (/^-\s+(.+)/.test(line)) {
                    // 箇条書き
                    const m = line.match(/^-\s+(.+)/);
                    // 箇条書き内の**太字**も太字化
                    const parts = (m ? m[1] : line).split(/(\*\*[^*]+\*\*)/g);
                    return (0, jsx_runtime_1.jsx)("li", { className: "ml-6 list-disc", children: parts.map((part, j) => part.startsWith('**') && part.endsWith('**') ? (0, jsx_runtime_1.jsx)("strong", { children: part.slice(2, -2) }, j) : part) }, i);
                }
                else if (/^\s*\d+\s*$/.test(line)) {
                    // 0や数字だけの行は無視
                    return null;
                }
                else if (/^\s*$/.test(line)) {
                    // 空行は無視
                    return null;
                }
                else {
                    // 通常テキスト：文中の**太字**も太字化
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return ((0, jsx_runtime_1.jsx)("div", { children: parts.map((part, j) => part.startsWith('**') && part.endsWith('**')
                            ? (0, jsx_runtime_1.jsx)("strong", { children: part.slice(2, -2) }, j)
                            : part) }, i));
                }
            }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6 bg-gray-50 min-h-screen", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold mb-4", children: "\u30EC\u30C3\u30B9\u30F3\u5C65\u6B74\u4E00\u89A7" }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between font-bold mb-2", children: [(0, jsx_runtime_1.jsx)("button", { className: "px-2 py-1", onClick: prevMonth, children: '＜' }), (0, jsx_runtime_1.jsxs)("span", { children: [calendarYear, "\u5E74", calendarMonth + 1, "\u6708\u306E\u5B66\u7FD2\u30AB\u30EC\u30F3\u30C0\u30FC"] }), (0, jsx_runtime_1.jsx)("button", { className: "px-2 py-1 disabled:text-gray-300", onClick: nextMonth, disabled: !isNextMonthActive, children: '＞' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-7 gap-1 bg-white rounded p-2 shadow text-center text-sm", children: [["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (0, jsx_runtime_1.jsx)("div", { className: "font-bold " + (i === 0 ? "text-red-500" : "text-gray-500"), children: d }, d)), Array(new Date(calendarYear, calendarMonth, 1).getDay()).fill(null).map((_, i) => (0, jsx_runtime_1.jsx)("div", {}, 'empty' + i)), days.map(day => {
                                const dateStr = `${calendarYear}-${pad2(calendarMonth + 1)}-${pad2(day)}`;
                                const learned = learnedDays.has(dateStr);
                                const isToday = dateStr === todayStr;
                                const weekDay = new Date(calendarYear, calendarMonth, day).getDay();
                                // 未来の日付判定
                                const isFuture = (calendarYear > today.getFullYear()) || (calendarYear === today.getFullYear() && calendarMonth > today.getMonth()) || (calendarYear === today.getFullYear() && calendarMonth === today.getMonth() && day > today.getDate());
                                let className = '';
                                if (isFuture) {
                                    className = 'text-gray-300';
                                }
                                else if (isToday && learned) {
                                    className = "inline-block w-7 h-7 rounded-full bg-blue-500 text-white border-2 border-red-500 flex items-center justify-center font-bold";
                                }
                                else if (isToday) {
                                    className = "inline-block w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold";
                                }
                                else if (learned) {
                                    className = "inline-block w-7 h-7 rounded-full border-2 border-red-500 flex items-center justify-center font-bold text-black";
                                }
                                else if (weekDay === 0) {
                                    className = "text-red-500";
                                }
                                return ((0, jsx_runtime_1.jsx)("div", { className: "py-1 flex items-center justify-center ", children: (0, jsx_runtime_1.jsx)("span", { className: className, children: day }) }, day));
                            })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded", children: [(0, jsx_runtime_1.jsx)("div", { className: "font-bold mb-2 text-green-700", children: "\u5B66\u3073\u306E\u307E\u3068\u3081\u30FB\u30A2\u30C9\u30D0\u30A4\u30B9" }), loadingSummary ? (0, jsx_runtime_1.jsx)("div", { children: "\u307E\u3068\u3081\u3092\u751F\u6210\u4E2D..." }) : (0, jsx_runtime_1.jsx)("div", { style: { whiteSpace: 'pre-wrap' }, children: renderSummary(summary) })] }), (0, jsx_runtime_1.jsx)("button", { className: "mb-4 px-4 py-2 bg-blue-600 text-white rounded", onClick: () => setPage('summary'), children: "\u30B5\u30DE\u30EA\u30FC\u306B\u623B\u308B" }), histories.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-gray-500", children: "\u5C65\u6B74\u304C\u3042\u308A\u307E\u305B\u3093\u3002" })) : ((0, jsx_runtime_1.jsx)("ul", { className: "space-y-4", children: histories.map((h, i) => ((0, jsx_runtime_1.jsxs)("li", { className: "bg-white rounded shadow p-4 flex flex-col", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500", children: new Date(h.timestamp).toLocaleString() }), (0, jsx_runtime_1.jsxs)("div", { className: "font-bold mt-1 mb-2", children: [h.article.slice(0, 40), h.article.length > 40 ? '...' : ''] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-blue-700 font-bold", children: ["\u5408\u8A08\u30B9\u30B3\u30A2: ", (() => {
                                    const s = h.summary?.scores || h.scores || h.summary?.totalScore || h.totalScore;
                                    if (typeof s === 'object' && s !== null) {
                                        return Object.values(s).reduce((a, b) => a + b, 0);
                                    }
                                    else if (typeof s === 'number') {
                                        return s;
                                    }
                                    else if (Array.isArray(h.answers)) {
                                        // answers配列のfeedback.scoreを合計
                                        return h.answers.reduce((sum, ans) => sum + (ans.feedback && typeof ans.feedback.score === 'number' ? ans.feedback.score : 0), 0);
                                    }
                                    else {
                                        return 0;
                                    }
                                })()] })] }, h.lessonId))) }))] }));
};
exports.default = HistoryList;

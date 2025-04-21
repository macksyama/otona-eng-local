"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryTest = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
// 簡易円グラフ（SVG）描画関数
function PieChart({ data }) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    let acc = 0;
    const colors = [
        '#60a5fa', // blue-400
        '#fbbf24', // yellow-400
        '#34d399', // green-400
        '#f87171', // red-400
        '#a78bfa', // purple-400
        '#f472b6', // pink-400
    ];
    const keys = Object.keys(data);
    return ((0, jsx_runtime_1.jsx)("svg", { width: "180", height: "180", viewBox: "0 0 36 36", className: "mx-auto", children: keys.map((key, i) => {
            const value = data[key];
            const start = acc / total * 100;
            acc += value;
            const end = acc / total * 100;
            const large = end - start > 50 ? 1 : 0;
            const r = 16;
            const startAngle = (start / 100) * 2 * Math.PI - Math.PI / 2;
            const endAngle = (end / 100) * 2 * Math.PI - Math.PI / 2;
            const x1 = 18 + r * Math.cos(startAngle);
            const y1 = 18 + r * Math.sin(startAngle);
            const x2 = 18 + r * Math.cos(endAngle);
            const y2 = 18 + r * Math.sin(endAngle);
            return ((0, jsx_runtime_1.jsx)("path", { d: `M18,18 L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`, fill: colors[i % colors.length], stroke: "#fff", strokeWidth: "0.5" }, key));
        }) }));
}
const Summary = ({ setPage, summaryData }) => {
    if (!summaryData) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-2xl mx-auto py-12 text-center", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold mb-4", children: "\u30EC\u30C3\u30B9\u30F3\u30B5\u30DE\u30EA\u30FC" }), (0, jsx_runtime_1.jsx)("p", { children: "AI\u306B\u3088\u308B\u30B5\u30DE\u30EA\u30FC\u3092\u751F\u6210\u4E2D..." })] }));
    }
    if (summaryData.error) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-2xl mx-auto py-12 text-center", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold mb-4", children: "\u30EC\u30C3\u30B9\u30F3\u30B5\u30DE\u30EA\u30FC" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-600", children: summaryData.error }), (0, jsx_runtime_1.jsx)("button", { className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded", onClick: () => setPage('home'), children: "\u30DB\u30FC\u30E0\u3078\u623B\u308B" })] }));
    }
    const { scores, score_chart, vocab_phrases, praise, improvement, advice } = summaryData;
    // 合計点数はscoresの合計値で再計算
    const totalScore = scores ? Object.values(scores).map(Number).reduce((a, b) => a + b, 0) : 0;
    // 円グラフデータ（未獲得点はグレーで追加）
    const chartData = { ...(score_chart || scores || {}) };
    if (totalScore < 100) {
        chartData['未獲得'] = 100 - totalScore;
    }
    const chartColors = [
        '#60a5fa', // blue-400
        '#fbbf24', // yellow-400
        '#34d399', // green-400
        '#f87171', // red-400
        '#a78bfa', // purple-400
        '#f472b6', // pink-400
        '#e5e7eb' // gray-200 for 未獲得
    ];
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-2xl mx-auto py-12", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold mb-4", children: "\u30EC\u30C3\u30B9\u30F3\u30B5\u30DE\u30EA\u30FC" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col md:flex-row items-center md:items-start gap-8 mb-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-shrink-0", children: [(0, jsx_runtime_1.jsx)("svg", { width: "180", height: "180", viewBox: "0 0 36 36", className: "mx-auto", children: Object.entries(chartData).reduce((acc, [key, value], i, arr) => {
                                    const total = Object.values(chartData).map(Number).reduce((a, b) => a + b, 0);
                                    const start = acc.accum / total * 100;
                                    acc.accum += Number(value);
                                    const end = acc.accum / total * 100;
                                    const large = end - start > 50 ? 1 : 0;
                                    const r = 16;
                                    const startAngle = (start / 100) * 2 * Math.PI - Math.PI / 2;
                                    const endAngle = (end / 100) * 2 * Math.PI - Math.PI / 2;
                                    const x1 = 18 + r * Math.cos(startAngle);
                                    const y1 = 18 + r * Math.sin(startAngle);
                                    const x2 = 18 + r * Math.cos(endAngle);
                                    const y2 = 18 + r * Math.sin(endAngle);
                                    acc.paths.push((0, jsx_runtime_1.jsx)("path", { d: `M18,18 L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`, fill: key === '未獲得' ? '#e5e7eb' : chartColors[i % (chartColors.length - 1)], stroke: "#fff", strokeWidth: "0.5" }, key));
                                    return acc;
                                }, { accum: 0, paths: [] }).paths }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-2 text-center font-bold text-lg", children: ["\u5408\u8A08\u70B9: ", (0, jsx_runtime_1.jsxs)("span", { className: "text-blue-600", children: [totalScore, " / 100"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold mb-2", children: "\u5404\u8A2D\u554F\u306E\u70B9\u6570" }), (0, jsx_runtime_1.jsx)("ul", { className: "mb-4", children: scores && Object.entries(scores).map(([k, v]) => ((0, jsx_runtime_1.jsxs)("li", { className: "flex justify-between border-b py-1", children: [(0, jsx_runtime_1.jsx)("span", { children: k }), (0, jsx_runtime_1.jsxs)("span", { className: "font-bold", children: [String(v), "\u70B9"] })] }, k))) }), (0, jsx_runtime_1.jsx)("h3", { className: "font-bold mb-2", children: "\u5B66\u3093\u3060\u5358\u8A9E\u30FB\u30D5\u30EC\u30FC\u30BA" }), (0, jsx_runtime_1.jsx)("ul", { className: "flex flex-wrap gap-2 mb-4", children: vocab_phrases && vocab_phrases.map((w, i) => ((0, jsx_runtime_1.jsxs)("li", { className: "bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm", children: [w.word, w.meaning ? `（${w.meaning}）` : ''] }, i))) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold mb-1", children: "\u826F\u304B\u3063\u305F\u70B9" }), (0, jsx_runtime_1.jsx)("p", { className: "bg-green-50 border-l-4 border-green-400 p-2 rounded text-green-800 whitespace-pre-line", children: praise })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold mb-1", children: "\u6539\u5584\u70B9" }), (0, jsx_runtime_1.jsx)("p", { className: "bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded text-yellow-800 whitespace-pre-line", children: improvement })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold mb-1", children: "\u30A2\u30C9\u30D0\u30A4\u30B9" }), (0, jsx_runtime_1.jsx)("p", { className: "bg-blue-50 border-l-4 border-blue-400 p-2 rounded text-blue-800 whitespace-pre-line", children: advice })] }), (0, jsx_runtime_1.jsx)("button", { className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded", onClick: () => setPage('home'), children: "\u30DB\u30FC\u30E0\u3078\u623B\u308B" })] }));
};
// テスト用ダミーデータ
const mockSummaryData = {
    total_score: 87,
    scores: {
        summary: 18,
        vocab1: 8,
        vocab2: 9,
        comprehension1: 14,
        comprehension2: 13,
        discussion: 25
    },
    score_chart: {
        summary: 18,
        vocab1: 8,
        vocab2: 9,
        comprehension1: 14,
        comprehension2: 13,
        discussion: 25
    },
    vocab_phrases: [
        "broker a deal",
        "ceasefire",
        "diplomatic efforts",
        "mediate",
        "stalemate"
    ],
    praise: "要約やディスカッションで自分の意見をしっかり述べられていました。語彙問題でも新しい単語を正しく使えていました。",
    improvement: "一部の設問で理由や根拠の説明がやや不足していました。もう少し具体的な例や背景を加えるとさらに良くなります。",
    advice: "今後も積極的に自分の考えを英語で表現し、知らない単語や表現はその都度調べて使ってみましょう。"
};
// テスト用ページとしてエクスポート
const SummaryTest = () => ((0, jsx_runtime_1.jsx)(Summary, { setPage: () => { }, summaryData: mockSummaryData }));
exports.SummaryTest = SummaryTest;
exports.default = Summary;

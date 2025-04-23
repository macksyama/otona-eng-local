import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { getLessonHistories } from './history';
// カレンダー用ユーティリティ
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
function pad2(n) { return n < 10 ? '0' + n : n; }
const HistoryList = ({ setPage }) => {
    const histories = getLessonHistories().slice().reverse();
    // 学習日（YYYY-MM-DD）一覧
    const learnedDays = new Set(histories.map(h => new Date(h.timestamp).toISOString().slice(0, 10)));
    // カレンダー表示月のstate
    const today = new Date();
    const [calendarYear, setCalendarYear] = useState(today.getFullYear());
    const [calendarMonth, setCalendarMonth] = useState(today.getMonth()); // 0-indexed
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
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "\u30EC\u30C3\u30B9\u30F3\u5C65\u6B74\u4E00\u89A7" }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center justify-between font-bold mb-2", children: [_jsx("button", { className: "px-2 py-1", onClick: prevMonth, children: '＜' }), _jsxs("span", { children: [calendarYear, "\u5E74", calendarMonth + 1, "\u6708\u306E\u5B66\u7FD2\u30AB\u30EC\u30F3\u30C0\u30FC"] }), _jsx("button", { className: "px-2 py-1 disabled:text-gray-300", onClick: nextMonth, disabled: !isNextMonthActive, children: '＞' })] }), _jsxs("div", { className: "grid grid-cols-7 gap-1 bg-white rounded p-2 shadow text-center text-sm", children: [["日", "月", "火", "水", "木", "金", "土"].map((d, i) => _jsx("div", { className: "font-bold " + (i === 0 ? "text-red-500" : "text-gray-500"), children: d }, d)), Array(new Date(calendarYear, calendarMonth, 1).getDay()).fill(null).map((_, i) => _jsx("div", {}, 'empty' + i)), days.map(day => {
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
                                return (_jsx("div", { className: "py-1 flex items-center justify-center ", children: _jsx("span", { className: className, children: day }) }, day));
                            })] })] }), _jsx("button", { className: "mb-4 px-4 py-2 bg-blue-600 text-white rounded", onClick: () => setPage('summary'), children: "\u30B5\u30DE\u30EA\u30FC\u306B\u623B\u308B" }), histories.length === 0 ? (_jsx("div", { className: "text-gray-500", children: "\u5C65\u6B74\u304C\u3042\u308A\u307E\u305B\u3093\u3002" })) : (_jsx("ul", { className: "space-y-4", children: histories.map((h, i) => (_jsxs("li", { className: "bg-white rounded shadow p-4 flex flex-col", children: [_jsx("div", { className: "text-sm text-gray-500", children: new Date(h.timestamp).toLocaleString() }), _jsxs("div", { className: "font-bold mt-1 mb-2", children: [h.article.slice(0, 40), h.article.length > 40 ? '...' : ''] }), _jsxs("div", { className: "text-blue-700 font-bold", children: ["\u5408\u8A08\u30B9\u30B3\u30A2: ", (() => {
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
export default HistoryList;

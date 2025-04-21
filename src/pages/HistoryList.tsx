import React, { useState } from 'react';
import { getLessonHistories, LessonHistory } from './history';

// カレンダー用ユーティリティ
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function pad2(n: number) { return n < 10 ? '0' + n : n; }

const HistoryList: React.FC<{ setPage: (page: import('./App').Page) => void }> = ({ setPage }) => {
  const histories: LessonHistory[] = getLessonHistories().slice().reverse();
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
    } else {
      setCalendarMonth(m => m - 1);
    }
  };
  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear(y => y + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  // 翌月ボタンの活性判定
  const isNextMonthActive = calendarYear < today.getFullYear() || (calendarYear === today.getFullYear() && calendarMonth < today.getMonth());

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">レッスン履歴一覧</h2>
      {/* カレンダー表示 */}
      <div className="mb-6">
        <div className="flex items-center justify-between font-bold mb-2">
          <button className="px-2 py-1" onClick={prevMonth}>{'＜'}</button>
          <span>{calendarYear}年{calendarMonth + 1}月の学習カレンダー</span>
          <button className="px-2 py-1 disabled:text-gray-300" onClick={nextMonth} disabled={!isNextMonthActive}>{'＞'}</button>
        </div>
        <div className="grid grid-cols-7 gap-1 bg-white rounded p-2 shadow text-center text-sm">
          {["日","月","火","水","木","金","土"].map((d, i) => <div key={d} className={"font-bold " + (i === 0 ? "text-red-500" : "text-gray-500")}>{d}</div>)}
          {Array(new Date(calendarYear, calendarMonth, 1).getDay()).fill(null).map((_, i) => <div key={'empty'+i}></div>)}
          {days.map(day => {
            const dateStr = `${calendarYear}-${pad2(calendarMonth + 1)}-${pad2(day)}`;
            const learned = learnedDays.has(dateStr);
            const isToday = dateStr === todayStr;
            const weekDay = new Date(calendarYear, calendarMonth, day).getDay();
            // 未来の日付判定
            const isFuture = (calendarYear > today.getFullYear()) || (calendarYear === today.getFullYear() && calendarMonth > today.getMonth()) || (calendarYear === today.getFullYear() && calendarMonth === today.getMonth() && day > today.getDate());
            let className = '';
            if (isFuture) {
              className = 'text-gray-300';
            } else if (isToday && learned) {
              className = "inline-block w-7 h-7 rounded-full bg-blue-500 text-white border-2 border-red-500 flex items-center justify-center font-bold";
            } else if (isToday) {
              className = "inline-block w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold";
            } else if (learned) {
              className = "inline-block w-7 h-7 rounded-full border-2 border-red-500 flex items-center justify-center font-bold text-black";
            } else if (weekDay === 0) {
              className = "text-red-500";
            }
            return (
              <div key={day} className={"py-1 flex items-center justify-center "}>
                <span className={className}>{day}</span>
              </div>
            );
          })}
        </div>
      </div>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setPage('summary')}>
        サマリーに戻る
      </button>
      {histories.length === 0 ? (
        <div className="text-gray-500">履歴がありません。</div>
      ) : (
        <ul className="space-y-4">
          {histories.map((h, i) => (
            <li key={h.lessonId} className="bg-white rounded shadow p-4 flex flex-col">
              <div className="text-sm text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
              <div className="font-bold mt-1 mb-2">{h.article.slice(0, 40)}{h.article.length > 40 ? '...' : ''}</div>
              <div className="text-blue-700 font-bold">
                合計スコア: {
                  (() => {
                    const s = h.summary?.scores || (h as any).scores || h.summary?.totalScore || (h as any).totalScore;
                    if (typeof s === 'object' && s !== null) {
                      return (Object.values(s) as number[]).reduce((a, b) => a + b, 0);
                    } else if (typeof s === 'number') {
                      return s;
                    } else if (Array.isArray(h.answers)) {
                      // answers配列のfeedback.scoreを合計
                      return h.answers.reduce((sum, ans) => sum + (ans.feedback && typeof ans.feedback.score === 'number' ? ans.feedback.score : 0), 0);
                    } else {
                      return 0;
                    }
                  })()
                }
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryList; 
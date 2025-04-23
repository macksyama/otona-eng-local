import React, { useState, useEffect } from 'react';
import { getLessonHistories, LessonHistory, getRecentLessonSummaries } from './history';
import Summary from './Summary';

// カレンダー用ユーティリティ
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function pad2(n: number) { return n < 10 ? '0' + n : n; }

// 履歴削除機能のON/OFF（trueで有効、falseで無効）
const ENABLE_HISTORY_DELETE = true;

interface HistoryListProps {
  setPage: (page: import('./App').Page) => void;
  reloadKey?: any;
  showBackToSummary?: boolean;
}

const HistoryList: React.FC<HistoryListProps> = ({ setPage, reloadKey, showBackToSummary = true }) => {
  const [histories, setHistories] = useState<LessonHistory[]>(() => getLessonHistories().slice().reverse());
  const [editMode, setEditMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSummary, setModalSummary] = useState<any>(null);
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

  // --- まとめ・アドバイス用 ---
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  useEffect(() => {
    async function fetchSummary() {
      setLoadingSummary(true);
      const recent = getRecentLessonSummaries(100);
      const goal = localStorage.getItem('learning-goal') || 'ネイティブスピーカーと、時事問題に関してネイティブと同じように深い議論ができること。';
      let result = '';
      if ((window as any).electron?.invoke) {
        // Electron
        result = await (window as any).electron.invoke('generate-history-summary', { histories: recent, goal });
      } else {
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
  function renderSummary(summary: string) {
    if (!summary) return null;
    // 配列で返ってきて2番目がJSONオブジェクトの場合はそれを使う
    try {
      const arr = JSON.parse(summary);
      if (Array.isArray(arr) && typeof arr[1] === 'object' && arr[1] !== null) {
        const obj = arr[1];
        const keyToTitle: Record<string, string> = {
          goal: '学習目標',
          summary: '学んだ内容の要約',
          strengths: '得意な分野',
          weaknesses: '苦手な分野',
          mistakes: 'ミスの傾向',
          achievement: '目標達成度',
          advice: '目標達成までの差分と次のステップのアドバイス',
        };
        // 本文中の**太字**もすべて太字化
        const boldify = (text: string) => {
          const parts = text.split(/(\*\*[^*]+\*\*)/g);
          return parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          );
        };
        return (
          <div>
            {Object.entries(obj).map(([key, value], i) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <h3 className="mt-4 mb-1 text-lg font-bold text-green-800">{keyToTitle[key] || key}</h3>
                {typeof value === 'object' && value !== null ? (
                  Array.isArray(value) ? (
                    <ul className="ml-6 list-disc">
                      {value.map((v, j) => <li key={j}>{typeof v === 'string' ? boldify(v) : String(v)}</li>)}
                    </ul>
                  ) : (
                    <ul className="ml-6 list-disc">
                      {Object.entries(value).map(([k, v], idx) => (
                        <li key={idx}><strong>{k}:</strong> {typeof v === 'string' ? boldify(v) : String(v)}</li>
                      ))}
                    </ul>
                  )
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{typeof value === 'string' ? boldify(value) : String(value)}</div>
                )}
              </div>
            ))}
          </div>
        );
      }
    } catch {}
    // 0や空行などノイズ除去
    const clean = summary
      .replace(/^0+$/gm, '') // 行頭の0のみ
      .replace(/^\s*\n/gm, '') // 空行
      .replace(/^-\s*0+\s*/gm, '-') // 箇条書きの頭に0が入る場合
      .replace(/\n{2,}/g, '\n'); // 連続改行を1つに
    // Markdown風パース
    const lines = clean.split(/\r?\n/);
    return (
      <div>
        {lines.map((line, i) => {
          if (/^###?\s*\*\*(.+)\*\*/.test(line)) {
            // ### **見出し**
            const m = line.match(/^###?\s*\*\*(.+)\*\*/);
            return <h3 key={i} className="mt-4 mb-1 text-lg font-bold text-green-800">{m ? m[1] : line}</h3>;
          } else if (/^###?\s*(.+)/.test(line)) {
            // ### 見出し
            const m = line.match(/^###?\s*(.+)/);
            return <h3 key={i} className="mt-4 mb-1 text-lg font-bold text-green-800">{m ? m[1] : line}</h3>;
          } else if (/^\*\*(.+)\*\*/.test(line)) {
            // **太字**（行全体）
            const m = line.match(/^\*\*(.+)\*\*/);
            return <div key={i} className="font-semibold text-green-700 mt-2"><strong>{m ? m[1] : line}</strong></div>;
          } else if (/^---+$/.test(line)) {
            // 区切り線
            return <hr key={i} className="my-2" />;
          } else if (/^-\s+(.+)/.test(line)) {
            // 箇条書き
            const m = line.match(/^-\s+(.+)/);
            // 箇条書き内の**太字**も太字化
            const parts = (m ? m[1] : line).split(/(\*\*[^*]+\*\*)/g);
            return <li key={i} className="ml-6 list-disc">{parts.map((part, j) => part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part)}</li>;
          } else if (/^\s*\d+\s*$/.test(line)) {
            // 0や数字だけの行は無視
            return null;
          } else if (/^\s*$/.test(line)) {
            // 空行は無視
            return null;
          } else {
            // 通常テキスト：文中の**太字**も太字化
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
              <div key={i}>
                {parts.map((part, j) =>
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={j}>{part.slice(2, -2)}</strong>
                    : part
                )}
              </div>
            );
          }
        })}
      </div>
    );
  }

  // 履歴削除処理
  const handleDelete = (lessonId: string) => {
    if (!window.confirm('この履歴を削除しますか？')) return;
    const all = getLessonHistories();
    const filtered = all.filter(h => h.lessonId !== lessonId);
    localStorage.setItem('lessonHistories', JSON.stringify(filtered));
    setHistories(filtered.slice().reverse());
  };

  // 履歴詳細モーダルを開く
  const handleOpenModal = (h: LessonHistory) => {
    setModalSummary(h);
    setModalOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold mr-4">レッスン履歴一覧</h2>
        <button
          className={`px-3 py-1 rounded ${editMode ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setEditMode(e => !e)}
        >
          {editMode ? '編集モード終了' : '編集'}
        </button>
      </div>
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
      {/* まとめ・アドバイス表示 */}
      <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
        <div className="font-bold mb-2 text-green-700">学びのまとめ・アドバイス</div>
        {loadingSummary ? <div>まとめを生成中...</div> : <div style={{ whiteSpace: 'pre-wrap' }}>{renderSummary(summary)}</div>}
      </div>
      {showBackToSummary && (
        <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setPage('summary')}>
          サマリーに戻る
        </button>
      )}
      {histories.length === 0 ? (
        <div className="text-gray-500">履歴がありません。</div>
      ) : (
        <ul className="space-y-4">
          {histories.map((h, i) => (
            <li
              key={h.lessonId}
              className="bg-white rounded shadow p-4 flex flex-col relative cursor-pointer hover:bg-blue-50"
              onClick={() => !editMode && handleOpenModal(h)}
            >
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
              {editMode && (
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(h.lessonId); }}
                  title="この履歴を削除"
                  style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {/* Heroicons minus-circle SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="28" height="28">
                    <circle cx="12" cy="12" r="10" fill="#f87171" />
                    <rect x="8" y="11" width="8" height="2" rx="1" fill="#fff" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* 履歴詳細モーダル */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative p-6 overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-6 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              onClick={() => setModalOpen(false)}
              aria-label="閉じる"
            >
              ×
            </button>
            <Summary setPage={() => {}} summaryData={modalSummary} isModal={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryList; 
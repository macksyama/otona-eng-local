import React from 'react';
import { getLessonHistories, LessonHistory } from './history';

const HistoryList: React.FC<{ setPage: (page: import('./App').Page) => void }> = ({ setPage }) => {
  const histories: LessonHistory[] = getLessonHistories().slice().reverse();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">レッスン履歴一覧</h2>
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
              <div className="text-blue-700 font-bold">合計スコア: {h.summary?.scores ? (Object.values(h.summary.scores) as number[]).reduce((a, b) => a + b, 0) : '-'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryList; 
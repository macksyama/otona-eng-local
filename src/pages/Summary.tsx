import React from 'react';
import type { Page } from './App';

interface Props {
  setPage: (page: Page) => void;
  summaryData: any;
  isModal?: boolean;
}

// 簡易円グラフ（SVG）描画関数
function PieChart({ data }: { data: Record<string, number> }) {
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
  return (
    <svg width="180" height="180" viewBox="0 0 36 36" className="mx-auto">
      {keys.map((key, i) => {
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
        return (
          <path
            key={key}
            d={`M18,18 L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
            fill={colors[i % colors.length]}
            stroke="#fff"
            strokeWidth="0.5"
          >
          </path>
        );
      })}
    </svg>
  );
}

const Summary: React.FC<Props> = ({ setPage, summaryData, isModal }) => {
  if (!summaryData) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">レッスンサマリー</h2>
        <p>AIによるサマリーを生成中...</p>
      </div>
    );
  }
  if (summaryData.error) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">レッスンサマリー</h2>
        <p className="text-red-600">{summaryData.error}</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setPage('home')}>
          ホームへ戻る
        </button>
      </div>
    );
  }
  // summaryData.summaryがあればそれを使う
  const data = summaryData.summary ? summaryData.summary : summaryData;
  let { scores, score_chart, vocab_phrases, praise, improvement, advice } = data;
  // 合計点数・各設問点数の算出
  let totalScore: number = 0;
  // answers配列から計算（scoresがなければ）
  if (!scores && Array.isArray(summaryData.answers)) {
    scores = {};
    let idx = 0;
    for (const ans of summaryData.answers) {
      if (ans.feedback && typeof ans.feedback.score === 'number') {
        let key = '';
        if (idx === 0) key = 'summary';
        else if (idx === 1) key = 'vocab1';
        else if (idx === 2) key = 'vocab2';
        else if (idx === 3) key = 'comprehension1';
        else if (idx === 4) key = 'comprehension2';
        else if (idx === 5) key = 'discussion';
        scores[key] = ans.feedback.score;
        idx++;
      }
    }
  }
  totalScore = scores ? (Object.values(scores).map(Number) as number[]).reduce((a, b) => a + b, 0) : 0;
  // 円グラフデータ（未獲得点はグレーで追加）
  const chartData = { ...(data.score_chart || scores || {}) };
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
    '#e5e7eb'  // gray-200 for 未獲得
  ];
  // 設問ごとの最大点
  const maxScores: Record<string, number> = {
    summary: 15,
    vocab1: 10,
    vocab2: 10,
    comprehension1: 15,
    comprehension2: 15,
    discussion: 30,
  };
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-2xl font-bold mb-4">レッスンサマリー</h2>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
        <div className="flex-shrink-0">
          <svg width="180" height="180" viewBox="0 0 36 36" className="mx-auto">
            {Object.entries(chartData).reduce((acc: {accum: number, paths: React.ReactNode[]}, [key, value], i, arr) => {
              const total: number = (Object.values(chartData).map(Number) as number[]).reduce((a, b) => a + b, 0);
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
              acc.paths.push(
                <path
                  key={key}
                  d={`M18,18 L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
                  fill={key === '未獲得' ? '#e5e7eb' : chartColors[i % (chartColors.length - 1)]}
                  stroke="#fff"
                  strokeWidth="0.5"
                />
              );
              return acc;
            }, {accum: 0, paths: [] as React.ReactNode[]}).paths}
          </svg>
          <div className="mt-2 text-center font-bold text-lg">合計点: <span className="text-blue-600">{totalScore} / 100</span></div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold mb-2">各設問の点数</h3>
          <ul className="mb-4">
            {scores && Object.entries(scores).map(([k, v]) => (
              <li key={k} className="flex justify-between border-b py-1">
                <span>{k}</span>
                <span className="font-bold">{String(v)}点 / {maxScores[k] ?? '-'}点</span>
              </li>
            ))}
          </ul>
          <h3 className="font-bold mb-2">学んだ単語・フレーズ</h3>
          <ul className="flex flex-wrap gap-2 mb-4">
            {vocab_phrases && vocab_phrases.map((w: any, i: number) => (
              <li key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{w.word}{w.meaning ? `（${w.meaning}）` : ''}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-bold mb-1">良かった点</h3>
        <p className="bg-green-50 border-l-4 border-green-400 p-2 rounded text-green-800 whitespace-pre-line">{praise}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-bold mb-1">改善点</h3>
        <p className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded text-yellow-800 whitespace-pre-line">{improvement}</p>
      </div>
      <div className="mb-8">
        <h3 className="font-bold mb-1">アドバイス</h3>
        <p className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded text-blue-800 whitespace-pre-line">{advice}</p>
      </div>
      {!isModal && (
        <>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setPage('news')}>
            ホームへ戻る
          </button>
          <button className="mt-4 ml-4 px-4 py-2 bg-gray-600 text-white rounded" onClick={() => setPage('history')}>
            履歴一覧へ
          </button>
        </>
      )}
    </div>
  );
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
const SummaryTest = () => (
  <Summary setPage={() => {}} summaryData={mockSummaryData} />
);

export default Summary;
export { SummaryTest }; 
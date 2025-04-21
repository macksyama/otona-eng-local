// ユーザーのレッスン履歴型
export interface LessonHistory {
  lessonId: string; // 例: new Date().toISOString()
  timestamp: string;
  article: string;
  questions: any;
  answers: Array<{ questionType: string; answer: string; feedback: any }>;
  summary: any;
}

// 履歴を保存
export function saveLessonHistory(history: LessonHistory) {
  const all = getLessonHistories();
  all.push(history);
  localStorage.setItem('lessonHistories', JSON.stringify(all));
}

// 履歴一覧を取得（新しい順）
export function getLessonHistories(): LessonHistory[] {
  const raw = localStorage.getItem('lessonHistories');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
} 
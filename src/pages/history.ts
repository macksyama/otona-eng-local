// レッスン履歴の型定義
export type LessonHistory = {
  lessonId: string;
  timestamp: number;
  article: string;
  summary?: {
    scores?: Record<string, number>;
    totalScore?: number;
  };
  answers?: Array<{
    feedback?: {
      score?: number;
    };
  }>;
  scores?: Record<string, number>;
  totalScore?: number;
};

// ダミーの履歴データを返す関数
export function getLessonHistories(): LessonHistory[] {
  return [];
} 
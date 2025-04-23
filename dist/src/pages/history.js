"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveLessonHistory = saveLessonHistory;
exports.getLessonHistories = getLessonHistories;
exports.getRecentLessonHistories = getRecentLessonHistories;
exports.getRecentLessonSummaries = getRecentLessonSummaries;
// 履歴を保存
function saveLessonHistory(history) {
    const all = getLessonHistories();
    all.push(history);
    localStorage.setItem('lessonHistories', JSON.stringify(all));
}
// 履歴一覧を取得（新しい順）
function getLessonHistories() {
    const raw = localStorage.getItem('lessonHistories');
    if (!raw)
        return [];
    try {
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
// 直近300件（新しい順）を取得（記事本文は除外）
function getRecentLessonHistories() {
    return getLessonHistories()
        .slice(-300)
        .reverse()
        .map(({ article, ...rest }) => rest);
}
// サマリーページに表示する内容＋日時を返す（直近N件、新しい順、記事本文除外）
function getRecentLessonSummaries(n = 1) {
    return getLessonHistories()
        .slice(-n)
        .reverse()
        .map(({ summary, timestamp }) => {
        if (!summary)
            return { timestamp };
        const { scores, score_chart, vocab_phrases, praise, improvement, advice } = summary;
        return { timestamp, scores, score_chart, vocab_phrases, praise, improvement, advice };
    });
}

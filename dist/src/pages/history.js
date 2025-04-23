"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveLessonHistory = saveLessonHistory;
exports.getLessonHistories = getLessonHistories;
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

// 履歴を保存
export function saveLessonHistory(history) {
    const all = getLessonHistories();
    all.push(history);
    localStorage.setItem('lessonHistories', JSON.stringify(all));
}
// 履歴一覧を取得（新しい順）
export function getLessonHistories() {
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

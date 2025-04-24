import { saveHistory as saveFirestoreHistory, getHistories as getFirestoreHistories, deleteHistory as deleteFirestoreHistory } from './firestoreHistory';
import { saveLessonHistory, getLessonHistories } from '../pages/history';
// 保存先を判定
function isGoogleLogin() {
    return localStorage.getItem('otona-auth') === 'google';
}
// 履歴を保存
export async function saveHistory(history) {
    if (isGoogleLogin()) {
        await saveFirestoreHistory(history);
    }
    else {
        saveLessonHistory(history);
    }
}
// 履歴一覧を取得
export async function getHistories() {
    if (isGoogleLogin()) {
        return await getFirestoreHistories();
    }
    else {
        return getLessonHistories();
    }
}
// Firestoreのみ削除API（localStorageはhistory.tsで個別に対応）
export async function deleteHistory(lessonId) {
    if (isGoogleLogin()) {
        await deleteFirestoreHistory(lessonId);
    }
    else {
        // localStorage側の削除は未実装。必要ならhistory.tsに追加。
        throw new Error('ゲストモードでは履歴削除は未実装です');
    }
}
// 初回Googleログイン時のみlocalStorage→Firestore一括移行
export async function migrateLocalToFirestore() {
    const already = localStorage.getItem('otona-migrated');
    if (already === '1')
        return; // 既に移行済み
    const localHistories = getLessonHistories();
    if (localHistories.length === 0) {
        localStorage.setItem('otona-migrated', '1');
        return;
    }
    for (const h of localHistories) {
        try {
            await saveFirestoreHistory(h);
        }
        catch { }
    }
    localStorage.removeItem('lessonHistories');
    localStorage.setItem('otona-migrated', '1');
}

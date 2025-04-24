import { db, auth } from '../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
// 履歴を保存
export async function saveHistory(history) {
    const user = auth.currentUser;
    if (!user)
        throw new Error('未ログイン');
    const ref = doc(db, `users/${user.uid}/histories/${history.lessonId}`);
    await setDoc(ref, history);
}
// 履歴一覧を取得
export async function getHistories() {
    const user = auth.currentUser;
    if (!user)
        throw new Error('未ログイン');
    const col = collection(db, `users/${user.uid}/histories`);
    const snap = await getDocs(col);
    return snap.docs.map(doc => doc.data());
}
// 履歴を削除
export async function deleteHistory(lessonId) {
    const user = auth.currentUser;
    if (!user)
        throw new Error('未ログイン');
    const ref = doc(db, `users/${user.uid}/histories/${lessonId}`);
    await deleteDoc(ref);
}

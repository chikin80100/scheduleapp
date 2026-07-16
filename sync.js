(() => {
"use strict";

/* ============================================================
   TTSync — Firestoreを使った端末間データ同期
   ============================================================
   使い方の考え方：
   - 「同期コード」という6桁のコードを1つ作る
   - 別の端末で同じコードを入力すると、同じデータ（Firestore上の
     同じドキュメント）を見るようになる
   - どちらかの端末でデータを変更すると、自動的にもう片方にも反映される
   ============================================================ */

const SYNC_CODE_KEY = "jikanwari.syncCode";

let db = null;
let unsubscribe = null;
let pushTimer = null;
let applyingRemote = false; // 受信直後の内容をそのまま送り返さないためのフラグ

function ensureFirebase() {
  if (db) return db;
  if (typeof firebase === "undefined") {
    console.warn("Firebase SDK が読み込まれていません（index.htmlのscriptタグを確認してください）");
    return null;
  }
  const config = window.FIREBASE_CONFIG;
  if (!config || config.apiKey === "ここにapiKeyを貼り付け") {
    console.warn("firebase-config.js がまだ設定されていません");
    return null;
  }
  if (!firebase.apps.length) firebase.initializeApp(config);
  db = firebase.firestore();
  return db;
}

function isConfigured() {
  const config = window.FIREBASE_CONFIG;
  return !!(config && config.apiKey && config.apiKey !== "ここにapiKeyを貼り付け");
}

function getCode() {
  return localStorage.getItem(SYNC_CODE_KEY) || "";
}

function setCode(code) {
  localStorage.setItem(SYNC_CODE_KEY, code);
}

function clearCode() {
  localStorage.removeItem(SYNC_CODE_KEY);
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
}

// 読みやすい6桁コード（例: A3F9K2）を作る。まぎらわしい文字（0/O, 1/I）は除外
function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// state を Firestore に保存（連続呼び出しは1回にまとめる＝デバウンス）
function push(stateSnapshot) {
  const code = getCode();
  if (!code) return;
  const database = ensureFirebase();
  if (!database) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    if (applyingRemote) return; // 直前に受信した内容の書き戻しを防ぐ
    database.collection("timetables").doc(code).set({
      data: stateSnapshot,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.error("Firestore 保存エラー", err));
  }, 500);
}

// 初回1回だけ取得
async function fetchOnce(code) {
  const database = ensureFirebase();
  if (!database) return null;
  const doc = await database.collection("timetables").doc(code).get();
  if (!doc.exists) return null;
  const payload = doc.data();
  return payload ? payload.data : null;
}

// リアルタイム購読開始（以後、他端末の変更を自動で受け取る）
function subscribe(code, onRemoteUpdate) {
  const database = ensureFirebase();
  if (!database) return;
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  unsubscribe = database.collection("timetables").doc(code)
    .onSnapshot(snap => {
      if (!snap.exists) return;
      const payload = snap.data();
      if (!payload || !payload.data) return;
      applyingRemote = true;
      onRemoteUpdate(payload.data);
      setTimeout(() => { applyingRemote = false; }, 400);
    }, err => console.error("Firestore 購読エラー", err));
}

window.TTSync = { isConfigured, getCode, setCode, clearCode, randomCode, push, fetchOnce, subscribe };
})();

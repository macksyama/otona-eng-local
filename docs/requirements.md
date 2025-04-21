# おとなの学び直し時事英語アプリケーション 仕様書（最新版）

## 1. 概要
- BBC等の英語ニュース記事を題材に、AI（LLM）との対話を通じて英語力を高めるElectronアプリ。
- ユーザーは記事を入力し、AIが自動生成した設問にチャット形式で順に回答。AIが各回答を評価・フィードバックする。
- レッスン終了後、サマリー画面で合計点・各設問の点数・学んだ語彙・フィードバックを表示。

---

## 2. 画面構成・遷移

### 2.1 ホーム画面
- ユーザーが任意の英語記事をテキストで入力
- 「レッスン開始」ボタンで、**AIによる記事整形プロセス（余分な情報の除去）を自動実行**
- 整形後の本文のみを使ってレッスン画面へ遷移

### 2.2 レッスン画面
- 上部：入力記事の全文表示
- 下部：AIとのチャットUI（設問・回答・フィードバックのやり取り）
- 設問は要約・語彙・読解・ディスカッションの順に出題
- 各設問の回答後、AIがスコア・フィードバックを返す
- ディスカッション評価後のみ「Summary」ボタンが表示される

### 2.3 サマリーページ
- 合計点数（各設問の点数合計）を大きく表示
- 各設問ごとの点数を円グラフで可視化（未獲得点はグレー表示）
- 学んだ単語・フレーズ（英語＋日本語訳）をリスト表示
- 良かった点・改善点・アドバイスを日本語で表示
- 「ホームへ戻る」ボタンでホーム画面へ

---

## 3. 設問構成・出題順

1. **要約問題**（Summary）…1問（15点）
2. **語彙問題**（Vocab）…2問（各10点）
3. **読解問題**（Comprehension）…2問（各15点）
4. **ディスカッション問題**（Discussion）…1問（35点、2往復）

---

## 4. 設問生成・出題仕様

### 4.1 設問生成
- ユーザーが記事を入力した時点で、AI（LLM）に以下の形式で設問生成プロンプトを送信し、全設問を一括で生成

#### 設問生成プロンプト例
```
#Order
From the following article, generate the following:
1. One summary question (in Japanese, e.g. "この記事を要約してください。")
2. Two different English words (not too easy or too difficult, suitable for upper-intermediate learners) for vocabulary sentence tasks. The two words must be different.
3. Two open-ended comprehension questions about the article.
4. One discussion point related to the article's theme.

#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):
{
  "summary": {"question": "この記事を要約してください。"},
  "vocab": [
    {"word": "XXXX", "task": "Compose a sentence using the word 'XXXX'."},
    {"word": "YYYY", "task": "Compose a sentence using the word 'YYYY'."}
  ],
  "comprehension": [
    {"question": "What is ...?"},
    {"question": "Why did ...?"}
  ],
  "discussion": {"point": "Discuss the implications of ..."}
}
#Input
Article: ...（記事本文）...
```

---

### 4.2 設問出題・回答・評価フロー

- 設問ごとにAIがチャットで出題
- ユーザーが回答
- 回答送信後、AIに評価プロンプトを送信し、スコア・間違い・修正例・アドバイス・模範解答（全て英語）をJSONで返させる
- フィードバックをチャットに表示し、次の設問へ自動で進む
- ディスカッションのみ2往復＋AI評価
- **記事入力直後、AIが余分な情報（ナビゲーション・広告・フッター等）を除去し、本文のみを抽出するプロセスを自動実行。以降の全プロンプト・表示でこの整形後本文を利用**

---

## 5. サマリー生成・表示仕様

### 5.1 サマリー生成タイミング
- ディスカッション評価後、「Summary」ボタンが表示される
- ユーザーが「Summary」ボタンを押したタイミングで、AIにサマリー生成プロンプトを送信

### 5.2 サマリー生成プロンプト例
```
#Order
You are an English teacher. Please summarize the following English lesson for the student.

#Input
- Article: ...（記事本文）...
- Lesson log: ...（AIとユーザーの全やり取り・評価を時系列で挿入）...

#Task
- Output a summary of the lesson in JSON ONLY (no explanation, no code block, no extra text).
- The JSON must include the following fields:
  1. "vocab_phrases": 学んだキーワード・フレーズ5つ（英語＋日本語訳、必ず5つ返す）例: [{"word": "broker a deal", "meaning": "取引をまとめる"}, ...]
  2. "praise": ユーザーの回答で良かった点（日本語で2-3文）
  3. "improvement": もっと頑張るべき点（日本語で2-3文）
  4. "advice": 建設的なアドバイス（日本語で1-2文）

#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):
{
  "vocab_phrases": [
    {"word": "broker a deal", "meaning": "取引をまとめる"},
    {"word": "ceasefire", "meaning": "停戦"},
    {"word": "diplomatic efforts", "meaning": "外交的努力"},
    {"word": "mediate", "meaning": "仲介する"},
    {"word": "stalemate", "meaning": "行き詰まり"}
  ],
  "praise": "要約やディスカッションで自分の意見をしっかり述べられていました。語彙問題でも新しい単語を正しく使えていました。",
  "improvement": "一部の設問で理由や根拠の説明がやや不足していました。もう少し具体的な例や背景を加えるとさらに良くなります。",
  "advice": "今後も積極的に自分の考えを英語で表現し、知らない単語や表現はその都度調べて使ってみましょう。"
}
```

### 5.3 サマリーページUI
- 合計点数は`scores`の合計値をフロントエンドで再計算して表示
- 円グラフは獲得点のみ色付き、未獲得点（100点-合計点）はグレーで表示
- 学んだ単語・フレーズは英語＋日本語訳でリスト表示
- 良かった点・改善点・アドバイスは日本語で表示

---

## 6. 技術仕様

- フロントエンド：React + TypeScript + TailwindCSS + Electron
- バックエンド：Electron Main Process
- LLM API：Perplexity APIまたはOpenAI API（他のLLMでも同等のプロンプト・レスポンスで再現可能）
- 記事データ・進捗はメモリ上で管理

---

## 7. 注意事項・LLM利用時の厳守事項

- **全てのAI応答はSTRICTLY JSON ONLYで返すこと。説明文やコードブロック、余計なテキストは一切含めないこと。**
- パース失敗時は生データやエラーメッセージをUIに表示
- 深掘り質問はユーザーの1回目回答内容に応じて毎回異なるものを生成すること

ご不明点や追加要件があればご指示ください。

---

## 8. 記事整形プロセス（AIによる本文抽出）

- ユーザーが記事を入力した直後、AI（LLM）に以下のプロンプトで本文抽出を依頼
- 余分な情報（ナビゲーション、広告、フッター、著作権表示、関連記事リスト等）をすべて除去し、本文のみをJSONで返す
- 本文そのものの内容・文は一切改変しない
- 整形後の本文をレッスン画面上部や全プロンプトで利用

### 記事整形プロンプト例
```
#Order
以下の英語記事テキストから、本文以外の余分な情報（ナビゲーション、広告、フッター、著作権表示、関連記事リスト等）をすべて除去し、「記事本文」だけを抽出してください。本文そのものの内容・文は一切改変しないでください。

#Output format (STRICTLY JSON ONLY, NO explanation, NO code block, NO extra text. Output ONLY valid JSON object!):
{
  "cleaned_article": "（本文のみ）"
}
#Input
{ユーザーが貼り付けた記事全文}
```
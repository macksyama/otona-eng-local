# おとなの学び直し時事英語アプリケーション

## 概要
BBC等の英語ニュース記事を題材に、AI（LLM）との対話を通じて英語力を高めるElectronアプリです。
AIが自動で設問（要約・語彙・読解・ディスカッション）を生成し、ユーザーの回答を評価・フィードバックします。
レッスン終了後はサマリー画面で合計点・各設問の点数・学んだ語彙・フィードバックを表示します。

## セットアップ
```sh
npm install
```

## 開発
```sh
# React/Electronアプリの起動
npm run dev
```

## テスト
```sh
npm test
```

## ビルド
```sh
npm run build
```

## ディレクトリ構成
- `src/` ... アプリ本体
- `public/` ... HTMLテンプレート
- `docs/` ... 仕様書

## 主な技術
- Electron
- React + TypeScript
- TailwindCSS
- OpenAI/Perplexity API
- **PWA対応（Vercel等でデプロイ可能）**

## 主な機能

- 英語ニュース記事を入力すると、AIが自動で設問（要約・語彙・読解・ディスカッション）を生成
- 各設問にチャット形式で回答、AIがスコア・フィードバック（英語）を返す
- レッスン終了後、サマリー画面で合計点・各設問の点数（「3点 / 15点」形式）・学んだ語彙（英語＋日本語訳）・良かった点・改善点・アドバイス（日本語）を表示
- 設問ごとの配点：summary 15点、vocab1/2 各10点、comprehension1/2 各15点、discussion 30点（合計100点）
- AI応答はSTRICTLY JSON ONLY（余計なテキストやコードブロック禁止）
- **記事入力時、AIが自動で余分な情報（ナビゲーション・広告・フッター等）を除去し、本文のみでレッスンを進行**

詳細な仕様は`docs/requirements.md`を参照してください。

---

## PWA対応・デプロイ・API切り替え・今後の運用

### PWA対応・Vercelデプロイ
- 本アプリはElectron版とPWA（Web）版の両方をサポートしています。
- PWA版はVercel等のホスティングサービスでデプロイ可能です。
- service-worker.jsはpublic配下に配置してください。
- デプロイやPWA固有の注意点は`docs/requirements.md`も参照。

### API切り替え（OpenAI/Perplexity）
- AI APIはOpenAIとPerplexityの2種類をサポートしています。
- .envファイルでAPIキーを管理し、`src/main.ts`でapiTypeを切り替え可能です。
- 設問生成・評価時のレスポンス形式はJSONスキーマで厳格に管理しています。

### 共通ロジック分離・今後の運用
- Electron版・PWA版で共通化できるロジック（API通信・データ構造・履歴管理等）は`src/common`等に分離して管理する方針です。
- UIやプラットフォーム固有部分のみ個別に実装します。
- 新機能追加時は共通ロジック→各プラットフォームUIの順で実装・テストします。
- 詳細な運用方針やディレクトリ構成例は`docs/requirements.md`を参照してください。

---
ご質問・ご要望はissuesへどうぞ。 
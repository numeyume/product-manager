# 通販商品管理システム - 実行ガイド

このガイドでは、システムを実際に動かすための詳細な手順を説明します。

## 前提条件

- Node.js 18以上
- npm
- Googleアカウント
- Chromeブラウザ

## ステップ1: Firebaseプロジェクトの作成

### 1.1 Firebase Console でプロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：`product-manager-app`）
4. Google Analyticsは無効でOK
5. 「プロジェクトを作成」をクリック

### 1.2 Authentication の設定

1. 左サイドバーから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「Google」を選択して有効化
5. プロジェクトのサポートメールを設定
6. 「保存」をクリック

### 1.3 Firestore Database の作成

1. 左サイドバーから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. 「本番モードで開始」を選択
4. ロケーションを選択（asia-northeast1 推奨）
5. 「完了」をクリック

### 1.4 Firebase Functions の有効化

1. 左サイドバーから「Functions」を選択
2. 「始める」をクリック
3. Blaze プランにアップグレード（有料プランが必要）
   - 従量課金制だが、小規模利用では無料枠内で済む

### 1.5 Firebase設定情報の取得

1. プロジェクト設定（歯車アイコン）をクリック
2. 「全般」タブで下にスクロール
3. 「アプリ」セクションで「ウェブアプリを追加」
4. アプリ名を入力（例：`product-manager-web`）
5. 「Firebase Hosting も設定する」はチェックを外す
6. 「アプリを登録」をクリック
7. 設定オブジェクトをコピーして保存

## ステップ2: Google Cloud Console での設定

### 2.1 Gmail API の有効化

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 上部でFirebaseプロジェクトを選択
3. 「APIとサービス」→「ライブラリ」を選択
4. 「Gmail API」を検索して選択
5. 「有効にする」をクリック

### 2.2 OAuth 2.0 認証情報の作成

1. 「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuth 2.0 クライアント ID」
3. アプリケーションの種類：「ウェブアプリケーション」
4. 名前：`product-manager-oauth`
5. 承認済みの JavaScript 生成元：
   - `http://localhost:3000`
   - 本番URL（後で追加）
6. 承認済みのリダイレクト URI：
   - `http://localhost:3000/gmail-callback`
7. 「作成」をクリック
8. クライアント IDをコピーして保存

### 2.3 Chrome拡張用 OAuth クライアントの作成

1. 再度「認証情報を作成」→「OAuth 2.0 クライアント ID」
2. アプリケーションの種類：「Chrome拡張機能」
3. 名前：`product-manager-extension`
4. アプリケーション ID：後でChrome拡張のIDを設定
5. 「作成」をクリック

## ステップ3: ローカル環境の設定

### 3.1 プロジェクトのセットアップ

```bash
cd /home/tamaz/product-manager

# Firebase CLIをローカルにインストール
npm install firebase-tools --save-dev

# Firebaseにログイン
npx firebase login

# Firebaseプロジェクトを初期化
npx firebase init
```

Firebase initで以下を選択：
- Functions: Configure a Cloud Functions directory
- Hosting: Configure files for Firebase Hosting
- 既存のプロジェクトを選択
- TypeScript: No
- ESLint: Yes
- 依存関係をインストール: Yes
- public directory: web-app/build
- SPA: Yes

### 3.2 環境変数の設定

`web-app/.env` ファイルを作成：

```bash
cd web-app
cp .env.example .env
```

`.env` ファイルを編集して、Firebase設定情報を入力：

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
REACT_APP_GOOGLE_CLIENT_ID=your-oauth-client-id
```

## ステップ4: Firebase Functions のデプロイ

### 4.1 Functions の設定更新

`functions/index.js` を編集して、`YOUR_PROJECT_ID` を実際のプロジェクトIDに置換。

### 4.2 Functions のデプロイ

```bash
cd functions
npx firebase deploy --only functions
```

### 4.3 Firestore セキュリティルールの設定

Firebase Console で Firestore → ルール タブを開き、以下を設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## ステップ5: Cloud Scheduler の設定

### 5.1 Cloud Scheduler の有効化

1. Google Cloud Console で「Cloud Scheduler」を検索
2. 「APIを有効にする」をクリック

### 5.2 ジョブの作成

1. 「ジョブを作成」をクリック
2. 名前：`check-order-emails`
3. 頻度：`*/30 * * * *` （30分間隔）
4. タイムゾーン：Asia/Tokyo
5. ターゲットタイプ：HTTP
6. URL：`https://asia-northeast1-YOUR_PROJECT_ID.cloudfunctions.net/checkOrderEmails`
7. HTTPメソッド：POST
8. 「作成」をクリック

## ステップ6: Webアプリの起動

### 6.1 依存関係のインストール

```bash
cd web-app
npm install
```

### 6.2 開発サーバーの起動

```bash
npm start
```

ブラウザで `http://localhost:3000` にアクセス。

## ステップ7: Chrome拡張機能のインストール

### 7.1 設定ファイルの更新

1. `chrome-extension/manifest.json` の `oauth2.client_id` を Chrome拡張用クライアントIDに更新
2. `chrome-extension/background.js` の `YOUR_PROJECT_ID` を実際のプロジェクトIDに更新

### 7.2 Chrome拡張のインストール

1. Chromeで `chrome://extensions/` にアクセス
2. 右上の「デベロッパーモード」をON
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `chrome-extension` フォルダを選択
5. 拡張機能IDをコピー
6. Google Cloud Console で Chrome拡張用OAuth設定のアプリケーションIDに設定

## ステップ8: 動作確認

### 8.1 Gmail連携のテスト

1. Webアプリにアクセス
2. Googleでログイン
3. 「Gmail連携」ボタンをクリック
4. Gmail読み取り権限を許可

### 8.2 Chrome拡張のテスト

1. Amazon、楽天、メルカリの商品ページにアクセス
2. 過去に購入した商品があれば警告が表示される

## トラブルシューティング

### Firebase Functions のエラー

- Cloud Functions のログを確認：
```bash
npx firebase functions:log
```

### Gmail API のエラー

- Google Cloud Console の「APIとサービス」→「クォータ」でAPI制限を確認
- OAuth同意画面で必要なスコープが設定されているか確認

### Chrome拡張のエラー

- Chrome の拡張機能ページでエラーを確認
- デベロッパーツールのコンソールでエラーをチェック

## 本番環境へのデプロイ

### Firebase Hosting でのデプロイ

```bash
# Webアプリをビルド
cd web-app
npm run build

# Firebase Hosting にデプロイ
cd ..
npx firebase deploy --only hosting
```

### Chrome拡張の公開

1. Chrome Web Store Developer Dashboard にアクセス
2. 新しいアイテムを追加
3. 拡張機能をZIP化してアップロード
4. 審査に提出（通常2-3日）

## セキュリティ考慮事項

- 本番環境では環境変数を適切に設定
- Firebase セキュリティルールを厳密に設定
- OAuth スコープを最小限に制限
- 定期的なアクセストークンの更新を実装

このガイドに従って設定することで、Gmail連携による自動商品管理システムが動作します。
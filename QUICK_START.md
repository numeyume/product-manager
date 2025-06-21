# クイックスタートガイド

開発環境でシステムを素早く動作確認するための手順です。

## 最小限の設定で動作確認

### 1. Firebaseプロジェクトの作成（5分）

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. Authentication → Google プロバイダーを有効化
3. Firestore Database を作成（テストモードで開始）
4. プロジェクト設定から Web アプリの設定情報をコピー

### 2. Webアプリの起動（2分）

```bash
cd web-app

# .env ファイルを作成
cp .env.example .env

# Firebase設定を .env に記入（SETUP_GUIDE.md 参照）
nano .env

# 依存関係をインストールして起動
npm install
npm start
```

ブラウザで `http://localhost:3000` にアクセスして動作確認。

### 3. Chrome拡張の動作確認（2分）

```bash
# プロジェクトIDを更新
cd ../chrome-extension
# background.js の YOUR_PROJECT_ID を実際のIDに変更
```

Chrome で `chrome://extensions/` → デベロッパーモード ON → フォルダを読み込み

### 4. 基本機能のテスト

1. **Webアプリ**: Googleログイン → 商品一覧画面の表示確認
2. **Chrome拡張**: Amazon商品ページで拡張機能アイコンのクリック確認

## Gmail連携の完全テスト

Gmail連携をテストするには `SETUP_GUIDE.md` の手順が必要です：

- Gmail API の有効化
- OAuth 2.0 設定
- Firebase Functions のデプロイ
- Cloud Scheduler の設定

## 開発時の便利コマンド

```bash
# Firebase エミュレータの起動（ローカル開発用）
npx firebase emulators:start

# React アプリの開発サーバー
cd web-app && npm start

# Firebase Functions のログ確認
npx firebase functions:log

# 拡張機能のリロード
# Chrome の拡張機能ページで「再読み込み」ボタン
```

## よくある問題と解決方法

### Firebase設定エラー
- `.env` ファイルの設定値を確認
- プロジェクトIDが正しいか確認

### 認証エラー
- Firebase Console で Google プロバイダーが有効か確認
- OAuth クライアントID が正しく設定されているか確認

### Chrome拡張が動作しない
- マニフェストファイルのプロジェクトIDを確認
- 拡張機能ページでエラーメッセージを確認
- コンテンツスクリプトの権限を確認

このクイックスタートで基本動作を確認してから、`SETUP_GUIDE.md` で完全なGmail連携を設定することをお勧めします。
# 🚀 セットアップガイド

## 📋 目次

1. [クイックスタート（5分）](#クイックスタート5分)
2. [Firebase設定（本格運用）](#firebase設定本格運用)
3. [Gmail連携設定](#gmail連携設定)
4. [PWA設定](#pwa設定)
5. [トラブルシューティング](#トラブルシューティング)

---

## 🚀 クイックスタート（5分）

### 最小限の設定でアプリを体験

```bash
# 1. リポジトリクローン
git clone https://github.com/username/product-manager
cd product-manager/web-app

# 2. 依存関係インストール
npm install

# 3. 開発サーバー起動
npm start
```

```
✅ ブラウザで http://localhost:3000 にアクセス
✅ 「デモログイン」をクリック
✅ すぐに全機能が利用可能！
```

**重要**: デモモードでも重複購入防止機能を含む全機能が完全に動作します。

---

## 🔥 Firebase設定（本格運用）

### 事前準備

- Googleアカウント
- Firebase Console へのアクセス権限

### 手順1: Firebase プロジェクト作成

1. **Firebase Console にアクセス**
   ```
   https://console.firebase.google.com/
   ```

2. **新しいプロジェクトを作成**
   ```
   プロジェクト名: product-manager-[your-name]
   Analytics: 有効化（推奨）
   ```

3. **ウェブアプリを追加**
   ```
   アプリ名: 通販商品管理アプリ
   Firebase Hosting: 後で設定（チェック不要）
   ```

### 手順2: Authentication 設定

1. **Authentication を有効化**
   ```
   左サイドバー → Authentication → 始める
   ```

2. **Google認証プロバイダー有効化**
   ```
   Sign-in method → Google → 有効にする
   サポートメール: [your-email]
   保存をクリック
   ```

3. **承認済みドメイン追加**
   ```
   Settings → 承認済みドメイン
   localhost を追加（開発用）
   your-domain.com を追加（本番用）
   ```

### 手順3: Firestore Database 設定

1. **Firestore を有効化**
   ```
   左サイドバー → Firestore Database → データベースを作成
   テストモードで開始
   ロケーション: asia-northeast1 (東京)
   ```

2. **セキュリティルール設定**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // ユーザーは自分のデータのみアクセス可能
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null 
           && request.auth.uid == userId;
       }
     }
   }
   ```

### 手順4: 環境変数設定

1. **Firebase 設定をコピー**
   ```
   プロジェクト設定 → 全般 → ウェブアプリ → 設定
   ```

2. **`.env` ファイル作成**
   ```env
   REACT_APP_FIREBASE_API_KEY=AIzaSyBxxx...
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

3. **開発サーバー再起動**
   ```bash
   npm start
   ```

### 手順5: Google Cloud Console 設定

1. **OAuth 設定確認**
   ```
   https://console.cloud.google.com/
   同じプロジェクトを選択
   API とサービス → 認証情報
   ```

2. **承認済みJavaScript生成元追加**
   ```
   http://localhost:3000 (開発用)
   https://your-domain.com (本番用)
   ```

3. **承認済みリダイレクトURI追加**
   ```
   http://localhost:3000/__/auth/handler
   https://your-domain.com/__/auth/handler
   ```

---

## 📧 Gmail連携設定

### 概要

Gmail連携により、Amazon・楽天・メルカリ等の注文確認メールから自動で商品情報を抽出できます。

### 手順1: Gmail API 有効化

1. **Google Cloud Console**
   ```
   API とサービス → ライブラリ
   Gmail API を検索 → 有効にする
   ```

2. **OAuth 同意画面設定**
   ```
   OAuth 同意画面 → 外部 → 作成
   アプリ名: 通販商品管理アプリ
   ユーザーサポートメール: [your-email]
   ```

3. **スコープ追加**
   ```
   スコープを追加または削除
   gmail.readonly を追加
   ```

### 手順2: アプリでの設定

1. **アプリにログイン**
   ```
   Googleでログイン → 権限許可
   ```

2. **Gmail連携設定**
   ```
   Gmail連携ボタン → メールアクセス許可
   ```

3. **メール取得テスト**
   ```
   注文確認メール一覧が表示されることを確認
   ```

### 対応ECサイト

- ✅ **Amazon**: 注文確認・発送通知
- ✅ **楽天市場**: 注文受付・発送完了
- ✅ **メルカリ**: 購入完了通知
- ✅ **Yahoo!ショッピング**: 注文確認
- ✅ **その他**: 汎用パターンマッチング

---

## 📱 PWA設定

### PWA（Progressive Web App）とは

ネイティブアプリのような体験をウェブで提供する技術。重複購入防止を"無意識"に行うための重要機能。

### 手順1: PWA機能有効化

1. **アプリでPWA設定**
   ```
   🚀 無意識化設定 → PWAインストール
   ```

2. **ホーム画面に追加**
   ```
   モバイル: 「ホーム画面に追加」
   デスクトップ: 「アプリをインストール」
   ```

### 手順2: プッシュ通知設定

1. **通知許可**
   ```
   通知の許可 → 許可
   ```

2. **通知スケジュール設定**
   ```
   週末夕方: 金土 19-21時
   平日ランチ: 月-金 12-13時
   ```

### 手順3: ブックマークレット設定

1. **ブックマークレット取得**
   ```
   🚀 無意識化設定 → ブックマークレット
   コードをコピー
   ```

2. **ブラウザに登録**
   ```
   ブックマーク新規作成
   名前: 在庫確認
   URL: [コピーしたコード]
   ```

3. **ECサイトで使用**
   ```
   Amazon商品ページで「在庫確認」クリック
   類似商品の在庫状況を即座に表示
   ```

---

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 🔴 Firebase設定エラー

**症状**: "Firebase設定が見つかりません"

**解決方法**:
```bash
1. .env ファイルの存在確認
2. 環境変数名が REACT_APP_ で始まっているか確認
3. npm start でサーバー再起動
4. Firebase Console で Google認証が有効か確認
```

#### 🔴 Google認証エラー

**症状**: "auth/unauthorized-domain"

**解決方法**:
```bash
1. Firebase Console → Authentication → Settings
2. 承認済みドメインに localhost 追加
3. Google Cloud Console でOAuth設定確認
4. ブラウザキャッシュクリア
```

#### 🔴 Gmail連携エラー

**症状**: メール一覧が取得できない

**解決方法**:
```bash
1. Gmail API が有効化されているか確認
2. OAuth スコープに gmail.readonly 追加
3. Google アカウントの権限再設定
4. アプリで再認証実行
```

#### 🔴 PWA機能エラー

**症状**: プッシュ通知が届かない

**解決方法**:
```bash
1. ブラウザの通知設定確認
2. HTTPSでの動作確認（localhost以外）
3. Service Worker の登録状態確認
4. 通知許可の再設定
```

### 🔍 詳細診断

#### Firebase 接続診断

ブラウザの開発者ツール（F12）で以下のログを確認:

```javascript
✅ Firebase初期化成功
✅ Google認証プロバイダー設定完了
✅ Firestore 接続成功
```

#### Gmail API 診断

```javascript
✅ Gmail API 有効
✅ OAuth スコープ確認済み
✅ メール取得権限あり
```

### 🆘 サポート

**セルフヘルプ**:
- [FUNCTION_TEST_CHECKLIST.md](FUNCTION_TEST_CHECKLIST.md) でテスト実行
- [TROUBLESHOOT.md](TROUBLESHOOT.md) で詳細トラブルシューティング

**コミュニティサポート**:
- GitHub Issues: バグ報告・機能要望
- GitHub Discussions: 使い方相談・質問

**開発者サポート**:
- 企業利用・カスタマイズ相談
- 技術的な詳細サポート

---

## ⚡ 最適化設定

### パフォーマンス最適化

```bash
# 本番ビルド最適化
npm run build

# 静的ファイル配信設定
serve -s build -l 3000

# キャッシュ設定（Service Worker）
自動で最適なキャッシュ戦略を適用
```

### セキュリティ強化

```javascript
// Firestore セキュリティルール（厳密版）
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/items/{itemId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && request.auth.token.email_verified == true;
    }
  }
}
```

### 監視設定

```bash
# Firebase Analytics
自動でユーザー行動分析を収集

# Performance Monitoring
ページ読み込み・API応答時間を監視

# Crashlytics
エラー自動収集・報告
```

---

## 🎯 完了チェック

### 基本設定完了
- [ ] ローカル環境でアプリ起動
- [ ] デモモードでの動作確認
- [ ] 重複購入防止機能のテスト

### 本格運用設定完了
- [ ] Firebase プロジェクト作成
- [ ] Google認証の動作確認
- [ ] Firestore データ同期確認
- [ ] Gmail連携でのメール取得
- [ ] PWA機能の動作確認

### 高度な設定完了
- [ ] プッシュ通知の受信確認
- [ ] ブックマークレットの動作確認
- [ ] 複数デバイスでのデータ同期
- [ ] パフォーマンス最適化適用

**🎉 すべての設定が完了したら、[FUNCTION_TEST_CHECKLIST.md](FUNCTION_TEST_CHECKLIST.md) で包括的なテストを実行してください！**
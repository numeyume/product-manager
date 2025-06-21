# Firebase Google認証設定ガイド

## 🔥 Firebase Console での設定手順

### 1. Firebase Console にアクセス
https://console.firebase.google.com/ にアクセスして、プロジェクト `product-manager-f8432` を選択

### 2. Authentication の設定

#### ステップ1: Authentication を有効化
1. 左サイドバーの「Authentication」をクリック
2. 「始める」ボタンをクリック
3. 「Sign-in method」タブを選択

#### ステップ2: Google認証プロバイダーを有効化
1. 「Google」をクリック
2. **「有効にする」トグルをONにする（これが最重要！）**
3. **プロジェクトのサポートメール**を設定（必須）
4. **Web SDK設定**を確認:
   - Web クライアント ID が自動生成されることを確認
   - クライアントシークレットが設定されることを確認
5. **承認済みドメイン**を追加:
   - `localhost` (開発用) - **必ず追加**
   - `your-domain.com` (本番用)
   - `netlify.app` や `vercel.app` (デプロイ先)
6. **「保存」ボタンをクリック**

#### ステップ3: OAuth設定
1. Google Cloud Console (https://console.cloud.google.com/) にアクセス
2. 同じプロジェクト `product-manager-f8432` を選択
3. 「API とサービス」→「認証情報」
4. OAuth 2.0 クライアントIDの設定を確認
5. **承認済みのJavaScript生成元**に以下を追加:
   - `http://localhost:3000`
   - `https://localhost:3000`
   - 本番ドメイン (例: `https://yourapp.netlify.app`)
6. **承認済みのリダイレクトURI**に以下を追加:
   - `http://localhost:3000/__/auth/handler`
   - 本番ドメイン (例: `https://yourapp.netlify.app/__/auth/handler`)

### 3. Firestore Database の設定

#### ステップ1: Firestore を有効化
1. 左サイドバーの「Firestore Database」をクリック
2. 「データベースを作成」をクリック
3. **テストモード**で開始（後で本番モードに変更可能）
4. ロケーションを選択（推奨: asia-northeast1 (東京)）

#### ステップ2: セキュリティルールの設定
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🛠️ トラブルシューティング

### よくあるエラーと解決方法

#### エラー1: "Firebase設定が見つかりません"
**原因:** Firebase ConsoleでGoogle認証が有効化されていない（最も一般的）
**解決方法:**
1. **Firebase Console (https://console.firebase.google.com/) にアクセス**
2. **プロジェクト `product-manager-f8432` を選択**
3. **Authentication → Sign-in method**
4. **「Google」をクリック**
5. **「有効にする」トグルをONにする**
6. **サポートメール（Googleアカウント）を設定**
7. **「保存」ボタンをクリック**

#### エラー2: 環境変数の問題
**原因:** 環境変数が正しく読み込まれていない
**解決方法:**
1. `.env` ファイルがプロジェクトルートにあることを確認
2. 環境変数名が `REACT_APP_` で始まっていることを確認
3. 開発サーバーを再起動 (`npm start`)

#### エラー3: "auth/operation-not-allowed"
**原因:** Firebase ConsoleでGoogle認証が有効化されていない
**解決方法:**
1. Firebase Console → Authentication → Sign-in method
2. Google プロバイダーを有効にする
3. サポートメールを設定する

#### エラー4: "auth/popup-blocked"
**原因:** ブラウザがポップアップをブロックしている
**解決方法:**
1. ブラウザのポップアップブロックを解除
2. または、リダイレクト方式に変更

#### エラー5: "auth/unauthorized-domain"
**原因:** 現在のドメインが承認済みドメインに登録されていない
**解決方法:**
1. Firebase Console → Authentication → Settings → 承認済みドメイン
2. 現在のドメインを追加

## 🔍 設定確認方法

### 1. ブラウザの開発者ツールでチェック
```javascript
// コンソールで以下を実行
console.log('Firebase Config:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});
```

### 2. 現在の設定値
```
API Key: AIzaSyBiNdLhhzJxdd4oYa1ZVHD6pWZOnndxVXA
Auth Domain: product-manager-f8432.firebaseapp.com
Project ID: product-manager-f8432
Storage Bucket: product-manager-f8432.firebasestorage.app
Messaging Sender ID: 163137870258
App ID: 1:163137870258:web:4cedb8a24aa6326a89ecab
```

## 🚀 デプロイ時の注意点

### 1. 本番環境の承認済みドメイン設定
デプロイ先のドメインを事前にFirebase Consoleに登録:
- Netlify: `https://yourapp.netlify.app`
- Vercel: `https://yourapp.vercel.app`
- GitHub Pages: `https://username.github.io`

### 2. 環境変数の設定
デプロイ先のプラットフォームで環境変数を設定:
```
REACT_APP_FIREBASE_API_KEY=AIzaSyBiNdLhhzJxdd4oYa1ZVHD6pWZOnndxVXA
REACT_APP_FIREBASE_AUTH_DOMAIN=product-manager-f8432.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=product-manager-f8432
REACT_APP_FIREBASE_STORAGE_BUCKET=product-manager-f8432.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=163137870258
REACT_APP_FIREBASE_APP_ID=1:163137870258:web:4cedb8a24aa6326a89ecab
```

## 🔒 セキュリティベストプラクティス

### 1. API Keyの保護
- Firebase API Keyは公開されても問題ないが、使用量制限を設定
- Google Cloud Console でAPI制限を適切に設定

### 2. Firestore セキュリティルール
```javascript
// より厳密なルール例
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

### 3. 承認済みドメインの管理
- 開発用ドメインは本番リリース時に削除
- HTTPS必須（HTTPは開発時のみ）
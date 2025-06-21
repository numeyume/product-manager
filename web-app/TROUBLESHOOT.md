# 🚨 Google認証エラー: 即座に解決する方法

## ❌ エラーメッセージ: "Firebase設定が見つかりません"

### 🎯 最も可能性の高い原因
**Firebase Console で Google認証が有効化されていません**

### ✅ 即座に解決する手順

1. **Firebase Console を開く**
   - https://console.firebase.google.com/ にアクセス
   - `product-manager-f8432` プロジェクトを選択

2. **Google認証を有効化**
   - 左サイドバー: `Authentication` をクリック
   - `Sign-in method` タブを選択
   - `Google` プロバイダーをクリック
   - **`有効にする` トグルをONにする**
   - サポートメール（Googleアカウント）を入力
   - `保存` をクリック

3. **アプリを再読み込み**
   - ブラウザでアプリを再読み込み（F5）
   - Googleログインを再試行

---

## 🔧 その他の原因と解決方法

### 原因2: 承認済みドメインの未設定
**解決方法:**
- Firebase Console → Authentication → Settings → 承認済みドメイン
- `localhost` が登録されていることを確認

### 原因3: Google Cloud Console の設定不備
**解決方法:**
- https://console.cloud.google.com/ にアクセス
- `product-manager-f8432` プロジェクトを選択
- API とサービス → 認証情報
- OAuth 2.0 クライアントIDで `http://localhost:3000` が承認済みJavaScript生成元に追加されていることを確認

---

## 🆘 まだ解決しない場合

1. **ブラウザの開発者ツールでエラー確認**
   - F12 → Console タブ
   - エラーメッセージを確認

2. **開発サーバーを再起動**
   ```bash
   # 現在のサーバーを停止
   Ctrl+C
   
   # 再起動
   npm start
   ```

3. **デモモードを使用**
   - 「デモログイン」ボタンでアプリの動作を確認
   - Google認証の設定は後で完了可能

---

## 📞 完了確認

Google認証が正常に動作すると:
- ✅ ログインポップアップが開く
- ✅ Googleアカウント選択画面が表示
- ✅ 認証完了後、ダッシュボードに遷移

Google認証設定が完了すれば、アプリの全機能（重複購入防止、Gmail連携、データ同期）が使用可能になります。
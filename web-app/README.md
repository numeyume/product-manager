# 通販商品管理アプリ

Webベースの通販商品管理アプリケーションです。Gmail連携による自動商品登録や、詳細な在庫管理、保管場所管理などが可能です。

## 🚀 特徴

### 📱 個人用機能
- **商品登録**: 手動登録またはGmail連携による自動登録
- **在庫管理**: 購入数量と残り在庫の追跡
- **保管場所管理**: 3階層での詳細な場所管理
- **利用場所・用途管理**: 商品の用途を複数登録可能
- **カテゴリ分類**: 自動カテゴリ分類と手動調整
- **検索・フィルタ**: 商品名、カテゴリ、保管場所での絞り込み

### 🏢 ビジネス用機能
- **仕入れ先管理**: 取引先情報の記録
- **原価・利益管理**: 仕入れ原価と販売価格の管理
- **発注点管理**: 自動発注アラート機能
- **納期管理**: 発注日・納期の追跡
- **在庫統計**: ビジネス向け在庫分析

## 🛠️ 技術スタック

- **Frontend**: React 18 + TypeScript
- **Backend**: Firebase (Authentication, Firestore)
- **Styling**: CSS Modules
- **State Management**: React Context API
- **Build Tool**: Create React App

## 📋 事前準備

### デモモード（推奨）
特別な設定は不要です。すぐに全機能をお試しいただけます。

### 本格運用
Firebase設定が必要です：
1. Firebaseプロジェクトの作成
2. 環境変数ファイル(.env)の設定
3. Firebase Authentication、Firestoreの有効化

## 🏃‍♂️ クイックスタート

```bash
# リポジトリのクローン
git clone <repository-url>
cd web-app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

アプリケーションが [http://localhost:3000](http://localhost:3000) で起動します。

## 📖 使い方

アプリケーション内の「📖 使い方」ボタンから詳細なガイドを参照できます。

### 基本的な流れ
1. **モード選択**: デモモードまたは本格運用を選択
2. **商品登録**: 手動またはGmail連携で商品を追加
3. **在庫管理**: 「使用(-1)」ボタンで在庫を減らす
4. **場所管理**: 保管場所や利用場所を詳細に記録

### Gmail連携
- Google認証によるログインが必要
- Amazon、楽天、メルカリなどの注文確認メールから自動で商品情報を抽出
- 商品名、価格、数量、購入日などを自動登録

## 🔧 環境変数

本格運用時には以下の環境変数が必要です：

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 🏗️ ビルド

```bash
# プロダクションビルド
npm run build

# 型チェック
npm run type-check

# リンターチェック
npm run lint
```

## 📱 レスポンシブ対応

- デスクトップ、タブレット、スマートフォンに対応
- モバイルファーストデザイン
- タッチ操作に最適化されたUI

## 🎯 主要コンポーネント

### 商品管理
- `ProductList`: 商品一覧表示
- `ProductEdit`: 商品編集機能
- `ManualProductEntry`: 手動商品登録

### 場所管理
- `StorageManager`: 保管場所の階層管理
- 利用場所の複数登録機能

### 連携機能
- `GmailSetup`: Gmail API連携
- `EmailViewer`: 元メール表示
- `TestMode`: 機能テスト用

### ビジネス機能
- `BusinessModeToggle`: 個人/ビジネスモード切り替え
- 仕入れ先・原価管理
- 発注点アラート

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙋‍♂️ サポート

ご質問やバグ報告は、GitHubのIssuesページからお気軽にお寄せください。

---

### 🔄 最新の更新内容

- ✅ 利用場所の複数登録機能
- ✅ 商品編集での利用場所管理
- ✅ 使い方ガイドの追加
- ✅ ビジネスモード機能の実装
- ✅ TypeScript型安全性の向上
- ✅ パフォーマンス最適化
# 通販商品管理システム（Gmail連携版）

Gmail連携により注文メールから自動的に商品情報を取得し、重複購入を防止するためのChrome拡張機能とWebアプリケーションです。

![システム概要](https://img.shields.io/badge/Status-Ready%20for%20Development-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Firebase](https://img.shields.io/badge/Firebase-Functions%20%7C%20Firestore%20%7C%20Auth-orange)
![React](https://img.shields.io/badge/React-TypeScript-blue)

## ✨ 機能

### 📧 Gmail連携（メイン機能）
- 注文確認メールから商品情報を自動取得（Amazon、楽天、メルカリ）
- Firebase Functionsによるバックエンド処理
- 30分間隔での自動メールチェック
- カテゴリ自動分類

### 🔌 Chrome拡張機能
- 商品ページ閲覧時の重複警告表示
- 文字列類似度による重複判定
- リアルタイム警告システム

### 💻 Webアプリ
- 商品一覧表示・検索・編集
- 3階層の保管場所管理
- データソース表示（Gmail取得/手動登録）
- Gmail連携設定
- **🧪 テストモード機能** - 実際に購入せずにシステムをテスト可能

## 🏗️ アーキテクチャ

```
Gmail API → Firebase Functions → Firestore ← Webアプリ
                                      ↑
                               Chrome拡張機能
```

## 🚀 クイックスタート

### 最小限の設定で動作確認（10分）

1. **Firebaseプロジェクト作成**
   ```bash
   # Firebase Console でプロジェクト作成
   # Authentication → Google プロバイダー有効化
   # Firestore Database 作成
   ```

2. **Webアプリ起動**
   ```bash
   cd web-app
   cp .env.example .env
   # .env にFirebase設定を記入
   npm install
   npm start
   ```

3. **Chrome拡張インストール**
   ```bash
   # chrome://extensions/ → デベロッパーモード ON
   # chrome-extension フォルダを読み込み
   ```

### 📘 詳細な設定

- **完全版セットアップ**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **開発環境テスト**: [QUICK_START.md](./QUICK_START.md)

## 🧪 テスト機能

実際に商品を購入せずにシステムをテストできます：

### テストモード機能
- **サンプルデータ生成**: Amazon、楽天、メルカリの様々な商品データを自動生成
- **Gmail連携シミュレーション**: 注文確認メールの解析例を表示
- **重複検出テスト**: 類似商品の検出ロジックを確認
- **カテゴリ分類テスト**: 商品名からの自動分類を確認

### 使い方
1. Webアプリにログイン
2. ヘッダーの「テストモード」ボタンをクリック
3. 各種テスト機能を実行

## 📁 プロジェクト構成

```
product-manager/
├── 📄 README.md                    # このファイル
├── 📄 SETUP_GUIDE.md              # 詳細セットアップガイド  
├── 📄 QUICK_START.md               # クイックスタートガイド
├── 
├── 📁 chrome-extension/            # Chrome拡張機能
│   ├── 📄 manifest.json           # 拡張機能設定
│   ├── 📄 background.js            # バックグラウンド処理
│   ├── 📄 content.js               # 重複警告機能
│   └── 📄 popup.html               # ポップアップUI
│
├── 📁 web-app/                     # Reactウェブアプリ
│   ├── 📁 src/
│   │   ├── 📁 components/          # UIコンポーネント
│   │   │   ├── 📄 TestMode.tsx     # テストモード機能
│   │   │   ├── 📄 GmailSetup.tsx   # Gmail連携設定
│   │   │   └── 📄 ProductList.tsx  # 商品一覧
│   │   ├── 📁 utils/
│   │   │   └── 📄 testData.ts      # テストデータ生成
│   │   └── 📄 App.tsx              # メインアプリ
│   └── 📄 .env.example             # 環境変数テンプレート
│
└── 📁 functions/                   # Firebase Functions
    └── 📄 index.js                 # Gmail連携・メール解析処理
```

## 🛠️ 技術スタック

- **Frontend**: React + TypeScript
- **Backend**: Firebase Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google)
- **Email Processing**: Gmail API
- **Browser Extension**: Chrome Extension Manifest V3

## 📋 必要な設定

### Firebase
- Authentication (Google プロバイダー)
- Firestore Database
- Functions (Blaze プラン)
- Hosting (オプション)

### Google Cloud
- Gmail API
- OAuth 2.0 認証情報
- Cloud Scheduler (定期実行用)

## 🔧 開発コマンド

```bash
# Webアプリ開発サーバー
cd web-app && npm start

# Firebase Functions デプロイ
cd functions && firebase deploy --only functions

# Firebase エミュレータ起動
firebase emulators:start

# Chrome拡張リロード
# chrome://extensions/ でリロードボタン
```

## 🚧 本番環境デプロイ

### Firebase Hosting
```bash
cd web-app && npm run build
firebase deploy --only hosting
```

### Chrome Web Store
1. 拡張機能をZIP化
2. Chrome Web Store Developer Dashboard
3. 審査提出（2-3日）

## 🔒 セキュリティ

- Firebase セキュリティルールで適切なアクセス制御
- OAuth スコープを最小限に制限  
- 環境変数で機密情報を管理
- Gmail API はreadonly権限のみ

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/yourusername/product-manager/issues)
- **Wiki**: [プロジェクトWiki](https://github.com/yourusername/product-manager/wiki)

## 🙏 謝辞

- Firebase/Google Cloud Platform
- React・TypeScript コミュニティ
- Chrome Extensions API

---

**注意**: 本システムは個人使用を想定しています。Gmail APIの利用規約を遵守してご利用ください。
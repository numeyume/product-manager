# Chrome拡張機能 - 通販商品管理

## インストール方法

1. Chrome拡張機能の管理ページを開く（chrome://extensions/）
2. 右上の「開発者モード」をONにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このフォルダ（chrome-extension）を選択

## 設定

### OAuth2 クライアントID

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 「APIとサービス」→「認証情報」を開く
3. OAuth 2.0 クライアントIDを作成（Chrome拡張機能用）
4. `manifest.json`の`oauth2.client_id`を更新

### Firebase プロジェクトID

`background.js`内の`YOUR_PROJECT_ID`を実際のFirebaseプロジェクトIDに置換してください。

## アイコンについて

現在はプレースホルダーのSVGアイコンを使用しています。
実際の運用では、以下のサイズのPNGアイコンを用意してください：
- 16x16 (icon16.png)
- 48x48 (icon48.png)
- 128x128 (icon128.png)

## 開発時のデバッグ

1. 拡張機能ページで「サービスワーカー」をクリックしてDevToolsを開く
2. コンテンツスクリプトは対象サイトでF12キーを押してConsoleタブで確認

## 対応サイト

- Amazon.co.jp
- 楽天市場
- メルカリ

各サイトの購入完了ページで自動的に商品情報を取得します。
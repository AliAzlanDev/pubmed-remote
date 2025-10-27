# PubMed MCP Remote Server - 完全版

## 📦 含まれるファイル

このプロジェクトには以下の10個のファイルが含まれています：

### 📁 ルートディレクトリ

1. **package.json** (1.1 KB)
   - Node.jsプロジェクトの設定ファイル
   - 依存関係とスクリプトの定義
   - プロジェクト情報

2. **tsconfig.json** (40.2 KB)
   - TypeScriptコンパイラの設定
   - ES2022対応
   - ESModule設定

3. **render.yaml** (599 B)
   - Render.comデプロイ設定
   - 環境変数の定義
   - ビルド・起動コマンド

4. **.gitignore** (456 B)
   - Gitで無視するファイルの指定
   - node_modules, dist, .env など

5. **LICENSE** (1.1 KB)
   - MITライセンス
   - 使用・配布の条件

### 📚 ドキュメント

6. **README.md** (9.1 KB)
   - プロジェクトの完全なドキュメント
   - 機能説明、インストール方法
   - API仕様、設定方法

7. **DEPLOYMENT.md** (8.5 KB)
   - 詳細なデプロイ手順
   - Render.com完全ガイド
   - トラブルシューティング

8. **QUICKSTART.md** (6.8 KB)
   - クイックスタートガイド
   - プロジェクト概要
   - 学習ポイント

### 💻 ソースコード（src/フォルダ）

9. **src/index.ts** (約20 KB)
   - メインサーバーファイル
   - デュアルトランスポート実装（stdio/SSE）
   - 8つのツール定義
   - Express統合

10. **src/pubmed-api.ts** (約45 KB)
    - PubMed API統合
    - NCBI E-utilities実装
    - データ取得・処理ロジック
    - エラーハンドリング

---

## 🚀 使用方法

### オプション1: ZIPをダウンロード

1. **pubmed-mcp-remote-complete.zip** をダウンロード
2. 解凍
3. GitHub Desktopで開く
4. GitHubに公開

### オプション2: フォルダごと使用

1. **pubmed-mcp-remote-complete** フォルダを任意の場所にコピー
2. GitHub Desktopで「Add local repository」
3. GitHubに公開

---

## 📋 各ファイルの役割

### 必須ファイル（削除・変更禁止）

- ✅ **package.json** - 依存関係管理
- ✅ **tsconfig.json** - TypeScript設定
- ✅ **render.yaml** - デプロイ設定
- ✅ **src/index.ts** - メインプログラム
- ✅ **src/pubmed-api.ts** - API実装

### 推奨ファイル（残しておくべき）

- 📝 **README.md** - 使い方の説明
- 📝 **DEPLOYMENT.md** - デプロイ手順
- 📝 **LICENSE** - ライセンス
- 🔒 **.gitignore** - Git設定

### 任意ファイル（削除可能）

- 📘 **QUICKSTART.md** - クイックガイド（任意）

---

## 🎯 次のステップ

### 1. ファイルを取得
- ZIPファイルをダウンロードして解凍
- または、フォルダをコピー

### 2. GitHubにアップロード
**方法A: GitHub Desktop（推奨）**
1. GitHub Desktopを起動
2. File → Add local repository
3. フォルダを選択
4. Create repository → Publish to GitHub

**方法B: VSCode**
1. VSCodeでフォルダを開く
2. Source Control → Initialize Repository
3. Commit → Publish to GitHub

### 3. Render.comでデプロイ
1. Render.comにログイン
2. New + → Web Service
3. GitHubリポジトリを接続
4. 環境変数を設定（特に`NCBI_EMAIL`）
5. Create Web Service

### 4. Claude Desktopで使用
設定ファイルに追加:
```json
{
  "mcpServers": {
    "pubmed-remote": {
      "url": "https://your-service.onrender.com/sse"
    }
  }
}
```

---

## ✅ チェックリスト

プロジェクトが正しく動作するか確認：

- [ ] すべてのファイルが存在する（10個）
- [ ] `src/`フォルダに2つのファイルがある
- [ ] `.gitignore`ファイルが存在する
- [ ] `package.json`が正しい
- [ ] `render.yaml`が存在する
- [ ] ドキュメント（README等）が存在する

---

## 📊 ファイルサイズ合計

約 **112 KB** (ZIP: 約40KB)

---

## 🆘 トラブルシューティング

### ファイルが見つからない
- 隠しファイル（`.gitignore`）を表示する設定にしてください
- Windowsの場合: エクスプローラー → 表示 → 隠しファイル

### フォルダ構造が壊れている
正しい構造:
```
pubmed-mcp-remote-complete/
├── src/
│   ├── index.ts
│   └── pubmed-api.ts
├── package.json
├── tsconfig.json
├── render.yaml
├── .gitignore
├── LICENSE
├── README.md
├── DEPLOYMENT.md
└── QUICKSTART.md
```

### ZIPが解凍できない
- Windows標準の解凍機能を使用
- または7-Zip等の解凍ソフトを使用

---

## 💡 補足情報

### 環境変数（重要）

Render.comで設定が必要な環境変数:

```
NODE_ENV=production
MCP_TRANSPORT=sse
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=info
NCBI_EMAIL=your-email@example.com  ← 必ず変更！
```

### ビルドについて

このプロジェクトはTypeScriptで書かれています。
デプロイ時に自動的にビルドされます（`npm run build`）。

ローカルでビルドしたい場合:
```bash
npm install
npm run build
```

ビルド後、`dist/`フォルダが作成されます。

---

## 🎉 完成！

これで完全なプロジェクトファイルが揃いました！

質問や問題があれば、いつでも聞いてください 🚀

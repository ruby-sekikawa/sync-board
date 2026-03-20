# sync-board

リアルタイム同期に対応したカンバンボードアプリケーションです。チームでタスクを管理し、ドラッグ&ドロップで直感的に操作できます。

## 機能

- カンバンボード（カラム・タスクの作成・編集・削除、ドラッグ&ドロップ）
- ガントチャート（タスクの期間を可視化）
- リアルタイム同期（ActionCableによる複数ユーザー間の即時反映）
- プロジェクト・ボード管理
- メンバー招待・ロール管理（オーナー / 編集者 / 閲覧者）
- トークン認証

## 技術スタック

| | 技術 |
|---|---|
| バックエンド | Ruby on Rails 7.1 (APIモード) / Ruby 3.1.2 |
| フロントエンド | Next.js 16 / React 19 / TypeScript |
| データベース | MySQL 8.0 |
| リアルタイム通信 | ActionCable / Redis |
| 認証 | devise_token_auth |
| 認可 | Pundit |
| UIコンポーネント | Material UI (MUI) v5 |
| データ取得 | SWR / Axios |
| インフラ | Docker Compose |

## 起動方法

### 必要なもの

- Docker
- Docker Compose

### 手順

```bash
git clone <repository_url>
cd sync-board
docker compose up -d
```

起動後、以下のURLでアクセスできます。

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:8000 |
| バックエンドAPI | http://localhost:3000/api/v1 |

### DBのセットアップ（初回のみ）

```bash
docker compose exec rails bundle exec rails db:create db:migrate db:seed
```

## 開発コマンド

### Rails

```bash
docker compose exec rails bundle exec rspec          # テスト実行
docker compose exec rails bundle exec rubocop        # リント
docker compose exec rails bundle exec rubocop -A     # リント自動修正
```

### Next.js

```bash
docker compose exec next npm run lint      # ESLintチェック
docker compose exec next npm run format    # ESLint自動修正
docker compose exec next npm test          # テスト実行
```

## ディレクトリ構成

```
sync-board/
├── rails/          # Rails APIバックエンド
│   ├── app/
│   │   ├── controllers/api/v1/
│   │   ├── models/
│   │   ├── serializers/
│   │   └── policies/
│   └── spec/
├── next/           # Next.jsフロントエンド
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── types/
└── docker-compose.yml
```

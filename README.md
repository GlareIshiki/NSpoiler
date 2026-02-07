# NSpoiler

ネタバレを伏字にして共有できるWebアプリ

## セットアップ

### 1. 依存関係インストール

```bash
npm install
```

### 2. 環境変数設定

`.env.local.example` をコピーして `.env.local` を作成し、以下を設定：

```bash
cp .env.local.example .env.local
```

#### Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) でプロジェクト作成
2. OAuth 2.0 クライアントIDを作成
3. 承認済みリダイレクトURIに追加:
   - ローカル: `http://localhost:3000/api/auth/callback/google`
   - 本番: `https://your-domain.vercel.app/api/auth/callback/google`

#### NEXTAUTH_SECRET生成

```bash
openssl rand -base64 32
```

### 3. 開発サーバー起動

```bash
npm run dev
```

## Vercelデプロイ

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定:
   - `NEXTAUTH_URL`: デプロイURL
   - `NEXTAUTH_SECRET`: 生成したシークレット
   - `GOOGLE_CLIENT_ID`: Google OAuth クライアントID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth クライアントシークレット

## 技術スタック

- Next.js 16 (App Router)
- NextAuth.js (Google認証)
- Tailwind CSS
- Vercel KV (データ保存)
- kuromoji.js (形態素解析)

# Railway Configuration Files

## 📁 Files cấu hình tự động cho Railway

Project này đã được cấu hình sẵn để Railway tự động detect và chạy **tất cả workers** (Telegram, WhatsApp Web, Discord) trong **một service duy nhất**.

### Files cấu hình:

1. **`railway.json`** - Cấu hình chính (Railway tự động detect)
   - Start Command: `npm run worker:all` (chạy tất cả workers)
   - Build Command: `npm ci`
   - Restart Policy: Auto-restart on failure

2. **`nixpacks.toml`** - Cấu hình build (Nixpacks)
   - Install: `npm ci`
   - Start: `npm run worker:all`

3. **`Procfile`** - Cấu hình processes (Heroku/Railway)
   - Worker: `npm run worker:all`

4. **`package.json`** - Scripts
   - `worker:all` - Chạy cả 3 workers với concurrently

## 🚀 Cách sử dụng

### Deploy một lần → Chạy tất cả workers

1. **Tạo service mới trên Railway**
   - Vào [railway.app](https://railway.app)
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Chọn repository của bạn

2. **Railway tự động detect và cấu hình**
   - Railway sẽ tự động detect `railway.json`
   - Start Command: `npm run worker:all` (tự động)
   - Build Command: `npm ci` (tự động)

3. **Thêm Environment Variables**
   - Vào tab **"Variables"**
   - Thêm: `MONGODB_URI`, `OPENAI_API_KEY`

4. **Deploy!**
   - Railway sẽ tự động deploy
   - Tất cả workers sẽ chạy song song:
     - Telegram Worker
     - WhatsApp Web Worker
     - Discord Worker

## 📊 Cách hoạt động

### Script `worker:all`

Trong `package.json`:
```json
{
  "scripts": {
    "worker:all": "concurrently \"npm run worker:telegram\" \"npm run worker:whatsapp-web\" \"npm run worker:discord\" --names \"TELEGRAM,WHATSAPP,DISCORD\" --prefix-colors \"blue,green,magenta\""
  }
}
```

Script này sẽ:
1. Chạy **Telegram worker** (`scripts/telegram-worker.ts`)
2. Chạy **WhatsApp Web worker** (`scripts/whatsapp-web-worker.ts`)
3. Chạy **Discord worker** (`scripts/discord-worker.ts`)
4. Tất cả chạy **song song** (concurrently)
5. Logs được prefix với tên worker để dễ theo dõi

## 📝 Lưu ý

- Railway sẽ tự động detect `railway.json` ở root directory
- Chỉ cần tạo **1 service duy nhất** → Tự động chạy tất cả workers
- Environment Variables (`MONGODB_URI`, `OPENAI_API_KEY`) dùng chung cho tất cả workers
- Logs được prefix với `[TELEGRAM]`, `[WHATSAPP]`, `[DISCORD]` để dễ theo dõi

## 🔗 Xem thêm

- [Hướng dẫn Deploy Workers lên Railway](docs/RAILWAY_DEPLOYMENT.md) - Hướng dẫn chi tiết
- [Hướng dẫn setup Telegram Worker](docs/TELEGRAM_WORKER_STANDALONE.md)
- [Hướng dẫn setup WhatsApp Web Worker](docs/WHATSAPP_WEB_INTEGRATION.md)


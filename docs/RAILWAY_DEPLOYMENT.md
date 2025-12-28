# Hướng dẫn Deploy Workers lên Railway

## 🎯 Mục tiêu

Deploy **một service duy nhất** trên Railway để tự động chạy **tất cả workers** (Telegram, WhatsApp Web, Discord) cùng lúc.

## ✨ Tự động hóa

Project đã được cấu hình sẵn với file `railway.json` - Railway sẽ **tự động detect** và chạy tất cả workers khi deploy!

## 📋 Các bước thực hiện

### Bước 1: Tạo Project trên Railway

1. **Đăng nhập Railway Dashboard**
   - Vào [railway.app](https://railway.app)
   - Đăng nhập bằng GitHub account

2. **Tạo Project mới**
   - Click **"New Project"**
   - Chọn **"Deploy from GitHub repo"**
   - Chọn repository của bạn
   - Railway sẽ tự động detect `railway.json` và cấu hình!

### Bước 2: Cấu hình Environment Variables

1. **Vào tab "Variables"**
   - Click vào service vừa tạo
   - Vào tab **"Variables"**

2. **Thêm các biến bắt buộc:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbotdb
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

3. **Lưu ý:**
   - Các biến này sẽ được dùng chung cho tất cả workers
   - Railway sẽ tự động sync cho tất cả processes

### Bước 3: Deploy và Kiểm tra

1. **Railway tự động deploy**
   - Railway sẽ tự động detect `railway.json`
   - Start Command: `npm run worker:all` (tự động chạy cả 3 workers)
   - Railway sẽ build và deploy

2. **Kiểm tra Logs**
   - Vào tab **"Deployments"**
   - Click vào deployment mới nhất
   - Xem **"View Logs"**
   - Bạn sẽ thấy cả 3 workers đang chạy:
     ```
     [TELEGRAM] 🚀 Starting Telegram Worker Service...
     [WHATSAPP] 🚀 Starting WhatsApp Web Worker Service...
     [DISCORD] 🚀 Starting Discord Worker Service...
     [TELEGRAM] ✅ Connected to MongoDB
     [WHATSAPP] ✅ Connected to MongoDB
     [DISCORD] ✅ Connected to MongoDB
     [TELEGRAM] ✅ Telegram Worker Service is running
     [WHATSAPP] ✅ WhatsApp Web Worker Service is running
     [DISCORD] ✅ Discord Worker Service is running
     ```

3. **Kiểm tra Status**
   - Service phải ở trạng thái **"Active"** (màu xanh)
   - Logs hiển thị cả 3 workers đang chạy
   - Không có lỗi

## 🎨 Cấu trúc Project trên Railway

Sau khi deploy, bạn sẽ có:

```
Railway Project
└── Service 1: All Workers ✅
    └── Start Command: npm run worker:all
        ├── Telegram Worker (chạy song song)
        ├── WhatsApp Web Worker (chạy song song)
        └── Discord Worker (chạy song song)
```

**Lợi ích:**
- ✅ Chỉ cần 1 service duy nhất
- ✅ Tự động chạy tất cả workers
- ✅ Dễ quản lý và monitor
- ✅ Tiết kiệm chi phí (chỉ 1 service)

## 📁 Files cấu hình

Project đã có sẵn các file cấu hình:

- ✅ `railway.json` - Cấu hình chính (Railway tự động detect)
  - Start Command: `npm run worker:all`
  - Build Command: `npm ci`
  - Restart Policy: Auto-restart on failure

- ✅ `nixpacks.toml` - Cấu hình build (Nixpacks)
  - Install: `npm ci`
  - Start: `npm run worker:all`

- ✅ `Procfile` - Cấu hình processes (Heroku/Railway)
  - Worker: `npm run worker:all`

- ✅ `package.json` - Scripts
  - `worker:all` - Chạy cả 3 workers với concurrently

## 🔧 Cách hoạt động

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

## 📊 Monitoring và Logs

### Xem Logs Real-time

1. Vào Railway Dashboard
2. Click vào service
3. Tab **"Deployments"** → Click deployment mới nhất
4. Click **"View Logs"**
5. Logs sẽ hiển thị với prefix:
   - `[TELEGRAM]` - Logs từ Telegram worker
   - `[WHATSAPP]` - Logs từ WhatsApp Web worker
   - `[DISCORD]` - Logs từ Discord worker

### Logs quan trọng cần theo dõi:

**Telegram:**
- ✅ `[TELEGRAM] ✅ Connected to MongoDB`
- ✅ `[TELEGRAM] ✅ Telegram Worker Service is running`
- ✅ `[TELEGRAM] 📨 Telegram message: from=...`

**WhatsApp Web:**
- ✅ `[WHATSAPP] ✅ Connected to MongoDB`
- ✅ `[WHATSAPP] ✅ WhatsApp Web Worker Service is running`
- ✅ `[WHATSAPP] 📱 WhatsApp message: from=...`

**Discord:**
- ✅ `[DISCORD] ✅ Connected to MongoDB`
- ✅ `[DISCORD] ✅ Discord Worker Service is running`
- ✅ `[DISCORD] 📨 Discord message: from=...`

## 🐛 Troubleshooting

### ❌ Lỗi: "MONGODB_URI environment variable is required"
**Nguyên nhân:** Chưa thêm environment variable  
**Giải pháp:**
1. Vào tab **"Variables"**
2. Thêm `MONGODB_URI=...`
3. Click **"Redeploy"**

### ❌ Lỗi: "OpenAI API key not configured"
**Nguyên nhân:** Chưa thêm `OPENAI_API_KEY`  
**Giải pháp:**
1. Vào tab **"Variables"**
2. Thêm `OPENAI_API_KEY=sk-...`
3. Click **"Redeploy"**

### ❌ Một worker không chạy
**Nguyên nhân:** 
- Bot chưa được enable trong Dashboard
- Token/credentials sai
- Worker bị crash

**Giải pháp:**
1. Kiểm tra logs → Xem worker nào bị lỗi
2. Kiểm tra Dashboard → Bot đã enable chưa
3. Kiểm tra credentials (token, etc.)
4. Worker sẽ tự động restart nếu crash (restartPolicy)

### ❌ Service không start
**Nguyên nhân:** Start Command sai hoặc chưa cấu hình  
**Giải pháp:**
1. Vào **Settings** → **Deploy**
2. Kiểm tra **Start Command** = `npm run worker:all`
3. Nếu sai, sửa lại và click **"Save"**
4. Click **"Redeploy"**

### ❌ Bot không phản hồi
**Nguyên nhân:** 
- Worker chưa chạy
- Bot chưa được enable
- Token/credentials sai

**Giải pháp:**
1. Kiểm tra logs trên Railway → Xem worker có đang chạy không
2. Kiểm tra Dashboard → Bot đã enable chưa
3. Kiểm tra credentials trên Dashboard
4. Test lại bằng cách gửi tin nhắn

## 🔄 Auto-restart và Reliability

Railway tự động:
- ✅ **Restart** service nếu crash
- ✅ **Redeploy** khi có code mới từ GitHub
- ✅ **Monitor** health của service
- ✅ **Restart** từng worker nếu một worker crash (concurrently sẽ restart)

### Cấu hình Restart Policy

Trong `railway.json`:
```json
{
  "deploy": {
    "startCommand": "npm run worker:all",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 💰 Pricing và Usage

### Railway Free Tier:
- ✅ $5 credit mỗi tháng
- ✅ Đủ cho 1 service chạy 24/7
- ✅ Auto-sleep sau 5 phút không dùng (có thể wake up)

### Tips để tiết kiệm:
- Chỉ chạy workers khi cần
- Sử dụng Railway Pro để không bị sleep
- Monitor usage trong Railway Dashboard

## ✅ Checklist sau khi Deploy

- [ ] Service đã được tạo trên Railway
- [ ] Environment Variables đã được thêm (`MONGODB_URI`, `OPENAI_API_KEY`)
- [ ] Service đã deploy thành công (status = Active)
- [ ] Logs hiển thị cả 3 workers đang chạy
- [ ] Telegram bot đã được enable trong Dashboard
- [ ] WhatsApp Web bot đã được enable trong Dashboard
- [ ] Discord bot đã được enable trong Dashboard
- [ ] Test gửi tin nhắn trên từng platform → Bot phản hồi

## 🎉 Hoàn thành!

Sau khi hoàn thành các bước trên, tất cả workers sẽ:
- ✅ Tự động chạy khi deploy
- ✅ Tự động restart nếu crash
- ✅ Tự động update khi có code mới
- ✅ Monitor và log tất cả hoạt động
- ✅ Chạy song song, không ảnh hưởng lẫn nhau

## 📝 Notes

- **Database:** Sử dụng chung MongoDB cho tất cả workers
- **Environment Variables:** Dùng chung cho tất cả workers
- **Logs:** Tất cả logs được prefix với tên worker để dễ theo dõi
- **Scaling:** Railway tự động scale dựa trên usage
- **Concurrently:** Sử dụng `concurrently` để chạy nhiều workers song song

## 🆘 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trên Railway Dashboard
2. Kiểm tra Environment Variables
3. Kiểm tra bot settings trong Dashboard
4. Xem các file worker scripts để debug

---

**Chúc bạn deploy thành công! 🚀**


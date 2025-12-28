# Hướng dẫn Setup Discord Worker trên Railway

## 🎯 Mục tiêu

Tạo một Service riêng trên Railway để chạy Discord worker (`npm run worker:discord`) tự động khi deploy.

## ✨ Tự động hóa

Project đã được cấu hình sẵn với file `railway-discord.json` - Railway sẽ **tự động detect** và sử dụng cấu hình này khi bạn tạo service mới!

## 📋 Các bước thực hiện

### Bước 1: Tạo Service mới trên Railway

1. **Đăng nhập Railway Dashboard**
   - Vào [railway.app](https://railway.app)
   - Đăng nhập bằng GitHub account

2. **Tạo Project mới (nếu chưa có)**
   - Click **"New Project"**
   - Chọn **"Deploy from GitHub repo"**
   - Chọn repository của bạn
   - Railway sẽ tự động tạo service đầu tiên

3. **Tạo Service thứ 2 cho Discord Worker**
   - Trong Project của bạn, click **"New"** (góc trên bên phải)
   - Chọn **"Empty Service"**
   - Click **"Deploy from GitHub repo"**
   - Chọn **cùng repository** với service đầu tiên
   - Railway sẽ tự động detect file `railway-discord.json` và sử dụng cấu hình!

### Bước 2: Cấu hình Service cho Discord Worker

**✅ Tự động:** Railway đã tự động detect `railway-discord.json` và cấu hình:
- **Start Command:** `npm run worker:discord`
- **Build Command:** `npm ci`
- **Restart Policy:** Auto-restart on failure

**Nếu cần chỉnh sửa thủ công:**
1. **Vào Settings của Service mới**
   - Click vào service vừa tạo
   - Vào tab **"Settings"**

2. **Cấu hình Start Command (nếu cần)**
   - Scroll xuống phần **"Deploy"**
   - Tìm **"Start Command"**
   - Đã được set tự động: `npm run worker:discord`
   - Có thể chỉnh sửa nếu cần

3. **Cấu hình Root Directory (nếu cần)**
   - Để mặc định là `/` (root directory)
   - Hoặc để trống

### Bước 3: Thêm Environment Variables

1. **Vào tab "Variables"**
   - Click vào tab **"Variables"** của service Discord worker

2. **Thêm các biến bắt buộc:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbotdb
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

3. **Lưu ý:**
   - Các biến này có thể được **share** từ service khác trong cùng project
   - Hoặc bạn có thể thêm riêng cho service này
   - Railway sẽ tự động sync nếu bạn chọn "Share from other service"

### Bước 4: Deploy và Kiểm tra

1. **Trigger Deploy**
   - Railway sẽ tự động deploy khi bạn save settings
   - Hoặc bạn có thể click **"Redeploy"** trong tab **"Deployments"**

2. **Kiểm tra Logs**
   - Vào tab **"Deployments"**
   - Click vào deployment mới nhất
   - Xem **"View Logs"**
   - Bạn sẽ thấy:
     ```
     🚀 Starting Discord Worker Service...
     🔌 Connecting to MongoDB...
     ✅ Connected to MongoDB
     ✨ Initializing Discord bot: Bot Name (botId)
     ✅ Discord bot "BotName#1234" is online for bot: botId!
     ✅ Discord Worker Service is running
     ```

3. **Kiểm tra Status**
   - Service phải ở trạng thái **"Active"** (màu xanh)
   - Logs không có lỗi

## 🎨 Cấu trúc Project trên Railway

Sau khi setup, bạn sẽ có:

```
Railway Project
├── Service 1: Next.js App (Vercel) hoặc All Workers
│   └── Start Command: npm run worker:all (từ railway.json)
│
├── Service 2: Telegram Worker (tùy chọn)
│   └── Start Command: npm run worker:telegram (từ railway-telegram.json)
│
├── Service 3: WhatsApp Web Worker (tùy chọn)
│   └── Start Command: npm run worker:whatsapp-web (từ railway-whatsapp.json)
│
└── Service 4: Discord Worker ✅
    └── Start Command: npm run worker:discord (từ railway-discord.json)
```

## 📁 Files cấu hình tự động

Project đã có sẵn các file cấu hình cho Railway:

- ✅ `railway.json` - Cấu hình mặc định (worker:all)
- ✅ `railway-telegram.json` - Cấu hình cho Telegram worker
- ✅ `railway-whatsapp.json` - Cấu hình cho WhatsApp worker
- ✅ `railway-discord.json` - Cấu hình cho Discord worker
- ✅ `Procfile` - Cấu hình cho Heroku/Railway (nhiều processes)

Khi tạo service mới, Railway sẽ tự động detect và sử dụng file phù hợp!

## 🔧 Tùy chọn: Tạo nhiều Services riêng biệt

Nếu bạn muốn tách riêng từng worker, tạo 3 services:

### Service 1: Telegram Worker
- **Start Command:** `npm run worker:telegram`
- **Variables:** `MONGODB_URI`, `OPENAI_API_KEY`

### Service 2: WhatsApp Web Worker
- **Start Command:** `npm run worker:whatsapp-web`
- **Variables:** `MONGODB_URI`, `OPENAI_API_KEY`

### Service 3: Discord Worker
- **Start Command:** `npm run worker:discord`
- **Variables:** `MONGODB_URI`, `OPENAI_API_KEY`

**Lợi ích:**
- ✅ Mỗi worker chạy độc lập
- ✅ Dễ monitor và debug
- ✅ Có thể scale riêng từng service
- ✅ Nếu một worker crash, các worker khác vẫn chạy

## 📊 Monitoring và Logs

### Xem Logs Real-time
1. Vào service Discord worker
2. Tab **"Deployments"** → Click deployment mới nhất
3. Click **"View Logs"**
4. Logs sẽ update real-time

### Logs quan trọng cần theo dõi:
- ✅ `✅ Connected to MongoDB` - Kết nối database thành công
- ✅ `✅ Discord bot "..." is online` - Bot đã online
- ✅ `📨 Discord message: from=...` - Nhận được tin nhắn
- ✅ `✅ AI reply generated` - AI đã tạo phản hồi
- ❌ `❌ Error processing Discord message` - Có lỗi xử lý

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

### ❌ Lỗi: "Discord bot settings not found"
**Nguyên nhân:** Chưa enable Discord bot trong Dashboard  
**Giải pháp:**
1. Vào Vercel app (Dashboard)
2. Chọn bot → Tab **"Discord"**
3. Nhập Bot Token → Click **"Kích hoạt Discord Bot"**
4. Đợi vài giây, Railway worker sẽ tự động detect

### ❌ Service không start
**Nguyên nhân:** Start Command sai hoặc chưa cấu hình  
**Giải pháp:**
1. Vào **Settings** → **Deploy**
2. Kiểm tra **Start Command** = `npm run worker:discord`
3. Click **"Save"** và **"Redeploy"**

### ❌ Bot không phản hồi
**Nguyên nhân:** 
- Worker chưa chạy
- Bot chưa được enable
- Bot Token sai

**Giải pháp:**
1. Kiểm tra logs trên Railway → Xem có lỗi không
2. Kiểm tra Dashboard → Bot đã enable Discord chưa
3. Kiểm tra Bot Token trên Discord Developer Portal
4. Đảm bảo đã bật **MESSAGE CONTENT INTENT** trong Discord Developer Portal

## 🔄 Auto-restart và Reliability

Railway tự động:
- ✅ **Restart** service nếu crash
- ✅ **Redeploy** khi có code mới từ GitHub
- ✅ **Monitor** health của service

### Cấu hình Restart Policy (tùy chọn)

Trong `railway.json` (nếu muốn):
```json
{
  "deploy": {
    "startCommand": "npm run worker:discord",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 💰 Pricing và Usage

### Railway Free Tier:
- ✅ $5 credit mỗi tháng
- ✅ Đủ cho 1-2 services nhỏ
- ✅ Auto-sleep sau 5 phút không dùng (có thể wake up)

### Tips để tiết kiệm:
- Chỉ chạy workers khi cần
- Sử dụng Railway Pro để không bị sleep
- Monitor usage trong Railway Dashboard

## ✅ Checklist sau khi Setup

- [ ] Service Discord worker đã được tạo
- [ ] Start Command = `npm run worker:discord`
- [ ] Environment Variables đã được thêm (`MONGODB_URI`, `OPENAI_API_KEY`)
- [ ] Service đã deploy thành công (status = Active)
- [ ] Logs hiển thị: "✅ Discord Worker Service is running"
- [ ] Bot đã được enable trong Dashboard
- [ ] Test gửi tin nhắn trên Discord → Bot phản hồi

## 🎉 Hoàn thành!

Sau khi hoàn thành các bước trên, Discord worker sẽ:
- ✅ Tự động chạy khi deploy
- ✅ Tự động restart nếu crash
- ✅ Tự động update khi có code mới
- ✅ Monitor và log tất cả hoạt động

## 📝 Notes

- **Database:** Sử dụng chung MongoDB với các services khác
- **Environment Variables:** Có thể share giữa các services trong cùng project
- **Logs:** Lưu trữ trong Railway, có thể export nếu cần
- **Scaling:** Railway tự động scale dựa trên usage

## 🆘 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trên Railway Dashboard
2. Kiểm tra Environment Variables
3. Kiểm tra Discord bot settings trong Dashboard
4. Xem file `scripts/discord-worker.ts` để debug

---

**Chúc bạn setup thành công! 🚀**


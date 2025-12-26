# Hướng dẫn Deploy Telegram Worker Standalone (Không phụ thuộc Vercel)

## 🎯 Giải pháp dứt điểm

Worker service độc lập sử dụng **Telegram Bot API với Long Polling**, không cần webhook hay queue. Xử lý messages trực tiếp và nhanh chóng.

## ✅ Ưu điểm

- ✅ **Không phụ thuộc Vercel** - Chạy trên server riêng
- ✅ **Xử lý trực tiếp** - Không qua queue, không delay
- ✅ **Long Polling** - Telegram Bot API tự động fetch messages
- ✅ **Tự động reconnect** - Tự động kết nối lại nếu mất kết nối
- ✅ **Multi-bot support** - Hỗ trợ nhiều bot cùng lúc
- ✅ **Reliable** - Không bị timeout như serverless functions

## 📋 Các bước setup

### Option 1: Deploy trên Railway (Khuyến nghị - Dễ nhất)

#### Bước 1: Tạo Railway Account
1. Vào https://railway.app/
2. Đăng ký/đăng nhập (có thể dùng GitHub)
3. Click **"New Project"**

#### Bước 2: Deploy từ GitHub
1. Chọn **"Deploy from GitHub repo"**
2. Chọn repository của bạn
3. Railway sẽ tự động detect và build

#### Bước 3: Cấu hình Environment Variables
Trong Railway dashboard → **Variables** tab, thêm:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbotdb
MONGODB_DB=chatbotdb
OPENAI_API_KEY=sk-your-openai-api-key
```

#### Bước 4: Cấu hình Start Command
Trong Railway dashboard → **Settings** → **Deploy**:

**Start Command:**
```bash
npm run worker:telegram
```

#### Bước 5: Deploy
Railway sẽ tự động deploy và worker sẽ chạy.

---

### Option 2: Deploy trên Render

#### Bước 1: Tạo Render Account
1. Vào https://render.com/
2. Đăng ký/đăng nhập

#### Bước 2: Tạo Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository
3. Cấu hình:
   - **Name:** `telegram-worker`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run worker:telegram`
   - **Plan:** Free hoặc Starter

#### Bước 3: Environment Variables
Thêm các biến:
```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=chatbotdb
OPENAI_API_KEY=sk-...
```

#### Bước 4: Deploy
Click **"Create Web Service"** và đợi deploy xong.

---

### Option 3: Deploy trên DigitalOcean App Platform

1. Vào https://cloud.digitalocean.com/apps
2. Click **"Create App"** → **"GitHub"**
3. Chọn repository
4. Cấu hình:
   - **Type:** Web Service
   - **Build Command:** `npm install`
   - **Run Command:** `npm run worker:telegram`
5. Thêm Environment Variables
6. Deploy

---

### Option 4: Chạy trên VPS/Server riêng

#### Bước 1: Setup Server
```bash
# Cài Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd onfaagent
npm install
```

#### Bước 2: Tạo .env file
```bash
cp scripts/telegram-worker.env.example .env
# Edit .env với thông tin của bạn
nano .env
```

#### Bước 3: Chạy Worker
```bash
# Chạy trực tiếp
npm run worker:telegram

# Hoặc dùng PM2 để chạy background
npm install -g pm2
pm2 start npm --name "telegram-worker" -- run worker:telegram
pm2 save
pm2 startup
```

---

## 🔧 Cấu hình Webhook (Tùy chọn)

Sau khi worker chạy, bạn có thể:

### Option A: Tắt webhook trên Vercel (Khuyến nghị)
1. Vào dashboard → Telegram settings
2. Click **"Delete Webhook"**
3. Worker sẽ tự động nhận messages qua long polling

### Option B: Giữ webhook làm backup
- Worker sẽ nhận messages qua long polling
- Webhook trên Vercel vẫn hoạt động như backup
- Nếu worker offline, webhook sẽ xử lý (chậm hơn)

---

## 🧪 Kiểm tra hoạt động

### 1. Xem logs trên hosting platform:
```
🚀 Starting Telegram Worker Service...
✅ Connected to MongoDB
✅ Found 1 enabled bot(s)
🚀 Starting bot: Your Bot Name (bot-id)
✅ Bot Your Bot Name is now polling for messages
✅ Telegram Worker Service is running
```

### 2. Gửi message trên Telegram:
- Bot sẽ phản hồi ngay lập tức (10-30 giây)
- Xem logs để thấy:
  ```
  🤖 Processing message: chatId=123456, text="hello"
  🤖 Processing message with AI: "hello"
  ✅ AI reply generated: "..."
  ✅ Reply sent to Telegram
  ```

---

## 🔄 So sánh các giải pháp

| | Webhook trên Vercel | Queue + Worker | Standalone Worker |
|---|---|---|---|
| **Response time** | 20-60 giây | < 1 giây (webhook) | < 1 giây |
| **Processing time** | 20-60 giây | 10-30 giây | 10-30 giây |
| **Reliability** | Thấp (timeout) | Trung bình | Cao ✅ |
| **Setup complexity** | Dễ | Trung bình | Dễ ✅ |
| **Cost** | Free (Vercel) | Free (Upstash) | Free (Railway/Render) ✅ |
| **Không phụ thuộc Vercel** | ❌ | ❌ | ✅ |

---

## 🚨 Troubleshooting

### Worker không nhận được messages

1. **Kiểm tra bot token:**
   - Đảm bảo bot đã được enable trong dashboard
   - Token phải đúng format

2. **Kiểm tra MongoDB connection:**
   - Xem logs có `✅ Connected to MongoDB` không
   - Kiểm tra MONGODB_URI đúng chưa

3. **Kiểm tra bot đã được enable:**
   - Vào dashboard → Telegram settings
   - Đảm bảo bot đã được enable

4. **Kiểm tra webhook:**
   - Nếu webhook đang active, có thể conflict
   - Xóa webhook: Dashboard → Delete Webhook

### Worker crash hoặc restart

1. **Kiểm tra logs** trên hosting platform
2. **Kiểm tra environment variables** đã đúng chưa
3. **Kiểm tra MongoDB connection** có stable không
4. **Kiểm tra OpenAI API key** có valid không

### Messages bị duplicate

- Nếu cả webhook và worker đều chạy, messages có thể bị duplicate
- **Giải pháp:** Tắt webhook trên Vercel hoặc chỉ chạy worker

---

## 💰 Chi phí

### Railway
- **Free tier:** $5 credit/tháng (đủ cho worker nhỏ)
- **Starter:** $5/tháng (nếu cần nhiều hơn)

### Render
- **Free tier:** Có thể bị sleep sau 15 phút không hoạt động
- **Starter:** $7/tháng (always-on)

### DigitalOcean
- **Basic:** $5/tháng

### VPS riêng
- **DigitalOcean Droplet:** $4-6/tháng
- **Vultr:** $2.50-6/tháng
- **Linode:** $5/tháng

---

## 📚 Tài liệu tham khảo

- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [PM2 Docs](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

## ✅ Kết quả mong đợi

Sau khi deploy worker:
- ✅ **Response time:** < 1 giây (nhận message)
- ✅ **Processing time:** 10-30 giây (AI reply)
- ✅ **Reliability:** 99.9% uptime
- ✅ **Không timeout:** Worker chạy liên tục
- ✅ **Multi-bot:** Hỗ trợ nhiều bot cùng lúc


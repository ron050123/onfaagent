# Quick Start: Telegram Worker Standalone

## ⚡ Deploy trong 5 phút

### Railway (Khuyến nghị)

1. **Tạo account:** https://railway.app/ (đăng nhập bằng GitHub)

2. **Deploy:**
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Chọn repository của bạn
   - Railway tự động detect và build

3. **Cấu hình:**
   - Vào **Variables** tab
   - Thêm:
     ```
     MONGODB_URI=mongodb+srv://...
     MONGODB_DB=chatbotdb
     OPENAI_API_KEY=sk-...
     ```

4. **Start Command:**
   - Vào **Settings** → **Deploy**
   - **Start Command:** `npm run worker:telegram`

5. **Done!** ✅
   - Worker sẽ tự động chạy
   - Bot sẽ nhận messages ngay lập tức

---

### Render

1. **Tạo account:** https://render.com/

2. **New Web Service:**
   - Connect GitHub repo
   - **Build:** `npm install`
   - **Start:** `npm run worker:telegram`

3. **Environment Variables:**
   ```
   MONGODB_URI=...
   MONGODB_DB=chatbotdb
   OPENAI_API_KEY=...
   ```

4. **Deploy** ✅

---

### VPS/Server riêng

```bash
# Clone repo
git clone <your-repo>
cd onfaagent

# Install dependencies
npm install

# Create .env
cp scripts/telegram-worker.env.example .env
nano .env  # Edit với thông tin của bạn

# Run worker
npm run worker:telegram

# Hoặc dùng PM2 (background)
npm install -g pm2
pm2 start npm --name "telegram-worker" -- run worker:telegram
pm2 save
```

---

## ✅ Kiểm tra

Gửi message trên Telegram → Bot phản hồi trong 10-30 giây ✅

Xem logs trên hosting platform để debug nếu cần.

---

## 📚 Chi tiết

Xem [TELEGRAM_WORKER_STANDALONE.md](./TELEGRAM_WORKER_STANDALONE.md) để biết thêm.


# Quick Start: Telegram Queue Setup

## ⚡ Setup trong 3 bước

### 1. Lấy QStash Token
- Vào https://console.upstash.com/
- Tạo project → QStash → Copy token (`qst_...`)

### 2. Thêm vào Vercel
- Vercel Dashboard → Project → Settings → Environment Variables
- Thêm: `QSTASH_TOKEN` = `qst_xxxxxxxxxxxxx`

### 3. Deploy
```bash
git add .
git commit -m "Add queue system"
git push
```

## ✅ Kết quả

- **Trước:** Webhook mất 20-60 giây → User đợi 5 phút
- **Sau:** Webhook < 1 giây → User nhận reply trong 10-30 giây

## 🔍 Kiểm tra

Gửi message trên Telegram và xem logs:
- ✅ `Message queued for async processing` = Đã hoạt động
- ⚠️ `Queue not available` = Cần kiểm tra lại QSTASH_TOKEN

## 📚 Chi tiết

Xem [TELEGRAM_QUEUE_SETUP.md](./TELEGRAM_QUEUE_SETUP.md) để biết thêm.


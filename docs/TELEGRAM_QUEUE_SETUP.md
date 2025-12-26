# Hướng dẫn Setup Queue cho Telegram Bot (Giải pháp tăng tốc)

## 🚀 Vấn đề hiện tại

Chatbot Telegram trên Vercel trả lời chậm (5 phút) vì:
- Vercel serverless functions có cold start
- OpenAI API call mất 20+ giây
- Database queries chậm
- Tất cả xử lý đồng bộ trong webhook

## ✅ Giải pháp: Queue System với Upstash QStash

Sử dụng queue để:
1. **Webhook nhận message → đẩy vào queue → trả về 200 OK ngay lập tức** (< 1 giây)
2. **Worker endpoint xử lý message trong background** (không bị timeout)
3. **Telegram nhận được response nhanh**, user không phải đợi

## 📋 Các bước setup

### Bước 1: Tạo Upstash QStash Account (Miễn phí)

1. Vào https://console.upstash.com/
2. Đăng ký/đăng nhập (có thể dùng GitHub)
3. Tạo một project mới
4. Vào **QStash** section
5. Copy **Token** (bắt đầu với `qst_...`)

### Bước 2: Cấu hình Environment Variable trên Vercel

1. Vào **Vercel Dashboard** → **Project Settings** → **Environment Variables**
2. Thêm biến mới:
   ```
   Name: QSTASH_TOKEN
   Value: qst_xxxxxxxxxxxxx (token từ Upstash)
   ```
3. Chọn **Production**, **Preview**, và **Development**
4. Click **Save**

### Bước 3: Deploy lại ứng dụng

```bash
git add .
git commit -m "Add queue system for Telegram"
git push origin main
```

Vercel sẽ tự động deploy và áp dụng environment variable mới.

## 🔧 Cách hoạt động

### Luồng xử lý mới:

```
1. User gửi message trên Telegram
   ↓
2. Telegram gọi webhook: /api/telegram/webhook
   ↓
3. Webhook đẩy message vào Upstash Queue (< 1 giây)
   ↓
4. Webhook trả về 200 OK ngay lập tức ✅
   ↓
5. Upstash tự động gọi worker: /api/telegram/worker
   ↓
6. Worker xử lý message (AI, DB, gửi reply)
   ↓
7. User nhận được reply từ bot
```

### So sánh:

| | Trước (Đồng bộ) | Sau (Queue) |
|---|---|---|
| **Webhook response time** | 20-60 giây | < 1 giây ✅ |
| **User experience** | Phải đợi 5 phút | Nhận reply trong 10-30 giây ✅ |
| **Timeout risk** | Cao (Vercel 60s limit) | Thấp (worker không bị timeout) ✅ |
| **Cold start impact** | Nặng | Nhẹ (webhook nhanh) ✅ |

## 🧪 Kiểm tra hoạt động

### 1. Kiểm tra Queue đã được cấu hình:

Gửi message trên Telegram và xem logs trên Vercel:

```
✅ Message queued for async processing
```

Nếu thấy:
```
⚠️ Queue not available, processing synchronously
```

→ Cần kiểm tra lại `QSTASH_TOKEN` trong Vercel environment variables.

### 2. Kiểm tra Worker xử lý:

Xem logs trên Vercel để thấy:
```
🔄 Processing queued Telegram message
🤖 Processing message with AI
✅ Reply sent to Telegram
```

## 🔄 Fallback Mode

Nếu `QSTASH_TOKEN` không được cấu hình, hệ thống sẽ tự động fallback về chế độ xử lý đồng bộ (như cũ). Điều này đảm bảo bot vẫn hoạt động ngay cả khi queue chưa được setup.

## 💰 Chi phí

**Upstash QStash Free Tier:**
- 10,000 requests/tháng miễn phí
- Đủ cho hầu hết các bot nhỏ/trung bình
- Nếu cần nhiều hơn: $10/tháng cho 1M requests

## 🚨 Troubleshooting

### Vấn đề: Queue không hoạt động

1. Kiểm tra `QSTASH_TOKEN` đã được set trong Vercel
2. Kiểm tra token có đúng format (bắt đầu với `qst_`)
3. Xem logs trên Vercel để debug

### Vấn đề: Worker không được gọi

1. Kiểm tra URL worker endpoint: `https://your-domain.vercel.app/api/telegram/worker`
2. Kiểm tra Upstash dashboard → QStash → Messages để xem có messages trong queue không
3. Kiểm tra signature verification (QStash tự động verify)

### Vấn đề: Vẫn chậm

1. Kiểm tra OpenAI API response time (có thể do API key hoặc model)
2. Kiểm tra MongoDB connection (có thể do network latency)
3. Xem logs để tìm bottleneck

## 📚 Tài liệu tham khảo

- [Upstash QStash Docs](https://docs.upstash.com/qstash)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎯 Kết quả mong đợi

Sau khi setup:
- ✅ Webhook response time: **< 1 giây**
- ✅ User nhận reply: **10-30 giây** (thay vì 5 phút)
- ✅ Không còn timeout errors
- ✅ Better user experience


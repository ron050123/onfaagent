# Hướng dẫn Deploy lên Vercel

## ⚠️ Quan trọng: Cấu hình sẽ KHÔNG bị mất

Khi deploy lên Vercel, **dữ liệu trong MongoDB sẽ được giữ nguyên** vì database nằm trên MongoDB Atlas (cloud), không phải trên server local.

Tuy nhiên, bạn cần cấu hình lại các **Environment Variables** trên Vercel dashboard.

## 📋 Checklist trước khi Deploy

### 1. Environment Variables cần cấu hình trên Vercel

Vào **Vercel Dashboard** → **Project Settings** → **Environment Variables** và thêm các biến sau:

#### **Bắt buộc:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbotdb
MONGODB_DB=chatbotdb
OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### **Tùy chọn (cho Telegram & Messenger):**
```env
WEBHOOK_URL=https://your-domain.vercel.app
VERCEL_URL=your-domain.vercel.app
MESSENGER_APP_SECRET=your-messenger-app-secret
MESSENGER_VERIFY_TOKEN=your-verify-token
DEMO=false
```

### 2. Dữ liệu sẽ được giữ nguyên

✅ **Giữ nguyên:**
- Tất cả bots và cấu hình trong MongoDB
- Users và authentication data
- FAQs, documents, URLs, structured data
- Telegram bot tokens và webhook settings
- Messenger page access tokens và webhook settings
- Message history

❌ **Cần cấu hình lại:**
- Environment Variables trên Vercel (phải thêm thủ công)
- Webhook URLs cho Telegram/Messenger (sẽ tự động update khi bạn activate lại)

### 3. Các bước Deploy

#### Bước 1: Push code lên Git
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

#### Bước 2: Kết nối với Vercel
1. Vào [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import repository từ GitHub/GitLab
4. Chọn framework: **Next.js**

#### Bước 3: Cấu hình Environment Variables
1. Trong màn hình **Configure Project**
2. Click **"Environment Variables"**
3. Thêm từng biến một theo danh sách ở trên
4. **Quan trọng:** Chọn **"Production"**, **"Preview"**, và **"Development"** cho mỗi biến

#### Bước 4: Deploy
1. Click **"Deploy"**
2. Đợi build hoàn tất (thường 2-5 phút)
3. Kiểm tra URL: `https://your-project.vercel.app`

### 4. Sau khi Deploy

#### ✅ Kiểm tra Database Connection
- Đăng nhập vào dashboard
- Kiểm tra xem bots có hiển thị không
- Nếu không thấy bots → Kiểm tra `MONGODB_URI`

#### ✅ Kiểm tra Telegram Bot (nếu có)
1. Vào dashboard → Chọn bot → Tab **"Telegram Bot"**
2. Kiểm tra token đã được lưu chưa
3. Nếu webhook bị mất, click **"Kích hoạt Bot"** lại
4. Webhook URL sẽ tự động update thành: `https://your-domain.vercel.app/api/telegram/webhook?botId=...`

#### ✅ Kiểm tra Messenger Bot (nếu có)
1. Vào dashboard → Chọn bot → Tab **"Messenger Bot"**
2. Kiểm tra Page Access Token đã được lưu chưa
3. Nếu webhook bị mất, click **"Kích hoạt Bot"** lại
4. Webhook URL sẽ tự động update thành: `https://your-domain.vercel.app/api/messenger/webhook?botId=...`

### 5. Troubleshooting

#### ❌ Lỗi: "MongoDB connection failed"
- **Nguyên nhân:** `MONGODB_URI` chưa được cấu hình hoặc sai
- **Giải pháp:** Kiểm tra lại Environment Variables trên Vercel

#### ❌ Lỗi: "OpenAI API key not configured"
- **Nguyên nhân:** `OPENAI_API_KEY` chưa được cấu hình
- **Giải pháp:** Thêm `OPENAI_API_KEY` vào Environment Variables

#### ❌ Lỗi: "NextAuth secret not configured"
- **Nguyên nhân:** `NEXTAUTH_SECRET` chưa được cấu hình
- **Giải pháp:** Tạo secret mới: `openssl rand -base64 32` và thêm vào Vercel

#### ❌ Telegram/Messenger webhook không hoạt động
- **Nguyên nhân:** Webhook URL đã thay đổi sau khi deploy
- **Giải pháp:** 
  1. Vào dashboard
  2. Chọn bot
  3. Vào tab Telegram/Messenger
  4. Click **"Kích hoạt Bot"** lại để update webhook URL

#### ❌ Không đăng nhập được
- **Nguyên nhân:** `NEXTAUTH_URL` chưa đúng hoặc `NEXTAUTH_SECRET` đã thay đổi
- **Giải pháp:** 
  1. Kiểm tra `NEXTAUTH_URL` = `https://your-domain.vercel.app`
  2. Nếu đã đổi `NEXTAUTH_SECRET`, bạn có thể cần đăng ký lại user mới

### 6. Best Practices

#### 🔒 Security
- **KHÔNG** commit `.env` file vào Git (đã có trong `.gitignore`)
- Sử dụng **Vercel Environment Variables** để lưu secrets
- Rotate secrets định kỳ (đặc biệt là `NEXTAUTH_SECRET`)

#### 📊 Monitoring
- Sử dụng Vercel Analytics để theo dõi performance
- Kiểm tra Vercel Logs nếu có lỗi
- Monitor MongoDB Atlas dashboard để theo dõi database usage

#### 🔄 Updates
- Mỗi lần push code mới, Vercel sẽ tự động deploy
- Environment Variables sẽ được giữ nguyên
- Database data sẽ không bị ảnh hưởng

### 7. Environment Variables Reference

| Biến | Mô tả | Bắt buộc | Ví dụ |
|------|-------|----------|-------|
| `MONGODB_URI` | MongoDB connection string | ✅ | `mongodb+srv://...` |
| `MONGODB_DB` | Database name | ❌ | `chatbotdb` |
| `OPENAI_API_KEY` | OpenAI API key | ✅ | `sk-...` |
| `NEXTAUTH_SECRET` | Secret cho NextAuth | ✅ | Random string |
| `NEXTAUTH_URL` | URL của ứng dụng | ✅ | `https://...` |
| `WEBHOOK_URL` | Webhook URL cho Telegram/Messenger | ❌ | `https://...` |
| `VERCEL_URL` | Vercel URL (tự động) | ❌ | Auto |
| `MESSENGER_APP_SECRET` | Messenger App Secret | ❌ | `...` |
| `MESSENGER_VERIFY_TOKEN` | Messenger Verify Token | ❌ | `...` |
| `DEMO` | Demo mode | ❌ | `false` |

## 📝 Notes

- **Database:** Sử dụng MongoDB Atlas (cloud) nên dữ liệu sẽ không bị mất khi deploy
- **Environment Variables:** Phải cấu hình lại trên Vercel dashboard
- **Webhooks:** Có thể cần activate lại sau khi deploy
- **Users:** Nếu đổi `NEXTAUTH_SECRET`, users cũ có thể không đăng nhập được

## 🆘 Support

Nếu gặp vấn đề khi deploy, kiểm tra:
1. Vercel Build Logs
2. Vercel Function Logs
3. MongoDB Atlas Connection Logs
4. Environment Variables trên Vercel Dashboard


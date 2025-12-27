# Hướng dẫn tích hợp WhatsApp Web (Không cần Business Account)

Dự án OnfaAgent hiện đã hỗ trợ tích hợp WhatsApp Web bằng `whatsapp-web.js` - **KHÔNG CẦN WhatsApp Business Account**!

## Tính năng

- ✅ Tích hợp WhatsApp Web API (không cần Business Account)
- ✅ Đăng nhập bằng QR code (như WhatsApp Web)
- ✅ Tự động trả lời tin nhắn dựa trên FAQs và knowledge base
- ✅ Lưu session tự động (không cần quét QR lại)
- ✅ Lưu lịch sử chat và analytics
- ✅ Quản lý bot qua Dashboard
- ✅ Worker service độc lập (có thể deploy trên Railway, Render, etc.)

## Cách hoạt động

WhatsApp Web integration sử dụng `whatsapp-web.js` để kết nối với WhatsApp thông qua WhatsApp Web, tương tự như khi bạn sử dụng WhatsApp trên trình duyệt. Bạn chỉ cần:

1. **Quét QR code** để đăng nhập (giống WhatsApp Web)
2. **Session được lưu tự động** - không cần quét lại
3. **Bot tự động nhận và trả lời** tin nhắn

## Cách thiết lập

### Bước 1: Cài đặt dependencies

Dependencies đã được cài đặt tự động:
- `whatsapp-web.js` - Thư viện chính
- `qrcode` - Tạo QR code image
- `@types/qrcode` - TypeScript types

### Bước 2: Kích hoạt WhatsApp Web Bot trong Dashboard

1. Đăng nhập vào Dashboard
2. Chọn bot mà bạn muốn tích hợp WhatsApp Web
3. Vào tab **"WhatsApp Settings"** hoặc **"WhatsApp Web"**
4. Nhấn **"Kích hoạt WhatsApp Web Bot"**
5. Hệ thống sẽ tự động khởi tạo client và tạo QR code

### Bước 3: Quét QR code

1. Sau khi kích hoạt, bạn sẽ thấy QR code
2. Mở WhatsApp trên điện thoại
3. Vào **Settings → Linked Devices → Link a Device**
4. Quét QR code trên màn hình
5. Đợi vài giây để xác thực

### Bước 4: Deploy Worker Service (Khuyến nghị)

Để bot hoạt động 24/7, bạn cần deploy worker service trên một hosting service như Railway, Render, hoặc DigitalOcean.

#### Deploy trên Railway:

1. Tạo project mới trên [Railway](https://railway.app)
2. Connect với GitHub repository
3. Thêm environment variables:
   ```
   MONGODB_URI=your_mongodb_uri
   OPENAI_API_KEY=your_openai_key
   ```
4. Thêm **Start Command**: `npm run worker:whatsapp-web`
5. Deploy!

#### Deploy trên Render:

1. Tạo **Background Worker** mới trên [Render](https://render.com)
2. Connect với GitHub repository
3. Thêm environment variables (giống Railway)
4. Set **Start Command**: `npm run worker:whatsapp-web`
5. Deploy!

### Bước 5: Kiểm tra hoạt động

1. Gửi tin nhắn đến số điện thoại đã đăng nhập WhatsApp Web
2. Bot sẽ tự động trả lời dựa trên FAQs và knowledge base!

## API Endpoints

### 1. Lấy QR Code

```http
GET /api/whatsapp-web/qr-code?botId=YOUR_BOT_ID
```

**Response:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KG...",
  "botId": "your_bot_id",
  "message": "Scan this QR code with WhatsApp to authenticate"
}
```

Hoặc nếu đã authenticated:
```json
{
  "authenticated": true,
  "phoneNumber": "1234567890",
  "name": "Your Name",
  "message": "WhatsApp Web is already authenticated"
}
```

### 2. Kiểm tra trạng thái

```http
GET /api/whatsapp-web/status?botId=YOUR_BOT_ID
```

**Response:**
```json
{
  "botId": "your_bot_id",
  "authenticated": true,
  "phoneNumber": "1234567890",
  "name": "Your Name"
}
```

### 3. Đăng xuất

```http
POST /api/whatsapp-web/logout
Content-Type: application/json

{
  "botId": "YOUR_BOT_ID"
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp Web client logged out successfully"
}
```

## Worker Service

Worker service chạy độc lập và tự động:

- ✅ Tự động tìm và khởi động các bot đã enabled
- ✅ Tự động tạo QR code khi cần
- ✅ Tự động xử lý tin nhắn đến
- ✅ Tự động refresh bot list mỗi 5 phút
- ✅ Graceful shutdown khi restart

### Chạy Worker Service Locally:

```bash
npm run worker:whatsapp-web
```

### Environment Variables cho Worker:

```env
MONGODB_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_key
```

## Lưu ý quan trọng

### ⚠️ Terms of Service

- WhatsApp Web.js **KHÔNG phải** giải pháp chính thức của WhatsApp
- Có thể vi phạm Terms of Service của WhatsApp
- Có nguy cơ bị **ban account** nếu sử dụng không đúng cách
- **Khuyến nghị**: Chỉ sử dụng cho testing hoặc personal use
- **Production**: Nên sử dụng WhatsApp Business API (chính thức)

### 🔒 Bảo mật

- Session được lưu trong `.wwebjs_auth/` folder
- **KHÔNG commit** folder này vào Git
- Thêm vào `.gitignore`:
  ```
  .wwebjs_auth/
  ```

### 📱 Giới hạn

- Chỉ hoạt động với **1 số điện thoại** mỗi bot
- Cần quét QR code lại nếu session bị mất
- Không hỗ trợ group messages (có thể bật trong code)
- Không hỗ trợ media messages (có thể thêm sau)

### 🚀 Performance

- Worker service cần chạy 24/7 để nhận tin nhắn
- Có thể deploy trên Railway (free tier available)
- Memory usage: ~200-300MB per bot

## Troubleshooting

### QR Code không hiển thị

1. Kiểm tra logs của worker service
2. Đảm bảo worker service đang chạy
3. Thử logout và login lại

### Bot không trả lời

1. Kiểm tra worker service logs
2. Đảm bảo bot đã được enabled trong Dashboard
3. Kiểm tra MongoDB connection
4. Kiểm tra OpenAI API key

### Session bị mất

1. Session được lưu trong `.wwebjs_auth/` folder
2. Nếu folder bị xóa, cần quét QR code lại
3. Trên Railway/Render, đảm bảo persistent storage được cấu hình

### Puppeteer errors

Nếu gặp lỗi Puppeteer trên server:

1. Đảm bảo server có đủ dependencies:
   ```bash
   sudo apt-get update
   sudo apt-get install -y \
     chromium-browser \
     chromium-chromedriver
   ```

2. Hoặc sử dụng Docker với Chrome pre-installed

## So sánh với WhatsApp Business API

| Tính năng | WhatsApp Web.js | WhatsApp Business API |
|-----------|----------------|----------------------|
| Cần Business Account | ❌ Không | ✅ Có |
| Chi phí | 💰 Miễn phí | 💰 Có phí |
| Setup | 🟢 Dễ (QR code) | 🟡 Phức tạp |
| Ổn định | 🟡 Trung bình | 🟢 Rất ổn định |
| Terms of Service | ⚠️ Có thể vi phạm | ✅ Chính thức |
| Production Ready | ❌ Không khuyến nghị | ✅ Khuyến nghị |

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs của worker service
2. Kiểm tra MongoDB connection
3. Kiểm tra environment variables
4. Tạo issue trên GitHub

---

**Lưu ý**: Giải pháp này phù hợp cho **testing và development**. Để sử dụng trong production, khuyến nghị sử dụng **WhatsApp Business API** (chính thức).


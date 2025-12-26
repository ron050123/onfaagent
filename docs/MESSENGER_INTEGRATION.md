# Hướng dẫn tích hợp Facebook Messenger Bot

Dự án OnfaAgent hiện đã hỗ trợ tích hợp Facebook Messenger Bot để bạn có thể sử dụng chatbot trên Facebook Messenger!

## Tính năng

- ✅ Tích hợp Facebook Messenger API
- ✅ Tự động trả lời tin nhắn dựa trên FAQs và knowledge base
- ✅ Hỗ trợ chat riêng tư (private messages)
- ✅ Xác minh webhook với Verify Token
- ✅ Bảo mật webhook với App Secret (tùy chọn)
- ✅ Lưu lịch sử chat và analytics
- ✅ Quản lý bot qua Dashboard

## Cách thiết lập

### Bước 1: Tạo Facebook App và Page

1. Vào [Facebook Developers](https://developers.facebook.com/apps)
2. Nhấn **"Create App"** hoặc chọn app có sẵn
3. Chọn loại app: **"Business"** hoặc **"Other"**
4. Điền thông tin app và tạo app
5. Trong App Dashboard, thêm sản phẩm **"Messenger"**

### Bước 2: Lấy Page Access Token

1. Trong App Dashboard, vào **Messenger → Settings**
2. Chọn Facebook Page của bạn (hoặc tạo Page mới)
3. Copy **"Page Access Token"** (dạng: `EAAxxxxxxxxxxxxx`)
4. **Lưu lại token này** - bạn sẽ cần nó ở bước tiếp theo

### Bước 3: Tạo Verify Token

1. Tạo một Verify Token bất kỳ (ví dụ: `my_verify_token_123`)
2. Token này sẽ được dùng để xác minh webhook với Facebook
3. **Lưu lại token này**

### Bước 4: Lấy App Secret (Tùy chọn nhưng khuyến nghị)

1. Trong App Dashboard, vào **Settings → Basic**
2. Copy **"App Secret"**
3. **Lưu lại** để bảo mật webhook

### Bước 5: Cấu hình Bot trong Dashboard

1. Đăng nhập vào Dashboard của bạn
2. Chọn bot mà bạn muốn tích hợp Messenger
3. Vào tab **"Messenger Bot"**
4. Nhập các thông tin:
   - **Page Access Token**: Dán token từ Bước 2
   - **Verify Token**: Nhập token từ Bước 3
   - **App Secret**: Dán secret từ Bước 4 (tùy chọn)
5. Nhấn **"Lấy thông tin Page"** để xác minh token
6. Sau khi xác minh thành công, nhấn **"Kích hoạt Messenger Bot"**

### Bước 6: Cấu hình Webhook trong Facebook App Dashboard

Sau khi kích hoạt bot, bạn sẽ nhận được webhook URL và verify token. Làm theo các bước sau:

1. Vào **Messenger → Settings** trong Facebook App Dashboard
2. Trong phần **"Webhooks"**, nhấn **"Add Callback URL"**
3. Nhập:
   - **Callback URL**: Webhook URL từ Dashboard (ví dụ: `https://yourdomain.com/api/messenger/webhook?botId=YOUR_BOT_ID`)
   - **Verify Token**: Verify Token bạn đã nhập trong Dashboard
4. Nhấn **"Verify and Save"**
5. Facebook sẽ gửi GET request để xác minh - hệ thống sẽ tự động xử lý
6. Sau khi verify thành công, subscribe các events:
   - ✅ **messages**
   - ✅ **messaging_postbacks**

### Bước 7: Kiểm tra hoạt động

1. Mở Facebook Messenger
2. Tìm Page của bạn và nhắn tin
3. Bot sẽ tự động trả lời dựa trên FAQs và knowledge base của bạn!

## Cách hoạt động

### Webhook

Khi bạn kích hoạt Messenger bot, hệ thống sẽ:
1. Lưu Page Access Token, Verify Token, và App Secret vào database
2. Webhook URL sẽ là: `https://yourdomain.com/api/messenger/webhook?botId=YOUR_BOT_ID`
3. Facebook sẽ gửi tất cả tin nhắn đến webhook này
4. Hệ thống sẽ xác minh signature (nếu có App Secret) và xử lý tin nhắn
5. Bot sẽ tự động trả lời dựa trên knowledge base

### Xử lý tin nhắn

- **Private messages**: Bot sẽ trả lời tất cả tin nhắn
- **Postback events**: Bot sẽ xử lý các button clicks (ví dụ: "Get Started")
- **Welcome message**: Bot sẽ gửi welcome message khi user nhấn "Get Started"

### Knowledge Base

Bot sẽ sử dụng cùng knowledge base như website chatbot:
- FAQs
- Documents (PDF, DOCX, TXT)
- URLs (scraped content)
- Structured Data

## Quản lý Bot

### Vô hiệu hóa Bot

1. Vào Dashboard → Tab "Messenger Bot"
2. Nhấn **"Vô hiệu hóa"**
3. Bot sẽ ngừng hoạt động
4. **Nhớ xóa webhook** trong Facebook App Dashboard

### Cập nhật Bot

- Thay đổi FAQs, documents, URLs sẽ tự động áp dụng cho Messenger bot
- Không cần cấu hình lại Messenger

## API Endpoints

### Set Webhook
```
POST /api/messenger/set-webhook
Body: { 
  botId: string, 
  pageAccessToken: string,
  verifyToken: string,
  appSecret?: string,
  webhookUrl?: string
}
```

### Delete Webhook
```
POST /api/messenger/delete-webhook
Body: { botId: string }
```

### Get Page Info
```
POST /api/messenger/page-info
Body: { pageAccessToken: string }
```

### Webhook (Facebook calls this)
```
GET /api/messenger/webhook?botId=YOUR_BOT_ID
Query params: hub.mode, hub.verify_token, hub.challenge

POST /api/messenger/webhook?botId=YOUR_BOT_ID
Body: Facebook webhook payload
```

## Troubleshooting

### Bot không trả lời

1. Kiểm tra xem bot đã được kích hoạt trong Dashboard chưa
2. Kiểm tra webhook đã được cấu hình trong Facebook App Dashboard chưa
3. Kiểm tra webhook URL có đúng không
4. Xem logs trong server để tìm lỗi
5. Kiểm tra Page Access Token có hợp lệ không

### Verify Token không khớp

- Đảm bảo Verify Token trong Dashboard khớp với Verify Token trong Facebook App Dashboard
- Token phải giống hệt nhau (case-sensitive)

### Webhook không được verify

- Kiểm tra webhook URL có đúng không
- Kiểm tra Verify Token có khớp không
- Đảm bảo server đang chạy và có thể truy cập được từ internet
- Kiểm tra HTTPS (Messenger yêu cầu HTTPS, trừ localhost)

### Bot không nhận được messages

1. Kiểm tra webhook đã được subscribe events chưa (messages, messaging_postbacks)
2. Kiểm tra Page Access Token có quyền gửi messages không
3. Kiểm tra Page có được kết nối với App chưa

## Bảo mật

### App Secret

- **Khuyến nghị**: Luôn sử dụng App Secret để bảo mật webhook
- App Secret giúp xác minh tính hợp lệ của requests từ Facebook
- Không chia sẻ App Secret với người khác

### Verify Token

- Verify Token được dùng để xác minh webhook khi Facebook gửi GET request
- Tạo một token mạnh và duy nhất
- Không sử dụng token dễ đoán

## Mở rộng

Hệ thống được thiết kế để dễ dàng mở rộng sang các platform khác:
- Zalo
- WhatsApp Business API
- Discord
- Slack
- Viber

## Tài liệu tham khảo

- [Facebook Messenger Platform Documentation](https://developers.facebook.com/docs/messenger-platform)
- [Webhook Setup Guide](https://developers.facebook.com/docs/messenger-platform/webhook)
- [Page Access Tokens](https://developers.facebook.com/docs/pages/access-tokens)


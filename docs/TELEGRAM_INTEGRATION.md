# Hướng dẫn tích hợp Telegram Bot

Dự án OnfaAgent hiện đã hỗ trợ tích hợp Telegram Bot để bạn có thể sử dụng chatbot trên Telegram!

## Tính năng

- ✅ Tích hợp Telegram Bot API
- ✅ Tự động trả lời tin nhắn dựa trên FAQs và knowledge base
- ✅ Hỗ trợ chat riêng tư (private chat)
- ✅ Hỗ trợ chat nhóm (group chat) khi bot được mention
- ✅ Lưu lịch sử chat và analytics
- ✅ Quản lý bot qua Dashboard

## Cách thiết lập

### Bước 1: Tạo Telegram Bot

1. Mở Telegram và tìm kiếm [@BotFather](https://t.me/botfather)
2. Gửi lệnh `/newbot`
3. Làm theo hướng dẫn:
   - Nhập tên cho bot (ví dụ: "My FAQ Bot")
   - Nhập username cho bot (phải kết thúc bằng `bot`, ví dụ: `my_faq_bot`)
4. BotFather sẽ cung cấp cho bạn một **Bot Token** (dạng: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
5. **Lưu lại token này** - bạn sẽ cần nó ở bước tiếp theo

### Bước 2: Cấu hình Bot trong Dashboard

1. Đăng nhập vào Dashboard của bạn
2. Chọn bot mà bạn muốn tích hợp Telegram
3. Vào tab **"Telegram Bot"**
4. Dán Bot Token vào ô "Telegram Bot Token"
5. Nhấn **"Lấy thông tin bot"** để xác minh token
6. Sau khi xác minh thành công, nhấn **"Kích hoạt Telegram Bot"**

### Bước 3: Kiểm tra hoạt động

1. Mở Telegram và tìm kiếm bot của bạn (theo username bạn đã đặt)
2. Nhấn **Start** hoặc gửi lệnh `/start`
3. Bot sẽ gửi welcome message
4. Thử gửi một câu hỏi - bot sẽ trả lời dựa trên FAQs và knowledge base của bạn!

## Cách hoạt động

### Webhook

Khi bạn kích hoạt Telegram bot, hệ thống sẽ:
1. Tự động thiết lập webhook với Telegram
2. Webhook URL sẽ là: `https://yourdomain.com/api/telegram/webhook?botId=YOUR_BOT_ID`
3. Telegram sẽ gửi tất cả tin nhắn đến webhook này
4. Hệ thống sẽ xử lý và trả lời tự động

### Xử lý tin nhắn

- **Private chat**: Bot sẽ trả lời tất cả tin nhắn
- **Group chat**: Bot chỉ trả lời khi được mention (ví dụ: `@my_faq_bot câu hỏi?`)
- **Lệnh `/start`**: Bot sẽ gửi welcome message

### Knowledge Base

Bot sẽ sử dụng cùng knowledge base như website chatbot:
- FAQs
- Documents (PDF, DOCX, TXT)
- URLs (scraped content)
- Structured Data

## Quản lý Bot

### Vô hiệu hóa Bot

1. Vào Dashboard → Tab "Telegram Bot"
2. Nhấn **"Vô hiệu hóa"**
3. Bot sẽ ngừng hoạt động và webhook sẽ bị xóa

### Cập nhật Bot

- Thay đổi FAQs, documents, URLs sẽ tự động áp dụng cho Telegram bot
- Không cần cấu hình lại Telegram

## API Endpoints

### Set Webhook
```
POST /api/telegram/set-webhook
Body: { botId: string, token: string }
```

### Delete Webhook
```
POST /api/telegram/delete-webhook
Body: { botId: string }
```

### Get Bot Info
```
POST /api/telegram/bot-info
Body: { token: string }
```

### Webhook (Telegram calls this)
```
POST /api/telegram/webhook?botId=YOUR_BOT_ID
```

## Troubleshooting

### Bot không trả lời

1. Kiểm tra xem bot đã được kích hoạt trong Dashboard chưa
2. Kiểm tra webhook URL có đúng không
3. Xem logs trong server để tìm lỗi

### Token không hợp lệ

- Đảm bảo bạn đã copy đúng token từ BotFather
- Token phải có định dạng: `123456:ABC-DEF...`

### Bot không hoạt động trong group

- Đảm bảo bot đã được thêm vào group
- Bot phải được mention để trả lời trong group
- Kiểm tra quyền của bot trong group settings

## Mở rộng

Hệ thống được thiết kế để dễ dàng mở rộng sang các platform khác:
- Facebook Messenger
- Zalo
- WhatsApp Business API
- Discord
- Slack

Chỉ cần tạo service tương tự như `telegramService.ts` và webhook handler tương ứng.

## Lưu ý bảo mật

- Bot Token được lưu trữ an toàn trong database
- Webhook chỉ nhận requests từ Telegram
- Tất cả tin nhắn đều được log để analytics

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong server
2. Xem documentation của Telegram Bot API: https://core.telegram.org/bots/api
3. Liên hệ support team


# 🎯 Zalo Official Account Integration Guide

## Overview

This guide explains how to integrate Zalo Official Account (OA) with your chatbot. Zalo is a popular messaging platform in Vietnam, and this integration allows your bot to communicate with users through Zalo.

---

## ✅ Implementation Status

The Zalo integration has been fully implemented with:

- ✅ **Data Model**: Zalo settings interface added to `BotSettings`
- ✅ **Service Layer**: `lib/services/zaloService.ts` - Handles Zalo API interactions
- ✅ **API Routes**: 
  - `/api/zalo/webhook` - Receives webhook events from Zalo
  - `/api/zalo/set-webhook` - Sets up webhook for Zalo OA
  - `/api/zalo/delete-webhook` - Removes webhook
  - `/api/zalo/oa-info` - Gets Official Account information
- ✅ **Worker Script**: `scripts/zalo-worker.ts` - Standalone worker for monitoring
- ✅ **Dashboard UI**: Zalo settings section (to be added)

---

## 📋 Prerequisites

1. **Zalo Official Account (OA)**
   - Register at https://oa.zalo.me/manage
   - Complete verification process
   - Get approved by Zalo

2. **API Credentials**
   - App ID (`app_id`)
   - App Secret (`app_secret`)
   - Get these from Zalo Developer Console

3. **Environment Variables**
   - `MONGODB_URI` - MongoDB connection string
   - `OPENAI_API_KEY` - OpenAI API key for AI responses

---

## 🚀 Setup Steps

### Step 1: Create Zalo Official Account

1. Visit https://oa.zalo.me/manage
2. Sign up and complete registration
3. Submit required documents for verification
4. Wait for approval (usually 1-3 business days)

### Step 2: Get API Credentials

1. After OA is approved, go to Developer Console
2. Navigate to "API" section
3. Copy your:
   - **App ID** (`app_id`)
   - **App Secret** (`app_secret`)

### Step 3: Configure Bot in Dashboard

1. **Login to Dashboard**
   - Go to your dashboard
   - Select the bot you want to configure

2. **Go to Zalo Tab**
   - Click on "Zalo" tab in bot settings

3. **Enter Credentials**
   - **App ID**: Your Zalo App ID
   - **App Secret**: Your Zalo App Secret
   - **Verify Token**: (Optional) Custom verify token for webhook

4. **Get OA Info**
   - Click "Lấy thông tin OA" to verify credentials
   - System will fetch your OA ID and name

5. **Activate Bot**
   - Click "Kích hoạt Zalo Bot"
   - System will:
     - Verify credentials
     - Set up webhook
     - Save settings to database

### Step 4: Configure Webhook in Zalo

1. **Get Webhook URL**
   - After activation, copy the webhook URL from dashboard
   - Format: `https://yourdomain.com/api/zalo/webhook?botId=YOUR_BOT_ID&verify_token=YOUR_TOKEN`

2. **Set Webhook in Zalo Console**
   - Go to Zalo Developer Console
   - Navigate to "Webhook" section
   - Enter webhook URL
   - Enter verify token (same as in dashboard)
   - Save

3. **Verify Webhook**
   - Zalo will send a GET request to verify
   - System automatically handles verification

---

## 🔧 How It Works

### Architecture

```
Zalo Users → Zalo Platform → Webhook → Your Server → AI Processing → Response → Zalo Users
```

1. **User sends message** on Zalo
2. **Zalo sends webhook event** to `/api/zalo/webhook`
3. **Webhook handler** processes event:
   - Validates event type
   - Extracts message and user info
   - Finds bot settings from database
4. **Message processing**:
   - Checks for welcome messages (`/start`, `hi`, `hello`)
   - Processes with AI using knowledge base
   - Generates response
5. **Response sent** back to user via Zalo API

### Access Token Management

Zalo access tokens expire after a certain period. The service automatically:
- **Caches tokens** to reduce API calls
- **Refreshes tokens** before expiration
- **Handles token errors** gracefully

### Webhook Events

Zalo sends various event types:
- `user_send_text` - User sends text message (handled)
- `user_send_image` - User sends image (can be extended)
- `user_send_sticker` - User sends sticker (can be extended)
- `oa_send_message` - OA sends message (acknowledged)

Currently, only `user_send_text` events are processed.

---

## 📝 API Reference

### Set Webhook

**Endpoint**: `POST /api/zalo/set-webhook`

**Request Body**:
```json
{
  "botId": "your-bot-id",
  "appId": "your-app-id",
  "appSecret": "your-app-secret",
  "webhookUrl": "https://yourdomain.com/api/zalo/webhook", // Optional
  "verifyToken": "your-verify-token" // Optional
}
```

**Response**:
```json
{
  "success": true,
  "webhookUrl": "https://yourdomain.com/api/zalo/webhook?botId=...",
  "oaInfo": {
    "oaId": "123456789",
    "oaName": "Your OA Name"
  },
  "verifyToken": "your-verify-token",
  "zalo": { /* bot settings */ }
}
```

### Delete Webhook

**Endpoint**: `POST /api/zalo/delete-webhook`

**Request Body**:
```json
{
  "botId": "your-bot-id"
}
```

### Get OA Info

**Endpoint**: `POST /api/zalo/oa-info`

**Request Body**:
```json
{
  "appId": "your-app-id",
  "appSecret": "your-app-secret"
}
```

**Response**:
```json
{
  "success": true,
  "oaInfo": {
    "oaId": "123456789",
    "oaName": "Your OA Name",
    "avatar": "https://..."
  }
}
```

---

## 🛠️ Development

### Running Locally

1. **Start Main App**:
   ```bash
   npm run dev
   ```

2. **Start Zalo Worker** (optional, for monitoring):
   ```bash
   npm run worker:zalo
   ```

3. **Use ngrok for Webhook** (local development):
   ```bash
   ngrok http 3000
   ```
   - Copy HTTPS URL
   - Use it as custom webhook URL in dashboard

### Testing

1. **Test Webhook Verification**:
   ```bash
   curl "http://localhost:3000/api/zalo/webhook?verify_token=test&challenge=123"
   ```

2. **Test Message Event**:
   ```bash
   curl -X POST http://localhost:3000/api/zalo/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "app_id": "test",
       "oa_id": "123456789",
       "user_id": "user123",
       "event": "user_send_text",
       "timestamp": 1234567890,
       "message": {
         "text": "Hello"
       }
     }'
   ```

---

## 🐛 Troubleshooting

### ❌ Webhook Not Receiving Events

**Check:**
1. Webhook URL is accessible (use ngrok for local)
2. Webhook is set in Zalo Console
3. Verify token matches
4. Check server logs for errors

**Solution:**
- Verify webhook URL is HTTPS (required in production)
- Check firewall/network settings
- Verify webhook is active in Zalo Console

### ❌ Access Token Errors

**Error**: `Failed to get access token`

**Solution:**
- Verify App ID and App Secret are correct
- Check Zalo API status
- Ensure OA is approved and active

### ❌ Bot Not Responding

**Check:**
1. Bot is enabled in dashboard
2. Webhook is set correctly
3. Bot has knowledge base (FAQs/Documents)
4. OpenAI API key is configured

**Solution:**
- Check webhook logs
- Verify bot settings in database
- Test with simple message like "hi"

### ❌ Rate Limit Errors

**Error**: `Rate limit exceeded`

**Solution:**
- Zalo has rate limits on API calls
- Implement rate limiting in your code
- Use message queuing for high volume

---

## 📊 Monitoring

### Worker Script

The Zalo worker (`scripts/zalo-worker.ts`) monitors:
- Enabled bots
- Webhook status
- Bot configuration

Run it with:
```bash
npm run worker:zalo
```

### Logs

Check logs for:
- Webhook events received
- Message processing
- API errors
- Token refresh

---

## 🔒 Security

1. **App Secret**: Never expose in client-side code
2. **Verify Token**: Use strong, random tokens
3. **HTTPS**: Always use HTTPS for webhooks
4. **Access Tokens**: Automatically managed, never expose

---

## 📚 Resources

- **Zalo OA Documentation**: https://docs.zalochatbot.com/
- **Zalo Developer Portal**: https://developers.zalo.me/
- **Zalo OA Management**: https://oa.zalo.me/manage

---

## ✅ Checklist

- [ ] Zalo Official Account created and approved
- [ ] App ID and App Secret obtained
- [ ] Bot configured in dashboard
- [ ] Webhook URL set in Zalo Console
- [ ] Webhook verified successfully
- [ ] Test message sent and bot responded
- [ ] Knowledge base configured (FAQs/Documents)
- [ ] Worker script running (optional)

---

## 🎉 Next Steps

After setup:
1. Add FAQs and documents to knowledge base
2. Test with various message types
3. Monitor logs for errors
4. Customize welcome messages
5. Set up analytics tracking

---

**Need Help?** Check the code comments in:
- `lib/services/zaloService.ts`
- `app/api/zalo/webhook/route.ts`
- `scripts/zalo-worker.ts`

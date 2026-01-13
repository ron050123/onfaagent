# 🔑 Zalo Direct API Token Setup Guide

## Overview

If you have created a Zalo bot using a personal account and received:
- **HTTP API Token** (direct access token)
- **Security Token** (for webhook verification)
- **Webhook URL** (already configured in Zalo)

You can connect your bot directly without needing App ID/App Secret.

---

## ✅ Quick Setup Steps

### Step 1: Go to Dashboard

1. Open your dashboard
2. Select the bot you want to configure
3. Go to **"Zalo"** tab

### Step 2: Select Connection Mode

1. You'll see two connection modes:
   - **App ID/Secret** (for OAuth-based authentication)
   - **API Token** (for direct token authentication) ← **Select this**

2. Click **"API Token"** button

### Step 3: Enter Your Credentials

Fill in the required fields:

1. **HTTP API Token** (required)
   - Your direct API token from Zalo
   - This is used to send messages via Zalo API

2. **Security Token** (required)
   - Your security token for webhook verification
   - This is used to verify webhook requests from Zalo

3. **Webhook URL** (required)
   - The webhook URL you configured in Zalo Developer Console
   - Format: `https://yourdomain.com/api/zalo/webhook?botId=YOUR_BOT_ID&verify_token=YOUR_TOKEN`
   - Or your custom webhook URL if already configured

### Step 4: Activate Bot

1. Click **"Kích hoạt Zalo Bot"** button
2. System will save your settings
3. Bot is now ready to receive messages!

---

## 📋 What Happens Behind the Scenes

### When Using Direct API Token:

1. **No OAuth Flow**: System uses your token directly (no App ID/Secret needed)
2. **Webhook Already Configured**: Assumes webhook is already set in Zalo Console
3. **Direct API Calls**: Uses your token to send messages via Zalo API
4. **Security Token Verification**: Uses security token to verify incoming webhooks

### Important Notes:

- ⚠️ **Webhook must be configured manually** in Zalo Developer Console
- ⚠️ **Security Token** must match the token in Zalo webhook settings
- ⚠️ **API Token** is used directly (no refresh needed if it doesn't expire)

---

## 🔧 Webhook Configuration in Zalo

If you haven't configured the webhook yet:

1. **Get your webhook URL**:
   - Format: `https://yourdomain.com/api/zalo/webhook?botId=YOUR_BOT_ID&verify_token=YOUR_SECURITY_TOKEN`
   - Replace `YOUR_BOT_ID` with your actual bot ID
   - Replace `YOUR_SECURITY_TOKEN` with your security token

2. **Configure in Zalo Developer Console**:
   - Go to Zalo Developer Console
   - Navigate to Webhook settings
   - Enter your webhook URL
   - Enter your security token (verify token)
   - Save

3. **Verify Webhook**:
   - Zalo will send a GET request to verify
   - System automatically handles verification

---

## 🧪 Testing

### Test Webhook Locally:

1. **Use ngrok** (for local testing):
   ```bash
   ngrok http 3000
   ```

2. **Copy HTTPS URL** from ngrok

3. **Update webhook URL** in dashboard:
   ```
   https://abc123.ngrok.io/api/zalo/webhook?botId=YOUR_BOT_ID&verify_token=YOUR_TOKEN
   ```

4. **Configure in Zalo Console** with the ngrok URL

5. **Send a test message** from Zalo app

### Test Without Real Webhook:

Use the test endpoint:
```bash
curl -X POST "http://localhost:3000/api/zalo/test-webhook?botId=YOUR_BOT_ID" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, test message"}'
```

---

## 🔄 Switching Between Modes

You can switch between connection modes:

1. **From API Token to App ID/Secret**:
   - Click "App ID/Secret" button
   - Enter App ID and App Secret
   - System will use OAuth flow

2. **From App ID/Secret to API Token**:
   - Click "API Token" button
   - Enter API Token, Security Token, and Webhook URL
   - System will use direct token

**Note**: You need to disable the bot first before switching modes.

---

## 📊 How It Works

### Direct API Token Flow:

```
User sends message on Zalo
    ↓
Zalo sends webhook to your server
    ↓
Server verifies security token
    ↓
Server processes message with AI
    ↓
Server sends response using API Token
    ↓
User receives response on Zalo
```

### Key Differences:

| Feature | App ID/Secret | Direct API Token |
|---------|---------------|------------------|
| Authentication | OAuth flow | Direct token |
| Token Refresh | Automatic | Manual (if needed) |
| Webhook Setup | Automatic | Manual |
| OA Info | Fetched automatically | Not available |

---

## 🐛 Troubleshooting

### ❌ Error: "API Token is invalid"

**Solution:**
- Verify token is correct (no extra spaces)
- Check token hasn't expired
- Ensure token has proper permissions

### ❌ Error: "Webhook verification failed"

**Solution:**
- Security token must match token in Zalo Console
- Webhook URL must be accessible (use ngrok for local)
- Check webhook URL format is correct

### ❌ Bot not responding

**Check:**
1. ✅ Bot is enabled in dashboard
2. ✅ Webhook is configured in Zalo Console
3. ✅ Security token matches
4. ✅ Webhook URL is accessible
5. ✅ API token is valid
6. ✅ Bot has knowledge base (FAQs/Documents)

### ❌ Messages not sending

**Solution:**
- Verify API token has "Send Message" permission
- Check API token hasn't expired
- Review server logs for API errors

---

## ✅ Checklist

- [ ] Selected "API Token" mode in dashboard
- [ ] Entered HTTP API Token
- [ ] Entered Security Token
- [ ] Entered Webhook URL
- [ ] Configured webhook in Zalo Developer Console
- [ ] Security token matches in both places
- [ ] Webhook URL is accessible (HTTPS for production)
- [ ] Bot activated successfully
- [ ] Test message sent and bot responded ✅

---

## 📚 Additional Resources

- **Zalo Developer Portal**: https://developers.zalo.me/
- **Zalo API Documentation**: https://docs.zalochatbot.com/
- **Main Integration Guide**: `docs/ZALO_INTEGRATION.md`
- **Testing Guide**: `docs/ZALO_TESTING.md`

---

**Need Help?** Check server logs for detailed error messages!

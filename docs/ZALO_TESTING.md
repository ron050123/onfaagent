# 🧪 Zalo Integration Testing Guide

## Overview

Testing Zalo bot integration without waiting for Official Account (OA) verification. Two options:

1. **Technical Test OA** (Recommended) - Official Zalo testing account
2. **Mock/Test Mode** - Simulate webhooks locally without real credentials

---

## Option 1: Technical Test OA (Recommended)

Zalo provides a **Technical Test OA** specifically for developers. This doesn't require full business verification and is approved faster.

### Steps to Create Technical Test OA

1. **Create a Regular OA**
   - Go to https://oa.zalo.me/home
   - Log in with your personal Zalo account
   - Click "Tạo Official Account ngay" (Create Official Account Now)
   - Select "Doanh nghiệp" (Enterprise)
   - Fill in basic information:
     - **Category**: Choose any relevant category
     - **Account Name**: Include "Test" in the name (e.g., "My Test Bot")
     - **Description**: Mention it's for testing/development
     - Upload profile and cover photos

2. **Request Technical Test OA Conversion**
   - After creating the OA, send an email to **oa@zalo.me** with:
     - **Subject**: Request for Technical Test OA
     - **OA ID**: Your newly created OA ID
     - **OA Name**: Your OA name
     - **Company Name**: Your company name
     - **Business Registration Number**: (if applicable)
     - **Purpose**: Explain you're testing bot integration
     - **Your Full Name**: Your name
     - **Your Position**: Your role
     - **Contact Email**: Your email
     - **Contact Phone**: Your phone number

3. **Wait for Approval**
   - Usually approved within **1-2 business days**
   - You'll receive email confirmation
   - Test OA is limited to 100 followers
   - Won't appear in public searches

4. **Get API Credentials**
   - Once approved, go to Developer Console
   - Navigate to "API" section
   - Copy your **App ID** and **App Secret**

### Limitations of Technical Test OA

- ✅ No full business verification required
- ✅ Faster approval (1-2 days vs 3-5 days)
- ✅ Full API access for testing
- ⚠️ Limited to 100 followers
- ⚠️ Not searchable in Zalo app
- ⚠️ Must convert to full OA within 30 days

---

## Option 2: Mock/Test Mode (Local Testing)

For immediate testing without any Zalo account, use the test webhook endpoint.

### Using the Test Endpoint

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Configure a bot in Dashboard:**
   - Go to Dashboard
   - Select or create a bot
   - Add some FAQs/Documents to knowledge base
   - **Note**: You don't need to configure Zalo settings for test mode

3. **Send a test webhook event:**

   **Using cURL:**
   ```bash
   curl -X POST "http://localhost:3000/api/zalo/test-webhook?botId=YOUR_BOT_ID" \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello, this is a test message"}'
   ```

   **Using PowerShell (Windows):**
   ```powershell
   $body = @{
       text = "Hello, this is a test message"
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "http://localhost:3000/api/zalo/test-webhook?botId=YOUR_BOT_ID" `
     -Method POST `
     -ContentType "application/json" `
     -Body $body
   ```

   **Using JavaScript/Node.js:**
   ```javascript
   fetch('http://localhost:3000/api/zalo/test-webhook?botId=YOUR_BOT_ID', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       text: 'Hello, this is a test message',
       userId: 'test_user_123',
       oaId: 'test_oa_123'
     })
   })
   .then(r => r.json())
   .then(console.log);
   ```

4. **Check the response:**
   - The endpoint will simulate a Zalo webhook event
   - Your bot will process it and generate a response
   - Check your terminal/logs to see the AI response
   - The response won't be sent back to Zalo (since it's a test)

### Test Endpoint Parameters

**Query Parameters:**
- `botId` (required): Your bot ID from dashboard

**Request Body (JSON):**
- `text` (required): The message text to test
- `userId` (optional): Mock user ID (default: `test_user_${timestamp}`)
- `oaId` (optional): Mock OA ID (default: `test_oa_123456789`)
- `appId` (optional): Mock App ID (default: `test_app_id`)

**Example Request:**
```json
{
  "text": "What are your business hours?",
  "userId": "test_user_12345",
  "oaId": "test_oa_987654321"
}
```

### What Gets Tested

✅ **Message Processing:**
- Bot receives the message
- Knowledge base lookup
- AI response generation
- Message tracking in database

❌ **What Doesn't Work:**
- Actual message sending to Zalo (no real OA)
- Real webhook verification
- Access token management
- Real user interactions

---

## Testing Workflow

### Step 1: Test Locally (Mock Mode)

1. Use test endpoint to verify:
   - Bot processes messages correctly
   - Knowledge base is working
   - AI responses are generated
   - Database tracking works

### Step 2: Get Technical Test OA

1. Create Technical Test OA (1-2 days)
2. Get App ID and App Secret
3. Configure in Dashboard

### Step 3: Test with Real OA

1. Set webhook in Zalo Console
2. Send real messages from Zalo app
3. Verify end-to-end flow

### Step 4: Convert to Full OA (Production)

1. After testing, convert to full OA
2. Complete business verification
3. Deploy to production

---

## Troubleshooting Test Mode

### ❌ Error: "Bot settings not found"

**Solution:**
- Make sure `botId` parameter is correct
- Verify bot exists in dashboard
- Check bot has knowledge base (FAQs/Documents)

### ❌ Error: "OpenAI API key not configured"

**Solution:**
- Add `OPENAI_API_KEY` to `.env.local`
- Restart development server

### ❌ No response in logs

**Solution:**
- Check terminal for error messages
- Verify MongoDB connection
- Check bot has enabled knowledge base items

---

## Example Test Script

Create a file `test-zalo.js`:

```javascript
const fetch = require('node-fetch');

async function testZaloBot(botId, message) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/zalo/test-webhook?botId=${botId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      }
    );
    
    const data = await response.json();
    console.log('✅ Test Result:', data);
    return data;
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

// Test with your bot ID
testZaloBot('your-bot-id', 'Hello, what are your business hours?');
```

Run it:
```bash
node test-zalo.js
```

---

## Next Steps

1. **Test locally** using mock endpoint
2. **Apply for Technical Test OA** while testing
3. **Configure real OA** once approved
4. **Test end-to-end** with real Zalo messages
5. **Deploy to production** after verification

---

## Resources

- **Zalo OA Management**: https://oa.zalo.me/home
- **Technical Test OA Guide**: https://oa.zalo.me/home/documents/guides/tao-tai-khoan-oa-thu-nghiem-ky-thuat
- **Zalo Developer Portal**: https://developers.zalo.me/
- **Zalo API Documentation**: https://docs.zalochatbot.com/

---

**Need Help?** Check the main integration guide: `docs/ZALO_INTEGRATION.md`

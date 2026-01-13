# 🎮 Discord Integration - Local Setup Guide

## ✅ Yes, you can integrate Discord with your locally run project!

Your project already has Discord integration built-in. This guide will help you set it up locally.

---

## 📋 Prerequisites

1. **MongoDB Database** (local or cloud)
   - Local MongoDB installation, OR
   - MongoDB Atlas (free tier available)

2. **Discord Bot Token**
   - Create a bot on [Discord Developer Portal](https://discord.com/developers/applications)

3. **OpenAI API Key**
   - Get from [OpenAI Platform](https://platform.openai.com/api-keys)

4. **Node.js** (already installed)

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Discord Bot

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Click **"New Application"**
   - Give it a name (e.g., "My AI Chatbot")

2. **Create Bot**
   - Go to **"Bot"** tab (left sidebar)
   - Click **"Add Bot"** → **"Yes, do it!"**
   - Under **"Token"**, click **"Reset Token"** → **"Copy"**
   - ⚠️ **SAVE THIS TOKEN** - you'll need it later!

3. **Enable Privileged Gateway Intents** (CRITICAL!)
   - Still in **"Bot"** tab
   - Scroll down to **"Privileged Gateway Intents"**
   - Enable **"MESSAGE CONTENT INTENT"** ✅
   - This is required for the bot to read message content!

4. **Invite Bot to Your Server**
   - Go to **"OAuth2"** → **"URL Generator"**
   - Select scopes:
     - ✅ `bot`
     - ✅ `applications.commands`
   - Select bot permissions:
     - ✅ `Send Messages`
     - ✅ `Read Message History`
     - ✅ `Read Messages/View Channels`
   - Copy the generated URL and open it in browser
   - Select your Discord server and authorize

---

### Step 2: Configure Environment Variables

1. **Create `.env.local` file** (if not exists) in project root:

```env
# Database Configuration
MONGODB_URI="mongodb://localhost:27017/chatbotdb"
# OR use MongoDB Atlas:
# MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/chatbotdb"

# OpenAI API Configuration
OPENAI_API_KEY="sk-your-openai-api-key-here"

# NextAuth Configuration
NEXTAUTH_SECRET="your-random-secret-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

2. **Generate NEXTAUTH_SECRET** (if needed):
   ```bash
   # On Windows PowerShell:
   [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
   
   # On Linux/Mac:
   openssl rand -base64 32
   ```

---

### Step 3: Start the Main Application

1. **Install dependencies** (if not done):
   ```bash
   npm install
   ```

2. **Start MongoDB** (if running locally):
   ```bash
   # Windows (if installed as service, it should auto-start)
   # Or use MongoDB Atlas (cloud) - no local setup needed
   ```

3. **Start the Next.js app**:
   ```bash
   npm run dev
   ```
   - App will run on: http://localhost:3000

4. **Create Admin Account** (if not exists):
   ```bash
   npm run create-admin
   ```
   - Follow prompts to create admin user

---

### Step 4: Configure Discord Bot in Dashboard

1. **Login to Dashboard**
   - Open: http://localhost:3000/login
   - Login with your admin credentials

2. **Create/Select a Bot**
   - Go to Dashboard
   - Create a new bot or select existing bot

3. **Configure Discord Settings**
   - Scroll to **"Discord"** section
   - Enter your **Discord Bot Token** (from Step 1)
   - Optionally enter **Client ID** (from Discord Developer Portal → General Information)
   - Click **"Kích hoạt Discord Bot"** (Enable Discord Bot) button
   - Bot settings will be saved to MongoDB

---

### Step 5: Start Discord Worker

Open a **new terminal window** (keep the main app running):

```bash
npm run worker:discord
```

You should see:
```
🤖 Discord Worker Service Starting...
=====================================
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
✅ Found 1 enabled Discord bot(s)
🚀 Starting Discord bot for: Your Bot Name (botId)
[DISCORD] 🔐 Logging in with bot token...
[DISCORD] ✅ Discord bot logged in as: YourBot#1234
[DISCORD] ✅ Bot is ready and listening for messages
✅ Discord Worker Service is running
💡 Press Ctrl+C to stop
```

---

### Step 6: Test Your Discord Bot

1. **Open Discord** (desktop app or web)
2. **Go to your server** where you invited the bot
3. **Send a DM to the bot** or **mention it in a channel**:
   - Try: `@YourBot hello`
   - Or send a DM: `hello`
4. **Bot should respond!** 🎉

---

## 🔧 Running Multiple Workers

If you want to run **all workers** (Telegram, WhatsApp, Discord) together:

```bash
npm run worker:all
```

Or run individually in separate terminals:
- Terminal 1: `npm run worker:telegram`
- Terminal 2: `npm run worker:whatsapp-web`
- Terminal 3: `npm run worker:discord`

---

## 📊 How It Works

1. **Main App** (`npm run dev`):
   - Next.js web application
   - Dashboard for managing bots
   - Stores bot settings in MongoDB

2. **Discord Worker** (`npm run worker:discord`):
   - Connects to Discord using discord.js
   - Reads bot settings from MongoDB
   - Listens for messages (DMs or mentions)
   - Processes messages with AI (OpenAI GPT-4o-mini)
   - Sends responses back to Discord

3. **Communication**:
   - Both services connect to the same MongoDB database
   - Dashboard saves settings → Worker reads settings
   - No direct communication needed!

---

## 🐛 Troubleshooting

### ❌ Error: "MONGODB_URI environment variable is required"
**Solution:**
- Check `.env.local` file exists
- Verify `MONGODB_URI` is set correctly
- Restart the worker: `npm run worker:discord`

### ❌ Error: "Discord bot settings not found"
**Solution:**
1. Make sure you've enabled Discord bot in Dashboard
2. Check bot token is saved correctly
3. Wait a few seconds for settings to sync
4. Restart worker

### ❌ Bot doesn't respond to messages
**Check:**
1. ✅ Bot is online (check Discord server - bot should show as online)
2. ✅ MESSAGE CONTENT INTENT is enabled (Discord Developer Portal → Bot → Privileged Gateway Intents)
3. ✅ Bot has permission to read/send messages in the channel
4. ✅ Worker is running (`npm run worker:discord`)
5. ✅ Check worker logs for errors

### ❌ Bot responds but says "I don't know"
**Solution:**
- Add FAQs/Documents/URLs in Dashboard
- Bot uses knowledge base to answer questions
- Without knowledge base, bot will say it doesn't know

### ❌ Rate Limit Errors
**Solution:**
- Discord has rate limits
- Worker automatically handles rate limits
- Wait a few minutes and try again
- Check logs for reset time

---

## 📝 Important Notes

1. **Keep Both Running:**
   - Main app (`npm run dev`) - for Dashboard
   - Discord worker (`npm run worker:discord`) - for Discord bot

2. **MESSAGE CONTENT INTENT:**
   - **MUST** be enabled in Discord Developer Portal
   - Without it, bot cannot read message content
   - If you forgot, enable it and re-invite the bot

3. **Bot Token Security:**
   - Never commit `.env.local` to git
   - Bot token is stored encrypted in MongoDB
   - Keep your token secret!

4. **Local vs Production:**
   - This setup is for **local development**
   - For production, deploy worker separately (see `RAILWAY_DISCORD_SETUP.md`)

---

## ✅ Checklist

- [ ] Discord bot created on Developer Portal
- [ ] MESSAGE CONTENT INTENT enabled
- [ ] Bot invited to Discord server
- [ ] `.env.local` file created with MongoDB URI and OpenAI API key
- [ ] Main app running (`npm run dev`)
- [ ] Admin account created
- [ ] Discord bot configured in Dashboard
- [ ] Discord worker running (`npm run worker:discord`)
- [ ] Bot responds to test messages ✅

---

## 🎉 Success!

Your Discord bot is now running locally! The bot will:
- ✅ Respond to DMs
- ✅ Respond when mentioned in channels
- ✅ Use your knowledge base (FAQs, Documents, URLs)
- ✅ Process messages with AI
- ✅ Store conversation history in MongoDB

---

## 📚 Additional Resources

- **Discord.js Documentation**: https://discord.js.org/
- **Discord Developer Portal**: https://discord.com/developers/applications
- **Railway Deployment Guide**: See `docs/RAILWAY_DISCORD_SETUP.md`

---

**Need Help?** Check the worker logs for detailed error messages!

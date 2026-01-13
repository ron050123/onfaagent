# 🔧 Environment Variables Setup Guide

## Quick Fix for "MONGODB_URI environment variable is required"

If you're getting this error when running `npm run worker:discord`, you need to create a `.env.local` file with your environment variables.

---

## 📝 Step 1: Create `.env.local` File

Create a file named `.env.local` in the **root directory** of your project (same folder as `package.json`).

### Option A: Copy from `env.example`

1. Copy `env.example` to `.env.local`:
   ```bash
   # Windows PowerShell:
   Copy-Item env.example .env.local
   
   # Windows CMD:
   copy env.example .env.local
   
   # Linux/Mac:
   cp env.example .env.local
   ```

2. Edit `.env.local` and fill in your actual values

### Option B: Create Manually

Create a new file `.env.local` with this content:

```env
# Database Configuration
MONGODB_URI="mongodb://localhost:27017/chatbotdb"
# OR use MongoDB Atlas (cloud):
# MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/chatbotdb"

MONGODB_DB="chatbotdb"

# OpenAI API Configuration
OPENAI_API_KEY="sk-your-openai-api-key-here"

# NextAuth Configuration
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Webhook Configuration
WEBHOOK_URL="http://localhost:3000"
VERCEL_URL=""
```

---

## 🔑 Step 2: Get Your MongoDB URI

### Option A: Local MongoDB

If you have MongoDB installed locally:
```env
MONGODB_URI="mongodb://localhost:27017/chatbotdb"
```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. **Sign up** at https://www.mongodb.com/cloud/atlas (free tier available)
2. **Create a cluster** (free M0 tier)
3. **Create database user:**
   - Go to "Database Access" → "Add New Database User"
   - Username: `your-username`
   - Password: `your-password` (save this!)
4. **Whitelist your IP:**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP
5. **Get connection string:**
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example:
     ```env
     MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chatbotdb?retryWrites=true&w=majority"
     ```

---

## 🔑 Step 3: Get Your OpenAI API Key

1. **Sign up** at https://platform.openai.com (if not already)
2. **Go to API Keys:** https://platform.openai.com/api-keys
3. **Create new secret key**
4. **Copy the key** (starts with `sk-`)
5. **Add to `.env.local`:**
   ```env
   OPENAI_API_KEY="sk-your-actual-key-here"
   ```

---

## 🔑 Step 4: Generate NEXTAUTH_SECRET

Generate a random secret for NextAuth:

### Windows PowerShell:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
```

### Windows CMD:
```cmd
powershell -Command "[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))"
```

### Linux/Mac:
```bash
openssl rand -base64 32
```

### Or use an online generator:
- Visit: https://generate-secret.vercel.app/32
- Copy the generated secret

Add to `.env.local`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

---

## ✅ Step 5: Verify Your `.env.local` File

Your `.env.local` should look like this (with your actual values):

```env
# Database Configuration
MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chatbotdb?retryWrites=true&w=majority"
MONGODB_DB="chatbotdb"

# OpenAI API Configuration
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# NextAuth Configuration
NEXTAUTH_SECRET="aBc123XyZ456DeF789GhI012JkL345MnO678PqR901StU234VwX567YzA890="
NEXTAUTH_URL="http://localhost:3000"

# Webhook Configuration
WEBHOOK_URL="http://localhost:3000"
VERCEL_URL=""
```

**Important:**
- ✅ Use quotes around values (especially if they contain special characters)
- ✅ No spaces around the `=` sign
- ✅ No trailing spaces
- ✅ Each variable on its own line

---

## 🚀 Step 6: Test the Setup

1. **Restart your terminal** (to reload environment variables)

2. **Try running the Discord worker:**
   ```bash
   npm run worker:discord
   ```

3. **You should see:**
   ```
   🤖 Discord Worker Service Starting...
   =====================================
   🔌 Connecting to MongoDB...
   ✅ Connected to MongoDB
   ```

If you still get errors, check:
- ✅ File is named exactly `.env.local` (not `.env.local.txt`)
- ✅ File is in the root directory (same folder as `package.json`)
- ✅ No typos in variable names
- ✅ Values are properly quoted
- ✅ MongoDB URI is correct and accessible
- ✅ OpenAI API key is valid

---

## 🔒 Security Notes

1. **Never commit `.env.local` to Git!**
   - It's already in `.gitignore` ✅
   - Contains sensitive information (API keys, passwords)

2. **Use different values for development and production:**
   - Development: `.env.local`
   - Production: Set environment variables in your hosting platform

3. **Keep your secrets safe:**
   - Don't share `.env.local` file
   - Don't paste API keys in chat/email
   - Rotate keys if compromised

---

## 🐛 Troubleshooting

### ❌ Still getting "MONGODB_URI environment variable is required"

**Check:**
1. File is named `.env.local` (not `.env` or `.env.local.txt`)
2. File is in project root (same folder as `package.json`)
3. Restart terminal after creating file
4. Check for typos: `MONGODB_URI` (not `MONGODB_URL`)

**Try:**
```bash
# Check if file exists
ls .env.local  # Linux/Mac
dir .env.local  # Windows CMD
Get-ChildItem .env.local  # Windows PowerShell

# Check file contents (be careful - contains secrets!)
cat .env.local  # Linux/Mac
type .env.local  # Windows CMD
Get-Content .env.local  # Windows PowerShell
```

### ❌ MongoDB Connection Error

**Check:**
- MongoDB URI is correct
- If using Atlas: IP is whitelisted
- If using Atlas: Username/password are correct
- Network connection is working

**Test connection:**
```bash
# Try connecting with mongosh (if installed)
mongosh "your-mongodb-uri-here"
```

### ❌ OpenAI API Key Error

**Check:**
- API key starts with `sk-`
- Key is not expired
- Account has credits/quota
- Key has proper permissions

**Test:**
- Visit https://platform.openai.com/api-keys
- Verify key is active

---

## 📚 Additional Resources

- **MongoDB Atlas Setup**: https://www.mongodb.com/docs/atlas/getting-started/
- **OpenAI API Docs**: https://platform.openai.com/docs
- **NextAuth.js Docs**: https://next-auth.js.org/configuration/options#secret

---

## ✅ Checklist

- [ ] `.env.local` file created in project root
- [ ] `MONGODB_URI` set (local or Atlas)
- [ ] `OPENAI_API_KEY` set
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] `NEXTAUTH_URL` set to `http://localhost:3000`
- [ ] File saved and terminal restarted
- [ ] `npm run worker:discord` works without errors ✅

---

**Need more help?** Check the main setup guide: `docs/DISCORD_LOCAL_SETUP.md`

/**
 * Standalone Zalo Worker
 * 
 * This worker runs independently and monitors Zalo bots configured via bot.zapps.me
 * or standard Zalo Official Account API.
 * 
 * Features:
 * - Monitors enabled Zalo bots
 * - Verifies webhook connectivity
 * - Health checks for bot.zapps.me API integration
 * - Supports both direct API token (bot.zapps.me) and OAuth (standard Zalo API)
 * 
 * Usage:
 *   npm run worker:zalo
 *   or
 *   tsx scripts/zalo-worker.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import BotSettings from '../lib/models/BotSettings';
import { handleZaloMessage } from '../lib/services/zaloService';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEBHOOK_BASE_URL = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || process.env.WEBHOOK_URL || 'http://localhost:3000';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbName = mongoose.connection.db?.databaseName || 'unknown';
      console.log(`📊 Already connected to MongoDB. Database: ${dbName}`);
      return mongoose.connection;
    }

    console.log(`🔌 Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log(`✅ Connected to MongoDB`);
    console.log(`   Active database: ${dbName}`);
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Verify webhook connectivity for a bot
 */
async function verifyWebhook(bot: any): Promise<boolean> {
  const webhookUrl = bot.zalo?.webhookUrl;
  
  try {
    if (!webhookUrl) {
      return false;
    }
    
    // Check if webhook URL is localhost - won't be accessible from worker
    if (webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1')) {
      console.log(`   ⚠️ Webhook URL is localhost - not verifiable from worker`);
      console.log(`      URL: ${webhookUrl.replace(/verify_token=[^&]+/, 'verify_token=***')}`);
      console.log(`      💡 Use ngrok or a public URL for webhook verification`);
      return false;
    }

    // Check if webhook URL uses HTTP (not HTTPS) - may cause issues
    if (webhookUrl.startsWith('http://') && !webhookUrl.includes('localhost')) {
      console.log(`   ⚠️ Webhook URL uses HTTP instead of HTTPS - may cause security issues`);
    }

    // Try to ping the webhook endpoint (GET request for verification)
    const maskedUrl = webhookUrl.replace(/verify_token=[^&]+/, 'verify_token=***');
    console.log(`   🔍 Checking webhook: ${maskedUrl}`);
    
    const startTime = Date.now();
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Zalo-Worker-HealthCheck/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseTime = Date.now() - startTime;
    const responseText = await response.text().catch(() => 'Could not read response body');

    if (response.ok) {
      console.log(`   ✅ Webhook is accessible (${response.status} ${response.statusText}, ${responseTime}ms)`);
      try {
        const responseJson = JSON.parse(responseText);
        console.log(`   📄 Response: ${JSON.stringify(responseJson).substring(0, 100)}...`);
      } catch {
        console.log(`   📄 Response: ${responseText.substring(0, 100)}...`);
      }
      return true;
    } else {
      console.log(`   ⚠️ Webhook returned ${response.status} ${response.statusText}`);
      console.log(`   📄 Response body: ${responseText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'Unknown';
    console.error(`   ⚠️ Webhook verification failed: ${errorName}: ${errorMessage}`);
    
    // Provide helpful error messages
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      console.error(`   💡 Tip: Webhook URL may not be accessible. Check:`);
      console.error(`      1. URL is publicly accessible (not localhost)`);
      console.error(`      2. Server is running and reachable`);
      console.error(`      3. If using ngrok, make sure it's running (check ngrok dashboard: http://localhost:4040)`);
      console.error(`      4. Firewall/network allows connections`);
      console.error(`      5. Webhook URL format is correct (should include ?botId=...)`);
    } else if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
      console.error(`   💡 Tip: Webhook took too long to respond (>10s). Check:`);
      console.error(`      1. Server is running and not overloaded`);
      console.error(`      2. Network connection is stable`);
      console.error(`      3. Webhook endpoint is responding quickly`);
    } else if (errorMessage.includes('CERT') || errorMessage.includes('SSL') || errorMessage.includes('certificate')) {
      console.error(`   💡 Tip: SSL/TLS certificate issue. Check:`);
      console.error(`      1. HTTPS URL is valid`);
      console.error(`      2. Certificate is not expired`);
      console.error(`      3. If using ngrok, it should provide valid SSL`);
    } else {
      console.error(`   💡 Tip: Unknown error. Check webhook URL in bot settings.`);
    }
    
    return false;
  }
}

/**
 * Verify bot.zapps.me API connectivity
 */
async function verifyBotZappsMeAPI(bot: any): Promise<boolean> {
  try {
    if (!bot.zalo?.apiToken || !bot.zalo?.apiUrlTemplate) {
      return false;
    }

    // Replace <TOKN> with actual token
    const apiUrl = bot.zalo.apiUrlTemplate.replace(/<TOKN>/g, bot.zalo.apiToken);
    
    // Try a simple GET request to verify the API is accessible
    // Note: bot.zapps.me might not have a GET endpoint, so we just check if URL is valid
    const url = new URL(apiUrl);
    return url.hostname === 'bot-api.zapps.me' || url.hostname.includes('zapps.me');
  } catch (error) {
    return false;
  }
}

/**
 * Main function
 * 
 * Monitors enabled Zalo bots and verifies their connectivity
 */
async function main() {
  console.log('🤖 Zalo Worker Service Starting...');
  console.log('=====================================');
  console.log(`📡 Webhook Base URL: ${WEBHOOK_BASE_URL}`);
  console.log('');

  try {
    await connectDB();
    console.log('✅ Database connected');
    console.log('');

    // Initial bot discovery
    const enabledBots = await BotSettings.find({
      'zalo.enabled': true,
      $or: [
        { 'zalo.appId': { $exists: true, $ne: null } },
        { 'zalo.apiToken': { $exists: true, $ne: null } }
      ]
    }).select('botId name zalo').lean() as any[];

    if (enabledBots.length === 0) {
      console.log('⚠️ No enabled Zalo bots found. Waiting for bots to be enabled...');
    } else {
      console.log(`✅ Found ${enabledBots.length} enabled Zalo bot(s)`);
      console.log('');
      
      for (const bot of enabledBots) {
        const useDirectToken = !!bot.zalo?.apiToken;
        const connectionType = useDirectToken ? 'bot.zapps.me (Direct API Token)' : 'Zalo Official Account (OAuth)';
        
        console.log(`   📱 ${bot.name} (${bot.botId})`);
        console.log(`      Type: ${connectionType}`);
        console.log(`      OA ID: ${bot.zalo?.oaId || 'N/A'}`);
        console.log(`      Webhook: ${bot.zalo?.webhookUrl || 'Not set'}`);
        
        if (useDirectToken && bot.zalo?.apiUrlTemplate) {
          console.log(`      API URL Template: ${bot.zalo.apiUrlTemplate.replace(/<TOKN>/g, '***')}`);
        }
        console.log('');
      }
    }

    // Monitor bot status every 60 seconds
    setInterval(async () => {
      try {
        console.log(`[${new Date().toISOString()}] 🔄 Checking bot status...`);
        
        const currentBots = await BotSettings.find({
          'zalo.enabled': true,
          $or: [
            { 'zalo.appId': { $exists: true, $ne: null } },
            { 'zalo.apiToken': { $exists: true, $ne: null } }
          ]
        }).select('botId name zalo updatedAt').lean() as any[];

        console.log(`[ZALO] 📊 Active Zalo bots: ${currentBots.length}`);
        
        for (const bot of currentBots) {
          const useDirectToken = !!bot.zalo?.apiToken;
          const connectionType = useDirectToken ? 'bot.zapps.me' : 'Zalo OA';
          
          console.log(`[ZALO]   ✅ ${bot.name} (${bot.botId}) - ${connectionType}`);
          
          // Verify webhook if configured
          if (bot.zalo?.webhookUrl) {
            const webhookUrl = bot.zalo.webhookUrl;
            // Skip verification for localhost URLs (won't be accessible from worker)
            if (webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1')) {
              console.log(`[ZALO]      ⚠️ Webhook URL is localhost - not verifiable from worker`);
              console.log(`[ZALO]         URL: ${webhookUrl.replace(/verify_token=[^&]+/, 'verify_token=***')}`);
              console.log(`[ZALO]         💡 This is OK for local testing with ngrok`);
              console.log(`[ZALO]         💡 Use a public URL (ngrok, Railway, Vercel) for production`);
            } else {
              const webhookOk = await verifyWebhook(bot);
              if (webhookOk) {
                console.log(`[ZALO]      ✅ Webhook accessible`);
              } else {
                console.log(`[ZALO]      ⚠️ Webhook verification failed (but bot may still work)`);
                console.log(`[ZALO]         Check webhook URL: ${webhookUrl.replace(/verify_token=[^&]+/, 'verify_token=***')}`);
              }
            }
          } else {
            console.log(`[ZALO]      ⚠️ No webhook URL configured`);
            console.log(`[ZALO]         Messages will not be received until webhook is set in bot.zapps.me dashboard`);
          }
          
          // Show bot.zapps.me API configuration if using direct token
          if (useDirectToken && bot.zalo?.apiUrlTemplate) {
            const apiUrl = bot.zalo.apiUrlTemplate.replace(/<TOKN>/g, '***');
            console.log(`[ZALO]      ✅ bot.zapps.me API configured (${apiUrl})`);
          }
        }
        
        console.log('');
      } catch (error) {
        console.error('[ZALO] ❌ Error checking bot status:', error);
      }
    }, 60000); // 60 seconds

    console.log('✅ Zalo Worker Service is running');
    console.log('💡 This worker monitors Zalo bot status and webhook connectivity');
    console.log('💡 Supports both bot.zapps.me (Direct API Token) and Zalo Official Account (OAuth)');
    console.log('💡 Press Ctrl+C to stop');
    console.log('');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Zalo Worker Service...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down Zalo Worker Service...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Start the service
main().catch((error) => {
  console.error('❌ Fatal error in main:', error);
  process.exit(1);
});

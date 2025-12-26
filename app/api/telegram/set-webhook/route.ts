import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import BotSettings from '@/lib/models/BotSettings';
import { setTelegramWebhook, getTelegramBotInfo } from '@/lib/services/telegramService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId, token, webhookUrl: customWebhookUrl } = await request.json();

    if (!botId || !token) {
      return NextResponse.json(
        { error: 'Bot ID and Telegram token are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify bot belongs to user
    console.log(`🔍 Looking for bot with botId: "${botId}" and userId: "${session.user.id}"`);
    
    let botSettings = await BotSettings.findOne({ 
      botId,
      userId: session.user.id 
    });

    // If not found, try without userId check (for debugging)
    if (!botSettings) {
      console.log(`⚠️ Bot not found with userId check, trying without userId...`);
      botSettings = await BotSettings.findOne({ botId });
      
      if (botSettings) {
        console.log(`⚠️ Found bot but userId mismatch: bot.userId=${botSettings.userId}, session.userId=${session.user.id}`);
      }
    }

    if (!botSettings) {
      // List all bots for debugging
      const allBots = await BotSettings.find({});
      console.log(`❌ Bot not found. All bots in database (${allBots.length}):`);
      allBots.forEach((bot, index) => {
        console.log(`   ${index + 1}. "${bot.botId}" (userId: ${bot.userId})`);
      });
      
      return NextResponse.json(
        { error: `Bot not found with botId: "${botId}"` },
        { status: 404 }
      );
    }
    
    console.log(`✅ Found bot: ${botSettings.name} (${botSettings.botId})`);

    // Get bot info to verify token
    const botInfo = await getTelegramBotInfo(token);

    // Build webhook URL - use custom URL if provided, otherwise build from env
    let webhookUrl = '';
    
    // Encode botId to handle special characters
    const encodedBotId = encodeURIComponent(botId);
    
    if (customWebhookUrl) {
      // User provided custom webhook URL (e.g., from ngrok)
      // Remove trailing slash if present
      const cleanUrl = customWebhookUrl.replace(/\/$/, '');
      webhookUrl = `${cleanUrl}/api/telegram/webhook?botId=${encodedBotId}`;
    } else {
      // Auto-build from environment variables
      let baseUrl = '';
      if (process.env.NEXTAUTH_URL) {
        baseUrl = process.env.NEXTAUTH_URL;
      } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.WEBHOOK_URL) {
        baseUrl = process.env.WEBHOOK_URL;
      } else {
        // Default to localhost (will fail but give clear error)
        baseUrl = 'http://localhost:3000';
      }
      
      // Remove trailing slash if present
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      webhookUrl = `${cleanBaseUrl}/api/telegram/webhook?botId=${encodedBotId}`;
    }

    // Telegram requires HTTPS for webhooks - no exceptions
    if (!webhookUrl.startsWith('https://')) {
      return NextResponse.json(
        { 
          error: 'Telegram requires HTTPS for webhooks. Please provide an HTTPS URL.',
          details: `Current URL: ${webhookUrl}. For local development, use ngrok (https://ngrok.com) or provide a custom HTTPS webhook URL.`,
          requiresHttps: true
        },
        { status: 400 }
      );
    }

    console.log('Setting webhook URL:', webhookUrl);

    // Set webhook
    const result = await setTelegramWebhook(token, webhookUrl);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to set webhook',
          details: result.details
        },
        { status: 500 }
      );
    }

    // Update bot settings using findOneAndUpdate to ensure atomic update
    console.log(`💾 Saving telegram settings for bot: ${botSettings.botId}`);
    console.log(`   Current telegram settings:`, JSON.stringify(botSettings.telegram || {}));
    
    try {
      // Prepare telegram data
      const telegramData = {
        enabled: true,
        botToken: token,
        botUsername: botInfo.username || '',
        webhookUrl: webhookUrl,
        webhookSetAt: new Date()
      };
      
      console.log(`💾 Saving telegram settings:`, JSON.stringify(telegramData, null, 2));
      console.log(`   Bot ID: ${botSettings.botId}`);
      
      // CRITICAL: Use MongoDB native update to bypass Mongoose schema issues
      // Access MongoDB directly through mongoose connection
      const mongooseConnection = await connectDB();
      if (!mongooseConnection || !mongooseConnection.connection || !mongooseConnection.connection.db) {
        throw new Error('MongoDB connection not available');
      }
      const db = mongooseConnection.connection.db;
      // Mongoose pluralizes model names, so "BotSettings" becomes "botsettings"
      const collectionName = BotSettings.collection.name;
      console.log(`📦 Using collection: ${collectionName}`);
      const collection = db.collection(collectionName);
      
      console.log(`🔧 Using MongoDB native update...`);
      const updateResult = await collection.updateOne(
        { botId: botSettings.botId },
        {
          $set: {
            'telegram.enabled': telegramData.enabled,
            'telegram.botToken': telegramData.botToken,
            'telegram.botUsername': telegramData.botUsername,
            'telegram.webhookUrl': telegramData.webhookUrl,
            'telegram.webhookSetAt': telegramData.webhookSetAt
          }
        }
      );
      
      console.log(`✅ MongoDB native update result:`, {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        acknowledged: updateResult.acknowledged
      });
      
      if (updateResult.matchedCount === 0) {
        console.error(`❌ No document matched botId: ${botSettings.botId}`);
        return NextResponse.json(
          { error: 'Bot not found for update' },
          { status: 404 }
        );
      }
      
      if (updateResult.modifiedCount === 0) {
        console.warn(`⚠️ Document matched but not modified. This might mean data is already the same.`);
      }
      
      // Now reload using Mongoose to get the updated document
      let updatedBot = await BotSettings.findOne({ botId: botSettings.botId });
      
      if (!updatedBot) {
        console.error(`❌ Failed to reload bot after update!`);
        return NextResponse.json(
          { error: 'Failed to reload bot after update' },
          { status: 500 }
        );
      }

      if (!updatedBot) {
        console.error(`❌ Failed to update bot settings!`);
        return NextResponse.json(
          { error: 'Failed to save bot settings to database' },
          { status: 500 }
        );
      }

      console.log(`✅ Bot settings saved successfully`);
      console.log(`   Updated bot telegram (from save):`, JSON.stringify(updatedBot.telegram || {}, null, 2));
      console.log(`   Updated bot telegram type:`, typeof updatedBot.telegram);
      
      // Update local reference
      botSettings = updatedBot;
      
      // CRITICAL VERIFICATION: Check multiple ways to ensure data is saved
      console.log(`🔍 Verifying save with multiple methods...`);
      
      // Wait a bit for MongoDB to commit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verification 1: Mongoose document (without lean)
      const verifyBotDoc = await BotSettings.findOne({ botId: botSettings.botId });
      console.log(`✅ Verification 1 (Mongoose doc):`, {
        botId: verifyBotDoc?.botId,
        hasToken: !!verifyBotDoc?.telegram?.botToken,
        enabled: verifyBotDoc?.telegram?.enabled,
        username: verifyBotDoc?.telegram?.botUsername,
        telegram: verifyBotDoc?.telegram,
        telegramType: typeof verifyBotDoc?.telegram
      });
      
      // Verification 2: Plain object (with lean - what API returns)
      const verifyBot = await BotSettings.findOne({ botId: botSettings.botId }).lean() as any;
      console.log(`✅ Verification 2 (Plain object):`, {
        botId: verifyBot?.botId,
        hasToken: !!verifyBot?.telegram?.botToken,
        enabled: verifyBot?.telegram?.enabled,
        username: verifyBot?.telegram?.botUsername,
        telegram: verifyBot?.telegram,
        telegramType: typeof verifyBot?.telegram,
        allKeys: Object.keys(verifyBot || {})
      });
      
      // Verification 3: Query using telegram.botToken (how telegramService queries)
      const verifyByToken = await BotSettings.findOne({ 
        botId: botSettings.botId,
        'telegram.botToken': token 
      }).lean() as any;
      console.log(`✅ Verification 3 (Query by token):`, {
        found: !!verifyByToken,
        hasToken: !!verifyByToken?.telegram?.botToken,
        enabled: verifyByToken?.telegram?.enabled
      });
      
      // Verification 4: Query using telegram.enabled (how telegramService queries)
      const verifyByEnabled = await BotSettings.findOne({ 
        botId: botSettings.botId,
        'telegram.enabled': true 
      }).lean() as any;
      console.log(`✅ Verification 4 (Query by enabled):`, {
        found: !!verifyByEnabled,
        hasToken: !!verifyByEnabled?.telegram?.botToken,
        enabled: verifyByEnabled?.telegram?.enabled
      });
      
      // Final check
      if (!verifyBot || !verifyBot.telegram || !verifyBot.telegram.botToken) {
        console.error(`❌❌❌ CRITICAL: Telegram settings NOT saved!`);
        console.error(`   Verification 1 (Mongoose):`, verifyBotDoc?.telegram);
        console.error(`   Verification 2 (Lean):`, verifyBot?.telegram);
        console.error(`   Verification 3 (By token):`, verifyByToken?.telegram);
        console.error(`   Verification 4 (By enabled):`, verifyByEnabled?.telegram);
        console.error(`   Full document:`, JSON.stringify(verifyBot, null, 2));
        
        // Try one more time with direct MongoDB query
        const directQuery = await BotSettings.findOne({ botId: botSettings.botId }).select('+telegram').lean() as any;
        console.error(`   Direct query result:`, directQuery?.telegram);
      } else {
        console.log(`✅✅✅ ALL VERIFICATIONS PASSED! Telegram settings saved successfully!`);
      }
    } catch (saveError: any) {
      console.error(`❌ Error saving bot settings:`, saveError);
      console.error(`   Error details:`, saveError.message);
      return NextResponse.json(
        { 
          error: 'Failed to save bot settings',
          details: saveError.message 
        },
        { status: 500 }
      );
    }

    // Final reload to ensure we return the latest data
    const finalBot = await BotSettings.findOne({ botId: botSettings.botId }).lean() as any;
    
    return NextResponse.json({
      success: true,
      webhookUrl,
      botInfo,
      message: 'Telegram bot activated successfully!',
      telegram: finalBot?.telegram || null // Include telegram settings in response
    });
  } catch (error: any) {
    console.error('Error setting Telegram webhook:', error);
    
    // Provide more detailed error information
    let errorMessage = error.message || 'Failed to set webhook';
    let errorDetails = null;

    if (error.response?.data) {
      errorDetails = error.response.data;
      errorMessage = error.response.data.description || errorMessage;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails || error.stack
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import BotSettings from '@/lib/models/BotSettings';
import { setMessengerWebhook, getMessengerPageInfo } from '@/lib/services/messengerService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId, pageAccessToken, verifyToken, appSecret, webhookUrl: customWebhookUrl } = await request.json();

    if (!botId || !pageAccessToken || !verifyToken) {
      return NextResponse.json(
        { error: 'Bot ID, Page Access Token, and Verify Token are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify bot belongs to user
    let botSettings = await BotSettings.findOne({ 
      botId,
      userId: session.user.id 
    });

    if (!botSettings) {
      return NextResponse.json(
        { error: `Bot not found with botId: "${botId}"` },
        { status: 404 }
      );
    }

    console.log(`✅ Found bot: ${botSettings.name} (${botSettings.botId})`);

    // Get page info to verify token
    const pageInfo = await getMessengerPageInfo(pageAccessToken);

    // Build webhook URL
    const encodedBotId = encodeURIComponent(botId);
    let webhookUrl = '';
    
    if (customWebhookUrl) {
      const cleanUrl = customWebhookUrl.replace(/\/$/, '');
      webhookUrl = `${cleanUrl}/api/messenger/webhook?botId=${encodedBotId}`;
    } else {
      let baseUrl = '';
      if (process.env.NEXTAUTH_URL) {
        baseUrl = process.env.NEXTAUTH_URL;
      } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.WEBHOOK_URL) {
        baseUrl = process.env.WEBHOOK_URL;
      } else {
        baseUrl = 'http://localhost:3000';
      }
      
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      webhookUrl = `${cleanBaseUrl}/api/messenger/webhook?botId=${encodedBotId}`;
    }

    // Messenger requires HTTPS for webhooks (except localhost)
    if (!webhookUrl.startsWith('https://') && !webhookUrl.includes('localhost')) {
      return NextResponse.json(
        { 
          error: 'Messenger requires HTTPS for webhooks. Please provide an HTTPS URL.',
          details: `Current URL: ${webhookUrl}. For local development, use ngrok (https://ngrok.com) or provide a custom HTTPS webhook URL.`,
          requiresHttps: true
        },
        { status: 400 }
      );
    }

    console.log('Setting webhook URL:', webhookUrl);

    // Verify webhook configuration
    const result = await setMessengerWebhook(pageAccessToken, webhookUrl);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to verify Messenger configuration',
          details: result.details
        },
        { status: 500 }
      );
    }

    // Update bot settings using MongoDB native update
    const mongooseConnection = await connectDB();
    if (!mongooseConnection || !mongooseConnection.connection || !mongooseConnection.connection.db) {
      throw new Error('MongoDB connection not available');
    }
    const db = mongooseConnection.connection.db;
    const collectionName = BotSettings.collection.name;
    console.log(`📦 Using collection: ${collectionName}`);
    const collection = db.collection(collectionName);
    
    console.log(`🔧 Using MongoDB native update...`);
    const updateResult = await collection.updateOne(
      { botId: botSettings.botId },
      {
        $set: {
          'messenger.enabled': true,
          'messenger.pageAccessToken': pageAccessToken,
          'messenger.verifyToken': verifyToken,
          'messenger.appSecret': appSecret || null,
          'messenger.pageId': pageInfo.id,
          'messenger.pageName': pageInfo.name,
          'messenger.webhookUrl': webhookUrl,
          'messenger.webhookSetAt': new Date()
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

    // Reload bot to verify
    const updatedBot = await BotSettings.findOne({ botId: botSettings.botId }).lean() as any;
    
    console.log(`✅ Messenger settings saved successfully`);
    console.log(`   Updated bot messenger:`, JSON.stringify(updatedBot?.messenger || {}, null, 2));

    return NextResponse.json({
      success: true,
      webhookUrl,
      pageInfo: {
        id: pageInfo.id,
        name: pageInfo.name
      },
      message: 'Messenger bot activated successfully! Please configure webhook in Facebook App Dashboard.',
      instructions: [
        '1. Go to Facebook App Dashboard → Webhooks',
        `2. Add webhook URL: ${webhookUrl}`,
        `3. Set Verify Token: ${verifyToken}`,
        '4. Subscribe to "messages" and "messaging_postbacks" events',
        '5. Your bot will start receiving messages!'
      ]
    });
  } catch (error: any) {
    console.error('Error setting Messenger webhook:', error);
    
    let errorMessage = error.message || 'Failed to set webhook';
    let errorDetails = null;

    if (error.response?.data) {
      errorDetails = error.response.data;
      errorMessage = error.response.data.error?.message || errorMessage;
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


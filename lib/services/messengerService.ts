import connectDB from '@/lib/db';
import BotSettings from '@/lib/models/BotSettings';
import Message from '@/lib/models/Message';
import { processChatMessage } from './chatService';

/**
 * Send message via Facebook Messenger API
 */
export async function sendMessengerMessage(
  pageAccessToken: string,
  recipientId: string,
  message: string
): Promise<any> {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: message }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Facebook API error: ${error.error?.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Get Facebook Page information
 */
export async function getMessengerPageInfo(pageAccessToken: string): Promise<any> {
  const url = `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${pageAccessToken}`;
  
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Facebook API error: ${error.error?.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Set Messenger webhook subscription
 */
export async function setMessengerWebhook(
  pageAccessToken: string,
  webhookUrl: string
): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    // Note: Facebook webhook setup is done via Facebook App Dashboard
    // This function just verifies the configuration
    const pageInfo = await getMessengerPageInfo(pageAccessToken);
    
    return {
      success: true,
      details: {
        pageId: pageInfo.id,
        pageName: pageInfo.name,
        webhookUrl: webhookUrl
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to verify Messenger configuration',
      details: error
    };
  }
}

/**
 * Verify webhook signature (for security)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  appSecret: string
): boolean {
  if (!appSecret) {
    console.warn('⚠️ App Secret not configured, skipping signature verification');
    return true; // Allow if no secret configured
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}

/**
 * Handle incoming Messenger message
 */
export async function handleMessengerMessage(
  webhookData: any,
  botId?: string
) {
  // Messenger sends different event types
  if (webhookData.object !== 'page') {
    console.log('⚠️ Not a page object, skipping');
    return;
  }

  await connectDB();

  // Process each entry
  for (const entry of webhookData.entry || []) {
    const pageId = entry.id;
    
    // Process messages
    for (const event of entry.messaging || []) {
      // Skip if not a message
      if (!event.message || !event.message.text) {
        continue;
      }

      const senderId = event.sender.id;
      const messageText = event.message.text;
      const messageId = event.message.mid;

      console.log(`📨 Processing Messenger message: senderId=${senderId}, text="${messageText}", botId=${botId || 'not provided'}`);

      // Find bot settings
      let botSettings: any = null;

      if (botId) {
        const normalizedBotId = botId.trim();
        console.log(`🔍 Looking for bot with botId: "${normalizedBotId}"`);

        // Strategy 1: Try exact match with messenger.enabled
        botSettings = await BotSettings.findOne({
          botId: normalizedBotId,
          'messenger.enabled': true,
          'messenger.pageAccessToken': { $exists: true }
        }).lean() as any;

        // Strategy 2: Try without enabled check
        if (!botSettings) {
          console.log(`⚠️ Not found with enabled=true, trying without enabled check...`);
          botSettings = await BotSettings.findOne({
            botId: normalizedBotId,
            'messenger.pageAccessToken': { $exists: true }
          }).lean() as any;
        }

        // Strategy 3: Case-insensitive search
        if (!botSettings) {
          console.log(`⚠️ Exact match not found, trying case-insensitive search...`);
          const allBots = await BotSettings.find({
            'messenger.pageAccessToken': { $exists: true }
          }).lean() as any[];

          botSettings = allBots.find(bot =>
            bot.botId.toLowerCase() === normalizedBotId.toLowerCase()
          ) || null;
        }
      } else {
        // Fallback: find any enabled Messenger bot
        console.log('🔍 No botId provided, searching for enabled bots...');
        const bots = await BotSettings.find({
          'messenger.enabled': true,
          'messenger.pageAccessToken': { $exists: true }
        }).lean() as any[];

        if (bots.length > 0) {
          botSettings = bots[0];
          console.log(`✅ Using first enabled bot: ${botSettings.name} (${botSettings.botId})`);
        }
      }

      if (botSettings) {
        console.log(`✅ Found bot: ${botSettings.name} (${botSettings.botId})`);
        console.log(`   Messenger enabled: ${botSettings.messenger?.enabled || false}`);
        console.log(`   Has page access token: ${!!botSettings.messenger?.pageAccessToken}`);
        console.log(`   Messenger data:`, JSON.stringify(botSettings.messenger || {}, null, 2));
      }

      if (!botSettings || !botSettings.messenger?.pageAccessToken) {
        console.error('❌ Messenger bot not found or not configured');
        console.error('Bot settings:', botSettings ? 'Found but missing messenger config' : 'Not found');
        return;
      }

      // Handle postback (when user clicks button)
      if (event.postback) {
        if (event.postback.payload === 'GET_STARTED') {
          // Send welcome message
          try {
            await sendMessengerMessage(
              botSettings.messenger.pageAccessToken,
              senderId,
              botSettings.welcomeMessage || `Xin chào! Tôi là ${botSettings.name}. Tôi có thể giúp gì cho bạn?`
            );
            console.log('✅ Welcome message sent');
          } catch (error) {
            console.error('❌ Error sending welcome message:', error);
          }
        }
        return;
      }

      // Ignore empty messages
      if (!messageText.trim()) {
        console.log('⚠️ Empty message, skipping');
        return;
      }

      const apiKey = process.env.OPENAI_API_KEY || '';
      if (!apiKey) {
        console.error('❌ OpenAI API key not configured');
        try {
          await sendMessengerMessage(
            botSettings.messenger.pageAccessToken,
            senderId,
            'Sorry, the AI service is not configured. Please contact the administrator.'
          );
        } catch (error) {
          console.error('❌ Error sending API key error message:', error);
        }
        return;
      }

      try {
        console.log(`🤖 Processing message with AI: "${messageText}"`);

        // Process message with AI
        const reply = await processChatMessage(
          botSettings,
          messageText,
          apiKey,
          'facebook'
        );

        console.log(`✅ AI reply generated: "${reply.substring(0, 50)}..."`);

        // Send reply
        await sendMessengerMessage(
          botSettings.messenger.pageAccessToken,
          senderId,
          reply
        );

        console.log('✅ Reply sent to Messenger');

        // Track message - do this asynchronously to not block response
        setImmediate(async () => {
          try {
            const messageRecord = new Message({
              userId: botSettings.userId,
              botId: botSettings.botId,
              message: messageText,
              response: reply,
              timestamp: new Date(),
              sessionId: `messenger_${senderId}`
            });
            await messageRecord.save();
            console.log('✅ Message tracked in database');
          } catch (trackingError) {
            console.error('⚠️ Error tracking Messenger message:', trackingError);
          }
        });
      } catch (error) {
        console.error('❌ Error handling Messenger message:', error);
        console.error('Error details:', error instanceof Error ? error.stack : error);

        try {
          await sendMessengerMessage(
            botSettings.messenger.pageAccessToken,
            senderId,
            'Sorry, I encountered an error processing your message. Please try again later.'
          );
        } catch (sendError) {
          console.error('❌ Error sending error message to user:', sendError);
        }
      }
    }
  }
}


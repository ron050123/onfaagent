'use server';

import connectDB from '@/lib/db';
import BotSettings from '@/lib/models/BotSettings';
import Message from '@/lib/models/Message';
import { processChatMessage } from './chatService';

// Cache for bot settings to reduce database queries
const botSettingsCache = new Map<string, { settings: any; timestamp: number }>();
const BOT_SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Cache for access tokens (Zalo tokens expire, need to refresh)
const accessTokenCache = new Map<string, { token: string; expiresAt: number }>();

/**
 * Zalo API Base URL
 */
const ZALO_API_BASE = 'https://openapi.zalo.me/v2.0';

/**
 * Get or refresh Zalo access token
 * Zalo access tokens expire, so we need to refresh them periodically
 */
async function getZaloAccessToken(appId: string, appSecret: string): Promise<string> {
  const cacheKey = `${appId}_${appSecret}`;
  const cached = accessTokenCache.get(cacheKey);
  
  // Check if cached token is still valid (refresh 5 minutes before expiry)
  if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cached.token;
  }

  try {
    // Request new access token from Zalo OAuth endpoint
    const response = await fetch('https://oauth.zalo.me/v4/oa/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        app_id: appId,
        app_secret: appSecret,
      }),
    });

    if (!response.ok) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/services/zaloService.ts:47',message:'Zalo OAuth response not OK',data:{status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    // #region agent log
    let responseText = '';
    try {
      responseText = await response.text();
      fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/services/zaloService.ts:51',message:'Before parsing Zalo OAuth response',data:{responseLength:responseText.length,responsePreview:responseText.substring(0,200),isEmpty:!responseText.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    } catch (e) {
      fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/services/zaloService.ts:51',message:'Error reading Zalo OAuth response',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    }
    // #endregion
    const data = JSON.parse(responseText);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/services/zaloService.ts:51',message:'After parsing Zalo OAuth response',data:{hasAccessToken:!!data.access_token,hasError:!!data.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (data.error) {
      throw new Error(`Zalo API error: ${data.error_description || data.error}`);
    }

    const accessToken = data.access_token;
    const expiresIn = data.expires_in || 3600; // Default to 1 hour
    
    // Cache the token (expires in expiresIn seconds)
    accessTokenCache.set(cacheKey, {
      token: accessToken,
      expiresAt: Date.now() + (expiresIn * 1000),
    });

    return accessToken;
  } catch (error: any) {
    console.error('Error getting Zalo access token:', error);
    throw error;
  }
}

/**
 * Make authenticated request to Zalo API
 */
async function zaloApiRequest(
  endpoint: string,
  method: string,
  accessToken: string,
  body?: any
): Promise<any> {
  const url = `${ZALO_API_BASE}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access_token': accessToken,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/services/zaloService.ts:99',message:'Zalo API request not OK',data:{status:response.status,endpoint,errorText:errorText.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    throw new Error(`Zalo API error (${response.status}): ${errorText}`);
  }

  // #region agent log
  let responseText = '';
  try {
    responseText = await response.text();
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/services/zaloService.ts:103',message:'Before parsing Zalo API response',data:{responseLength:responseText.length,responsePreview:responseText.substring(0,200),isEmpty:!responseText.trim(),endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  } catch (e) {
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/services/zaloService.ts:103',message:'Error reading Zalo API response',data:{error:String(e),endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }
  // #endregion
  return JSON.parse(responseText);
}

/**
 * Get Zalo Official Account info
 */
export async function getZaloOAInfo(appId: string, appSecret: string) {
  try {
    const accessToken = await getZaloAccessToken(appId, appSecret);
    const data = await zaloApiRequest('/oa/getoa', 'GET', accessToken);
    
    return {
      oaId: data.data?.oa_id,
      oaName: data.data?.name,
      avatar: data.data?.avatar,
    };
  } catch (error: any) {
    console.error('Error getting Zalo OA info:', error);
    throw error;
  }
}

/**
 * Send message via Zalo Official Account
 * Supports both App ID/Secret (OAuth) and direct API token
 */
export async function sendZaloMessage(
  appIdOrToken: string,
  appSecretOrUserId: string,
  userId: string,
  message: string,
  useDirectToken: boolean = false
): Promise<any> {
  try {
    let accessToken: string;
    
    if (useDirectToken) {
      // Use direct API token
      accessToken = appIdOrToken;
    } else {
      // Use App ID/Secret to get access token
      accessToken = await getZaloAccessToken(appIdOrToken, appSecretOrUserId);
    }
    
    const payload = {
      recipient: {
        user_id: userId,
      },
      message: {
        text: message,
      },
    };

    const data = await zaloApiRequest('/oa/message', 'POST', accessToken, payload);
    return data;
  } catch (error: any) {
    console.error('Error sending Zalo message:', error);
    throw error;
  }
}

/**
 * Set webhook for Zalo Official Account
 * Supports both App ID/Secret (OAuth) and direct API token
 */
export async function setZaloWebhook(
  appIdOrToken: string,
  appSecretOrWebhookUrl: string,
  webhookUrl: string,
  verifyToken: string,
  useDirectToken: boolean = false
): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    let accessToken: string;
    let finalWebhookUrl = webhookUrl;
    
    if (useDirectToken) {
      // Use direct API token, appSecretOrWebhookUrl is the webhook URL
      accessToken = appIdOrToken;
      finalWebhookUrl = appSecretOrWebhookUrl;
    } else {
      // Use App ID/Secret to get access token
      accessToken = await getZaloAccessToken(appIdOrToken, appSecretOrWebhookUrl);
    }
    
    const payload = {
      url: finalWebhookUrl,
      verify_token: verifyToken,
    };

    const data = await zaloApiRequest('/oa/webhook', 'POST', accessToken, payload);
    
    if (data.error === 0 || data.error === undefined) {
      return { success: true };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to set webhook',
        details: data,
      };
    }
  } catch (error: any) {
    console.error('Error setting Zalo webhook:', error);
    return {
      success: false,
      error: error.message || 'Failed to set webhook',
      details: error,
    };
  }
}

/**
 * Delete webhook for Zalo Official Account
 * Supports both App ID/Secret (OAuth) and direct API token
 */
export async function deleteZaloWebhook(
  appIdOrToken: string,
  appSecret?: string,
  useDirectToken: boolean = false
): Promise<boolean> {
  try {
    let accessToken: string;
    
    if (useDirectToken) {
      // Use direct API token
      accessToken = appIdOrToken;
    } else {
      // Use App ID/Secret to get access token
      if (!appSecret) {
        throw new Error('App Secret is required when not using direct token');
      }
      accessToken = await getZaloAccessToken(appIdOrToken, appSecret);
    }
    
    await zaloApiRequest('/oa/webhook', 'DELETE', accessToken);
    return true;
  } catch (error) {
    console.error('Error deleting Zalo webhook:', error);
    return false;
  }
}

/**
 * Invalidate bot settings cache
 */
export async function invalidateBotSettingsCache(botId?: string): Promise<void> {
  if (botId) {
    const cacheKey = `zalo_${botId.trim()}`;
    botSettingsCache.delete(cacheKey);
    console.log(`🗑️ Invalidated cache for bot: ${botId}`);
  } else {
    botSettingsCache.clear();
    console.log('🗑️ Cleared all bot settings cache');
  }
}

/**
 * Handle incoming Zalo message
 */
export async function handleZaloMessage(
  event: any,
  botId?: string
) {
  // Zalo webhook event structure:
  // {
  //   "app_id": "...",
  //   "oa_id": "...",
  //   "user_id": "...",
  //   "event": "user_send_text",
  //   "timestamp": 1234567890,
  //   "message": {
  //     "text": "Hello"
  //   }
  // }

  if (!event || event.event !== 'user_send_text') {
    console.log('⏭️ Skipping non-text message event:', event?.event);
    return;
  }

  const userId = event.user_id;
  const text = event.message?.text || '';
  const oaId = event.oa_id;

  console.log(`📨 Zalo message received: userId=${userId}, text="${text.substring(0, 50)}..."`);

  // Connect to DB
  await connectDB();

  let botSettings: any = null;

  if (botId) {
    const normalizedBotId = botId.trim();
    console.log(`🔍 Looking for bot with botId: "${normalizedBotId}"`);
    
    // Check cache first
    const cacheKey = `zalo_${normalizedBotId}`;
    const cached = botSettingsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < BOT_SETTINGS_CACHE_TTL) {
      console.log(`✅ Using cached bot settings for: ${normalizedBotId}`);
      botSettings = cached.settings;
    } else {
      botSettings = await BotSettings.findOne({ 
        botId: normalizedBotId,
        'zalo.enabled': true,
        $or: [
          { 'zalo.appId': { $exists: true } },
          { 'zalo.apiToken': { $exists: true } }
        ]
      }).select('botId name userId zalo welcomeMessage faqs documents urls structuredData updatedAt').lean() as any;
      
      if (botSettings) {
        botSettingsCache.set(cacheKey, { settings: botSettings, timestamp: Date.now() });
      }
    }
  } else {
    // Find first enabled Zalo bot with matching oaId
    botSettings = await BotSettings.findOne({
      'zalo.enabled': true,
      'zalo.oaId': oaId,
      $or: [
        { 'zalo.appId': { $exists: true } },
        { 'zalo.apiToken': { $exists: true } }
      ]
    }).select('botId name userId zalo welcomeMessage faqs documents urls structuredData updatedAt').lean() as any;
  }

  if (!botSettings) {
    console.error(`❌ Zalo bot settings not found for bot: ${botId || oaId}`);
    return;
  }

  // Handle welcome message
  const lowerText = text.toLowerCase().trim();
  if (lowerText === '/start' || lowerText === 'start' || lowerText === 'hi' || lowerText === 'hello' || lowerText === 'xin chào') {
    try {
      await sendZaloMessage(
        botSettings.zalo.appId,
        botSettings.zalo.appSecret!,
        userId,
        botSettings.welcomeMessage || `Xin chào! Tôi là ${botSettings.name}. Tôi có thể giúp gì cho bạn?`
      );
    } catch (error) {
      console.error('❌ Error sending welcome message:', error);
    }
    return;
  }

  // Ignore empty messages
  if (!text.trim()) {
    return;
  }

  // Get OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OpenAI API key not configured');
    try {
      const useDirectToken = !!botSettings.zalo.apiToken;
      if (useDirectToken) {
        await sendZaloMessage(
          botSettings.zalo.apiToken!,
          userId,
          userId,
          'Xin lỗi, hệ thống đang được cấu hình. Vui lòng thử lại sau.',
          true
        );
      } else {
        await sendZaloMessage(
          botSettings.zalo.appId!,
          botSettings.zalo.appSecret!,
          userId,
          'Xin lỗi, hệ thống đang được cấu hình. Vui lòng thử lại sau.',
          false
        );
      }
    } catch (error) {
      console.error('❌ Error sending error message:', error);
    }
    return;
  }

  try {
    console.log(`🤖 Processing message with AI: "${text}"`);
    
    const reply = await processChatMessage(
      botSettings,
      text,
      apiKey,
      'zalo'
    );

    console.log(`✅ AI reply generated: "${reply.substring(0, 100)}..."`);

    // Send reply - support both direct API token and App ID/Secret
    const useDirectToken = !!botSettings.zalo.apiToken;
    if (useDirectToken) {
      await sendZaloMessage(
        botSettings.zalo.apiToken!,
        userId, // appSecretOrUserId parameter is userId when using direct token
        userId,
        reply,
        true
      );
    } else {
      await sendZaloMessage(
        botSettings.zalo.appId!,
        botSettings.zalo.appSecret!,
        userId,
        reply,
        false
      );
    }
    console.log('✅ Reply sent');

    // Track message asynchronously
    setImmediate(async () => {
      try {
        const messageRecord = new Message({
          userId: botSettings.userId,
          botId: botSettings.botId,
          message: text,
          response: reply,
          timestamp: new Date(),
          sessionId: `zalo_${oaId}_${userId}`
        });
        await messageRecord.save();
        console.log('✅ Message tracked in database');
      } catch (trackingError) {
        console.error('⚠️ Error tracking message:', trackingError);
      }
    });
  } catch (error: any) {
    console.error('❌ Error processing message:', error);

    const errorMsg = error.message?.includes('timeout')
      ? 'Xin lỗi, yêu cầu của bạn mất quá nhiều thời gian để xử lý. Vui lòng thử lại sau.'
      : error.message?.includes('Rate limit')
      ? 'Xin lỗi, hệ thống đang quá tải. Vui lòng thử lại sau vài giây.'
      : 'Xin lỗi, tôi đang gặp sự cố khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.';

    try {
      const useDirectToken = !!botSettings.zalo.apiToken;
      if (useDirectToken) {
        await sendZaloMessage(
          botSettings.zalo.apiToken!,
          userId,
          userId,
          errorMsg,
          true
        );
      } else {
        await sendZaloMessage(
          botSettings.zalo.appId!,
          botSettings.zalo.appSecret!,
          userId,
          errorMsg,
          false
        );
      }
    } catch {
      // Ignore if sending error message fails
    }
  }
}

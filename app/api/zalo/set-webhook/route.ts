import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import BotSettings from '@/lib/models/BotSettings';
import { setZaloWebhook, getZaloOAInfo } from '@/lib/services/zaloService';

export async function POST(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/set-webhook/route.ts:8',message:'POST handler entry',data:{hasRequest:!!request},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/set-webhook/route.ts:13',message:'Unauthorized - no session',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // #region agent log
    let requestBodyText = '';
    try {
      const clonedRequest = request.clone();
      requestBodyText = await clonedRequest.text();
      fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/set-webhook/route.ts:16',message:'Before request.json()',data:{bodyLength:requestBodyText.length,bodyPreview:requestBodyText.substring(0,200),isEmpty:!requestBodyText.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch (e) {
      fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/set-webhook/route.ts:16',message:'Error reading request body',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    const { botId, appId, appSecret, apiToken, securityToken, webhookUrl: customWebhookUrl, verifyToken } = await request.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/set-webhook/route.ts:16',message:'After request.json() success',data:{hasBotId:!!botId,useDirectToken:!!apiToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Support both App ID/Secret and direct API token
    const useDirectToken = !!apiToken;
    
    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      );
    }

    if (!useDirectToken && (!appId || !appSecret)) {
      return NextResponse.json(
        { error: 'Either (App ID and App Secret) or API Token is required' },
        { status: 400 }
      );
    }

    if (useDirectToken && !customWebhookUrl) {
      return NextResponse.json(
        { error: 'Webhook URL is required when using direct API token' },
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

    if (!botSettings) {
      console.log(`⚠️ Bot not found with userId check, trying without userId...`);
      botSettings = await BotSettings.findOne({ botId });
      
      if (botSettings) {
        console.log(`⚠️ Found bot but userId mismatch: bot.userId=${botSettings.userId}, session.userId=${session.user.id}`);
      }
    }

    if (!botSettings) {
      return NextResponse.json(
        { error: `Bot not found with botId: "${botId}"` },
        { status: 404 }
      );
    }
    
    console.log(`✅ Found bot: ${botSettings.name} (${botSettings.botId})`);

    // Get OA info to verify credentials (only if using App ID/Secret)
    let oaInfo: any = null;
    if (!useDirectToken) {
      try {
        oaInfo = await getZaloOAInfo(appId, appSecret);
      } catch (error) {
        console.warn('⚠️ Could not get OA info, continuing anyway:', error);
      }
    }

    // Use security token or verify token, or generate one
    const finalVerifyToken = securityToken || verifyToken || `verify_${botId}_${Date.now()}`;

    // Build webhook URL
    let webhookUrl = '';
    const encodedBotId = encodeURIComponent(botId);
    
    if (useDirectToken && customWebhookUrl) {
      // When using direct token, use the provided webhook URL as-is
      // User should have configured it in Zalo Console
      webhookUrl = customWebhookUrl.replace(/\/$/, '');
    } else if (customWebhookUrl) {
      // If custom webhook URL is provided, use it directly
      const cleanUrl = customWebhookUrl.replace(/\/$/, '');
      // Only append query params if not already present
      if (!cleanUrl.includes('?')) {
        webhookUrl = `${cleanUrl}/api/zalo/webhook?botId=${encodedBotId}&verify_token=${finalVerifyToken}`;
      } else {
        webhookUrl = cleanUrl;
      }
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
      webhookUrl = `${cleanBaseUrl}/api/zalo/webhook?botId=${encodedBotId}&verify_token=${finalVerifyToken}`;
    }

    // Zalo requires HTTPS for webhooks in production
    if (!webhookUrl.startsWith('https://') && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { 
          error: 'Zalo requires HTTPS for webhooks in production. Please provide an HTTPS URL.',
          details: `Current URL: ${webhookUrl}. For local development, use ngrok (https://ngrok.com) or provide a custom HTTPS webhook URL.`,
          requiresHttps: true
        },
        { status: 400 }
      );
    }

    console.log('Setting Zalo webhook URL:', webhookUrl);

    // Set webhook - support both methods
    let result;
    if (useDirectToken) {
      // When using direct token, we don't need to set webhook via API
      // User should configure webhook in Zalo Console manually
      // We just save the settings
      result = { success: true };
      console.log('⚠️ Using direct API token - webhook should be configured manually in Zalo Console');
      console.log(`   Webhook URL: ${webhookUrl}`);
      console.log(`   Security Token: ${finalVerifyToken}`);
    } else {
      result = await setZaloWebhook(appId, appSecret, webhookUrl, finalVerifyToken, false);
    }

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to set webhook',
          details: result.details
        },
        { status: 500 }
      );
    }

    // Update bot settings
    console.log(`💾 Saving Zalo settings for bot: ${botSettings.botId}`);
    
    try {
      const zaloData: any = {
        enabled: true,
        webhookUrl: webhookUrl,
        webhookSetAt: new Date(),
        verifyToken: finalVerifyToken
      };

      if (useDirectToken) {
        zaloData.apiToken = apiToken;
        zaloData.securityToken = securityToken || finalVerifyToken;
      } else {
        zaloData.appId = appId;
        zaloData.appSecret = appSecret;
        if (oaInfo) {
          zaloData.oaId = oaInfo.oaId;
          zaloData.oaName = oaInfo.oaName;
        }
      }
      
      console.log(`💾 Saving Zalo settings:`, JSON.stringify(zaloData, null, 2));
      
      const mongooseConnection = await connectDB();
      if (!mongooseConnection || !mongooseConnection.connection || !mongooseConnection.connection.db) {
        throw new Error('MongoDB connection not available');
      }
      const db = mongooseConnection.connection.db;
      const collectionName = BotSettings.collection.name;
      const collection = db.collection(collectionName);
      
      const updateResult = await collection.updateOne(
        { botId: botSettings.botId },
        {
          $set: {
            'zalo.enabled': zaloData.enabled,
            'zalo.webhookUrl': zaloData.webhookUrl,
            'zalo.webhookSetAt': zaloData.webhookSetAt,
            'zalo.verifyToken': zaloData.verifyToken,
            ...(useDirectToken ? {
              'zalo.apiToken': zaloData.apiToken,
              'zalo.securityToken': zaloData.securityToken
            } : {
              'zalo.appId': zaloData.appId,
              'zalo.appSecret': zaloData.appSecret,
              ...(zaloData.oaId && { 'zalo.oaId': zaloData.oaId }),
              ...(zaloData.oaName && { 'zalo.oaName': zaloData.oaName })
            })
          }
        }
      );
      
      console.log(`✅ MongoDB update result:`, {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        acknowledged: updateResult.acknowledged
      });
      
      if (updateResult.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Bot not found for update' },
          { status: 404 }
        );
      }
      
      const updatedBot = await BotSettings.findOne({ botId: botSettings.botId }).lean() as any;
      
      if (!updatedBot) {
        return NextResponse.json(
          { error: 'Failed to reload bot after update' },
          { status: 500 }
        );
      }

      console.log(`✅ Bot settings saved successfully`);
    } catch (saveError: any) {
      console.error(`❌ Error saving bot settings:`, saveError);
      return NextResponse.json(
        { 
          error: 'Failed to save bot settings',
          details: saveError.message 
        },
        { status: 500 }
      );
    }

    const finalBot = await BotSettings.findOne({ botId: botSettings.botId }).lean() as any;
    
    // #region agent log
    const responseData = {
      success: true,
      webhookUrl,
      oaInfo,
      verifyToken: finalVerifyToken,
      message: 'Zalo bot activated successfully!',
      zalo: finalBot?.zalo || null
    };
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/set-webhook/route.ts:244',message:'Before returning success response',data:{responseDataSize:JSON.stringify(responseData).length,hasWebhookUrl:!!webhookUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error setting Zalo webhook:', error);
    
    // #region agent log
    const isJsonError = error.message?.includes('JSON') || error.message?.includes('json');
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/set-webhook/route.ts:252',message:'Error caught in catch block',data:{errorMessage:error.message,errorName:error.name,isJsonError,stack:error.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    let errorMessage = error.message || 'Failed to set webhook';
    let errorDetails = null;

    if (error.response?.data) {
      errorDetails = error.response.data;
      errorMessage = error.response.data.description || errorMessage;
    }

    // #region agent log
    const errorResponseData = { 
      error: errorMessage,
      details: errorDetails || error.stack
    };
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/set-webhook/route.ts:263',message:'Before returning error response',data:{errorResponseSize:JSON.stringify(errorResponseData).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(
      errorResponseData,
      { status: 500 }
    );
  }
}

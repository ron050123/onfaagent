import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import BotSettings from '@/lib/models/BotSettings';
import { deleteZaloWebhook } from '@/lib/services/zaloService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId } = await request.json();

    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify bot belongs to user
    const botSettings = await BotSettings.findOne({ 
      botId,
      userId: session.user.id 
    });

    if (!botSettings) {
      return NextResponse.json(
        { error: `Bot not found with botId: "${botId}"` },
        { status: 404 }
      );
    }

    // Support both App ID/Secret and direct API token
    const useDirectToken = !!botSettings.zalo?.apiToken;
    
    if (!useDirectToken && (!botSettings.zalo?.appId || !botSettings.zalo?.appSecret)) {
      return NextResponse.json(
        { error: 'Zalo bot is not configured (missing App ID/Secret)' },
        { status: 400 }
      );
    }

    if (useDirectToken && !botSettings.zalo?.apiToken) {
      return NextResponse.json(
        { error: 'Zalo bot is not configured (missing API Token)' },
        { status: 400 }
      );
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/delete-webhook/route.ts:47',message:'Before deleting webhook',data:{useDirectToken,hasAppId:!!botSettings.zalo?.appId,hasApiToken:!!botSettings.zalo?.apiToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'I'})}).catch(()=>{});
    // #endregion

    // Delete webhook
    const deleted = useDirectToken
      ? await deleteZaloWebhook(botSettings.zalo.apiToken!, undefined, true)
      : await deleteZaloWebhook(botSettings.zalo.appId!, botSettings.zalo.appSecret!, false);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/delete-webhook/route.ts:52',message:'After deleteZaloWebhook call',data:{deleted,useDirectToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'I'})}).catch(()=>{});
    // #endregion

    if (!deleted) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/delete-webhook/route.ts:56',message:'deleteZaloWebhook returned false',data:{useDirectToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
      // For direct token mode, webhook might be configured manually in Zalo Console
      // So we'll still update the database even if API deletion fails
      if (useDirectToken) {
        console.warn('⚠️ Using direct API token - webhook deletion via API may not be supported. Webhook should be deleted manually in Zalo Console.');
      } else {
        return NextResponse.json(
          { error: 'Failed to delete webhook via Zalo API' },
          { status: 500 }
        );
      }
    }

    // Update bot settings
    const mongooseConnection = await connectDB();
    if (!mongooseConnection || !mongooseConnection.connection || !mongooseConnection.connection.db) {
      throw new Error('MongoDB connection not available');
    }
    const db = mongooseConnection.connection.db;
    const collectionName = BotSettings.collection.name;
    const collection = db.collection(collectionName);
    
    await collection.updateOne(
      { botId: botSettings.botId },
      {
        $set: {
          'zalo.enabled': false,
          'zalo.webhookUrl': null,
          'zalo.webhookSetAt': null
        }
      }
    );
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c60d4391-f97d-4f8f-b40f-56a2b2915eba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/zalo/delete-webhook/route.ts:105',message:'After updating bot settings',data:{useDirectToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'I'})}).catch(()=>{});
    // #endregion

    return NextResponse.json({
      success: true,
      message: useDirectToken 
        ? 'Zalo bot disabled successfully. Note: If webhook was configured manually in Zalo Console, please delete it there as well.'
        : 'Zalo webhook deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting Zalo webhook:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to delete webhook'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { handleMessengerMessage, verifyWebhookSignature } from '@/lib/services/messengerService';
import BotSettings from '@/lib/models/BotSettings';
import connectDB from '@/lib/db';

// Handle GET request for webhook verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    const botId = searchParams.get('botId');

    console.log('📨 Messenger webhook verification:', {
      mode,
      token,
      challenge: challenge ? 'provided' : 'not provided',
      botId: botId || 'not provided'
    });

    // Facebook webhook verification
    if (mode === 'subscribe' && token) {
      await connectDB();

      // Find bot with matching verify token
      let botSettings = null;
      if (botId) {
        botSettings = await BotSettings.findOne({
          botId: botId.trim(),
          'messenger.verifyToken': token
        }).lean() as any;
      } else {
        // Try to find any bot with matching verify token
        botSettings = await BotSettings.findOne({
          'messenger.verifyToken': token
        }).lean() as any;
      }

      if (botSettings) {
        console.log(`✅ Webhook verified for bot: ${botSettings.name} (${botSettings.botId})`);
        // Return challenge to Facebook
        return new NextResponse(challenge || '', { status: 200 });
      } else {
        console.error(`❌ Verify token not found or doesn't match`);
        return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 403 });
  } catch (error) {
    console.error('❌ Messenger webhook verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle POST request for incoming messages
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');
    
    // Get raw body for signature verification
    const rawBody = await request.text();
    const webhookData = JSON.parse(rawBody);
    
    // Get signature from headers
    const signature = request.headers.get('x-hub-signature-256');
    
    console.log('📨 Messenger webhook received:', {
      botId: botId || 'not provided',
      object: webhookData.object,
      entryCount: webhookData.entry?.length || 0,
      hasSignature: !!signature
    });

    // Verify signature if app secret is configured
    if (signature && botId) {
      await connectDB();
      const botSettings = await BotSettings.findOne({ botId: botId.trim() }).lean() as any;
      
      if (botSettings?.messenger?.appSecret) {
        const isValid = verifyWebhookSignature(rawBody, signature, botSettings.messenger.appSecret);
        if (!isValid) {
          console.error('❌ Invalid webhook signature');
          return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }
        console.log('✅ Webhook signature verified');
      }
    }

    // Handle the webhook asynchronously
    handleMessengerMessage(webhookData, botId || undefined).catch(error => {
      console.error('❌ Error processing Messenger webhook:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : error);
    });

    // Always return 200 OK to Facebook
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ Messenger webhook error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    // Still return 200 to prevent Facebook from retrying
    return NextResponse.json({ ok: true });
  }
}


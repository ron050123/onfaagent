import { NextRequest, NextResponse } from 'next/server';
import { handleZaloMessage } from '@/lib/services/zaloService';

// Force dynamic rendering - webhook should never be pre-rendered
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Zalo webhook endpoint
 * Zalo sends webhook events to this endpoint
 * 
 * Webhook verification (GET):
 * - Zalo sends GET request with verify_token and challenge
 * - We need to return the challenge if verify_token matches
 * 
 * Message events (POST):
 * - Zalo sends POST request with event data
 * - We process the message and respond
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verifyToken = searchParams.get('verify_token');
    const challenge = searchParams.get('challenge');

    console.log('🔍 Zalo webhook verification:', {
      verifyToken,
      challenge,
    });

    // Get botId from query parameter if available
    const botId = searchParams.get('botId');

    if (!verifyToken || !challenge) {
      return NextResponse.json({
        message: 'Zalo webhook endpoint is active',
        method: 'GET',
        description: 'Send Zalo webhook events to this endpoint',
        note: 'For webhook verification, provide verify_token and challenge parameters'
      });
    }

    // TODO: Verify token against stored verify_token in bot settings
    // For now, accept any token (you should verify against bot settings)
    if (botId) {
      // Verify token against bot settings
      // This would require database lookup - for now, accept it
      console.log(`✅ Webhook verification for bot: ${botId}`);
    }

    // Return challenge to complete verification
    return NextResponse.json({
      challenge: challenge,
      verify_token: verifyToken,
      status: 'verified'
    });
  } catch (error) {
    console.error('❌ Zalo webhook verification error:', error);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    
    // Get botId from query parameter if available
    const { searchParams } = new URL(request.url);
    let botId = searchParams.get('botId');
    
    if (botId) {
      botId = decodeURIComponent(botId).trim();
    }
    
    console.log('📨 Zalo webhook received:', {
      botId: botId || 'not provided',
      appId: event.app_id,
      oaId: event.oa_id,
      event: event.event,
      userId: event.user_id,
      timestamp: event.timestamp,
    });
    
    // Process message asynchronously (don't wait for completion)
    handleZaloMessage(event, botId || undefined).catch(error => {
      console.error('❌ Error processing Zalo message:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : error);
    });
    
    // Return immediately to Zalo (they expect quick response)
    return NextResponse.json({ 
      success: true,
      message: 'Event received and processing'
    });
  } catch (error) {
    console.error('❌ Zalo webhook error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    // Still return 200 to prevent Zalo from retrying
    return NextResponse.json({ success: true });
  }
}

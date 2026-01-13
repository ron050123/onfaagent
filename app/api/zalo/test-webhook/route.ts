import { NextRequest, NextResponse } from 'next/server';
import { handleZaloMessage } from '@/lib/services/zaloService';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Test endpoint for simulating Zalo webhook events
 * 
 * This allows you to test your Zalo bot integration without needing
 * a real Zalo Official Account or setting up webhooks.
 * 
 * Usage:
 * POST /api/zalo/test-webhook?botId=YOUR_BOT_ID
 * Body: { "text": "Hello, test message" }
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');
    const body = await request.json();
    
    const text = body.text || body.message || 'Hello';
    const userId = body.userId || `test_user_${Date.now()}`;
    const oaId = body.oaId || 'test_oa_123456789';
    const appId = body.appId || 'test_app_id';

    // Create a mock Zalo webhook event
    const mockEvent = {
      app_id: appId,
      oa_id: oaId,
      user_id: userId,
      event: 'user_send_text',
      timestamp: Math.floor(Date.now() / 1000),
      message: {
        text: text
      }
    };

    console.log('🧪 [TEST MODE] Simulating Zalo webhook event:', {
      botId: botId || 'not provided',
      userId,
      text,
      oaId
    });

    // Process the message
    await handleZaloMessage(mockEvent, botId || undefined);

    return NextResponse.json({
      success: true,
      message: 'Test webhook event processed',
      event: mockEvent,
      note: 'This is a test event. Check your bot logs to see the response.'
    });
  } catch (error: any) {
    console.error('❌ [TEST MODE] Error processing test webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process test webhook',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
/**
 * GET endpoint to show test instructions
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Zalo Test Webhook Endpoint',
    description: 'Use this endpoint to test Zalo bot integration without a real OA',
    usage: {
      method: 'POST',
      url: '/api/zalo/test-webhook?botId=YOUR_BOT_ID',
      body: {
        text: 'Your test message',
        userId: 'test_user_123 (optional)',
        oaId: 'test_oa_123 (optional)',
        appId: 'test_app_id (optional)'
      }
    },
    example: {
      curl: `curl -X POST "http://localhost:3000/api/zalo/test-webhook?botId=your-bot-id" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello, this is a test message"}'`
    }
  });
}


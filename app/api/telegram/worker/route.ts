import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramMessage } from '@/lib/services/telegramService';

/**
 * Worker endpoint to process queued Telegram messages
 * This endpoint is called by QStash queue system
 * 
 * Note: QStash automatically verifies requests using the QSTASH_TOKEN.
 * For additional security, you can add signature verification later.
 */

// Force dynamic rendering - worker should never be pre-rendered
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { update, botId, timestamp } = body;

    if (!update) {
      console.error('❌ Invalid queue message: missing update');
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    console.log('🔄 Processing queued Telegram message:', {
      botId: botId || 'not provided',
      updateId: update.update_id,
      messageId: update.message?.message_id,
      queuedAt: timestamp ? new Date(timestamp).toISOString() : 'unknown',
      processingDelay: timestamp ? Date.now() - timestamp : 'unknown',
    });

    // Process the message
    await handleTelegramMessage(update, botId);

    return NextResponse.json({ 
      success: true,
      processedAt: Date.now(),
    });
  } catch (error) {
    console.error('❌ Error processing queued Telegram message:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    
    // Return 500 so QStash will retry
    return NextResponse.json(
      { 
        error: 'Processing failed',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}


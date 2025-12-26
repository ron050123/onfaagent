import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import { handleTelegramMessage } from '@/lib/services/telegramService';
import { queueTelegramMessage, isQueueAvailable } from '@/lib/services/queueService';

// Force dynamic rendering - webhook should never be pre-rendered
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const update: TelegramBot.Update = await request.json();
    
    // Get botId from query parameter if available
    const { searchParams } = new URL(request.url);
    let botId = searchParams.get('botId');
    
    // Decode botId properly (handle URL encoding)
    if (botId) {
      botId = decodeURIComponent(botId).trim();
    }
    
    console.log('📨 Telegram webhook received:', {
      botId: botId || 'not provided',
      updateId: update.update_id,
      messageId: update.message?.message_id,
      chatId: update.message?.chat?.id,
      chatType: update.message?.chat?.type,
      text: update.message?.text,
      from: update.message?.from?.username || update.message?.from?.id
    });
    
    // Try to queue the message for async processing (faster response)
    // But if queue fails, process immediately to ensure message is handled
    const queued = await queueTelegramMessage(update, botId || undefined);
    
    if (queued) {
      console.log('✅ Message queued for async processing');
      // Return immediately - worker will process it
      return NextResponse.json({ 
        ok: true, 
        queued: true,
        message: 'Message queued for processing'
      });
    } else {
      // IMPORTANT: Process synchronously if queue not available
      // This ensures messages are always handled, even without queue
      console.log('⚠️ Queue not available, processing synchronously (fallback mode)');
      
      // Process immediately but don't wait for completion
      // This prevents Telegram timeout while still processing the message
      handleTelegramMessage(update, botId || undefined).catch(error => {
        console.error('❌ Error processing Telegram update:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : error);
      });
      
      // Return immediately to Telegram (don't wait for processing)
      return NextResponse.json({ 
        ok: true, 
        queued: false,
        message: 'Processing synchronously (queue not configured or failed)'
      });
    }
  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    // Still return 200 to prevent Telegram from retrying
    return NextResponse.json({ ok: true });
  }
}

// Handle GET request for webhook verification (Telegram sometimes sends GET)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Telegram webhook endpoint is active',
    method: 'POST',
    description: 'Send Telegram updates to this endpoint'
  });
}


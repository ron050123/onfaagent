import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import BotSettings from '@/lib/models/BotSettings';
import { deleteTelegramWebhook } from '@/lib/services/telegramService';

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

    if (!botSettings || !botSettings.telegram?.botToken) {
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 404 }
      );
    }

    // Delete webhook
    await deleteTelegramWebhook(botSettings.telegram.botToken);

    // Update bot settings using findOneAndUpdate with dot notation
    await BotSettings.findOneAndUpdate(
      { botId },
      {
        $set: {
          'telegram.enabled': false
          // Keep other telegram fields unchanged
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting Telegram webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}


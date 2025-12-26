import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import BotSettings from '@/lib/models/BotSettings';

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

    if (!botSettings || !botSettings.messenger?.pageAccessToken) {
      return NextResponse.json(
        { error: 'Messenger bot not configured' },
        { status: 404 }
      );
    }

    // Update bot settings - disable messenger
    await BotSettings.findOneAndUpdate(
      { botId },
      {
        $set: {
          'messenger.enabled': false
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Messenger bot deactivated successfully. Remember to remove webhook from Facebook App Dashboard.'
    });
  } catch (error: any) {
    console.error('Error deleting Messenger webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}


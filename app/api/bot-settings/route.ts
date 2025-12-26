import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import BotSettings from '@/lib/models/BotSettings';
import { invalidateBotSettingsCache } from '@/lib/services/telegramService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');

    await connectDB();

    if (botId) {
      // Get specific bot settings - use lean() to get plain object
      const botSettings = await BotSettings.findOne({ botId }).lean();
      if (!botSettings) {
        return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
      }
      return NextResponse.json(botSettings);
    } else {
      // Get all bots (for backward compatibility)
      const botSettings = await BotSettings.findOne({}).lean();
      return NextResponse.json(botSettings);
    }

  } catch (error) {
    console.error('Error fetching bot settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId, name, welcomeMessage, themeColor, faqs, documents, urls, structuredData, categories } = await request.json();

    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Upsert bot settings - use $set to preserve telegram settings
    const botSettings = await BotSettings.findOneAndUpdate(
      { botId },
      {
        $set: {
          botId,
          name: name || 'AI Assistant',
          welcomeMessage: welcomeMessage || 'Hello! How can I help you today?',
          themeColor: themeColor || '#3B82F6',
          faqs: faqs || [],
          documents: documents || [],
          urls: urls || [],
          structuredData: structuredData || [],
          categories: categories || []
          // Note: telegram field is NOT included here to preserve existing telegram settings
        }
      },
      { upsert: true, new: true }
    );

    // Invalidate cache when settings are updated
    invalidateBotSettingsCache(botId);

    return NextResponse.json(botSettings);

  } catch (error) {
    console.error('Error saving bot settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

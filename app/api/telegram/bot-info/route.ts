import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTelegramBotInfo } from '@/lib/services/telegramService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Telegram bot token is required' },
        { status: 400 }
      );
    }

    const botInfo = await getTelegramBotInfo(token);

    return NextResponse.json(botInfo);
  } catch (error: any) {
    console.error('Error getting Telegram bot info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get bot info' },
      { status: 500 }
    );
  }
}


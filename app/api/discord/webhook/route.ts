import { NextRequest, NextResponse } from 'next/server';
import { getDiscordBot, handleDiscordMessage } from '@/lib/services/discordService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Discord sends interaction events
    if (body.type === 1) {
      // PING - respond with PONG
      return NextResponse.json({ type: 1 });
    }

    // Handle message events (from bot client, not webhook)
    if (body.type === 0 && body.data) {
      const botId = request.headers.get('x-bot-id') || undefined;
      // This would be handled by the Discord worker, not webhook
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Discord webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


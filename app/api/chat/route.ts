import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BotSettings from '@/lib/models/BotSettings';
import User, { IUser } from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processChatMessage } from '@/lib/services/chatService';

export async function POST(request: NextRequest) {
  try {
    const { botId, message } = await request.json();

    if (!botId || !message) {
      return NextResponse.json(
        { error: 'Bot ID and message are required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // Run DB connection, session check, and user lookup in parallel where possible
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // Fetch user and bot settings in parallel for faster response
    const [user, botSettings] = await Promise.all([
      User.findOne({ email: session.user.email }).select('openaiApiKey').lean() as Promise<IUser | null>,
      BotSettings.findOne({ botId }).select('botId name userId welcomeMessage faqs documents urls structuredData updatedAt').lean()
    ]);
    
    if (!user || !user.openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set your API key in settings.' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    if (!botSettings) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // Use chatService for processing - includes caching and optimizations
    const reply = await processChatMessage(
      botSettings as any,
      message,
      user.openaiApiKey,
      'website'
    );

    return NextResponse.json(
      { reply },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Better error messages
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.message?.includes('timeout')) {
      errorMessage = 'Request timeout. Please try again.';
      statusCode = 504;
    } else if (error.message?.includes('Rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      statusCode = 429;
    } else if (error.message?.includes('authentication')) {
      errorMessage = 'API authentication failed.';
      statusCode = 401;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { 
        status: statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

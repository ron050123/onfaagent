import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BotSettings, { IBotSettings } from '@/lib/models/BotSettings';
import Message from '@/lib/models/Message';
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

    // Connect DB and find bot settings - optimize with select() to only fetch needed fields
    await connectDB();
    const botSettings = await BotSettings.findOne({ botId })
      .select('botId name userId welcomeMessage faqs documents urls structuredData updatedAt')
      .lean() as IBotSettings | null;
    
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

    // Use the main system OpenAI API key
    const mainApiKey = process.env.OPENAI_API_KEY;
    
    if (!mainApiKey) {
      return NextResponse.json(
        { error: 'System OpenAI API key not configured' },
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

    // Use chatService for processing - includes caching and optimizations
    const reply = await processChatMessage(
      botSettings,
      message,
      mainApiKey,
      'website'
    );

    // Track the message for analytics - do this asynchronously to not block response
    setImmediate(async () => {
      try {
        const messageRecord = new Message({
          userId: botSettings.userId,
          botId: botId,
          message: message,
          response: reply,
          timestamp: new Date()
        });
        await messageRecord.save();
      } catch (trackingError) {
        console.error('Error tracking message:', trackingError);
        // Don't fail the request if tracking fails
      }
    });

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
    console.error('Public Chat API error:', error);
    
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

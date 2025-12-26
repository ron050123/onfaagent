import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMessengerPageInfo } from '@/lib/services/messengerService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageAccessToken } = await request.json();

    if (!pageAccessToken) {
      return NextResponse.json(
        { error: 'Page Access Token is required' },
        { status: 400 }
      );
    }

    const pageInfo = await getMessengerPageInfo(pageAccessToken);

    return NextResponse.json(pageInfo);
  } catch (error: any) {
    console.error('Error getting Messenger page info:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get page info',
        details: error.response?.data || error
      },
      { status: 500 }
    );
  }
}


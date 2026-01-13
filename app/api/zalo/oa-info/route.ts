import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getZaloOAInfo } from '@/lib/services/zaloService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appId, appSecret } = await request.json();

    if (!appId || !appSecret) {
      return NextResponse.json(
        { error: 'App ID and App Secret are required' },
        { status: 400 }
      );
    }

    // Get OA info to verify credentials
    const oaInfo = await getZaloOAInfo(appId, appSecret);

    return NextResponse.json({
      success: true,
      oaInfo
    });
  } catch (error: any) {
    console.error('Error getting Zalo OA info:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get OA info',
        details: error.stack
      },
      { status: 500 }
    );
  }
}

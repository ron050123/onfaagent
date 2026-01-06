import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { invalidateKnowledgeBaseCache } from '@/lib/services/chatService';
import { invalidateBotSettingsCache } from '@/lib/services/telegramService';
import { invalidateWhatsAppBotSettingsCache } from '@/lib/services/whatsappService';
import { invalidateWhatsAppWebBotSettingsCache } from '@/lib/services/whatsappWebService';
import { invalidateDiscordBotSettingsCache } from '@/lib/services/discordCache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Clear all caches for a specific bot or all bots
 * POST /api/clear-cache
 * Body: { botId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId } = await request.json();

    const results: string[] = [];

    if (botId) {
      // Clear cache for specific bot
      console.log(`🗑️ Clearing cache for bot: ${botId}`);
      
      invalidateKnowledgeBaseCache(botId);
      results.push(`✅ Cleared knowledge base cache for bot: ${botId}`);
      
      invalidateBotSettingsCache(botId);
      results.push(`✅ Cleared Telegram cache for bot: ${botId}`);
      
      invalidateWhatsAppBotSettingsCache(botId);
      results.push(`✅ Cleared WhatsApp cache for bot: ${botId}`);
      
      invalidateWhatsAppWebBotSettingsCache(botId);
      results.push(`✅ Cleared WhatsApp Web cache for bot: ${botId}`);
      
      invalidateDiscordBotSettingsCache(botId);
      results.push(`✅ Cleared Discord cache for bot: ${botId}`);
    } else {
      // Clear all caches
      console.log('🗑️ Clearing ALL caches');
      
      // Clear all knowledge base caches (need to get all bots first)
      // For now, we'll clear by calling without botId which clears all
      invalidateBotSettingsCache(); // Clears all Telegram cache
      results.push('✅ Cleared all Telegram cache');
      
      invalidateWhatsAppBotSettingsCache(); // Clears all WhatsApp cache
      results.push('✅ Cleared all WhatsApp cache');
      
      invalidateWhatsAppWebBotSettingsCache(); // Clears all WhatsApp Web cache
      results.push('✅ Cleared all WhatsApp Web cache');
      
      invalidateDiscordBotSettingsCache(); // Clears all Discord cache
      results.push('✅ Cleared all Discord cache');
      
      // Note: invalidateKnowledgeBaseCache requires botId, so we can't clear all at once
      // But cache will expire after 10 minutes anyway
      results.push('ℹ️ Knowledge base cache will expire automatically after 10 minutes');
    }

    return NextResponse.json({
      success: true,
      message: botId ? `Cache cleared for bot: ${botId}` : 'All caches cleared',
      results
    });

  } catch (error: any) {
    console.error('Clear cache error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


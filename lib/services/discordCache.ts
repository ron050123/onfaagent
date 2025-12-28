/**
 * Discord Bot Settings Cache Management
 * 
 * This file is separated from discordService.ts to avoid importing discord.js
 * in Next.js API routes during build time.
 */

// Cache for bot settings to reduce database queries
const botSettingsCache = new Map<string, { settings: any; timestamp: number }>();

/**
 * Invalidate bot settings cache (call this when bot settings are updated)
 */
export function invalidateDiscordBotSettingsCache(botId?: string): void {
  if (botId) {
    const cacheKey = `discord_${botId.trim()}`;
    botSettingsCache.delete(cacheKey);
    console.log(`🗑️ Invalidated Discord cache for bot: ${botId}`);
  } else {
    // Clear all cache
    botSettingsCache.clear();
    console.log('🗑️ Cleared all Discord bot settings cache');
  }
}


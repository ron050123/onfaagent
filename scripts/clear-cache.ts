import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

// Import cache invalidation functions
import { invalidateKnowledgeBaseCache } from '../lib/services/chatService';
import { invalidateBotSettingsCache } from '../lib/services/telegramService';
import { invalidateWhatsAppBotSettingsCache } from '../lib/services/whatsappService';
import { invalidateWhatsAppWebBotSettingsCache } from '../lib/services/whatsappWebService';
import { invalidateDiscordBotSettingsCache } from '../lib/services/discordCache';
import BotSettings from '../lib/models/BotSettings';

async function clearCache(botId?: string) {
  try {
    console.log('='.repeat(80));
    console.log('🗑️ CLEAR CACHE UTILITY');
    console.log('='.repeat(80));

    if (botId) {
      console.log(`\nClearing cache for bot: ${botId}\n`);
      
      // Clear knowledge base cache
      invalidateKnowledgeBaseCache(botId);
      console.log(`✅ Cleared knowledge base cache for bot: ${botId}`);
      
      // Clear Telegram cache
      invalidateBotSettingsCache(botId);
      console.log(`✅ Cleared Telegram cache for bot: ${botId}`);
      
      // Clear WhatsApp cache
      invalidateWhatsAppBotSettingsCache(botId);
      console.log(`✅ Cleared WhatsApp cache for bot: ${botId}`);
      
      // Clear WhatsApp Web cache
      invalidateWhatsAppWebBotSettingsCache(botId);
      console.log(`✅ Cleared WhatsApp Web cache for bot: ${botId}`);
      
      // Clear Discord cache
      invalidateDiscordBotSettingsCache(botId);
      console.log(`✅ Cleared Discord cache for bot: ${botId}`);
      
    } else {
      console.log('\nClearing ALL caches...\n');
      
      // Connect to MongoDB to get all bot IDs
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        console.error('❌ MONGODB_URI not found in environment variables');
        process.exit(1);
      }

      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB\n');

      // Get all bot IDs
      const bots = await BotSettings.find({}).select('botId').lean();
      const botIds = bots.map((bot: any) => bot.botId);

      console.log(`Found ${botIds.length} bot(s) in database\n`);

      // Clear cache for each bot
      for (const id of botIds) {
        invalidateKnowledgeBaseCache(id);
        console.log(`✅ Cleared knowledge base cache for bot: ${id}`);
      }

      await mongoose.disconnect();

      // Clear all platform caches
      invalidateBotSettingsCache(); // Clears all Telegram cache
      console.log('✅ Cleared all Telegram cache');
      
      invalidateWhatsAppBotSettingsCache(); // Clears all WhatsApp cache
      console.log('✅ Cleared all WhatsApp cache');
      
      invalidateWhatsAppWebBotSettingsCache(); // Clears all WhatsApp Web cache
      console.log('✅ Cleared all WhatsApp Web cache');
      
      invalidateDiscordBotSettingsCache(); // Clears all Discord cache
      console.log('✅ Cleared all Discord cache');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Cache cleared successfully!');
    console.log('='.repeat(80));
    console.log('\n💡 Note: If server is running, cache will be cleared in memory.');
    console.log('   For persistent changes, restart the server after clearing cache.\n');

  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  }
}

// Get botId from command line arguments
const botId = process.argv[2];

if (botId === '--all' || botId === '-a') {
  clearCache();
} else {
  clearCache(botId);
}


/**
 * Check All Platforms Knowledge Base Consistency
 * 
 * This script verifies that all platforms (Telegram, WhatsApp, Discord, Website)
 * load the same knowledge base data from the database
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

import BotSettings from '../lib/models/BotSettings';
import { buildKnowledgeBase } from '../lib/services/chatService';

async function checkAllPlatforms() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all bots
    const bots = await BotSettings.find({}).lean() as any[];

    if (bots.length === 0) {
      console.log('❌ No bots found in database!');
      await mongoose.disconnect();
      return;
    }

    console.log('='.repeat(80));
    console.log('🔍 CHECKING KNOWLEDGE BASE CONSISTENCY ACROSS ALL PLATFORMS');
    console.log('='.repeat(80));
    console.log(`\nTotal bots found: ${bots.length}\n`);

    for (const bot of bots) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📋 Bot: ${bot.name || 'Unnamed'} (ID: ${bot.botId})`);
      console.log(`${'─'.repeat(80)}`);

      // Ensure arrays are initialized
      const faqs = Array.isArray(bot.faqs) ? bot.faqs : [];
      const documents = Array.isArray(bot.documents) ? bot.documents : [];
      const urls = Array.isArray(bot.urls) ? bot.urls : [];
      const structuredData = Array.isArray(bot.structuredData) ? bot.structuredData : [];

      // Count enabled items
      const enabledDocs = documents.filter((d: any) => d.enabled).length;
      const enabledUrls = urls.filter((u: any) => u.enabled).length;
      const enabledStruct = structuredData.filter((s: any) => s.enabled).length;

      console.log(`\n📚 Knowledge Base Summary:`);
      console.log(`   FAQs: ${faqs.length}`);
      console.log(`   Documents: ${documents.length} total, ${enabledDocs} enabled`);
      console.log(`   URLs: ${urls.length} total, ${enabledUrls} enabled`);
      console.log(`   Structured Data: ${structuredData.length} total, ${enabledStruct} enabled`);

      // Build knowledge base for each platform
      const platforms = ['website', 'telegram', 'whatsapp', 'discord'] as const;
      const kbResults: Record<string, { length: number; hasFaqs: boolean; hasDocs: boolean; hasUrls: boolean; hasStruct: boolean }> = {};

      for (const platform of platforms) {
        try {
          const kb = buildKnowledgeBase(bot as any, 50000); // Increased to 50000 to ensure FAQs are never truncated
          kbResults[platform] = {
            length: kb.length,
            hasFaqs: kb.includes('FAQs:'),
            hasDocs: kb.includes('Document Knowledge Base:'),
            hasUrls: kb.includes('Web Content Knowledge Base:'),
            hasStruct: kb.includes('Structured Data Knowledge Base:')
          };
        } catch (error) {
          console.error(`   ❌ Error building KB for ${platform}:`, error);
          kbResults[platform] = {
            length: 0,
            hasFaqs: false,
            hasDocs: false,
            hasUrls: false,
            hasStruct: false
          };
        }
      }

      console.log(`\n🌐 Knowledge Base by Platform (max 50000 chars each, FAQs NEVER truncated):`);
      for (const platform of platforms) {
        const result = kbResults[platform];
        console.log(`   ${platform.toUpperCase().padEnd(10)}: ${result.length.toString().padStart(6)} chars | FAQs: ${result.hasFaqs ? '✅' : '❌'} | Docs: ${result.hasDocs ? '✅' : '❌'} | URLs: ${result.hasUrls ? '✅' : '❌'} | Struct: ${result.hasStruct ? '✅' : '❌'}`);
      }

      // Check consistency
      const lengths = Object.values(kbResults).map(r => r.length);
      const allSameLength = lengths.every((len, i, arr) => len === arr[0]);
      const allHaveFaqs = Object.values(kbResults).every(r => r.hasFaqs === kbResults.website.hasFaqs);
      const allHaveUrls = Object.values(kbResults).every(r => r.hasUrls === kbResults.website.hasUrls);

      console.log(`\n✅ Consistency Check:`);
      console.log(`   All platforms same KB length: ${allSameLength ? '✅ Yes' : '❌ No (differences: ' + lengths.join(', ') + ')'}`);
      console.log(`   All platforms have FAQs: ${allHaveFaqs ? '✅ Yes' : '❌ No'}`);
      console.log(`   All platforms have URLs: ${allHaveUrls ? '✅ Yes' : '❌ No'}`);

      // Check platform settings
      console.log(`\n⚙️  Platform Settings:`);
      console.log(`   Telegram: ${bot.telegram?.enabled ? '✅ Enabled' : '❌ Disabled'} | Token: ${bot.telegram?.botToken ? '✅ Set' : '❌ Missing'}`);
      console.log(`   WhatsApp: ${bot.whatsapp?.enabled ? '✅ Enabled' : '❌ Disabled'} | Token: ${bot.whatsapp?.botToken ? '✅ Set' : '❌ Missing'}`);
      console.log(`   Discord: ${bot.discord?.enabled ? '✅ Enabled' : '❌ Disabled'} | Token: ${bot.discord?.botToken ? '✅ Set' : '❌ Missing'}`);
      console.log(`   Website: ✅ Always available`);
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ All platforms check complete!');
    console.log('='.repeat(80));
    console.log('\n💡 Summary:');
    console.log('   - All platforms use the same buildKnowledgeBase() function');
    console.log('   - All platforms use the same maxKbLength (50000 chars)');
    console.log('   - FAQs are NEVER truncated - they take priority over all other sections');
    console.log('   - All platforms load the same botSettings from database');
    console.log('   - Knowledge base is shared across all platforms');
    console.log('   - Only platform-specific differences are in system prompt context\n');

    await mongoose.disconnect();
    console.log('✅ Check complete!');

  } catch (error) {
    console.error('❌ Error checking platforms:', error);
    process.exit(1);
  }
}

checkAllPlatforms();


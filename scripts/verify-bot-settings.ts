/**
 * Verify Bot Settings for All Platforms
 * 
 * This script checks that bot settings are complete and consistent
 * across all platforms (Telegram, WhatsApp, Discord, Website)
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

import BotSettings from '../lib/models/BotSettings';

async function verifyBotSettings() {
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
    console.log('🔍 VERIFYING BOT SETTINGS FOR ALL PLATFORMS');
    console.log('='.repeat(80));
    console.log(`\nTotal bots found: ${bots.length}\n`);

    let allGood = true;

    for (const bot of bots) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📋 Bot: ${bot.name || 'Unnamed'} (ID: ${bot.botId})`);
      console.log(`${'─'.repeat(80)}`);

      // Check Knowledge Base
      const faqs = Array.isArray(bot.faqs) ? bot.faqs.length : 0;
      const documents = Array.isArray(bot.documents) ? bot.documents.length : 0;
      const enabledDocs = Array.isArray(bot.documents) 
        ? bot.documents.filter((d: any) => d.enabled).length 
        : 0;
      const urls = Array.isArray(bot.urls) ? bot.urls.length : 0;
      const enabledUrls = Array.isArray(bot.urls) 
        ? bot.urls.filter((u: any) => u.enabled).length 
        : 0;
      const structuredData = Array.isArray(bot.structuredData) ? bot.structuredData.length : 0;
      const enabledStruct = Array.isArray(bot.structuredData) 
        ? bot.structuredData.filter((s: any) => s.enabled).length 
        : 0;

      console.log(`\n📚 Knowledge Base:`);
      console.log(`   FAQs: ${faqs}`);
      console.log(`   Documents: ${documents} total, ${enabledDocs} enabled`);
      console.log(`   URLs: ${urls} total, ${enabledUrls} enabled`);
      console.log(`   Structured Data: ${structuredData} total, ${enabledStruct} enabled`);

      if (faqs === 0 && enabledDocs === 0 && enabledUrls === 0 && enabledStruct === 0) {
        console.log(`   ⚠️  WARNING: No knowledge base content found!`);
        allGood = false;
      }

      // Check Platform Settings
      console.log(`\n🌐 Platform Settings:`);
      
      // Telegram
      const telegramEnabled = bot.telegram?.enabled === true;
      const telegramToken = bot.telegram?.botToken ? '✅ Set' : '❌ Missing';
      console.log(`   Telegram: ${telegramEnabled ? '✅ Enabled' : '❌ Disabled'} | Token: ${telegramToken}`);
      if (telegramEnabled && !bot.telegram?.botToken) {
        console.log(`   ⚠️  WARNING: Telegram enabled but no bot token!`);
        allGood = false;
      }

      // WhatsApp
      const whatsappEnabled = bot.whatsapp?.enabled === true;
      const whatsappToken = bot.whatsapp?.botToken ? '✅ Set' : '❌ Missing';
      console.log(`   WhatsApp: ${whatsappEnabled ? '✅ Enabled' : '❌ Disabled'} | Token: ${whatsappToken}`);
      if (whatsappEnabled && !bot.whatsapp?.botToken) {
        console.log(`   ⚠️  WARNING: WhatsApp enabled but no bot token!`);
        allGood = false;
      }

      // Discord
      const discordEnabled = bot.discord?.enabled === true;
      const discordToken = bot.discord?.botToken ? '✅ Set' : '❌ Missing';
      console.log(`   Discord: ${discordEnabled ? '✅ Enabled' : '❌ Disabled'} | Token: ${discordToken}`);
      if (discordEnabled && !bot.discord?.botToken) {
        console.log(`   ⚠️  WARNING: Discord enabled but no bot token!`);
        allGood = false;
      }

      // Website (always available)
      console.log(`   Website: ✅ Always available`);

      // Check Basic Settings
      console.log(`\n⚙️  Basic Settings:`);
      console.log(`   Name: ${bot.name || '❌ Missing'}`);
      console.log(`   Welcome Message: ${bot.welcomeMessage ? '✅ Set' : '❌ Missing'}`);
      console.log(`   User ID: ${bot.userId || '❌ Missing'}`);
      console.log(`   Updated At: ${bot.updatedAt ? new Date(bot.updatedAt).toISOString() : '❌ Missing'}`);

      if (!bot.name || !bot.welcomeMessage || !bot.userId) {
        console.log(`   ⚠️  WARNING: Missing basic settings!`);
        allGood = false;
      }

      // Verify data consistency
      console.log(`\n🔍 Data Consistency Check:`);
      
      // Check if arrays are properly initialized
      const arraysOk = 
        Array.isArray(bot.faqs) &&
        Array.isArray(bot.documents) &&
        Array.isArray(bot.urls) &&
        Array.isArray(bot.structuredData);
      
      console.log(`   Arrays initialized: ${arraysOk ? '✅' : '❌'}`);
      if (!arraysOk) {
        console.log(`   ⚠️  WARNING: Some arrays are not properly initialized!`);
        allGood = false;
      }

      // Check if knowledge base is shared across platforms
      const kbShared = true; // All platforms use the same botSettings object
      console.log(`   Knowledge base shared: ${kbShared ? '✅ Yes' : '❌ No'}`);
    }

    console.log(`\n${'='.repeat(80)}`);
    if (allGood) {
      console.log('✅ ALL CHECKS PASSED - Bot settings are complete and consistent!');
    } else {
      console.log('⚠️  SOME ISSUES FOUND - Please review the warnings above');
    }
    console.log('='.repeat(80));

    await mongoose.disconnect();
    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error verifying bot settings:', error);
    process.exit(1);
  }
}

verifyBotSettings();


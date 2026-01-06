import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

import BotSettings from '../lib/models/BotSettings';

async function inspectBotContent(botId: string) {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get bot settings
    const botSettings = await BotSettings.findOne({ botId })
      .select('botId name faqs documents urls structuredData')
      .lean();

    if (!botSettings) {
      console.log(`❌ Bot với ID "${botId}" không tồn tại trong database.`);
      await mongoose.disconnect();
      return;
    }

    console.log('='.repeat(80));
    console.log(`📋 NỘI DUNG KNOWLEDGE BASE CỦA BOT: ${botSettings.name || botId}`);
    console.log('='.repeat(80));

    // Show document content
    if (botSettings.documents && botSettings.documents.length > 0) {
      console.log('\n📄 DOCUMENTS:');
      botSettings.documents.forEach((doc: any, index: number) => {
        console.log(`\n${index + 1}. ${doc.name} (${doc.type?.toUpperCase()})`);
        console.log(`   Enabled: ${doc.enabled}`);
        console.log(`   Category: ${doc.category || 'N/A'}`);
        console.log(`   Content preview (first 500 chars):`);
        console.log(`   ${doc.content?.substring(0, 500) || 'No content'}...`);
      });
    }

    // Show first 5 FAQs
    if (botSettings.faqs && botSettings.faqs.length > 0) {
      console.log('\n\n📋 FAQs (showing first 5):');
      botSettings.faqs.slice(0, 5).forEach((faq: string, index: number) => {
        console.log(`\n${index + 1}. ${faq.substring(0, 200)}${faq.length > 200 ? '...' : ''}`);
      });
      console.log(`\n... và ${botSettings.faqs.length - 5} FAQs khác`);
    }

    // Show URLs
    if (botSettings.urls && botSettings.urls.length > 0) {
      console.log('\n\n🌐 URLs:');
      botSettings.urls.forEach((url: any, index: number) => {
        console.log(`\n${index + 1}. ${url.title || 'Untitled'}`);
        console.log(`   URL: ${url.url}`);
        console.log(`   Enabled: ${url.enabled}`);
        console.log(`   Content preview (first 300 chars):`);
        console.log(`   ${url.content?.substring(0, 300) || 'No content'}...`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Hoàn tất!');
    console.log('='.repeat(80));

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

const botId = process.argv[2] || 'thien_thanh';
inspectBotContent(botId);


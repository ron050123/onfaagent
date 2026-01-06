import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

import BotSettings from '../lib/models/BotSettings';

async function deleteBot(botId: string) {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Check if bot exists
    const bot = await BotSettings.findOne({ botId });
    
    if (!bot) {
      console.log(`❌ Bot với ID "${botId}" không tồn tại trong database.`);
      await mongoose.disconnect();
      return;
    }

    console.log('='.repeat(80));
    console.log('🔍 THÔNG TIN BOT CẦN XÓA');
    console.log('='.repeat(80));
    console.log(`Bot ID: ${bot.botId}`);
    console.log(`Tên: ${bot.name || 'Unnamed'}`);
    console.log(`User ID: ${bot.userId}`);
    console.log(`FAQs: ${bot.faqs?.length || 0}`);
    console.log(`Documents: ${bot.documents?.length || 0}`);
    console.log(`URLs: ${bot.urls?.length || 0}`);
    console.log(`Structured Data: ${bot.structuredData?.length || 0}`);
    console.log(`Created At: ${bot.createdAt}`);
    console.log(`Updated At: ${bot.updatedAt}`);
    console.log('='.repeat(80));

    // Delete the bot
    const result = await BotSettings.deleteOne({ botId });
    
    if (result.deletedCount > 0) {
      console.log(`\n✅ Đã xóa thành công bot "${botId}" khỏi database!`);
      console.log(`   Số lượng bản ghi đã xóa: ${result.deletedCount}`);
    } else {
      console.log(`\n⚠️ Không thể xóa bot "${botId}". Có thể bot đã bị xóa trước đó.`);
    }

    // Verify deletion
    const verifyBot = await BotSettings.findOne({ botId });
    if (!verifyBot) {
      console.log(`✅ Xác nhận: Bot "${botId}" đã không còn tồn tại trong database.`);
    } else {
      console.log(`⚠️ Cảnh báo: Bot "${botId}" vẫn còn tồn tại sau khi xóa!`);
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

// Get botId from command line arguments
const botId = process.argv[2];

if (!botId) {
  console.error('❌ Vui lòng cung cấp Bot ID để xóa.');
  console.log('Cách sử dụng: npm run delete-bot <botId>');
  console.log('Ví dụ: npm run delete-bot support_onfa_wallet');
  process.exit(1);
}

deleteBot(botId);


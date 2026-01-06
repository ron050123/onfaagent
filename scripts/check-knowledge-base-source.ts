import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

import BotSettings from '../lib/models/BotSettings';
import { buildKnowledgeBase } from '../lib/services/chatService';

async function checkKnowledgeBaseSource(botId: string, searchTerm: string) {
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
      .select('botId name faqs documents urls structuredData updatedAt')
      .lean();

    if (!botSettings) {
      console.log(`❌ Bot với ID "${botId}" không tồn tại trong database.`);
      await mongoose.disconnect();
      return;
    }

    console.log('='.repeat(80));
    console.log(`🔍 KIỂM TRA KNOWLEDGE BASE CHO BOT: ${botSettings.name || botId}`);
    console.log('='.repeat(80));
    console.log(`Từ khóa tìm kiếm: "${searchTerm}"\n`);

    // Build knowledge base
    const knowledgeBase = buildKnowledgeBase(botSettings as any);
    
    // Check in FAQs
    console.log('📋 1. FAQs:');
    console.log(`   Tổng số FAQs: ${botSettings.faqs?.length || 0}`);
    const matchingFAQs = botSettings.faqs?.filter((faq: string) => 
      faq.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    
    if (matchingFAQs.length > 0) {
      console.log(`   ✅ Tìm thấy ${matchingFAQs.length} FAQ(s) chứa "${searchTerm}":`);
      matchingFAQs.forEach((faq: string, index: number) => {
        console.log(`\n   FAQ ${index + 1}:`);
        console.log(`   ${faq.substring(0, 200)}${faq.length > 200 ? '...' : ''}`);
      });
    } else {
      console.log(`   ❌ Không tìm thấy FAQ nào chứa "${searchTerm}"`);
    }

    // Check in Documents
    console.log('\n📄 2. Documents:');
    console.log(`   Tổng số Documents: ${botSettings.documents?.length || 0}`);
    const enabledDocs = botSettings.documents?.filter((doc: any) => doc.enabled) || [];
    console.log(`   Documents đang enabled: ${enabledDocs.length}`);
    
    const matchingDocs = enabledDocs.filter((doc: any) => 
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    
    if (matchingDocs.length > 0) {
      console.log(`   ✅ Tìm thấy ${matchingDocs.length} Document(s) chứa "${searchTerm}":`);
      matchingDocs.forEach((doc: any, index: number) => {
        console.log(`\n   Document ${index + 1}:`);
        console.log(`   - Tên: ${doc.name}`);
        console.log(`   - Loại: ${doc.type?.toUpperCase()}`);
        console.log(`   - Enabled: ${doc.enabled}`);
        console.log(`   - Category: ${doc.category || 'N/A'}`);
        const contentPreview = doc.content?.substring(0, 300) || '';
        if (contentPreview.toLowerCase().includes(searchTerm.toLowerCase())) {
          const matchIndex = contentPreview.toLowerCase().indexOf(searchTerm.toLowerCase());
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(contentPreview.length, matchIndex + searchTerm.length + 50);
          console.log(`   - Nội dung chứa "${searchTerm}": ...${contentPreview.substring(start, end)}...`);
        }
      });
    } else {
      console.log(`   ❌ Không tìm thấy Document nào chứa "${searchTerm}"`);
    }

    // Check in URLs
    console.log('\n🌐 3. URLs:');
    console.log(`   Tổng số URLs: ${botSettings.urls?.length || 0}`);
    const enabledUrls = botSettings.urls?.filter((url: any) => url.enabled) || [];
    console.log(`   URLs đang enabled: ${enabledUrls.length}`);
    
    const matchingUrls = enabledUrls.filter((url: any) => 
      url.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.content?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    
    if (matchingUrls.length > 0) {
      console.log(`   ✅ Tìm thấy ${matchingUrls.length} URL(s) chứa "${searchTerm}":`);
      matchingUrls.forEach((url: any, index: number) => {
        console.log(`\n   URL ${index + 1}:`);
        console.log(`   - URL: ${url.url}`);
        console.log(`   - Title: ${url.title}`);
        console.log(`   - Enabled: ${url.enabled}`);
        console.log(`   - Category: ${url.category || 'N/A'}`);
        const contentPreview = url.content?.substring(0, 300) || '';
        if (contentPreview.toLowerCase().includes(searchTerm.toLowerCase())) {
          const matchIndex = contentPreview.toLowerCase().indexOf(searchTerm.toLowerCase());
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(contentPreview.length, matchIndex + searchTerm.length + 50);
          console.log(`   - Nội dung chứa "${searchTerm}": ...${contentPreview.substring(start, end)}...`);
        }
      });
    } else {
      console.log(`   ❌ Không tìm thấy URL nào chứa "${searchTerm}"`);
    }

    // Check in Structured Data
    console.log('\n📊 4. Structured Data:');
    console.log(`   Tổng số Structured Data: ${botSettings.structuredData?.length || 0}`);
    const enabledStructured = botSettings.structuredData?.filter((data: any) => data.enabled) || [];
    console.log(`   Structured Data đang enabled: ${enabledStructured.length}`);
    
    const matchingStructured = enabledStructured.filter((data: any) => {
      const dataStr = JSON.stringify(data.data || {}).toLowerCase();
      return data.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             data.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             dataStr.includes(searchTerm.toLowerCase());
    }) || [];
    
    if (matchingStructured.length > 0) {
      console.log(`   ✅ Tìm thấy ${matchingStructured.length} Structured Data chứa "${searchTerm}":`);
      matchingStructured.forEach((data: any, index: number) => {
        console.log(`\n   Structured Data ${index + 1}:`);
        console.log(`   - Tên: ${data.name}`);
        console.log(`   - Loại: ${data.type}`);
        console.log(`   - Enabled: ${data.enabled}`);
        console.log(`   - Category: ${data.category || 'N/A'}`);
        console.log(`   - Data preview: ${JSON.stringify(data.data).substring(0, 200)}...`);
      });
    } else {
      console.log(`   ❌ Không tìm thấy Structured Data nào chứa "${searchTerm}"`);
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📝 TÓM TẮT');
    console.log('='.repeat(80));
    console.log(`\nKnowledge Base được build từ:`);
    console.log(`1. FAQs: ${botSettings.faqs?.length || 0} items (${matchingFAQs.length} chứa "${searchTerm}")`);
    console.log(`2. Documents: ${enabledDocs.length} enabled (${matchingDocs.length} chứa "${searchTerm}")`);
    console.log(`3. URLs: ${enabledUrls.length} enabled (${matchingUrls.length} chứa "${searchTerm}")`);
    console.log(`4. Structured Data: ${enabledStructured.length} enabled (${matchingStructured.length} chứa "${searchTerm}")`);
    
    console.log(`\n📏 Knowledge Base tổng độ dài: ${knowledgeBase.length} ký tự`);
    console.log(`\n💡 Khi chatbot trả lời câu hỏi về "${searchTerm}", nó sẽ:`);
    console.log(`   1. Lấy tất cả FAQs (ưu tiên cao nhất, không bị cắt)`);
    console.log(`   2. Lấy ${Math.min(enabledDocs.length, 10)} documents đầu tiên (enabled)`);
    console.log(`   3. Lấy ${Math.min(enabledUrls.length, 10)} URLs đầu tiên (enabled)`);
    console.log(`   4. Lấy ${Math.min(enabledStructured.length, 10)} structured data đầu tiên (enabled)`);
    console.log(`   5. Gửi tất cả vào system prompt cho OpenAI GPT-4o-mini`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Hoàn tất!');
    console.log('='.repeat(80));

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

// Get botId and searchTerm from command line arguments
const botId = process.argv[2] || 'thien_thanh';
const searchTerm = process.argv[3] || 'roadmap';

checkKnowledgeBaseSource(botId, searchTerm);


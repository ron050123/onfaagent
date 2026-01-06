import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

import BotSettings from '../lib/models/BotSettings';

async function listKnowledgeBase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all bots
    const bots = await BotSettings.find({}).select('botId name faqs documents urls structuredData').lean();

    console.log('='.repeat(80));
    console.log('📚 KNOWLEDGE BASE SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nTotal bots: ${bots.length}\n`);

    if (bots.length === 0) {
      console.log('No bots found in database.');
      await mongoose.disconnect();
      return;
    }

    // Count knowledge base types across all bots
    let totalFAQs = 0;
    let totalDocuments = 0;
    let totalURLs = 0;
    let totalStructuredData = 0;

    const documentTypes: { [key: string]: number } = { pdf: 0, docx: 0, txt: 0 };
    const structuredDataTypes: { [key: string]: number } = { products: 0, pricing: 0, services: 0, catalog: 0 };

    // Process each bot
    bots.forEach((bot: any, index: number) => {
      const faqCount = bot.faqs?.length || 0;
      const docCount = bot.documents?.length || 0;
      const urlCount = bot.urls?.length || 0;
      const structuredCount = bot.structuredData?.length || 0;

      totalFAQs += faqCount;
      totalDocuments += docCount;
      totalURLs += urlCount;
      totalStructuredData += structuredCount;

      // Count document types
      bot.documents?.forEach((doc: any) => {
        if (doc.type && documentTypes[doc.type] !== undefined) {
          documentTypes[doc.type]++;
        }
      });

      // Count structured data types
      bot.structuredData?.forEach((data: any) => {
        if (data.type && structuredDataTypes[data.type] !== undefined) {
          structuredDataTypes[data.type]++;
        }
      });

      console.log(`\n${index + 1}. Bot: ${bot.name || 'Unnamed'} (ID: ${bot.botId})`);
      console.log(`   └─ FAQs: ${faqCount}`);
      console.log(`   └─ Documents: ${docCount} (enabled: ${bot.documents?.filter((d: any) => d.enabled).length || 0})`);
      console.log(`   └─ URLs: ${urlCount} (enabled: ${bot.urls?.filter((u: any) => u.enabled).length || 0})`);
      console.log(`   └─ Structured Data: ${structuredCount} (enabled: ${bot.structuredData?.filter((s: any) => s.enabled).length || 0})`);

      // Show document details
      if (docCount > 0) {
        console.log(`      Documents breakdown:`);
        const docTypes: { [key: string]: number } = {};
        bot.documents?.forEach((doc: any) => {
          docTypes[doc.type] = (docTypes[doc.type] || 0) + 1;
        });
        Object.entries(docTypes).forEach(([type, count]) => {
          console.log(`         • ${type.toUpperCase()}: ${count}`);
        });
      }

      // Show structured data details
      if (structuredCount > 0) {
        console.log(`      Structured Data breakdown:`);
        const dataTypes: { [key: string]: number } = {};
        bot.structuredData?.forEach((data: any) => {
          dataTypes[data.type] = (dataTypes[data.type] || 0) + 1;
        });
        Object.entries(dataTypes).forEach(([type, count]) => {
          console.log(`         • ${type}: ${count}`);
        });
      }
    });

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 OVERALL STATISTICS');
    console.log('='.repeat(80));
    console.log(`\nTotal FAQs: ${totalFAQs}`);
    console.log(`Total Documents: ${totalDocuments}`);
    console.log(`   └─ PDF: ${documentTypes.pdf}`);
    console.log(`   └─ DOCX: ${documentTypes.docx}`);
    console.log(`   └─ TXT: ${documentTypes.txt}`);
    console.log(`Total URLs: ${totalURLs}`);
    console.log(`Total Structured Data: ${totalStructuredData}`);
    console.log(`   └─ Products: ${structuredDataTypes.products}`);
    console.log(`   └─ Pricing: ${structuredDataTypes.pricing}`);
    console.log(`   └─ Services: ${structuredDataTypes.services}`);
    console.log(`   └─ Catalog: ${structuredDataTypes.catalog}`);

    console.log('\n' + '='.repeat(80));
    console.log('📋 KNOWLEDGE BASE TYPES');
    console.log('='.repeat(80));
    console.log('\n1. FAQs (Frequently Asked Questions)');
    console.log('   └─ Format: Text string array');
    console.log('   └─ Usage: Q&A pairs stored as strings');
    console.log('   └─ Priority: Highest (always included in full, never truncated)');
    
    console.log('\n2. Documents');
    console.log('   └─ Types: PDF, DOCX, TXT');
    console.log('   └─ Features:');
    console.log('      • PDF: Text extraction using unpdf');
    console.log('      • DOCX: Text extraction using mammoth');
    console.log('      • TXT: Direct text content');
    console.log('   └─ Properties: name, type, content, enabled, category, tags, uploadedAt');
    
    console.log('\n3. URLs (Web Content)');
    console.log('   └─ Format: Scraped content from web pages');
    console.log('   └─ Features:');
    console.log('      • Automatic HTML to text conversion');
    console.log('      • Title extraction from <title> tag');
    console.log('   └─ Properties: url, title, content, enabled, category, tags, scrapedAt');
    
    console.log('\n4. Structured Data');
    console.log('   └─ Types: products, pricing, services, catalog');
    console.log('   └─ Format: JSON data');
    console.log('   └─ Properties: name, type, data (JSON), enabled, category, tags, createdAt');

    console.log('\n' + '='.repeat(80));
    console.log('✅ Done!');
    console.log('='.repeat(80));

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listKnowledgeBase();


/**
 * Quick test to check AdminUsers in Google Sheet
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function test() {
  const { MasterRegistryService } = await import('../lib/sheets/master');
  const master = new MasterRegistryService();
  
  console.log('\n🔍 Fetching AdminUsers from Google Sheet...\n');
  console.log('Sheet ID:', process.env.MASTER_SHEET_ID);
  console.log('━'.repeat(60));
  
  try {
    const rows = await master.readTable(process.env.MASTER_SHEET_ID!, 'AdminUsers!A1:Z');
    
    console.log(`\n✅ Found ${rows.length} admin user(s)\n`);
    
    rows.forEach((row: any, i: number) => {
      console.log(`Admin ${i + 1}:`);
      console.log('  Email:', row.Email || 'N/A');
      console.log('  Has Password Hash:', !!row.PasswordHash ? '✅' : '❌');
      
      if (row.PasswordHash) {
        console.log('  Hash starts with:', row.PasswordHash.substring(0, 7));
        console.log('  Hash length:', row.PasswordHash.length, 'chars');
        console.log('  Valid format:', row.PasswordHash.startsWith('$2') ? '✅' : '❌');
      }
      console.log('');
    });
    
    if (rows.length === 0) {
      console.log('⚠️  No admin users found in the AdminUsers tab!');
      console.log('\nTo add an admin:');
      console.log('1. Generate a hash: npx tsx scripts/hash-password.ts "password"');
      console.log('2. Add to AdminUsers tab in Google Sheet');
      console.log('   - Email: your-email@example.com');
      console.log('   - PasswordHash: [paste the generated hash]\n');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('\nPossible issues:');
    console.error('- Google Sheet not shared with service account');
    console.error('- Invalid MASTER_SHEET_ID');
    console.error('- Missing AdminUsers tab in the sheet');
    console.error('- Invalid Google credentials\n');
  }
}

test().catch(console.error);

/**
 * Utility script to verify environment variables are properly loaded
 * Usage: npx tsx scripts/verify-env.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const requiredVars = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'MASTER_SHEET_ID',
  'COOKIE_SECRET',
  'ROOT_DOMAIN',
  'USER_TEMPLATE_SHEET_ID',
  'USER_SHEET_FOLDER_ID'
];

console.log('\n🔍 Environment Variables Check\n');
console.log('━'.repeat(60));

let allPresent = true;

for (const varName of requiredVars) {
  const value = process.env[varName];
  const isPresent = !!value;
  const icon = isPresent ? '✅' : '❌';
  
  if (!isPresent) {
    allPresent = false;
  }
  
  let displayValue = '';
  if (isPresent) {
    if (varName === 'GOOGLE_PRIVATE_KEY') {
      displayValue = value!.substring(0, 30) + '...[TRUNCATED]';
    } else if (varName === 'COOKIE_SECRET') {
      displayValue = `[${value!.length} chars]`;
    } else {
      displayValue = value!.length > 50 ? value!.substring(0, 50) + '...' : value!;
    }
  } else {
    displayValue = 'MISSING';
  }
  
  console.log(`${icon} ${varName.padEnd(30)} ${displayValue}`);
}

console.log('━'.repeat(60));

if (allPresent) {
  console.log('\n✅ All required environment variables are present!\n');
  
  // Additional validations
  const cookieSecret = process.env.COOKIE_SECRET;
  if (cookieSecret && cookieSecret.length < 32) {
    console.log('⚠️  WARNING: COOKIE_SECRET should be at least 32 characters');
  }
  
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (privateKey && !privateKey.includes('BEGIN PRIVATE KEY')) {
    console.log('⚠️  WARNING: GOOGLE_PRIVATE_KEY format looks incorrect');
  }
  
} else {
  console.log('\n❌ Some environment variables are missing!\n');
  console.log('Make sure to:');
  console.log('1. Create a .env.local file in the project root');
  console.log('2. Add all required environment variables');
  console.log('3. On Vercel, add these to your project settings\n');
  process.exit(1);
}

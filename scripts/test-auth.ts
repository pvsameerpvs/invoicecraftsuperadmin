/**
 * Test authentication flow locally
 * Usage: npx tsx scripts/test-auth.ts <email> <password>
 */

import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Please provide email and password');
  console.log('Usage: npx tsx scripts/test-auth.ts <email> <password>');
  process.exit(1);
}

async function testAuth() {
  console.log('\n🔐 Testing Authentication Flow\n');
  console.log('━'.repeat(60));
  
  // Simulate what the login route does
  console.log('1️⃣  Checking environment variables...');
  const hasEnv = !!(
    process.env.MASTER_SHEET_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
  console.log(`   ${hasEnv ? '✅' : '❌'} Environment variables loaded`);
  
  if (!hasEnv) {
    console.log('\n❌ Missing environment variables. Run: npx tsx scripts/verify-env.ts\n');
    process.exit(1);
  }
  
  console.log('\n2️⃣  Connecting to Google Sheets...');
  try {
    const { MasterRegistryService } = await import('../lib/sheets/master');
    const master = new MasterRegistryService();
    
    console.log(`   ✅ Connected to Master Sheet: ${process.env.MASTER_SHEET_ID}`);
    
    console.log('\n3️⃣  Looking up admin user...');
    const admin = await master.getSuperAdminByEmail(email);
    
    if (!admin) {
      console.log(`   ❌ Admin not found for email: ${email}`);
      console.log('\n   Make sure:');
      console.log('   - Email exists in AdminUsers tab');
      console.log('   - Email is spelled correctly');
      console.log('   - Sheet is shared with service account\n');
      process.exit(1);
    }
    
    console.log(`   ✅ Admin found: ${admin.Email}`);
    console.log(`   📋 Password hash: ${admin.PasswordHash?.substring(0, 20)}...`);
    
    console.log('\n4️⃣  Validating password hash format...');
    if (!admin.PasswordHash) {
      console.log('   ❌ Password hash is empty');
      process.exit(1);
    }
    
    if (!admin.PasswordHash.startsWith('$2')) {
      console.log('   ❌ Invalid hash format (should start with $2a$, $2b$, or $2y$)');
      console.log(`   Current: ${admin.PasswordHash.substring(0, 10)}`);
      console.log('\n   Generate a new hash with:');
      console.log(`   npx tsx scripts/hash-password.ts "${password}"\n`);
      process.exit(1);
    }
    
    console.log(`   ✅ Hash format valid: ${admin.PasswordHash.substring(0, 7)}`);
    console.log(`   📏 Hash length: ${admin.PasswordHash.length} chars`);
    
    console.log('\n5️⃣  Comparing password...');
    const isValid = await bcrypt.compare(password, admin.PasswordHash);
    
    if (!isValid) {
      console.log('   ❌ Password does not match');
      console.log('\n   Possible issues:');
      console.log('   - Wrong password');
      console.log('   - Hash was generated with different bcrypt settings');
      console.log('   - Hash is corrupted');
      console.log('\n   Try generating a new hash:');
      console.log(`   npx tsx scripts/hash-password.ts "${password}"\n`);
      process.exit(1);
    }
    
    console.log('   ✅ Password matches!');
    
    console.log('\n━'.repeat(60));
    console.log('✅ AUTHENTICATION TEST PASSED!\n');
    console.log('Your credentials are valid. If login fails on Vercel:');
    console.log('1. Check environment variables are set on Vercel');
    console.log('2. Check Vercel function logs for errors');
    console.log('3. Ensure ROOT_DOMAIN is set correctly\n');
    
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    console.error('\n', error);
    process.exit(1);
  }
}

testAuth().catch(console.error);

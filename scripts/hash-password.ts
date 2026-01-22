import bcrypt from 'bcryptjs';

/**
 * Utility script to generate bcrypt password hashes
 * Usage: npx tsx scripts/hash-password.ts <password>
 */

const password = process.argv[2];

if (!password) {
  console.error('❌ Please provide a password as an argument');
  console.log('Usage: npx tsx scripts/hash-password.ts <password>');
  process.exit(1);
}

async function hashPassword(pwd: string) {
  console.log('\n🔐 Generating bcrypt hash...\n');
  
  // Use 10 rounds (default and recommended for production)
  const saltRounds = 10;
  const hash = await bcrypt.hash(pwd, saltRounds);
  
  console.log('Password:', pwd);
  console.log('Hash:', hash);
  console.log('\n✅ Copy the hash above and paste it into your Google Sheet AdminUsers tab');
  console.log('   Column: PasswordHash\n');
  
  // Verify the hash works
  const isValid = await bcrypt.compare(pwd, hash);
  console.log('Verification test:', isValid ? '✅ PASS' : '❌ FAIL');
  
  return hash;
}

hashPassword(password).catch(console.error);

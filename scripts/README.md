# Utility Scripts

This directory contains helpful scripts for managing authentication and debugging deployment issues.

## Available Scripts

### 1. 🔐 Generate Password Hash
Generate a bcrypt password hash for use in Google Sheets.

```bash
npx tsx scripts/hash-password.ts "YourPassword123"
```

**Output:**
- Bcrypt hash (copy this to Google Sheet)
- Verification test result

**Usage:**
1. Run the command with your desired password
2. Copy the generated hash
3. Paste it into the `PasswordHash` column in your Google Sheet's `AdminUsers` tab

---

### 2. ✅ Verify Environment Variables
Check if all required environment variables are properly configured.

```bash
npx tsx scripts/verify-env.ts
```

**Checks:**
- All required environment variables are present
- COOKIE_SECRET is at least 32 characters
- GOOGLE_PRIVATE_KEY format is correct

**Run this before deploying to Vercel!**

---

### 3. 🧪 Test Authentication Flow
Test the complete authentication flow locally before deploying.

```bash
npx tsx scripts/test-auth.ts "admin@example.com" "YourPassword123"
```

**What it tests:**
1. Environment variables are loaded
2. Connection to Google Sheets works
3. Admin user exists in the sheet
4. Password hash format is valid
5. Password comparison works

**Use this to debug authentication issues!**

---

## Common Workflows

### Setting up a new admin user

1. **Generate a password hash:**
   ```bash
   npx tsx scripts/hash-password.ts "SecurePassword123"
   ```

2. **Add to Google Sheet:**
   - Open your Master Sheet
   - Go to `AdminUsers` tab
   - Add a new row:
     - Email: `admin@example.com`
     - PasswordHash: `[paste the hash from step 1]`

3. **Test locally:**
   ```bash
   npx tsx scripts/test-auth.ts "admin@example.com" "SecurePassword123"
   ```

4. **Deploy and test on Vercel**

---

### Debugging Vercel deployment issues

1. **Verify local environment:**
   ```bash
   npx tsx scripts/verify-env.ts
   ```

2. **Test authentication locally:**
   ```bash
   npx tsx scripts/test-auth.ts "your-email@example.com" "your-password"
   ```

3. **Check Vercel environment variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure all variables from `.env.local` are added
   - Redeploy after adding/updating variables

4. **Check Vercel logs:**
   - Go to Deployments → Latest → Functions
   - Find `/api/auth/superadmin/login`
   - Look for `[LOGIN]` and `[SESSION]` log messages

---

## Troubleshooting

### "Admin not found"
- Check email spelling in Google Sheet
- Ensure Sheet is shared with service account
- Verify MASTER_SHEET_ID is correct

### "Password does not match"
- Generate a fresh hash with `hash-password.ts`
- Update Google Sheet with new hash
- Test again with `test-auth.ts`

### "Invalid hash format"
- Hash must start with `$2a$`, `$2b$`, or `$2y$`
- Hash must be exactly 60 characters
- Generate a new hash with `hash-password.ts`

### "Environment variables missing"
- Run `verify-env.ts` to check local setup
- On Vercel: Settings → Environment Variables
- Redeploy after adding variables

---

## See Also

- [VERCEL_AUTH_TROUBLESHOOTING.md](../VERCEL_AUTH_TROUBLESHOOTING.md) - Comprehensive troubleshooting guide

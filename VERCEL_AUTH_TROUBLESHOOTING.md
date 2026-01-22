# Vercel Authentication Troubleshooting Guide

## Problem
Authentication works locally but fails on Vercel deployment.

## Root Causes & Solutions

### 1. ✅ Environment Variables (MOST COMMON)

**Check on Vercel:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Ensure ALL these variables are set:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
MASTER_SHEET_ID
COOKIE_SECRET
ROOT_DOMAIN
USER_TEMPLATE_SHEET_ID
USER_SHEET_FOLDER_ID
```

**Important Notes:**
- `GOOGLE_PRIVATE_KEY` must include the newlines (`\n`) in the private key
- On Vercel, you can paste the entire key with actual newlines, or use `\n` escape sequences
- `COOKIE_SECRET` must be at least 32 characters
- `ROOT_DOMAIN` should be your production domain (e.g., `invoicecraftjs.com`)

**How to add GOOGLE_PRIVATE_KEY on Vercel:**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdQnRJR1n4egwr
...
-----END PRIVATE KEY-----
```

OR as a single line with `\n`:
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdQnRJR1n4egwr\n...\n-----END PRIVATE KEY-----\n
```

### 2. ✅ Password Hash Format

**Problem:** Password hashes in Google Sheet might be incorrect or corrupted.

**Solution:**
1. Generate a fresh hash using our utility:
   ```bash
   npx tsx scripts/hash-password.ts "your-password-here"
   ```

2. Copy the generated hash

3. Open your Master Sheet (ID: `16_6qhfq5WPLT-DDMUMw6ePvS19rpfPalk5mKHzsvnA8`)

4. Go to the **AdminUsers** tab

5. Update the `PasswordHash` column with the new hash

**Valid bcrypt hash format:**
- Starts with `$2a$`, `$2b$`, or `$2y$`
- Length: 60 characters
- Example: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

### 3. ✅ Runtime Configuration

**Already Fixed:** Added `export const dynamic = "force-dynamic"` to prevent caching issues.

### 4. ✅ Debugging on Vercel

**View Logs:**
1. Go to your Vercel project
2. Click on **Deployments**
3. Click on the latest deployment
4. Go to **Functions** tab
5. Find `/api/auth/superadmin/login`
6. Click **View Logs**

**What to look for:**
- `[LOGIN] Environment check` - Verify all env vars are present
- `[LOGIN] Admin found` - Check if hash format is correct
- `[LOGIN] Password comparison result` - See if bcrypt comparison works

### 5. ✅ Common Issues Checklist

- [ ] All environment variables are set on Vercel
- [ ] `GOOGLE_PRIVATE_KEY` includes proper newlines
- [ ] Password hash in Google Sheet is valid bcrypt format (starts with `$2`)
- [ ] Password hash is exactly 60 characters
- [ ] Email in Google Sheet matches login email (case-insensitive)
- [ ] Master Sheet is shared with service account email
- [ ] Redeploy after changing environment variables

### 6. ✅ Testing Steps

**Local Test:**
```bash
npx tsx scripts/verify-env.ts
```

**Generate New Hash:**
```bash
npx tsx scripts/hash-password.ts "MySecurePassword123"
```

**After Deployment:**
1. Try to login
2. Check Vercel function logs
3. Look for `[LOGIN]` prefixed messages
4. Identify which step is failing

### 7. ✅ Emergency Fix

If nothing works, try this:

1. **Create a new password hash:**
   ```bash
   npx tsx scripts/hash-password.ts "TempPassword123"
   ```

2. **Update Google Sheet AdminUsers tab:**
   - Email: your-email@example.com
   - PasswordHash: [paste the generated hash]

3. **Verify environment variables on Vercel:**
   - Go to Settings → Environment Variables
   - Click "Redeploy" after confirming all are set

4. **Check logs:**
   - Deploy → Functions → View Logs
   - Look for error messages

## Next Steps

1. **Verify environment variables on Vercel** ⬅️ START HERE
2. Generate fresh password hash
3. Update Google Sheet
4. Redeploy on Vercel
5. Check function logs
6. Test login

## Need Help?

Check the logs with these commands in the Vercel dashboard:
- Filter by: `/api/auth/superadmin/login`
- Look for: `[LOGIN]` messages
- Share the error messages if you need further assistance

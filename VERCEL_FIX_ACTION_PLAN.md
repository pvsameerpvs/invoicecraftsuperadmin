# 🚀 Vercel Authentication Fix - Action Plan

## What I Fixed

### 1. ✅ Enhanced Login Route with Debugging
**File:** `app/api/auth/superadmin/login/route.ts`

**Changes:**
- Added comprehensive error logging with `[LOGIN]` prefix
- Added environment variable validation
- Added password hash format validation
- Added `export const dynamic = "force-dynamic"` to prevent caching
- Wrapped everything in try-catch for better error handling

**Benefits:**
- You can now see exactly where authentication fails in Vercel logs
- Better error messages for debugging

---

### 2. ✅ Fixed Session Cookie Configuration
**File:** `lib/auth/session.ts`

**Changes:**
- Made `secure` flag environment-aware (only HTTPS in production)
- Added domain configuration for subdomain support
- Added session creation logging

**Benefits:**
- Cookies work correctly in both development and production
- Proper subdomain support for multi-tenant setup

---

### 3. ✅ Created Utility Scripts

#### `scripts/hash-password.ts`
Generate bcrypt password hashes with the same settings used in production.

```bash
npx tsx scripts/hash-password.ts "YourPassword123"
```

#### `scripts/verify-env.ts`
Verify all environment variables are properly configured.

```bash
npx tsx scripts/verify-env.ts
```

#### `scripts/test-auth.ts`
Test the complete authentication flow locally.

```bash
npx tsx scripts/test-auth.ts "admin@example.com" "password"
```

---

## 🎯 Action Items for You

### Step 1: Verify Local Setup ✅ (Already Done)
Your local environment is correctly configured!

### Step 2: Test Authentication Locally

Run this command to test your login credentials:

```bash
npx tsx scripts/test-auth.ts "your-admin-email@example.com" "your-password"
```

If this fails, you'll need to:
1. Generate a new password hash
2. Update your Google Sheet

### Step 3: Configure Vercel Environment Variables ⚠️ **CRITICAL**

Go to your Vercel project dashboard:

1. **Navigate to:** Settings → Environment Variables

2. **Add these variables** (copy from your `.env.local`):

   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=invoice-admin@invoicecraft-db.iam.gserviceaccount.com
   
   GOOGLE_PRIVATE_KEY=
   -----BEGIN PRIVATE KEY-----
   MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdQnRJR1n4egwr
   ... [paste your full private key with actual newlines]
   -----END PRIVATE KEY-----
   
   MASTER_SHEET_ID=16_6qhfq5WPLT-DDMUMw6ePvS19rpfPalk5mKHzsvnA8
   
   COOKIE_SECRET=12345678901234567890123456789012
   
   ROOT_DOMAIN=invoicecraftjs.com
   
   USER_TEMPLATE_SHEET_ID=11P91FDTPVheq0mvnZLlX7g8pfMyo3wy3tr6DvUNJOJI
   
   USER_SHEET_FOLDER_ID=1KKLX4geS3wjoc9iYU4cWLsNZB_VRDF__
   ```

3. **Important notes:**
   - For `GOOGLE_PRIVATE_KEY`: You can paste with actual newlines OR use `\n` escape sequences
   - For `ROOT_DOMAIN`: Use your production domain (e.g., `invoicecraftjs.com`) without `https://`
   - For `COOKIE_SECRET`: Generate a secure 32+ character string for production

### Step 4: Generate Fresh Password Hash (If Needed)

If your password hash might be corrupted or you want to be safe:

```bash
npx tsx scripts/hash-password.ts "YourSecurePassword123"
```

Then update the `AdminUsers` tab in your Google Sheet with the new hash.

### Step 5: Redeploy on Vercel

After setting environment variables:

1. Go to Vercel Dashboard
2. Click **Deployments**
3. Click **Redeploy** on the latest deployment
4. OR push a new commit to trigger automatic deployment

### Step 6: Check Vercel Logs

After deployment:

1. Go to **Deployments** → Latest deployment
2. Click **Functions** tab
3. Find `/api/auth/superadmin/login`
4. Click **View Logs**
5. Try to login
6. Look for `[LOGIN]` messages in the logs

**What to look for:**
- `[LOGIN] Environment check` - All should be `true`
- `[LOGIN] Admin found` - Should show your email
- `[LOGIN] Password comparison result` - Should be `true`
- `[SESSION] Setting cookie` - Should show cookie configuration

---

## 🔍 Debugging Checklist

If authentication still fails on Vercel:

- [ ] All environment variables are set on Vercel
- [ ] `GOOGLE_PRIVATE_KEY` includes the full key with proper formatting
- [ ] `ROOT_DOMAIN` is set to your production domain (no `localhost`)
- [ ] Password hash in Google Sheet starts with `$2` and is 60 characters
- [ ] Email in Google Sheet matches login email exactly
- [ ] Master Sheet is shared with service account email
- [ ] You redeployed after changing environment variables
- [ ] Checked Vercel function logs for error messages

---

## 📚 Documentation

- **[VERCEL_AUTH_TROUBLESHOOTING.md](./VERCEL_AUTH_TROUBLESHOOTING.md)** - Comprehensive troubleshooting guide
- **[scripts/README.md](./scripts/README.md)** - Utility scripts documentation

---

## 🆘 Still Having Issues?

1. **Run the test script:**
   ```bash
   npx tsx scripts/test-auth.ts "your-email" "your-password"
   ```

2. **Check Vercel logs** and share the `[LOGIN]` messages

3. **Verify environment variables** on Vercel match your local `.env.local`

4. **Common issues:**
   - Missing or incorrect `GOOGLE_PRIVATE_KEY` on Vercel
   - Wrong `ROOT_DOMAIN` value
   - Password hash format issue
   - Google Sheet not shared with service account

---

## Next Steps

1. ✅ Test locally: `npx tsx scripts/test-auth.ts "email" "password"`
2. ⚠️ Set environment variables on Vercel
3. 🚀 Redeploy
4. 🔍 Check logs
5. 🎉 Login should work!

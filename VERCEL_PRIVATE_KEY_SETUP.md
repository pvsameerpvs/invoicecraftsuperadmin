# 🔑 How to Set GOOGLE_PRIVATE_KEY on Vercel

## The Problem
You're getting this error on Vercel:
```
error:1E08010C:DECODER routines::unsupported
```

This means the `GOOGLE_PRIVATE_KEY` environment variable is not formatted correctly on Vercel.

## ✅ Solution: Correct Format for Vercel

### Step 1: Get Your Private Key

Open your `.env.local` file and copy the `GOOGLE_PRIVATE_KEY` value.

It should look like this:
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdQnRJR1n4egwr\nMcSRLwQskBZlR/FYrAe83bPBQPLpR+VDKHX84g39VS3ueoJEd23RX33oP/2SbNjE\n...\n-----END PRIVATE KEY-----\n
```

### Step 2: Add to Vercel (Choose ONE method)

#### Method 1: Multi-line Format (RECOMMENDED)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Name: `GOOGLE_PRIVATE_KEY`
4. Value: Paste the key with **actual newlines** (press Enter after each line):

```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdQnRJR1n4egwr
McSRLwQskBZlR/FYrAe83bPBQPLpR+VDKHX84g39VS3ueoJEd23RX33oP/2SbNjE
3/E/Zun6ulnoKDDjwbMdvmCqrabzS4iKNaqo2n42DNSdVbbcfI3Wz6F3N4K0gOkJ
Wx7uKwJ8cCN29/OYLKZjGAdku7fr1azyK7S1FLh9on+TgVVFV82Et5Z7iQPJgxp2
WYzIKzq+uFsPR73adN7CtzsMB/OOJLm4S9HEYosz7YOQflNZ6QUsyWQILagkRl9N
pLtJmExb4XnI4u3LBzKdEOiJOszE0X5kvC9BpJ8sUinOtMFdVhDtI473Ii3DIsk7
y20q3mEpAgMBAAECggEAFiCI8Yad8jMPY0SCvqrkO3ZKsGrfBUsEtl5mMdr2/ZFQ
K5LrMcSHk2MDg3quuajURZGEyxkLOinL670BhO+bckgLk87pPM1pwSr4ZGDqt3D5
VU5tJN/EF8wrs7ehHdpTWtZRhyTDD1gpcgI65+garB0F4HIi+avOqELJR4iM6HHV
J+CFs7uTeG2c/xgDR2vIGrfOzwnsa/E8Q3v2pGZhZ3ggjgVNpVsNA7xXZHPZvQPI
mTqqpfHl31Kp4TEpKbXXYrxLrzDNZKlpBve0KwGxPfRF9QQLqkeTuATGNcxw6cXr
ff7b0XBUR6wBjDiRu7c7v/3WMKLH8xbmfaJC8+YOwQKBgQDQbjHaWyx6kOT/n52i
EcXjGvqiqtfUPvMC/QE1sOwoojGrQowDX4p55VD5IafZbJInonbEw8dtFyuSwkvC
cvdj5YUGKch6Z99tVPdX/TnsxdqJMgdizApQIsmDsC8UOB5/tcPQjUYDyXUKeKpA
5U4XPZWDHCwz53oVwc+BSUGY0wKBgQDBJon8I65MLPghSLz9ZX48jin1QPookUps
LsoRMfry7hDnASIDB+z+So3QVF9DkIpFeMudfo4OYkIOKbCTadvVmjpXoJpHpKvb
wGStGzKAwwh1vFX4wb9+i/Vqn/fXnkbpQPfzDg3m+NfVE5OEMxTMLZYEpIVbtmER
qpoJLLngkwKBgQC8j0RIj30QsO6Kl0MLMNr+VxTxfm9dE0nTpUGn6hPrurgGgGCc
WJ21IxD7IUhxOXiLpL2fyqIq/fAsh3vz4QAP/r3USyOGFSX22sczfjOTDwlK/5kk
cSutJnrqcMdnptw2+Z3UKdLm8BnpbwYk5nvCoatIxqWJk5bSofIJZbTgwKBgQCf
7sNuzjSyysGi/dHPmEyQ476GX4lEMhoHvi/Un1SziGcxeldzSBF54Kdql8/WN3Fb
KJdBL+n1WCQzaByT8NB+XS5vjhBfm73hTVXyR9mUxgcNRiS5AsmQ8mwwki8d0iMN
8mXrlmAmShOPOl3G7zq3AxOR9RM/pUdxb/KPQiklQKBgC1/lUfn5EtZHCl4xMWyx
9epbn6VUDoAX1z2Csd1G+nJRM74pTAKKdAAJjaX11T/kkt8dGaHX8oai36sUHmBB
pceNSEYzpgVYHpDzdTmU3rqikJNDRdzaq8/XD55nKxjz9WNEUZ8u1tWho2YsFssx
C+LidkE2c/SkJqzu7YFLZxk
-----END PRIVATE KEY-----
```

**Important:** 
- Remove the `\n` characters
- Each line should be on its own line
- Include the BEGIN and END markers

#### Method 2: Single Line with \n (Alternative)

If Method 1 doesn't work, use this format:

```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdQnRJR1n4egwr\nMcSRLwQskBZlR/FYrAe83bPBQPLpR+VDKHX84g39VS3ueoJEd23RX33oP/2SbNjE\n...\n-----END PRIVATE KEY-----\n
```

**Note:** Keep the `\n` characters as literal text.

### Step 3: Verify Other Environment Variables

Make sure ALL these are set on Vercel:

- ✅ `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- ✅ `GOOGLE_PRIVATE_KEY` (the one we just fixed)
- ✅ `MASTER_SHEET_ID`
- ✅ `COOKIE_SECRET` (use a secure random string, not the dev one!)
- ✅ `ROOT_DOMAIN` (set to `invoicecraftjs.com`, NOT `localhost:3000`)
- ✅ `USER_TEMPLATE_SHEET_ID`
- ✅ `USER_SHEET_FOLDER_ID`

### Step 4: Redeploy

After setting the environment variables:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy**
4. **IMPORTANT:** Uncheck "Use existing Build Cache"
5. Click **Redeploy**

### Step 5: Check Logs

After redeployment:

1. Try to login at https://app.invoicecraftjs.com/admin/login
2. If it fails, go to **Deployments** → **Functions** → `/api/auth/superadmin/login`
3. Look for `[AUTH] Private key format check:` in the logs
4. It should show:
   ```
   hasBeginMarker: true
   hasEndMarker: true
   hasNewlines: true
   lineCount: 28 (or similar)
   ```

## 🔍 Troubleshooting

### Still getting DECODER error?

The private key format is still wrong. Try this:

1. **Get the key from your JSON file:**
   ```bash
   cat invoicecraft-db-8ffab0842984.json | grep -A 30 "private_key"
   ```

2. **Copy the exact value** (it will have `\n` in it)

3. **Paste it into Vercel** exactly as shown

### How to test if the key is correct?

Run this locally:
```bash
npx tsx -e "
const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\\\n/g, '\\n');
console.log('Has BEGIN:', key.includes('-----BEGIN'));
console.log('Has END:', key.includes('-----END'));
console.log('Has newlines:', key.includes('\\n'));
console.log('Line count:', key.split('\\n').length);
"
```

It should show:
- Has BEGIN: true
- Has END: true
- Has newlines: true
- Line count: 28 (approximately)

## 📝 Quick Copy-Paste

Here's the exact value from your `.env.local` that you should use:

```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdQnRJR1n4egwr\nMcSRLwQskBZlR/FYrAe83bPBQPLpR+VDKHX84g39VS3ueoJEd23RX33oP/2SbNjE\n3/E/Zun6ulnoKDDjwbMdvmCqrabzS4iKNaqo2n42DNSdVbbcfI3Wz6F3N4K0gOkJ\nWx7uKwJ8cCN29/OYLKZjGAdku7fr1azyK7S1FLh9on+TgVVFV82Et5Z7iQPJgxp2\nWYzIKzq+uFsPR73adN7CtzsMB/OOJLm4S9HEYosz7YOQflNZ6QUsyWQILagkRl9N\npLtJmExb4XnI4u3LBzKdEOiJOszE0X5kvC9BpJ8sUinOtMFdVhDtI473Ii3DIsk7\ny20q3mEpAgMBAAECggEAFiCI8Yad8jMPY0SCvqrkO3ZKsGrfBUsEtl5mMdr2/ZFQ\nK5LrMcSHk2MDg3quuajURZGEyxkLOinL670BhO+bckgLk87pPM1pwSr4ZGDqt3D5\nVU5tJN/EF8wrs7ehHdpTWtZRhyTDD1gpcgI65+garB0F4HIi+avOqELJR4iM6HHV\nJ+CFs7uTeG2c/xgDR2vIGrfOzwnsa/E8Q3v2pGZhZ3ggjgVNpVsNA7xXZHPZvQPI\nmTqqpfHl31Kp4TEpKbXXYrxLrzDNZKlpBve0KwGxPfRF9QQLqkeTuATGNcxw6cXr\nff7b0XBUR6wBjDiRu7c7v/3WMKLH8xbmfaJC8+YOwQKBgQDQbjHaWyx6kOT/n52i\nEcXjGvqiqtfUPvMC/QE1sOwoojGrQowDX4p55VD5IafZbJInonbEw8dtFyuSwkvC\ncvdj5YUGKch6Z99tVPdX/TnsxdqJMgdizApQIsmDsC8UOB5/tcPQjUYDyXUKeKpA\n5U4XPZWDHCwz53oVwc+BSUGY0wKBgQDBJon8I65MLPghSLz9ZX48jin1QPookUps\nLsoRMfry7hDnASIDB+z+So3QVF9DkIpFeMudfo4OYkIOKbCTadvVmjpXoJpHpKvb\nwGStGzKAwwh1vFX4wb9+i/Vqn/fXnkbpQPfzDg3m+NfVE5OEMxTMLZYEpIVbtmER\nqpoJLLngkwKBgQC8j0RIj30QsO6Kl0MLMNr+VxTxfm9dE0nTpUGn6hPrurgGgGCc\nWJ21IxD7IUhxOXiLpL2fyqIq/fAsh3vz4QAP/r3USyOGFSX22sczfjOTDwlK/5kk\ncSutJnrqcMdnptw2+Z3UKdLm8BnpbwYk5nvCoatIxqWJk5bSofIJZbTgwKBgQCf\n7sNuzjSyysGi/dHPmEyQ476GX4lEMhoHvi/Un1SziGcxeldzSBF54Kdql8/WN3Fb\nKJdBL+n1WCQzaByT8NB+XS5vjhBfm73hTVXyR9mUxgcNRiS5AsmQ8mwwki8d0iMN\n8mXrlmAmShOPOl3G7zq3AxOR9RM/pUdxb/KPQiklQKBgC1/lUfn5EtZHCl4xMWyx\n9epbn6VUDoAX1z2Csd1G+nJRM74pTAKKdAAJjaX11T/kkt8dGaHX8oai36sUHmBB\npceNSEYzpgVYHpDzdTmU3rqikJNDRdzaq8/XD55nKxjz9WNEUZ8u1tWho2YsFssx\nC+LidkE2c/SkJqzu7YFLZxk\n-----END PRIVATE KEY-----\n
```

Copy this EXACTLY and paste it into Vercel's `GOOGLE_PRIVATE_KEY` environment variable.

## ✅ Success Indicators

After fixing and redeploying, you should see in Vercel logs:

```
[AUTH] Private key format check: {
  hasBeginMarker: true,
  hasEndMarker: true,
  hasNewlines: true,
  length: 1704,
  firstLine: '-----BEGIN PRIVATE KEY-----',
  lineCount: 28
}
```

And authentication should work! 🎉

import { google } from "googleapis";
import { env } from "@/lib/env";

function getPrivateKey() {
  let key = env.GOOGLE_PRIVATE_KEY;
  
  // Handle different newline formats
  // Vercel might store as literal \n or actual newlines
  if (key.includes('\\n')) {
    // Replace literal \n with actual newlines
    key = key.replace(/\\n/g, '\n');
  }
  
  // Ensure key has proper format
  if (!key.includes('\n') && key.length > 100) {
    // Key might be base64 encoded or missing newlines
    console.warn('[AUTH] Private key appears to be in wrong format, attempting to fix...');
    
    // Try to add newlines in standard PEM format
    if (key.startsWith('-----BEGIN PRIVATE KEY-----')) {
      const lines = [];
      const header = '-----BEGIN PRIVATE KEY-----';
      const footer = '-----END PRIVATE KEY-----';
      
      let content = key.replace(header, '').replace(footer, '').replace(/\s/g, '');
      
      lines.push(header);
      // Split content into 64-character lines (standard PEM format)
      for (let i = 0; i < content.length; i += 64) {
        lines.push(content.substring(i, i + 64));
      }
      lines.push(footer);
      
      key = lines.join('\n');
    }
  }
  
  console.log('[AUTH] Private key format check:', {
    hasBeginMarker: key.includes('-----BEGIN PRIVATE KEY-----'),
    hasEndMarker: key.includes('-----END PRIVATE KEY-----'),
    hasNewlines: key.includes('\n'),
    length: key.length,
    firstLine: key.split('\n')[0],
    lineCount: key.split('\n').length
  });
  
  return key;
}

export function getGoogleAuth() {
  const fs = require('fs');
  // Try to load from local JSON file first (more robust in dev)
  try {
    const p = process.cwd() + "/invoicecraft-db-8ffab0842984.json";
    console.log('[AUTH] Trying to load from:', p);
    
    if (fs.existsSync(p)) {
        const fileContent = fs.readFileSync(p, 'utf-8');
        const creds = JSON.parse(fileContent);
        console.log('[AUTH] Loaded JSON. Email:', creds.client_email);
        console.log('[AUTH] Key length:', creds.private_key ? creds.private_key.length : 'undefined');
        
        return new google.auth.JWT({
          email: creds.client_email,
          key: creds.private_key,
          scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
          ],
        });
    } else {
        console.log('[AUTH] File not found at', p);
    }

  } catch (e: any) {
    console.log('[AUTH] Error loading JSON:', e.message);
    console.warn("Could not load local JSON credentials, falling back to ENV variables.");
  }

  // Fallback
  console.log('[AUTH] Falling back to ENV. Email:', env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log('[AUTH] Private key available:', !!env.GOOGLE_PRIVATE_KEY);
  console.log('[AUTH] Private key length:', env.GOOGLE_PRIVATE_KEY?.length);
  
  return new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: getPrivateKey(),
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

export function getSheets() {
  const auth = getGoogleAuth();
  return google.sheets({ version: "v4", auth });
}

export function getDrive() {
  const auth = getGoogleAuth();
  return google.drive({ version: "v3", auth });
}

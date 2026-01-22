import { google } from "googleapis";
import { env } from "@/lib/env";

function getPrivateKey() {
  // Vercel stores multiline keys with literal \n
  return env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
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

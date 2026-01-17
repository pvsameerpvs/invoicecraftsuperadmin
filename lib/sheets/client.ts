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
    fs.appendFileSync('auth_debug.log', `Trying to load from: ${p}\n`);
    
    if (fs.existsSync(p)) {
        const fileContent = fs.readFileSync(p, 'utf-8');
        const creds = JSON.parse(fileContent);
        fs.appendFileSync('auth_debug.log', `Loaded JSON. Email: ${creds.client_email}\n`);
        fs.appendFileSync('auth_debug.log', `Key length: ${creds.private_key ? creds.private_key.length : 'undefined'}\n`);
        
        return new google.auth.JWT({
          email: creds.client_email,
          key: creds.private_key,
          scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
          ],
        });
    } else {
        fs.appendFileSync('auth_debug.log', `File not found at ${p}\n`);
    }

  } catch (e: any) {
    fs.appendFileSync('auth_debug.log', `Error loading JSON: ${e.message}\n`);
    console.warn("Could not load local JSON credentials, falling back to ENV variables.");
  }

  // Fallback
  fs.appendFileSync('auth_debug.log', `Falling back to ENV. Email: ${env.GOOGLE_SERVICE_ACCOUNT_EMAIL}\n`);
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

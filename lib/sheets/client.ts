import { google } from "googleapis";
import { env } from "@/lib/env";

function getPrivateKey() {
  // Vercel stores multiline keys with literal \n
  return env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
}

export function getGoogleAuth() {
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

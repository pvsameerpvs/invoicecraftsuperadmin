import { NextResponse } from "next/server";
import { getSheets } from "@/lib/sheets/client";
import { env } from "@/lib/env";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sheets = getSheets();
    const spreadsheetId = env.MASTER_SHEET_ID;

    // DEBUG: Inspect key format
    const key = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
    const debugInfo = `
    Length: ${key.length}
    Start: ${key.substring(0, 40)}
    Contains Newline: ${key.includes("\n")}
    Contains Literal \\n: ${key.includes("\\n")}
    First 10 chars: ${key.split('').map(c => c.charCodeAt(0)).slice(0, 10).join(',')}
    `;
    const fs = require('fs');
    fs.writeFileSync('debug_key.txt', debugInfo);


    // Try to get spreadsheet metadata to verify access
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    return NextResponse.json({
      success: true,
      message: "Connection successful!",
      spreadsheetTitle: response.data.properties?.title || "Unknown Title",
      sheets: response.data.sheets?.map(s => s.properties?.title) || []
    });
  } catch (error: any) {
    console.error("Connection failed:", error);
    return NextResponse.json({
      success: false,
      message: "Connection failed",
      error: error.message,
      details: error.response?.data?.error || "No details"
    }, { status: 500 });
  }
}

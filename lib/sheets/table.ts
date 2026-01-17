import { getSheets } from "@/lib/sheets/client";

export type Row = Record<string, string>;

export async function readTable(sheetId: string, rangeA1: string): Promise<Row[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: rangeA1,
  });
  const values = res.data.values || [];
  if (values.length < 2) return [];
  const headers = values[0].map((h) => (h || "").toString().trim());
  const rows = values.slice(1).map((row) => {
    const obj: Row = {};
    headers.forEach((h, idx) => {
      obj[h] = (row[idx] || "").toString();
    });
    return obj;
  });
  return rows;
}

export async function appendRow(sheetId: string, rangeA1: string, headers: string[], row: Record<string, any>) {
  const sheets = getSheets();
  const values = [headers.map((h) => (row[h] ?? "").toString())];
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: rangeA1,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function updateCell(sheetId: string, rangeA1: string, value: string) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: rangeA1,
    valueInputOption: "RAW",
    requestBody: { values: [[value]] },
  });
}

export async function upsertByKey(
  sheetId: string,
  tabName: string,
  keyColumn: string,
  keyValue: string,
  updates: Record<string, any>
) {
  const sheets = getSheets();
  const range = `${tabName}!A:Z`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  const values = res.data.values || [];
  if (values.length === 0) throw new Error(`Missing tab ${tabName}`);
  const headers = (values[0] || []).map((h) => (h || "").toString());
  const keyIdx = headers.indexOf(keyColumn);
  if (keyIdx === -1) throw new Error(`Missing key column ${keyColumn}`);

  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if ((values[i][keyIdx] || "").toString() === keyValue) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex === -1) {
    // append new
    const row: Record<string, any> = { [keyColumn]: keyValue, ...updates };
    await appendRow(sheetId, `${tabName}!A1`, headers, row);
    return;
  }

  // update existing row: build full row array, then set back
  const current = values[rowIndex] || [];
  const newRow = headers.map((h, idx) => {
    if (Object.prototype.hasOwnProperty.call(updates, h)) return (updates[h] ?? "").toString();
    return (current[idx] ?? "").toString();
  });
  const a1 = `${tabName}!A${rowIndex + 1}:${String.fromCharCode(65 + headers.length - 1)}${rowIndex + 1}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: a1,
    valueInputOption: "RAW",
    requestBody: { values: [newRow] },
  });
}

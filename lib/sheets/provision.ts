import { getDrive, getSheets } from "@/lib/sheets/client";

export async function createTenantSpreadsheet(companyName: string) {
  const drive = getDrive();
  const sheets = getSheets();

  // Create spreadsheet via Sheets API
  const created = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: `InvoiceCraft Super Admin - ${companyName}` },
      sheets: [
        { properties: { title: "Users" } },
        { properties: { title: "Invoices" } },
        { properties: { title: "Settings" } }
      ]
    }
  });

  const spreadsheetId = created.data.spreadsheetId;
  if (!spreadsheetId) throw new Error("Spreadsheet creation failed");

  // Seed headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Users!A1:C1",
    valueInputOption: "RAW",
    requestBody: { values: [["Username", "Password", "Role"]] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Invoices!A1:F1",
    valueInputOption: "RAW",
    requestBody: { values: [["InvoiceNumber", "Date", "Client", "Total", "Status", "PayloadJSON"]] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Settings!A1:B1",
    valueInputOption: "RAW",
    requestBody: { values: [["Key", "Value"]] }
  });

  return { spreadsheetId };
}

import { readTable, appendRow, upsertByKey } from "@/lib/sheets/table";

export type TenantRole = "admin" | "user";

export type TenantUser = {
  Username: string;
  Password: string; // hashed
  Role: TenantRole;
};

export type InvoiceStatus = "Paid" | "Unpaid";

export type InvoiceRecord = {
  InvoiceNumber: string;
  Date: string;
  Client: string;
  Total: string;
  Status: InvoiceStatus;
  PayloadJSON: string;
};

export type SettingsRecord = {
  CompanyName: string;
  LogoUrl: string;
  BrandColor: string;
  BankDetails: string;
  Currency: string;
  TaxID: string;
  Address: string;
};

export class TenantSheetService {
  constructor(private sheetId: string) {}

  static USERS_TAB = "Users";
  static INVOICES_TAB = "Invoices";
  static SETTINGS_TAB = "Settings";

  async getUser(username: string): Promise<TenantUser | null> {
    const rows = await readTable(this.sheetId, `${TenantSheetService.USERS_TAB}!A1:Z`);
    const found = rows.find((r) => (r.Username || "").toLowerCase() === username.toLowerCase());
    return (found as any) || null;
  }

  async createUser(user: TenantUser) {
    const headers = ["Username", "Password", "Role"];
    await appendRow(this.sheetId, `${TenantSheetService.USERS_TAB}!A1`, headers, user as any);
  }

  async listInvoices(): Promise<InvoiceRecord[]> {
    const rows = await readTable(this.sheetId, `${TenantSheetService.INVOICES_TAB}!A1:Z`);
    return rows as any;
  }

  async getInvoice(invoiceNumber: string): Promise<InvoiceRecord | null> {
    const invoices = await this.listInvoices();
    return invoices.find((i) => i.InvoiceNumber === invoiceNumber) || null;
  }

  async upsertInvoice(invoiceNumber: string, data: Partial<InvoiceRecord>) {
    await upsertByKey(this.sheetId, TenantSheetService.INVOICES_TAB, "InvoiceNumber", invoiceNumber, data as any);
  }

  async getSettings(): Promise<SettingsRecord> {
    // Settings tab is key-value: two columns Key | Value
    const rows = await readTable(this.sheetId, `${TenantSheetService.SETTINGS_TAB}!A1:B`);
    const map: any = {};
    for (const r of rows) {
      const key = r.Key || r.key || r.Setting || r["Setting"];
      const val = r.Value || r.value;
      if (key) map[key] = val;
    }
    return {
      CompanyName: map.CompanyName || "",
      LogoUrl: map.LogoUrl || "",
      BrandColor: map.BrandColor || "#111827",
      BankDetails: map.BankDetails || "",
      Currency: map.Currency || "USD",
      TaxID: map.TaxID || "",
      Address: map.Address || "",
    };
  }
}

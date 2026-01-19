import { env } from "@/lib/env";
import { readTable, appendRow, upsertByKey, ensureTab } from "@/lib/sheets/table";
import { duplicateFile } from "./drive";

export type CompanyStatus = "Active" | "Pending" | "Suspended";

export type CompanyRecord = {
  CompanyID: string;
  CompanyName: string;
  Subdomain: string;
  SheetID: string;
  AdminEmail: string;
  Plan: string;
  Status: CompanyStatus;
  
  // Extended Profile
  TaxID?: string;
  Phone?: string;
  Address?: string;
  City?: string;
  Country?: string;
  Currency?: string;

  CreatedAt: string;
};

export type TenantUserRecord = {
  UserID: string;
  CompanyID: string;
  Email: string;
  Username: string;
  FullName: string;
  Role: "admin" | "user";
  PasswordHash?: string; // Optional if using external auth, but keeping for now
  CreatedAt: string;
};

export class MasterRegistryService {
  static COMPANIES_TAB = "Companies";
  static USERS_TAB = "TenantUsers"; // New Tab for Users
  static ADMINS_TAB = "AdminUsers"; // Super Admins

  async listCompanies(): Promise<CompanyRecord[]> {
    const rows = await readTable(env.MASTER_SHEET_ID, `${MasterRegistryService.COMPANIES_TAB}!A1:Z`);
    return rows as any;
  }

  async listTenantUsers(): Promise<TenantUserRecord[]> {
    const rows = await readTable(env.MASTER_SHEET_ID, `${MasterRegistryService.USERS_TAB}!A1:Z`);
    return rows as any;
  }

  // Helper to expose readTable for ad-hoc queries if needed, using the imported function
  async readTable(sheetId: string, range: string) {
      return readTable(sheetId, range);
  }

  async getCompanyBySubdomain(subdomain: string): Promise<CompanyRecord | null> {
    const companies = await this.listCompanies();
    const found = companies.find((c) => c.Subdomain?.toLowerCase() === subdomain.toLowerCase());
    return found || null;
  }

  async getCompanyById(companyId: string): Promise<CompanyRecord | null> {
    const companies = await this.listCompanies();
    const found = companies.find((c) => c.CompanyID === companyId);
    return found || null;
  }

  async setCompanyStatus(companyId: string, status: CompanyStatus) {
    await upsertByKey(env.MASTER_SHEET_ID, MasterRegistryService.COMPANIES_TAB, "CompanyID", companyId, {
      Status: status,
    });
  }

  async createCompany(record: CompanyRecord) {
    const headers = [
      "CompanyID",
      "CompanyName",
      "Subdomain",
      "SheetID",
      "AdminEmail",
      "Plan",
      "Status",
      "TaxID",
      "Phone",
      "Address",
      "City",
      "Country",
      "Currency",
      "CreatedAt",
    ];
    await appendRow(env.MASTER_SHEET_ID, `${MasterRegistryService.COMPANIES_TAB}!A1`, headers, record as any);
  }

  async createTenantUser(record: TenantUserRecord) {
     const headers = [
      "UserID",
      "CompanyID",
      "Email",
      "Username",
      "FullName",
      "Role",
      "PasswordHash",
      "CreatedAt"
     ];
     await appendRow(env.MASTER_SHEET_ID, `${MasterRegistryService.USERS_TAB}!A1`, headers, record as any);
  }

  async validateTenantSheet(sheetId: string) {
    if (sheetId === env.USER_TEMPLATE_SHEET_ID) {
      throw new Error("Cannot assign Template Sheet as Tenant Sheet");
    }

    // Define schema
    const tabs = [
      { 
        name: "Invoices", 
        headers: ["InvoiceID", "ClientID", "Date", "DueDate", "Items", "Subtotal", "Tax", "Total", "Status", "CreatedAt"] 
      },
      { 
        name: "Clients", 
        headers: ["ClientID", "Name", "Email", "Phone", "Address", "City", "Country", "CreatedAt"] 
      },
      { 
        name: "Products", 
        headers: ["ProductID", "Name", "Description", "Price", "Currency", "CreatedAt"] 
      },
      { 
        name: "Settings", 
        headers: ["Key", "Value", "Description", "UpdatedAt"] 
      },
    ];

    // Ensure all tabs exist
    for (const tab of tabs) {
      await ensureTab(sheetId, tab.name, tab.headers);
    }
  }

  async createTenantDB(subdomain: string) {
    const newSheetId = await duplicateFile(env.USER_TEMPLATE_SHEET_ID, env.USER_SHEET_FOLDER_ID, subdomain);
    console.info("New sheet created with ID:", newSheetId);
    return newSheetId;
  }

  async getSuperAdminByEmail(email: string): Promise<{ Email: string; PasswordHash: string } | null> {
    const rows = await readTable(env.MASTER_SHEET_ID, `${MasterRegistryService.ADMINS_TAB}!A1:Z`);
    const found = rows.find((r) => (r.Email || "").toLowerCase() == email.toLowerCase());
    if (!found) return null;
    return { Email: found.Email, PasswordHash: found.PasswordHash };
  }
}

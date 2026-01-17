import { env } from "@/lib/env";
import { readTable, appendRow, upsertByKey } from "@/lib/sheets/table";

export type CompanyStatus = "Active" | "Pending" | "Suspended";

export type CompanyRecord = {
  CompanyID: string;
  CompanyName: string;
  Subdomain: string;
  SheetID: string;
  AdminEmail: string;
  Plan: string;
  Status: CompanyStatus;
  CreatedAt: string;
};

export class MasterRegistryService {
  static COMPANIES_TAB = "Companies";
  static ADMINS_TAB = "AdminUsers";

  async listCompanies(): Promise<CompanyRecord[]> {
    const rows = await readTable(env.MASTER_SHEET_ID, `${MasterRegistryService.COMPANIES_TAB}!A1:Z`);
    return rows as any;
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
      "CreatedAt",
    ];
    await appendRow(env.MASTER_SHEET_ID, `${MasterRegistryService.COMPANIES_TAB}!A1`, headers, record as any);
  }

  async getSuperAdminByEmail(email: string): Promise<{ Email: string; PasswordHash: string } | null> {
    const rows = await readTable(env.MASTER_SHEET_ID, `${MasterRegistryService.ADMINS_TAB}!A1:Z`);
    const found = rows.find((r) => (r.Email || "").toLowerCase() == email.toLowerCase());
    if (!found) return null;
    return { Email: found.Email, PasswordHash: found.PasswordHash };
  }
}

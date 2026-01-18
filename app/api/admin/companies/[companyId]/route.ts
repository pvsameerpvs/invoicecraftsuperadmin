import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/require";
import { MasterRegistryService } from "@/lib/sheets/master";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { companyId: string } }) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.res;

  const subdomain = params.companyId;
  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain required" }, { status: 400 });
  }

  const master = new MasterRegistryService();
  const company = await master.getCompanyBySubdomain(subdomain);

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  // Fetch admin user name
  let adminName = "";
  try {
    const users = await master.readTable(process.env.MASTER_SHEET_ID!, "TenantUsers!A1:Z");
    const adminUser = users.find((u: any) => u.CompanyID === company.CompanyID && u.Role === "admin");
    if (adminUser) adminName = adminUser.FullName;
  } catch (e) {
    console.error("Failed to fetch admin user", e);
  }

  return NextResponse.json({ ok: true, company: { ...company, AdminName: adminName } });
}

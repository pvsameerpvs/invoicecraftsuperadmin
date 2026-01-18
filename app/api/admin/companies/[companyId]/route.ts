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

export async function PATCH(req: Request, { params }: { params: { companyId: string } }) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.res;

  const subdomain = params.companyId; 
  // params.companyId is actually the subdomain based on previous context, 
  // but let's double check logic. 
  // In GET, it treats params.companyId as subdomain: `const subdomain = params.companyId;`
  // But wait, the route is `app/api/admin/companies/[companyId]/route.ts`. 
  // The service method is `getCompanyBySubdomain`. 
  // However, updating status usually requires the actual CompanyID (Sheet ID key), OR we need to lookup the ID first.
  
  if (!subdomain) {
    return NextResponse.json({ error: "Company identifier required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["Active", "Pending", "Suspended"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status provided" }, { status: 400 });
    }

    const master = new MasterRegistryService();
    // We need the actual CompanyID to update the record safely if the sheet uses ID as key.
    // Let's first get the company to find its ID.
    const company = await master.getCompanyBySubdomain(subdomain);
    
    if (!company) {
       return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    await master.setCompanyStatus(company.CompanyID, status);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

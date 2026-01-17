import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MasterRegistryService } from "@/lib/sheets/master";
import { TenantSheetService } from "@/lib/sheets/tenant";
import { sealSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as any;
  const tenant = (body?.tenant || "").toString().trim();
  const username = (body?.username || "").toString().trim();
  const password = (body?.password || "").toString();
  if (!tenant || !username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const master = new MasterRegistryService();
  const company = await master.getCompanyBySubdomain(tenant);
  if (!company) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  if (company.Status !== "Active") return NextResponse.json({ error: `Tenant is ${company.Status}` }, { status: 403 });

  const tenantSvc = new TenantSheetService(company.SheetID);
  const user = await tenantSvc.getUser(username);
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.Password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const role = user.Role === "admin" ? "tenant_admin" : "tenant_user";
  await sealSession({ tenant: tenant, sheetId: company.SheetID, role, status: company.Status, sub: username });

  return NextResponse.json({ ok: true });
}

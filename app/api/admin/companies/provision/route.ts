import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { requireSuperAdmin } from "@/lib/auth/require";
import { MasterRegistryService } from "@/lib/sheets/master";
import { createTenantSpreadsheet } from "@/lib/sheets/provision";
import { TenantSheetService } from "@/lib/sheets/tenant";
import { getSheets } from "@/lib/sheets/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.res;

  const body = await req.json().catch(() => null) as any;
  const adminUsername = (body?.adminUsername || "").toString().trim();
  const adminPassword = (body?.adminPassword || "").toString();
  const plan = (body?.plan || "Free").toString();
  const subdomain = (body?.subdomain || "").toString().trim().toLowerCase();
  const companyName = (body?.companyName || "").toString().trim();
  const taxId = (body?.taxId || "").toString().trim();
  const officialEmail = (body?.officialEmail || "").toString().trim();
  const phone = (body?.phone || "").toString().trim();
  const address = (body?.address || "").toString().trim();
  const currency = (body?.currency || "USD").toString().trim();

  if (!adminUsername || !adminPassword || !subdomain || !companyName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["free", "pro", "enterprise"].includes(plan.toLowerCase())) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const master = new MasterRegistryService();
  const exists = await master.getCompanyBySubdomain(subdomain);
  if (exists) return NextResponse.json({ error: "Subdomain already exists" }, { status: 409 });

  const { spreadsheetId } = await createTenantSpreadsheet(companyName);

  // Seed tenant admin user
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const tenantSvc = new TenantSheetService(spreadsheetId);
  await tenantSvc.createUser({ Username: adminUsername, Password: passwordHash, Role: "admin" });

  // Seed settings key/value
  const sheets = getSheets();
  const settings = [
    ["CompanyName", companyName],
    ["LogoUrl", body?.logoUrl || ""],
    ["BrandColor", body?.brandColor || "#111827"],
    ["BankDetails", body?.bankDetails || ""],
    ["Currency", currency],
    ["TaxID", taxId],
    ["Address", address],
    ["OfficialEmail", officialEmail],
    ["Phone", phone],
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Settings!A2:B",
    valueInputOption: "RAW",
    requestBody: { values: settings },
  });

  const companyId = randomUUID();
  await master.createCompany({
    CompanyID: companyId,
    CompanyName: companyName,
    Subdomain: subdomain,
    SheetID: spreadsheetId,
    AdminEmail: officialEmail || "",
    Plan: plan,
    Status: "Pending",
    CreatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, companyId, sheetId: spreadsheetId, status: "Pending" });
}

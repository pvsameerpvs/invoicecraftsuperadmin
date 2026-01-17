import { NextResponse } from "next/server";
import { MasterRegistryService } from "@/lib/sheets/master";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") || "").trim();
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  const master = new MasterRegistryService();
  const company = await master.getCompanyBySubdomain(slug);
  if (!company) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    status: company.Status,
    sheetId: company.SheetID,
    companyId: company.CompanyID,
  });
}

import { NextResponse } from "next/server";
import { getTenantContextFromHeaders } from "@/lib/tenant-context";
import { requireTenant } from "@/lib/auth/require";
import { TenantSheetService } from "@/lib/sheets/tenant";

export const runtime = "nodejs";

export async function GET() {
  const { tenant, sheetId } = getTenantContextFromHeaders();
  if (!tenant || !sheetId) return NextResponse.json({ error: "Missing tenant context" }, { status: 400 });

  const guard = await requireTenant(tenant);
  if (!guard.ok) return guard.res;

  const svc = new TenantSheetService(sheetId);
  const settings = await svc.getSettings();
  return NextResponse.json({ ok: true, settings });
}

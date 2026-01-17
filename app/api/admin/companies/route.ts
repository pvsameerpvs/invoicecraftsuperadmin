import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/require";
import { MasterRegistryService } from "@/lib/sheets/master";

export const runtime = "nodejs";

export async function GET() {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.res;

  const master = new MasterRegistryService();
  const companies = await master.listCompanies();
  return NextResponse.json({ ok: true, companies });
}

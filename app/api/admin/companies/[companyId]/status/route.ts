import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/require";
import { MasterRegistryService, type CompanyStatus } from "@/lib/sheets/master";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: { companyId: string } }) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.res;

  const body = await req.json().catch(() => null) as any;
  const status = (body?.status || "").toString() as CompanyStatus;
  if (!status || !["Active", "Pending", "Suspended"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const master = new MasterRegistryService();
  await master.setCompanyStatus(params.companyId, status);
  return NextResponse.json({ ok: true });
}

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
  const invoices = await svc.listInvoices();
  return NextResponse.json({ ok: true, invoices });
}

export async function POST(req: Request) {
  const { tenant, sheetId } = getTenantContextFromHeaders();
  if (!tenant || !sheetId) return NextResponse.json({ error: "Missing tenant context" }, { status: 400 });

  const guard = await requireTenant(tenant, ["tenant_admin", "tenant_user"]);
  if (!guard.ok) return guard.res;

  const body = await req.json().catch(() => null) as any;
  const invoiceNumber = (body?.invoiceNumber || "").toString().trim();
  if (!invoiceNumber) return NextResponse.json({ error: "Missing invoiceNumber" }, { status: 400 });

  const svc = new TenantSheetService(sheetId);
  await svc.upsertInvoice(invoiceNumber, {
    InvoiceNumber: invoiceNumber,
    Date: body?.date || new Date().toISOString().slice(0, 10),
    Client: body?.client || "",
    Total: body?.total || "0",
    Status: body?.status || "Unpaid",
    PayloadJSON: JSON.stringify(body?.payload || {}),
  } as any);

  return NextResponse.json({ ok: true });
}

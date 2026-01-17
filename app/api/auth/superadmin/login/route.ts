import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MasterRegistryService } from "@/lib/sheets/master";
import { sealSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as any;
  const email = (body?.email || "").toString().trim();
  const password = (body?.password || "").toString();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const master = new MasterRegistryService();
  const admin = await master.getSuperAdminByEmail(email);
  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, admin.PasswordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await sealSession({ tenant: null, sheetId: null, role: "superadmin", sub: admin.Email });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MasterRegistryService } from "@/lib/sheets/master";
import { sealSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as any;
    const email = (body?.email || "").toString().trim();
    const password = (body?.password || "").toString();
    
    console.log("[LOGIN] Attempt for email:", email);
    console.log("[LOGIN] Environment check:", {
      hasMasterSheetId: !!process.env.MASTER_SHEET_ID,
      hasGoogleEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    });

    if (!email || !password) {
      console.log("[LOGIN] Missing credentials");
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const master = new MasterRegistryService();
    const admin = await master.getSuperAdminByEmail(email);
    
    if (!admin) {
      console.log("[LOGIN] Admin not found for email:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log("[LOGIN] Admin found:", {
      email: admin.Email,
      hasPasswordHash: !!admin.PasswordHash,
      hashLength: admin.PasswordHash?.length,
      hashPrefix: admin.PasswordHash?.substring(0, 7) // bcrypt hashes start with $2a$, $2b$, or $2y$
    });

    // Validate hash format
    if (!admin.PasswordHash || !admin.PasswordHash.startsWith('$2')) {
      console.error("[LOGIN] Invalid password hash format");
      return NextResponse.json({ error: "Invalid credentials configuration" }, { status: 500 });
    }

    // Compare password
    const ok = await bcrypt.compare(password, admin.PasswordHash);
    console.log("[LOGIN] Password comparison result:", ok);
    
    if (!ok) {
      console.log("[LOGIN] Password mismatch");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log("[LOGIN] Authentication successful, creating session");
    await sealSession({ tenant: null, sheetId: null, role: "superadmin", sub: admin.Email });
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[LOGIN] Error:", error);
    return NextResponse.json({ 
      error: "Authentication failed", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSession, type Role, type SessionData } from "@/lib/auth/session";

type ReqResult =
  | { ok: true; session: SessionData; res: null }
  | { ok: false; session: null; res: NextResponse };

export async function requireRole(allowed: Role[]): Promise<ReqResult> {
  const session = await getSession();
  if (!session || !allowed.includes(session.role)) {
    return {
      ok: false,
      session: null,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, session, res: null };
}

export async function requireSuperAdmin() {
  return requireRole(["superadmin"]);
}

export async function requireTenant(tenantSlug: string, allowed: Role[] = ["tenant_admin", "tenant_user"]) {
  const result = await requireRole(allowed);
  if (!result.ok) return result;
  if (result.session.tenant !== tenantSlug) {
    return {
      ok: false as const,
      session: null,
      res: NextResponse.json({ error: "Cross-tenant access blocked" }, { status: 403 }),
    };
  }
  return result;
}

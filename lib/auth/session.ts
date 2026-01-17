import { cookies } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";
import { env } from "@/lib/env";

export type TenantStatus = "Active" | "Pending" | "Suspended";
export type Role = "superadmin" | "tenant_admin" | "tenant_user";

export type SessionData = {
  tenant: string | null;
  sheetId: string | null;
  role: Role;
  status?: TenantStatus;
  sub?: string; // user identifier
};

const COOKIE_NAME = "ic_session";

function getKey() {
  // 32+ chars -> 256-bit key material
  return new TextEncoder().encode(env.COOKIE_SECRET);
}

export async function sealSession(payload: SessionData, maxAgeSeconds = 60 * 60 * 12) {
  const now = Math.floor(Date.now() / 1000);
  const token = await new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt(now)
    .setExpirationTime(now + maxAgeSeconds)
    .encrypt(getKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSession() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionData | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtDecrypt(token, getKey());
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

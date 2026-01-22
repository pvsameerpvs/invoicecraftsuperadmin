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

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions: any = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction, // Only use secure in production (HTTPS)
    path: "/",
    maxAge: maxAgeSeconds,
  };

  // In production, set domain for subdomain support
  if (isProduction && env.ROOT_DOMAIN && !env.ROOT_DOMAIN.includes('localhost')) {
    cookieOptions.domain = `.${env.ROOT_DOMAIN}`; // e.g., .invoicecraftjs.com
  }

  console.log('[SESSION] Setting cookie:', {
    isProduction,
    secure: cookieOptions.secure,
    domain: cookieOptions.domain,
    maxAge: maxAgeSeconds
  });

  cookies().set(COOKIE_NAME, token, cookieOptions);
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

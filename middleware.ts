import { NextRequest, NextResponse } from "next/server";

function getHost(req: NextRequest) {
  return req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
}

function parseSubdomain(host: string, rootDomain: string) {
  const cleanHost = host.split(":")[0];

  // Local dev: tenant.localhost or app.localhost
  if (cleanHost === "localhost") return null;
  if (cleanHost.endsWith(".localhost")) {
    const h = cleanHost.replace(/\.localhost$/, "");
    const parts = h.split(".");
    if (parts.length >= 1 && parts[0]) return parts[0];
    return null;
  }

  if (!cleanHost.endsWith(rootDomain)) return null;
  const remainder = cleanHost.slice(0, -rootDomain.length);
  const trimmed = remainder.replace(/\.$/, "");
  if (!trimmed) return null;
  const parts = trimmed.split(".");
  return parts[0] || null;
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|robots.txt|sitemap.xml|assets|public).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const host = getHost(req);
  const rootDomain = process.env.ROOT_DOMAIN || "invoicecraft.com";
  const subdomain = parseSubdomain(host, rootDomain);

  const url = req.nextUrl.clone();

  // Super Admin entrypoint: app.<root>
  if (subdomain === "app") {
    // Allow API routes to pass through (do not prefix with /admin)
    if (url.pathname.startsWith("/api")) {
       return NextResponse.next();
    }

    if (!url.pathname.startsWith("/admin")) {
      url.pathname = "/admin" + (url.pathname === "/" ? "" : url.pathname);
    }
    return NextResponse.rewrite(url);
  }

  // Public root domain: redirect to app
  if (!subdomain) {
    // allow /api endpoints on root for health
    return NextResponse.next();
  }

  // Avoid infinite loop when middleware itself is resolving
  if (url.pathname.startsWith("/api/tenant/resolve")) {
    return NextResponse.next();
  }

  // Resolve tenant -> status + sheetId using server route (Node runtime)
  // Edge middleware can fetch; keep tight timeouts.
  const resolveUrl = new URL(`/api/tenant/resolve?slug=${encodeURIComponent(subdomain)}`, req.nextUrl.origin);
  const resolveRes = await fetch(resolveUrl, {
    headers: { "x-internal-mw": "1" },
    cache: "no-store",
  }).catch(() => null);

  if (!resolveRes || !resolveRes.ok) {
    url.pathname = "/tenant-not-found";
    url.searchParams.set("tenant", subdomain);
    return NextResponse.rewrite(url);
  }

  const resolved = (await resolveRes.json()) as {
    ok: boolean;
    status: "Active" | "Pending" | "Suspended";
    sheetId: string;
    companyId: string;
  };

  // If tenant not active, block everything except a friendly info page
  if (resolved.status !== "Active") {
    if (url.pathname.startsWith("/api")) {
      return NextResponse.json({ ok: false, error: `Tenant is ${resolved.status}` }, { status: 403 });
    }
    url.pathname = "/blocked";
    url.searchParams.set("status", resolved.status);
    url.searchParams.set("tenant", subdomain);
    return NextResponse.rewrite(url);
  }

  // For API routes we do not rewrite path; we only attach tenant context headers
  if (url.pathname.startsWith("/api")) {
    const apiRes = NextResponse.next();
    apiRes.headers.set("x-tenant", subdomain);
    apiRes.headers.set("x-tenant-sheet-id", resolved.sheetId);
    apiRes.headers.set("x-tenant-status", resolved.status);
    apiRes.headers.set("x-company-id", resolved.companyId);
    return apiRes;
  }

  // Rewrite tenant to /tenant/[slug]
  if (!url.pathname.startsWith(`/tenant/${subdomain}`)) {
    url.pathname = `/tenant/${subdomain}` + (url.pathname === "/" ? "" : url.pathname);
  }

  const res = NextResponse.rewrite(url);
  res.headers.set("x-tenant", subdomain);
  res.headers.set("x-tenant-sheet-id", resolved.sheetId);
  res.headers.set("x-tenant-status", resolved.status);
  res.headers.set("x-company-id", resolved.companyId);
  return res;
}

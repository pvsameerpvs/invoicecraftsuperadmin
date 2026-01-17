import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { TenantSheetService } from "@/lib/sheets/tenant";
import { Button } from "@/components/ui/button";

export default async function TenantAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const session = await getSession();
  if (!session || (session.role !== "tenant_admin" && session.role !== "tenant_user")) {
    redirect(`/tenant/${params.slug}/login`);
  }
  if (session.tenant !== params.slug) {
    redirect(`/tenant/${params.slug}/login`);
  }

  const sheetId = session.sheetId!;
  const svc = new TenantSheetService(sheetId);
  const settings = await svc.getSettings().catch(() => ({
    CompanyName: params.slug,
    LogoUrl: "",
    BrandColor: "#111827",
    BankDetails: "",
    Currency: "USD",
    TaxID: "",
    Address: "",
  }));

  return (
    <div
      style={{
        // @ts-ignore
        "--tenant-brand": settings.BrandColor || "#111827",
      } as any}
      className="min-h-screen"
    >
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.LogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.LogoUrl} alt="logo" className="h-8 w-8 rounded" />
            ) : (
              <div className="h-8 w-8 rounded bg-muted" />
            )}
            <div>
              <div className="font-semibold">{settings.CompanyName || params.slug}</div>
              <div className="text-xs text-muted-foreground">{params.slug}.invoicecraft.com</div>
            </div>
          </div>
          <nav className="text-sm text-muted-foreground flex gap-3">
            <Link href={`/tenant/${params.slug}/dashboard`}>Dashboard</Link>
            <Link href={`/tenant/${params.slug}/invoices`}>Invoices</Link>
            <Link href={`/tenant/${params.slug}/settings`}>Settings</Link>
          </nav>
          <form action="/api/auth/logout" method="post">
            <Button variant="outline" type="submit">Logout</Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div
          className="mb-6 rounded-xl border p-4"
          style={{ borderColor: "var(--tenant-brand)" }}
        >
          <p className="text-sm">
            Brand color is loaded from tenant sheet and applied via CSS variable: <code>--tenant-brand</code>.
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}

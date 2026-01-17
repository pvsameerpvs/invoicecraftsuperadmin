import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="font-semibold">InvoiceCraft Super Admin</Link>
            <nav className="text-sm text-muted-foreground flex gap-3">
              <Link href="/admin/dashboard">Dashboard</Link>
              <Link href="/admin/companies">Companies</Link>
              <Link href="/admin/register">Register Tenant</Link>
            </nav>
          </div>
          <form action="/api/auth/logout" method="post">
            <Button variant="outline" type="submit">Logout</Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, FileText, Users } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";

export default function CompanyDetailsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { companyId: string };
}) {
  const pathname = usePathname();
  const baseUrl = `/admin/companies/${params.companyId}`;

  const navItems = [
    { name: "Overview", href: baseUrl, icon: LayoutDashboard },
    { name: "Invoices", href: `${baseUrl}/invoices`, icon: FileText },
    { name: "Team", href: `${baseUrl}/team`, icon: Users },
    { name: "Settings", href: `${baseUrl}/settings`, icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-56 shrink-0 space-y-2">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 shadow-sm border space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={clsx(
                    "w-full justify-start",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/20",
                    !isActive && "hover:bg-muted"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}

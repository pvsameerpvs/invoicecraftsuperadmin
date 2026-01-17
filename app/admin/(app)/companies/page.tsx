"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Company = {
  CompanyID: string;
  CompanyName: string;
  Subdomain: string;
  Plan: string;
  Status: "Active" | "Pending" | "Suspended";
  CreatedAt: string;
};

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/companies");
    const data = await res.json();
    setCompanies(data.companies || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const breakdown = useMemo(() => {
    const b = { Active: 0, Pending: 0, Suspended: 0 } as any;
    for (const c of companies) b[c.Status] += 1;
    return b;
  }, [companies]);

  async function setStatus(companyId: string, status: Company["Status"]) {
    const res = await fetch(`/api/admin/companies/${companyId}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-sm text-muted-foreground">
            Control tenant status and plans from the Master Registry Sheet.
          </p>
        </div>
        <Link href="/admin/register">
          <Button>Register Tenant</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="Active" value={breakdown.Active} />
        <Stat title="Pending" value={breakdown.Pending} />
        <Stat title="Suspended" value={breakdown.Suspended} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All companies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No companies registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Company</th>
                    <th className="py-2">Subdomain</th>
                    <th className="py-2">Plan</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr 
                      key={c.CompanyID} 
                      className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/admin/companies/${c.Subdomain}`)}
                    >
                      <td className="py-2 font-medium">{c.CompanyName}</td>
                      <td className="py-2"><code>{c.Subdomain}</code></td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                             c.Plan === 'Enterprise' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                             c.Plan === 'Pro' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                             'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                            {c.Plan}
                        </span>
                      </td>
                      <td className="py-2">
                         <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            c.Status === 'Active' ? 'bg-green-100 text-green-700' :
                            c.Status === 'Suspended' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {c.Status}
                        </span>
                      </td>
                      <td className="py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-muted hover:bg-muted/80 text-muted-foreground"
                            onClick={() => router.push(`/admin/companies/${c.Subdomain}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStatus(c.CompanyID, "Active")}
                          >
                            Activate
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setStatus(c.CompanyID, "Suspended")}
                          >
                            Suspend
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

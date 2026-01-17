"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Building2, 
  Mail, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Company = {
  CompanyID: string;
  CompanyName: string;
  Subdomain: string;
  Plan: string;
  Status: "Active" | "Pending" | "Suspended";
  AdminName?: string;
  AdminEmail: string; 
  CreatedAt: string;
};

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Suspended" | "Pending">("All");

  async function load() {
    setLoading(true);
    try {
        const res = await fetch("/api/admin/companies");
        const data = await res.json();
        setCompanies(data.companies || []);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch = 
        c.CompanyName.toLowerCase().includes(search.toLowerCase()) || 
        c.Subdomain.toLowerCase().includes(search.toLowerCase()) ||
        (c.AdminName || "").toLowerCase().includes(search.toLowerCase()) ||
        c.AdminEmail.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || c.Status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [companies, search, statusFilter]);

  const stats = useMemo(() => {
      return {
          total: companies.length,
          active: companies.filter(c => c.Status === 'Active').length,
          suspended: companies.filter(c => c.Status === 'Suspended').length
      };
  }, [companies]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Companies</h1>
          <p className="text-slate-500 mt-1">Manage your tenants, monitor status, and handle subscriptions.</p>
        </div>
        <Link href="/admin/register">
          <Button className="shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Register New Company
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Companies" value={stats.total} icon={Building2} />
        <StatCard title="Active Tenants" value={stats.active} icon={ShieldCheck} className="text-green-600" />
        <StatCard title="Suspended" value={stats.suspended} icon={ShieldAlert} className="text-red-600" />
      </div>

      {/* Main Content */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="Search companies, domains, or admins..." 
                    className="pl-9 bg-white border-slate-200 focus:ring-primary"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select 
                    className="text-sm border-none bg-transparent focus:ring-0 text-slate-600 font-medium cursor-pointer"
                    value={statusFilter}
                    onChange={(e: any) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                </select>
             </div>
          </div>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Admin</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        <div className="flex justify-center items-center gap-2">
                             <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                             Loading data...
                        </div>
                    </td>
                 </tr>
              ) : filteredCompanies.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No companies found matching your criteria.
                    </td>
                 </tr>
              ) : (
                filteredCompanies.map((c) => (
                  <tr 
                    key={c.CompanyID} 
                    className="group hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/companies/${c.Subdomain}`)}
                  >
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                {c.CompanyName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">{c.CompanyName}</p>
                                <p className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1">
                                    {c.Subdomain}.invoicecraft.com
                                </p>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{c.AdminName || "Unknown"}</span>
                            <span className="text-xs text-slate-400">{c.AdminEmail}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            c.Plan === 'Enterprise' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            c.Plan === 'Pro' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                            {c.Plan}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <StatusBadge status={c.Status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                        {c.CreatedAt ? format(new Date(c.CreatedAt), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Button variant="ghost" size="sm" className="text-slate-400 hover:text-primary">
                          View
                          <ArrowRight className="w-4 h-4 ml-1" />
                       </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, className }: any) {
    return (
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <p className={`text-3xl font-bold text-slate-800 ${className}`}>{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-slate-50 ${className?.replace('text-', 'bg-').replace('600', '100') || 'text-slate-500'}`}>
                    <Icon className={`w-6 h-6`} />
                </div>
            </CardContent>
        </Card>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Active') {
        return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                Active
            </div>
        )
    }
    if (status === 'Suspended') {
        return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full w-fit">
                 <ShieldAlert className="w-3 h-3" />
                Suspended
            </div>
        )
    }
    return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full w-fit">
            Pending
        </div>
    )
}

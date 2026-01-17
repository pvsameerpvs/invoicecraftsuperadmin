"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Calendar, CreditCard, Mail, Shield, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CompanyRecord = {
  CompanyID: string;
  CompanyName: string;
  Subdomain: string;
  SheetID: string;
  AdminEmail: string;
  AdminName?: string; 
  AdminUsername?: string; // Extended info
  Plan: string;
  Status: "Active" | "Pending" | "Suspended";
  TaxID?: string;
  Phone?: string;
  Address?: string;
  City?: string;
  Country?: string;
  Currency?: string;
  CreatedAt: string;
};

export default function CompanyDetailsPage({ params }: { params: { companyId: string } }) {
  const router = useRouter();
  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/admin/companies/${params.companyId}`);
        const data = await res.json();
        
        if (!res.ok) {
           throw new Error(data.error || "Failed to load company details");
        }
        
        setCompany(data.company);
      } catch (error: any) {
        toast.error(error.message);
        router.push("/admin/companies");
      } finally {
        setLoading(false);
      }
    }

    if (params.companyId) {
      fetchDetails();
    }
  }, [params.companyId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{company.CompanyName}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{company.Subdomain}.invoicecraft.com</span>
            <span className="text-xs">•</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                company.Status === 'Active' ? 'bg-green-100 text-green-700' :
                company.Status === 'Suspended' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
            }`}>
                {company.Status}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Company Profile
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Company Name</label>
                        <p className="text-sm font-medium">{company.CompanyName}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Subdomain</label>
                        <p className="text-sm font-medium">{company.Subdomain}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Admin</label>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium">{company.AdminName || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">@{company.AdminUsername || "username"}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{company.AdminEmail}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Created At</label>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <p className="text-sm font-medium">{new Date(company.CreatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    {/* Extended Info */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Phone</label>
                        <p className="text-sm font-medium">{company.Phone || "-"}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Tax ID</label>
                        <p className="text-sm font-medium font-mono">{company.TaxID || "-"}</p>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Address</label>
                        <p className="text-sm font-medium">
                            {[company.Address, company.City, company.Country].filter(Boolean).join(", ") || "-"}
                        </p>
                    </div>
                </div>
                
                <div className="pt-4 border-t">
                    <label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">Database (Google Sheet)</label>
                    <div className="bg-muted p-3 rounded-md font-mono text-xs break-all flex items-center gap-2">
                        <span className="flex-1">{company.SheetID}</span>
                        <Button variant="outline" size="sm" className="h-6 text-xs ml-2" onClick={() => {
                            navigator.clipboard.writeText(company.SheetID);
                            toast.success("Sheet ID copied");
                        }}>
                            Copy
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="shadow-sm h-fit">
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Subscription
                </CardTitle>
                <CardDescription>Current plan details</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Plan</span>
                    <span className="font-bold text-primary">{company.Plan}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        company.Status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {company.Status}
                    </span>
                 </div>
                 
                 <div className="pt-4 mt-2 border-t space-y-2">
                    <Button className="w-full" variant="outline">Upgrade Plan</Button>
                    <Button className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" variant="ghost">Suspend Tenant</Button>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

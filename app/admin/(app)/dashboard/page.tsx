import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MasterRegistryService } from "@/lib/sheets/master";

function withinLastDays(iso: string, days: number) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return t >= Date.now() - days * 24 * 60 * 60 * 1000;
}

export default async function AdminDashboard() {
  const master = new MasterRegistryService();
  const companies = await master.listCompanies();

  const total = companies.length;
  const active = companies.filter((c) => c.Status === "Active").length;
  const pending = companies.filter((c) => c.Status === "Pending").length;
  const suspended = companies.filter((c) => c.Status === "Suspended").length;
  const recent = companies.filter((c) => withinLastDays(c.CreatedAt, 30));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground">Global overview across all tenants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat title="Total Companies" value={total} />
        <Stat title="Active" value={active} />
        <Stat title="Pending" value={pending} />
        <Stat title="Suspended" value={suspended} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent registrations (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No registrations in the last 30 days
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Company</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subdomain</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Plan</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {recent.slice(0, 20).map((c) => {
                     // Determine status badge variant
                     let statusVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "secondary";
                     if (c.Status === "Active") statusVariant = "success";
                     else if (c.Status === "Suspended") statusVariant = "destructive";
                     else if (c.Status === "Pending") statusVariant = "warning";

                     // Initials for avatar
                     const initials = c.CompanyName
                       ? c.CompanyName.slice(0, 2).toUpperCase()
                       : "CO";

                     return (
                      <tr key={c.CompanyID} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">
                           <div className="flex items-center gap-2">
                             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                               {initials}
                             </div>
                             {c.CompanyName}
                           </div>
                        </td>
                        <td className="p-4 align-middle">
                           <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                             {c.Subdomain}
                           </code>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant="outline" className="capitalize">
                            {c.Plan}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant={statusVariant}>
                            {c.Status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {new Date(c.CreatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Health is derived from Google Sheets API reachability. If dashboards load, the control plane is healthy.
          </p>
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

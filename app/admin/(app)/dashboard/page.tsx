import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            <p className="text-sm text-muted-foreground">No registrations in the last 30 days.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Company</th>
                    <th className="py-2">Subdomain</th>
                    <th className="py-2">Plan</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.slice(0, 20).map((c) => (
                    <tr key={c.CompanyID} className="border-t">
                      <td className="py-2">{c.CompanyName}</td>
                      <td className="py-2"><code>{c.Subdomain}</code></td>
                      <td className="py-2">{c.Plan}</td>
                      <td className="py-2">{c.Status}</td>
                      <td className="py-2">{new Date(c.CreatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
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

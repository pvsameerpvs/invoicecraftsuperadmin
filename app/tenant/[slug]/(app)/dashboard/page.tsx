import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { TenantSheetService } from "@/lib/sheets/tenant";

export default async function TenantDashboard({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getSession();
  const sheetId = session?.sheetId;

  const svc = new TenantSheetService(sheetId || "");
  const invoices = sheetId ? await svc.listInvoices().catch(() => []) : [];

  const paid = invoices.filter((i) => i.Status === "Paid");
  const unpaid = invoices.filter((i) => i.Status !== "Paid");
  const sum = (xs: any[]) => xs.reduce((a, b) => a + (parseFloat(b.Total || "0") || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Revenue & payment analytics (Google Sheets-backed).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="Total invoices" value={invoices.length.toString()} />
        <Stat title="Paid total" value={sum(paid).toFixed(2)} />
        <Stat title="Unpaid total" value={sum(unpaid).toFixed(2)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Go to <b>Invoices</b> to create invoices and export high-fidelity PDFs with your company branding.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
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

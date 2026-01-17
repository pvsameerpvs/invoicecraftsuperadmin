import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle>InvoiceCraft Super Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is the root domain landing page. Use <b>app</b> subdomain for Super Admin, or a tenant subdomain for the Tenant app.
          </p>
          <div className="mt-4 text-sm">
            <ul className="list-disc pl-5 space-y-1">
              <li><code>app.invoicecraft.com</code> → Super Admin</li>
              <li><code>&lt;tenant&gt;.invoicecraft.com</code> → Tenant</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

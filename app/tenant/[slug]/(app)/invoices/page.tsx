"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import html2pdf from "html2pdf.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Invoice = {
  InvoiceNumber: string;
  Date: string;
  Client: string;
  Total: string;
  Status: "Paid" | "Unpaid";
  PayloadJSON: string;
};

type Settings = {
  CompanyName: string;
  LogoUrl: string;
  BrandColor: string;
  BankDetails: string;
  Currency: string;
  TaxID: string;
  Address: string;
};

export default function InvoicesPage() {
  const params = useParams<{ slug: string }>();
  const slug = (params?.slug as string) || "";

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({ invoiceNumber: "", date: "", client: "", total: "", status: "Unpaid" as const });
  const [selected, setSelected] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  async function load() {
    const [invRes, setRes] = await Promise.all([
      fetch("/api/tenant/invoices"),
      fetch("/api/tenant/settings"),
    ]);
    const invData = await invRes.json();
    const setData = await setRes.json();
    setInvoices(invData.invoices || []);
    setSettings(setData.settings || null);
  }

  useEffect(() => {
    load();
  }, []);

  const canExport = !!selected && !!settings;

  async function createOrUpdate() {
    if (!form.invoiceNumber) return alert("Invoice number required");
    const res = await fetch("/api/tenant/invoices", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        invoiceNumber: form.invoiceNumber,
        date: form.date || new Date().toISOString().slice(0, 10),
        client: form.client,
        total: form.total,
        status: form.status,
        payload: { notes: "" },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.error || "Failed");
    setForm({ invoiceNumber: "", date: "", client: "", total: "", status: "Unpaid" });
    await load();
  }

  async function exportPDF() {
    if (!printRef.current || !selected || !settings) return;

    // Make sure branding gets applied into PDF
    const opt = {
      margin: 10,
      filename: `${selected.InvoiceNumber}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    };

    await html2pdf().set(opt).from(printRef.current).save();
  }

  const statusColor = (s: string) => (s === "Paid" ? "text-green-600" : "text-amber-600");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground">Create invoices, then export PDFs with tenant branding.</p>
        </div>
        <Button onClick={load} variant="outline">Refresh</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoice list</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">Number</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Client</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Status</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((i) => (
                      <tr key={i.InvoiceNumber} className="border-t">
                        <td className="py-2"><code>{i.InvoiceNumber}</code></td>
                        <td className="py-2">{i.Date}</td>
                        <td className="py-2">{i.Client}</td>
                        <td className="py-2">{i.Total}</td>
                        <td className={"py-2 " + statusColor(i.Status)}>{i.Status}</td>
                        <td className="py-2">
                          <Button variant="outline" onClick={() => setSelected(i)}>Preview / PDF</Button>
                        </td>
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
            <CardTitle>Create / Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Invoice Number">
              <Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="INV-0001" />
            </Field>
            <Field label="Date">
              <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="YYYY-MM-DD" />
            </Field>
            <Field label="Client">
              <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client name" />
            </Field>
            <Field label="Total">
              <Input value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} placeholder="0" />
            </Field>
            <Field label="Status">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </Field>
            <Button className="w-full" onClick={createOrUpdate}>Save to Sheets</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PDF Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <p className="text-sm text-muted-foreground">Select an invoice from the list to preview.</p>
          ) : !settings ? (
            <p className="text-sm text-muted-foreground">Loading branding…</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Tenant: <code>{slug}</code></div>
                <Button onClick={exportPDF} disabled={!canExport}>Export PDF</Button>
              </div>

              <div className="border rounded-xl p-4">
                <div ref={printRef} className="p-6">
                  <InvoicePrint settings={settings} invoice={selected} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm">{label}</label>
      {children}
    </div>
  );
}

function InvoicePrint({ settings, invoice }: { settings: Settings; invoice: Invoice }) {
  const currency = settings.Currency || "USD";
  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui" }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-semibold" style={{ color: settings.BrandColor || "#111827" }}>
            {settings.CompanyName}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Tax ID: {settings.TaxID}</div>
          <div className="text-xs text-muted-foreground">{settings.Address}</div>
        </div>
        <div className="text-right">
          {settings.LogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.LogoUrl} alt="logo" className="h-12 w-12 object-contain inline-block" />
          ) : null}
          <div className="mt-2 text-sm"><b>Invoice</b></div>
          <div className="text-xs">#{invoice.InvoiceNumber}</div>
          <div className="text-xs">Date: {invoice.Date}</div>
        </div>
      </div>

      <hr className="my-6" />

      <div className="text-sm">
        <div className="font-medium">Bill To</div>
        <div className="mt-1">{invoice.Client}</div>
      </div>

      <div className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 border-t">Services</td>
              <td className="py-3 border-t text-right">{currency} {invoice.Total}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="py-3 border-t font-semibold text-right">Total</td>
              <td className="py-3 border-t font-semibold text-right">{currency} {invoice.Total}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-8 text-sm">
        <div className="font-medium">Bank Details</div>
        <div className="mt-1 whitespace-pre-wrap">{settings.BankDetails}</div>
      </div>

      <div className="mt-6 text-xs text-muted-foreground">
        Status: {invoice.Status}
      </div>
    </div>
  );
}

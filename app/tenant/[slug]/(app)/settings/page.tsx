"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Settings = {
  CompanyName: string;
  LogoUrl: string;
  BrandColor: string;
  BankDetails: string;
  Currency: string;
  TaxID: string;
  Address: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  async function load() {
    const res = await fetch("/api/tenant/settings");
    const data = await res.json();
    setSettings(data.settings || null);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Branding & company profile are read from the tenant Google Sheet.
          </p>
        </div>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current settings</CardTitle>
        </CardHeader>
        <CardContent>
          {!settings ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <KV k="CompanyName" v={settings.CompanyName} />
              <KV k="BrandColor" v={settings.BrandColor} />
              <KV k="LogoUrl" v={settings.LogoUrl} />
              <KV k="Currency" v={settings.Currency} />
              <KV k="TaxID" v={settings.TaxID} />
              <KV k="Address" v={settings.Address} />
              <div className="md:col-span-2">
                <KV k="BankDetails" v={settings.BankDetails} pre />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit flow (recommended)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            For production, add a settings editor that writes back to the Settings tab with server-side access checks.
            This starter includes the read path + dynamic branding.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function KV({ k, v, pre }: { k: string; v: string; pre?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className={pre ? "mt-1 whitespace-pre-wrap" : "mt-1"}>{v || "—"}</div>
    </div>
  );
}

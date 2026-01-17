"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const step1Schema = z.object({
  adminUsername: z.string().min(2),
  adminPassword: z.string().min(6),
  plan: z.enum(["Free", "Pro", "Enterprise"]),
});

const step2Schema = z.object({
  subdomain: z.string().min(2).regex(/^[a-z0-9-]+$/),
  companyName: z.string().min(2),
  taxId: z.string().optional(),
  officialEmail: z.string().email(),
  phone: z.string().optional(),
});

const step3Schema = z.object({
  address: z.string().min(2),
  city: z.string().optional(),
  country: z.string().min(2),
  currency: z.string().min(2),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

type Wizard = Step1 & Step2 & Step3;

export default function RegisterTenantPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: { plan: "Free" } });
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema), defaultValues: { currency: "USD" } });

  const values = useMemo(() => ({
    ...form1.getValues(),
    ...form2.getValues(),
    ...form3.getValues(),
  }) as Wizard, [step]);

  async function next() {
    if (step === 1) {
      const ok = await form1.trigger();
      if (!ok) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      const ok = await form2.trigger();
      if (!ok) return;
      setStep(3);
      return;
    }
  }

  function back() {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  }

  async function submit() {
    const ok3 = await form3.trigger();
    if (!ok3) return;

    setSubmitting(true);
    const payload: Wizard = {
      ...form1.getValues(),
      ...form2.getValues(),
      ...form3.getValues(),
    };

    const res = await fetch("/api/admin/companies/provision", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      alert(data.error || "Provision failed");
      return;
    }

    alert(`Tenant created. Status: ${data.status}. SheetID: ${data.sheetId}`);
    window.location.href = "/admin/companies";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Register New Tenant</h1>
        <p className="text-sm text-muted-foreground">
          Strict 3-step wizard. Steps cannot be skipped.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {step} of 3</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form className="space-y-4">
              <Field label="Admin Username">
                <Input {...form1.register("adminUsername")} placeholder="admin" />
              </Field>
              <Field label="Admin Password">
                <Input type="password" {...form1.register("adminPassword")} placeholder="••••••••" />
              </Field>
              <Field label="Plan">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...form1.register("plan")}
                >
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </Field>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4">
              <Field label="Company Subdomain">
                <Input {...form2.register("subdomain")} placeholder="abccargo" />
              </Field>
              <Field label="Legal Company Name">
                <Input {...form2.register("companyName")} placeholder="ABC Cargo LLC" />
              </Field>
              <Field label="Tax ID / VAT">
                <Input {...form2.register("taxId")} placeholder="" />
              </Field>
              <Field label="Official Email">
                <Input type="email" {...form2.register("officialEmail")} placeholder="admin@company.com" />
              </Field>
              <Field label="Contact Phone">
                <Input {...form2.register("phone")} placeholder="" />
              </Field>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-4">
              <Field label="Full Address">
                <Input {...form3.register("address")} placeholder="" />
              </Field>
              <Field label="City / State">
                <Input {...form3.register("city")} placeholder="" />
              </Field>
              <Field label="Country">
                <Input {...form3.register("country")} placeholder="UAE" />
              </Field>
              <Field label="Default Currency">
                <Input {...form3.register("currency")} placeholder="AED" />
              </Field>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" type="button" onClick={back} disabled={step === 1 || submitting}>
              Back
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={next} disabled={submitting}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting ? "Provisioning…" : "Create Tenant"}
              </Button>
            )}
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            <p><b>Preview</b></p>
            <pre className="mt-2 overflow-x-auto rounded-md border bg-muted p-3">{JSON.stringify(values, null, 2)}</pre>
          </div>
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

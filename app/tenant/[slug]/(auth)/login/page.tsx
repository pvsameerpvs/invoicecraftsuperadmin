"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export default function TenantLoginPage() {
  const params = useParams<{ slug: string }>();
  const slug = (params?.slug as string) || "";
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/auth/tenant/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tenant: slug, ...values }),
    });
    if (res.ok) {
      window.location.href = `/tenant/${slug}/dashboard`;
      return;
    }
    const data = await res.json().catch(() => ({}));
    alert(data.error || "Login failed");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Tenant Login – {slug}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm">Username</label>
              <Input {...form.register("username")} />
            </div>
            <div>
              <label className="text-sm">Password</label>
              <Input type="password" {...form.register("password")} />
            </div>
            <Button className="w-full" type="submit">Login</Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Auth is validated against the <b>Users</b> tab inside this tenant&apos;s private Google Sheet.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

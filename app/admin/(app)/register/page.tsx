"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building, User, CreditCard, Check } from "lucide-react";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Step 1: Company Information
const step1Schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  subdomain: z.string().min(2, "Subdomain is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  taxId: z.string().optional(),
  officialEmail: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

// Step 2: Admin User
const step2Schema = z.object({
  adminName: z.string().min(2, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password is required"),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Step 3: Location & Plan
const step3Schema = z.object({
  address: z.string().min(2, "Address is required"),
  city: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  currency: z.string().min(2, "Currency is required"),
  plan: z.enum(["Free", "Pro", "Enterprise"]),
  sheetId: z.string().min(10, "Valid Sheet ID is required"),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

// Composite schema for final submission
const step2Base = z.object({
  adminName: z.string().min(2, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password is required"),
});

const fullSchema = step1Schema.merge(step2Base).merge(step3Schema).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof fullSchema>;

const STEPS = [
  { id: 0, title: "Company Details", icon: Building },
  { id: 1, title: "Admin User", icon: User },
  { id: 2, title: "Details & Plan", icon: CreditCard },
];

export default function RegisterTenantPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FormValues>>({});

  const form1 = useForm<Step1>({ 
    resolver: zodResolver(step1Schema), 
    defaultValues: { companyName: "", subdomain: "", taxId: "", officialEmail: "", phone: "" } 
  });
  
  const form2 = useForm<Step2>({ 
    resolver: zodResolver(step2Schema), 
    defaultValues: { adminName: "", username: "", adminPassword: "", confirmPassword: "" } 
  });
  
  const form3 = useForm<Step3>({ 
    resolver: zodResolver(step3Schema), 
    defaultValues: { address: "", city: "", country: "", currency: "AED", plan: "Pro", sheetId: "" } 
  });

  const onStep1Submit = (data: Step1) => { 
    setFormData((prev) => ({ ...prev, ...data })); 
    setStep(1); 
  };
  
  const onStep2Submit = (data: Step2) => { 
    setFormData((prev) => ({ ...prev, ...data })); 
    setStep(2); 
  };
  
  const onFinalSubmit = async (data: Step3) => {
    const finalData = { ...formData, ...data } as FormValues;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to register tenant");

      toast.success(`Tenant registered successfully! Sheet ID: ${result.sheetId}`);
      router.push("/admin/companies");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Register New Tenant</h1>
        <p className="text-muted-foreground mt-2">Onboard a new company to the platform using the wizard below.</p>
      </div>

      {/* Visual Stepper */}
      <div className="mb-10 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0"></div>
        <div className="relative z-10 flex justify-between px-10">
          {STEPS.map((s, idx) => {
            const isActive = step === idx;
            const isCompleted = step > idx;
            return (
              <div key={s.id} className="flex flex-col items-center bg-transparent gap-2">
                 <div 
                    className={clsx(
                        "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-md bg-white",
                        isActive ? "border-primary text-primary scale-110" : 
                        isCompleted ? "bg-green-500 border-green-500 text-white" : "border-gray-200 text-gray-400"
                    )}
                 >
                    {isCompleted ? <Check className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                 </div>
                 <span className={clsx("text-sm font-semibold transition-colors duration-300", isActive ? "text-primary" : "text-gray-500")}>
                    {s.title}
                 </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="shadow-lg border-muted/40 max-w-2xl mx-auto backdrop-blur-sm bg-white/90">
        <CardHeader>
          <CardTitle className="text-xl">{STEPS[step]?.title}</CardTitle>
          <CardDescription>Please enter the required information for this step.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input {...form1.register("companyName")} placeholder="Acme Inc." className="h-11" />
                  {form1.formState.errors.companyName && <p className="text-red-500 text-xs">{form1.formState.errors.companyName.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Subdomain</label>
                    <div className="flex items-center">
                        <Input {...form1.register("subdomain")} placeholder="acme" className="h-11 rounded-r-none" />
                        <div className="h-11 px-3 flex items-center bg-muted border border-l-0 border-input rounded-r-md text-muted-foreground text-xs whitespace-nowrap">
                            .invoicecraft.com
                        </div>
                    </div>
                    {form1.formState.errors.subdomain && <p className="text-red-500 text-xs">{form1.formState.errors.subdomain.message}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Official Email</label>
                    <Input type="email" {...form1.register("officialEmail")} placeholder="info@acme.com" className="h-11" />
                    {form1.formState.errors.officialEmail && <p className="text-red-500 text-xs">{form1.formState.errors.officialEmail.message}</p>}
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input {...form1.register("phone")} placeholder="+971 50 123 4567" className="h-11" />
                 </div>
              </div>
              
               <div className="space-y-2">
                  <label className="text-sm font-medium">Tax ID (TRN)</label>
                  <Input {...form1.register("taxId")} placeholder="1234567890" className="h-11" />
               </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" className="w-full sm:w-auto">Next Step</Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Name</label>
                <Input {...form2.register("adminName")} placeholder="John Doe" className="h-11" />
                {form2.formState.errors.adminName && <p className="text-red-500 text-xs">{form2.formState.errors.adminName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input {...form2.register("username")} placeholder="johndoe" className="h-11" />
                {form2.formState.errors.username && <p className="text-red-500 text-xs">{form2.formState.errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" {...form2.register("adminPassword")} placeholder="******" className="h-11" />
                {form2.formState.errors.adminPassword && <p className="text-red-500 text-xs">{form2.formState.errors.adminPassword.message}</p>}
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium">Repeat Password</label>
                <Input type="password" {...form2.register("confirmPassword")} placeholder="******" className="h-11" />
                {form2.formState.errors.confirmPassword && <p className="text-red-500 text-xs">{form2.formState.errors.confirmPassword.message}</p>}
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(0)} size="lg">Back</Button>
                <Button type="submit" size="lg">Next Step</Button>
              </div>
            </form>
          )}

          {step === 2 && (
             <form onSubmit={form3.handleSubmit(onFinalSubmit)} className="space-y-4">
              <Field label="Full Address">
                <Input {...form3.register("address")} placeholder="123 Business Bay" />
                {form3.formState.errors.address && <p className="text-red-500 text-xs">{form3.formState.errors.address.message}</p>}
              </Field>
              
              <div className="grid grid-cols-2 gap-4">
                  <Field label="City">
                    <Input {...form3.register("city")} placeholder="Dubai" />
                  </Field>
                  <Field label="Country">
                    <Input {...form3.register("country")} placeholder="UAE" />
                     {form3.formState.errors.country && <p className="text-red-500 text-xs">{form3.formState.errors.country.message}</p>}
                  </Field>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                   <Field label="Currency">
                     <Input {...form3.register("currency")} placeholder="AED" />
                     {form3.formState.errors.currency && <p className="text-red-500 text-xs">{form3.formState.errors.currency.message}</p>}
                   </Field>
                   <Field label="Plan">
                     <select {...form3.register("plan")} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="Free">Free</option>
                        <option value="Pro">Pro</option>
                        <option value="Enterprise">Enterprise</option>
                     </select>
                   </Field>
              </div>

               <Field label="Google Sheet ID">
                 <Input {...form3.register("sheetId")} placeholder="Paste your manually created Sheet ID here" />
                 <p className="text-[10px] text-muted-foreground">Optional. If provided, the system will initialize the database schema inside your sheet. Leave blank to auto-create.</p>
                 {form3.formState.errors.sheetId && <p className="text-red-500 text-xs">{form3.formState.errors.sheetId.message}</p>}
               </Field>

              <div className="mt-6 flex items-center justify-between">
                <Button variant="outline" type="button" onClick={() => setStep(1)} disabled={loading}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Provisioning..." : "Create Tenant"}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-xs text-muted-foreground hidden">
            <p><b>Debug Data</b></p>
            <pre className="mt-2 overflow-x-auto rounded-md border bg-muted p-3">{JSON.stringify({ ...formData }, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

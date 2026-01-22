"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    // Prevent multiple submissions
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/superadmin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        toast.success("Login successful!", {
          description: "Redirecting to dashboard...",
        });
        
        // Small delay to show the success message
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 500);
        return;
      }
      
      // Handle different error cases
      if (res.status === 401) {
        toast.error("Invalid credentials", {
          description: "Please check your email and password and try again.",
        });
      } else if (res.status === 500) {
        toast.error("Server error", {
          description: data.error || "Something went wrong. Please try again later.",
        });
      } else {
        toast.error("Login failed", {
          description: data.error || "An unexpected error occurred.",
        });
      }
    } catch (error) {
      toast.error("Connection error", {
        description: "Unable to connect to the server. Please check your internet connection.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex">
      {/* Left Side - Brand Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-orange-600 relative items-center justify-center p-12 overflow-hidden text-white">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="relative z-10 max-w-lg text-center">
            <div className="flex justify-center mb-8">
                 <div className="bg-white p-4 rounded-2xl shadow-2xl">
                    <Image src="/logo.png" alt="JustSearch Logo" width={240} height={80} className="h-auto w-auto" priority />
                 </div>
            </div>
          <h1 className="text-4xl font-bold mb-4">Master Control Panel</h1>
          <p className="text-lg text-white/90">
            Manage your tenants, monitor invoicing, and oversee the entire ecosystem from one centralized dashboard.
          </p>
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                <p className="text-muted-foreground mt-2">Enter your credentials to access the admin account.</p>
            </div>

          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
              <Input 
                type="email" 
                placeholder="admin@invoicecraft.com" 
                className="h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30" 
                {...form.register("email")} 
                disabled={isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
              <Input 
                type="password" 
                placeholder="Enter your password"
                className="h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30" 
                {...form.register("password")} 
                disabled={isLoading}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <Button 
              className="w-full h-11 text-base font-medium shadow-primary/25 shadow-lg" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Protected by secure authentication. <br/>Auth validated against <b>AdminUsers</b> registry.
          </p>
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/require";
import { MasterRegistryService } from "@/lib/sheets/master";
import { v4 as uuidv4 } from "uuid";
import { hash } from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return guard.res;

    const body = await req.json();
    const { 
      companyName, subdomain, officialEmail, taxId, phone, // Step 1
      adminName, username, adminPassword, // Step 2 (adminEmail removed)
      address, city, country, currency, plan // Step 3
    } = body;

    // Basic Validation
    if (!companyName || !subdomain || !username || !adminPassword || !adminName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const master = new MasterRegistryService();

    // Check if subdomain exists
    const existing = await master.getCompanyBySubdomain(subdomain);
    if (existing) {
      return NextResponse.json({ error: "Subdomain already taken" }, { status: 400 });
    }

    const companyId = uuidv4();
    const userId = uuidv4();
    const sheetId = `mock-sheet-${subdomain}`; // In a real app, we would create a real sheet here

    // 1. Create Company Record
    await master.createCompany({
      CompanyID: companyId,
      CompanyName: companyName,
      Subdomain: subdomain,
      SheetID: sheetId,
      // Use official email as the main admin contact since we don't have a separate admin email anymore
      AdminEmail: officialEmail || "", 
      Plan: plan || "Pro",
      Status: "Active",
      TaxID: taxId || "",
      Phone: phone || "",
      Address: address || "",
      City: city || "",
      Country: country || "",
      Currency: currency || "AED",
      CreatedAt: new Date().toISOString(),
    });

    // 2. Create Admin User Record
    // Hash password
    const hashedPassword = await hash(adminPassword, 10);
    
    await master.createTenantUser({
      UserID: userId,
      CompanyID: companyId,
      Email: officialEmail || "", // Use official email for user record too, or leave blank
      Username: username,
      FullName: adminName,
      Role: "Owner",
      PasswordHash: hashedPassword,
      CreatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      ok: true, 
      companyId, 
      sheetId,
      message: "Tenant registered successfully" 
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

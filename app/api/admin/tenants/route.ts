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
      address, city, country, currency, plan, sheetId, // Step 3
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

    // Determine Sheet ID: Use provided one or create new
    let finalSheetId = sheetId;
    if (!finalSheetId) {
      try {
         finalSheetId = await master.createTenantDB(subdomain);
      } catch (e: any) {
         console.error("Failed to create tenant DB", e);
         return NextResponse.json({ error: "Failed to create Google Sheet: " + e.message }, { status: 500 });
      }
    } else {
      // If manually provided, check if it's already in use
      const existingSheetUser = await master.getCompanyBySheetId(finalSheetId);
      if (existingSheetUser) {
        return NextResponse.json({ error: "This Sheet ID is already in use by another company." }, { status: 400 });
      }
    }

    // Validate and Initialize Schema (Create Tabs)
    try {
      await master.validateTenantSheet(finalSheetId);
    } catch (e: any) {
      console.error("Sheet Validation Failed:", e);
      if (e.message?.includes("403") || e.message?.includes("permission")) {
        return NextResponse.json({ 
          error: "Permission Denied: The system cannot access the provided Google Sheet. Please share the sheet with the Service Account email." 
        }, { status: 400 });
      }
      return NextResponse.json({ error: "Invalid Sheet ID or Schema Initialization Failed: " + e.message }, { status: 400 });
    }

    // 1. Prepare Records
    const companyRecord = {
      CompanyID: companyId,
      CompanyName: companyName,
      Subdomain: subdomain,
      SheetID: finalSheetId,
      // Use official email as the main admin contact since we don't have a separate admin email anymore
      AdminEmail: officialEmail || "", 
      Plan: plan || "Pro",
      Status: "Active" as const, // Cast to literal type if needed
      TaxID: taxId || "",
      Phone: phone || "",
      Address: address || "",
      City: city || "",
      Country: country || "",
      Currency: currency || "AED",
      CreatedAt: new Date().toISOString(),
    };

    const hashedPassword = await hash(adminPassword, 10);
    const userRecord = {
      UserID: userId,
      CompanyID: companyId,
      Email: officialEmail || "", // Use official email for user record too, or leave blank
      Username: username,
      FullName: adminName,
      Role: "admin" as const,
      PasswordHash: hashedPassword,
      Mobile: phone || "",
      CreatedAt: new Date().toISOString(),
    };

    // 2. Save to Master Registry
    await master.createCompany(companyRecord);
    await master.createTenantUser(userRecord);

    // 3. Sync Initial Data to Tenant Sheet
    // This ensures the tenant sheet is self-contained
    try {
        console.log("Syncing data to Tenant Sheet:", finalSheetId);
        
        // Sync Company Profile (ID, Subdomain, SheetID, Username)
        await master.addCompanyProfileToTenantSheet(finalSheetId, companyRecord, username);
        
        // User requested NOT to sync company settings to the Settings tab
        // await master.addCompanyToTenantSettings(finalSheetId, companyRecord);
        
        await master.addUserToTenantSheet(finalSheetId, userRecord);
    } catch (syncError) {
        // Log but don't fail the entire request, as the tenant is technically registered
        console.error("Warning: Failed to sync initial data to Tenant Sheet:", syncError);
    }

    return NextResponse.json({ 
      ok: true, 
      companyId, 
      sheetId: finalSheetId,
      message: "Tenant registered successfully" 
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

# InvoiceCraft Super Admin — Multi-Tenant SaaS (Google Sheets DB)

This project is a **production-style starter** for the requested architecture:

- Next.js 14+ App Router + TypeScript
- Subdomain multi-tenancy via `middleware.ts`
- Google Sheets as the **only** database (Master Registry + per-tenant sheet)
- Stateless encrypted cookies (JWE) for auth
- Tenant data isolation by `sheetId` locked in session
- Client-side PDF generation (html2pdf.js)

## 1) Domains & Routing

- **Super Admin**: `app.<ROOT_DOMAIN>` → rewrites to `/admin/*`
- **Tenant**: `<tenant>.<ROOT_DOMAIN>` → rewrites to `/tenant/[slug]/*`

`middleware.ts` reads the Host header, resolves the tenant in the Master Registry Sheet, enforces status, then rewrites.

> Important: `/api/*` routes are not rewritten. Middleware attaches tenant context headers and still blocks non-Active tenants.

## 2) Google Sheets Database

### Master Registry Sheet (control plane)
Tabs:
- `Companies` columns: `CompanyID, CompanyName, Subdomain, SheetID, AdminEmail, Plan, Status, CreatedAt`
- `AdminUsers` columns: `Email, PasswordHash`

### Tenant Sheet (per company)
Tabs:
- `Users`: `Username, Password (bcrypt hash), Role (admin|user)`
- `Invoices`: `InvoiceNumber, Date, Client, Total, Status (Paid|Unpaid), PayloadJSON`
- `Settings`: key/value table: `Key, Value` (BrandColor, LogoUrl, BankDetails, ...)

## 3) Auth Model

Stateless encrypted cookie (JWE via `jose`) stores:
- `tenant`
- `sheetId`
- `role`
- `status`

Tenant requests are **always** checked for:
- active tenant status in middleware (instant suspend)
- session tenant match (server route handlers)

## 4) Super Admin flows

- Login: `/admin/login` → `/api/auth/superadmin/login`
- Dashboard: `/admin/dashboard` (metrics from master sheet)
- Companies list: `/admin/companies` (status management)
- Provision wizard: `/admin/register` → `/api/admin/companies/provision`
  - creates a new tenant spreadsheet
  - seeds tabs/headers
  - seeds tenant admin user
  - inserts company row into master registry with `Pending`

## 5) Tenant flows

- Login: `/tenant/[slug]/login` → `/api/auth/tenant/login`
- Dashboard: simple paid/unpaid totals
- Invoices: create/update invoices, preview, export PDF including logo + bank details
- Settings: view settings pulled from tenant sheet

## 6) Environment Variables

Create `.env.local`:

```bash
ROOT_DOMAIN=invoicecraft.com
MASTER_SHEET_ID=YOUR_MASTER_SHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
COOKIE_SECRET=use_a_long_random_32+_chars_secret_here
```

## 7) Run

```bash
npm install
npm run dev
```

Local routing examples:
- `app.localhost:3000` (Super Admin)
- `abccargo.localhost:3000` (Tenant)

> Use a hosts file entry or a local DNS tool (e.g. `dnsmasq`) to point `*.localhost` to `127.0.0.1`.

---

## Security Notes (why this meets the brief)

- **Strict isolation**: server-side data access is always by `sheetId` from session. No shared DB.
- **Cross-tenant access blocked**: `requireTenant()` enforces session tenant match.
- **Immediate suspend**: middleware checks master sheet status on every request and blocks at the edge.
- **Passwords hashed**: bcryptjs.
- **No SQL / ORM**: only Google Sheets API.

export default function TenantNotFound({
  searchParams,
}: {
  searchParams: { tenant?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border p-6">
        <h1 className="text-xl font-semibold">Tenant not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not resolve the tenant subdomain <b>{searchParams.tenant}</b>.
        </p>
      </div>
    </main>
  );
}

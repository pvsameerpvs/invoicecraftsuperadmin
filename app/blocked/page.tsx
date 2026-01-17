export default function BlockedPage({
  searchParams,
}: {
  searchParams: { status?: string; tenant?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border p-6">
        <h1 className="text-xl font-semibold">Access blocked</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tenant <b>{searchParams.tenant}</b> is currently <b>{searchParams.status}</b>.
        </p>
        <p className="mt-4 text-sm">
          If you believe this is a mistake, contact your company administrator or platform support.
        </p>
      </div>
    </main>
  );
}

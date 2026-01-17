export default function CompanyInvoicesPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold tracking-tight mb-4">Company Invoices</h2>
      <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
        <p>No invoices found for this company.</p>
      </div>
    </div>
  );
}

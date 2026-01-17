import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Building2, 
  UserPlus, 
  LogOut, 
  Settings 
} from "lucide-react";

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") redirect("/admin/login");

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Header - Fixed Top, Full Width */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-slate-900 text-white z-[60] flex items-center justify-between px-6 shadow-md">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
             <div className="relative w-40 h-12 bg-white/95 rounded-lg flex items-center justify-center shadow-lg overflow-hidden p-2 transition-transform hover:scale-[1.02]">
                <Image 
                    src="/logo.png" 
                    alt="JustSearch" 
                    width={140}
                    height={48}
                    className="object-contain h-full w-auto" 
                />
             </div>
             <span className="text-lg font-semibold tracking-tight text-white/90 border-l border-white/20 pl-4 h-8 flex items-center">
                Super Admin
             </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-2">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-medium text-white">{session.sub}</p>
                 <p className="text-xs text-white/50">Administrator</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-xs font-bold border-2 border-white/10">
                 SA
               </div>
            </div>
        </div>
      </header>

      {/* Main Layout Wrapper */}
      <div className="flex pt-20 h-screen overflow-hidden">
        {/* Sidebar - Fixed Left, Below Header */}
        <aside className="w-64 bg-slate-900 border-t border-white/10 flex-shrink-0 flex flex-col z-50">
           <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
             <p className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider px-2">Overview</p>
             
             <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors text-white/80 hover:text-white">
               <LayoutDashboard className="w-4 h-4" />
               Dashboard
             </Link>
             
             <Link href="/admin/companies" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors text-white/80 hover:text-white">
               <Building2 className="w-4 h-4" />
               Companies
             </Link>

             <p className="text-xs font-semibold text-white/40 mt-6 mb-2 uppercase tracking-wider px-2">Management</p>

             <Link href="/admin/register" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors text-white/80 hover:text-white">
               <UserPlus className="w-4 h-4" />
               Register Tenant
             </Link>

             <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-not-allowed opacity-50">
               <Settings className="w-4 h-4" />
               Settings
             </Link>
           </nav>
           
           <div className="p-4 border-t border-white/10">
              <form action="/api/auth/logout" method="post">
                <Button variant="destructive" className="w-full justify-start pl-3 text-white bg-red-600/20 hover:bg-red-600/40 border border-red-600/20" size="sm" type="submit">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
              </form>
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto bg-muted/20 p-8">
           {children}
        </main>
      </div>
    </div>
  );
}

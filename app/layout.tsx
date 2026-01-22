import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'InvoiceCraft Super Admin',
  description: 'Multi-tenant invoice SaaS'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          duration={4000}
          toastOptions={{
            style: {
              padding: '16px',
            },
          }}
        />
      </body>
    </html>
  )
}

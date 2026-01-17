import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth/session'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  await clearSession()
  // Redirect to /admin/login
  return NextResponse.redirect(new URL("/admin/login", req.url))
}

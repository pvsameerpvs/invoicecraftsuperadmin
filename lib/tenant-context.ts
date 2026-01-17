import { headers } from 'next/headers'

export function getTenantContextFromHeaders() {
  const h = headers()
  const tenant = h.get('x-tenant')
  const sheetId = h.get('x-tenant-sheet-id')
  const status = h.get('x-tenant-status')
  const companyId = h.get('x-company-id')
  return { tenant, sheetId, status, companyId }
}

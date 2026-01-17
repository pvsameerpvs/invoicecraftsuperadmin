import { redirect } from 'next/navigation'

export default function TenantIndex({ params }: { params: { slug: string } }) {
  redirect(`/tenant/${params.slug}/dashboard`)
}

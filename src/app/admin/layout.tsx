import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalIntranetLayout>
      {children}
    </PortalIntranetLayout>
  )
}

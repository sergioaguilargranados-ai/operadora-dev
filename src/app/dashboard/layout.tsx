import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalIntranetLayout>
      {children}
    </PortalIntranetLayout>
  )
}

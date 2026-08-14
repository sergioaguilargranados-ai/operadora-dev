import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'

export default function CRMLayout({ children }: { children: React.ReactNode }) {
    return (
        <PortalIntranetLayout>
            {children}
        </PortalIntranetLayout>
    )
}

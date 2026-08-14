import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'

export default function RRHHLayout({ children }: { children: React.ReactNode }) {
    return (
        <PortalIntranetLayout>
            <div className="p-6 md:p-8 space-y-6">
                {children}
            </div>
        </PortalIntranetLayout>
    )
}

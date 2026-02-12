import { CRMSidebar } from '@/components/CRMSidebar'

export default function CRMLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <CRMSidebar />
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    )
}

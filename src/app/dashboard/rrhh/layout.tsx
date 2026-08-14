import { HRSidebar } from '@/components/HRSidebar'

export default function RRHHLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <HRSidebar />
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    )
}

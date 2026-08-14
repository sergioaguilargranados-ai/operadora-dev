import { AgencySidebar } from '@/components/AgencySidebar'

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <AgencySidebar />
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    )
}

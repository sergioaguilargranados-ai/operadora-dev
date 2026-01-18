'use client'

import Link from 'next/link'
import { Logo } from './Logo'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
  children?: React.ReactNode
}

export function PageHeader({
  showBackButton = true,
  backButtonText = 'Volver',
  backButtonHref,
  children
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backButtonHref) {
      router.push(backButtonHref)
    } else {
      router.back()
    }
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {backButtonText}
              </Button>
            )}
            <Link href="/">
              <Logo className="py-2" />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </header>
  )
}

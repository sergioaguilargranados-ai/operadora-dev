'use client';

import { useWhiteLabel } from '@/contexts/WhiteLabelContext';
import Image from 'next/image';

interface LogoProps {
  className?: string
  forceDefault?: boolean  // Forzar logo AS Operadora (ej: en footer "Powered by")
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = "", forceDefault = false, size = 'md' }: LogoProps) {
  const { logoUrl, companyName, isWhiteLabel, isLoading } = useWhiteLabel()

  // Tamaños según prop
  const sizeClasses = {
    sm: { logo: 'h-8 w-auto', text: 'text-2xl', sub: 'text-[7px]' },
    md: { logo: 'h-12 w-auto', text: 'text-4xl md:text-5xl', sub: 'text-[9px] md:text-[11px]' },
    lg: { logo: 'h-16 w-auto', text: 'text-5xl md:text-6xl', sub: 'text-[11px] md:text-[13px]' },
  }
  const s = sizeClasses[size]

  // Si tenemos logo URL de white-label Y no es forzado default
  if (!forceDefault && isWhiteLabel && logoUrl && !isLoading) {
    return (
      <div className={`flex items-center gap-3 notranslate ${className}`} translate="no">
        <Image
          src={logoUrl}
          alt={companyName}
          width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          className={`${s.logo} object-contain`}
          unoptimized // Para URLs externas
        />
        <div className="flex flex-col">
          <span
            className="font-bold tracking-tight leading-none notranslate"
            translate="no"
            style={{
              fontFamily: 'Georgia, serif',
              color: 'var(--brand-primary, #0066FF)',
              fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : '22px'
            }}
          >
            {companyName}
          </span>
        </div>
      </div>
    )
  }

  // Si es white-label pero SIN logo URL, mostrar nombre con colores del tenant
  if (!forceDefault && isWhiteLabel && !isLoading) {
    return (
      <div className={`flex flex-col notranslate ${className}`} translate="no">
        <div className="flex items-baseline gap-1">
          <span
            className={`${s.text} font-bold tracking-tighter leading-none notranslate`}
            translate="no"
            style={{
              fontFamily: 'Georgia, serif',
              color: 'var(--brand-primary, #0066FF)'
            }}
          >
            {companyName.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div
          className={`${s.sub} tracking-[0.15em] font-medium leading-tight mt-0.5 uppercase notranslate`}
          translate="no"
          style={{
            fontFamily: 'Georgia, serif',
            color: 'var(--brand-primary, #0066FF)'
          }}
        >
          {companyName}
        </div>
      </div>
    )
  }

  // Default: Logo AS Operadora (diseño según mockup)
  return (
    <div className={`flex items-center gap-3 notranslate ${className}`} translate="no">
      <span className="text-5xl md:text-6xl font-normal tracking-tighter leading-none text-black notranslate" translate="no" style={{ fontFamily: 'Georgia, serif' }}>
        A<span className="text-5xl md:text-6xl">S</span>
      </span>
      
      <div className="h-10 w-[2px] bg-gray-300"></div>
      
      <div className="flex flex-col justify-center notranslate" translate="no">
        <span className="text-[10px] md:text-[11px] tracking-[0.2em] font-bold leading-tight text-black notranslate" translate="no">
          OPERADORA DE
        </span>
        <span className="text-[10px] md:text-[11px] tracking-[0.2em] font-bold leading-tight text-black notranslate" translate="no">
          VIAJES Y EVENTOS
        </span>
      </div>
    </div>
  )
}

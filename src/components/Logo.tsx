export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl md:text-5xl font-bold tracking-tighter leading-none" style={{ fontFamily: 'Georgia, serif' }}>
          A<span className="text-4xl md:text-5xl">S</span>
        </span>
      </div>
      <div className="text-[9px] md:text-[11px] tracking-[0.15em] font-medium leading-tight mt-0.5 uppercase" style={{ fontFamily: 'Georgia, serif' }}>
        AS OPERADORA DE VIAJES Y EVENTOS
      </div>
      <div className="text-[9px] md:text-[11px] text-gray-600 leading-tight -mt-0.5" style={{ fontFamily: 'Georgia, serif' }}>
        Experiencias que inspiran
      </div>
    </div>
  )
}

"use client"

/**
 * MobileLogo - Componente unificado del logo para la app móvil.
 *
 * - Si hay un logoUrl personalizado (agencia white-label), muestra la imagen.
 * - Si no hay logo personalizado, renderiza el logo de texto AS Operadora
 *   usando fuentes del sistema (sin depender de Google Fonts en SVG).
 *
 * Uso:
 *   <MobileLogo variant="dark" />   → texto negro (fondos claros)
 *   <MobileLogo variant="light" />  → texto blanco (fondos oscuros)
 *   <MobileLogo size="lg" />        → tamaño grande (login)
 *   <MobileLogo logoUrl={url} />    → imagen personalizada de agencia
 */

interface MobileLogoProps {
  /** "dark" = texto negro (para fondos claros). "light" = texto blanco (para fondos oscuros). */
  variant?: "dark" | "light"
  /** Tamaño del logo de texto. "sm"=pequeño, "md"=mediano (default), "lg"=grande (login) */
  size?: "sm" | "md" | "lg"
  /** URL de logo personalizado de agencia. Si se provee, se muestra como imagen. */
  logoUrl?: string | null
  /** Clase CSS adicional para el contenedor */
  className?: string
}

export function MobileLogo({ variant = "dark", size = "md", logoUrl, className = "" }: MobileLogoProps) {
  const textColor = variant === "light" ? "#FFFFFF" : "#000000"

  // Si hay logo personalizado (agencia white-label), mostrar imagen
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Logo"
        className={`object-contain ${
          size === "lg" ? "h-20 max-w-[220px]" :
          size === "sm" ? "h-8 max-w-[120px]" :
          "h-14 max-w-[200px]"
        } ${variant === "light" ? "brightness-0 invert" : ""} ${className}`}
        onError={(e) => {
          // Si falla la imagen, ocultar y mostrar texto fallback
          e.currentTarget.style.display = "none"
        }}
      />
    )
  }

  // Logo de texto AS Operadora (sin depender de SVG + Google Fonts)
  const mainSize =
    size === "lg" ? "68px" :
    size === "sm" ? "40px" :
    "52px"

  const subSize =
    size === "lg" ? "10px" :
    size === "sm" ? "7px" :
    "8.5px"

  const letterSpacing =
    size === "lg" ? "4px" :
    size === "sm" ? "2.5px" :
    "3px"

  return (
    <div
      className={`flex flex-col items-center leading-none select-none notranslate ${className}`}
      style={{ color: textColor }}
    >
      <span
        style={{
          fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
          fontSize: mainSize,
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: "-1px",
          color: textColor,
        }}
      >
        AS
      </span>
      <span
        style={{
          fontFamily: "'Montserrat', 'Arial', sans-serif",
          fontSize: subSize,
          fontWeight: 700,
          letterSpacing: letterSpacing,
          color: textColor,
          marginTop: "2px",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        OPERADORA DE<br />VIAJES Y EVENTOS
      </span>
    </div>
  )
}

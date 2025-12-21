import { Badge } from '@/components/ui/badge'

interface PolicyBadgeProps {
  withinPolicy: boolean
  requiresApproval?: boolean
  violations?: string[]
  warnings?: string[]
  showDetails?: boolean
}

export function PolicyBadge({
  withinPolicy,
  requiresApproval = false,
  violations = [],
  warnings = [],
  showDetails = false
}: PolicyBadgeProps) {

  if (withinPolicy && !requiresApproval && warnings.length === 0) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        ✓ Dentro de Política
      </Badge>
    )
  }

  if (requiresApproval && violations.length > 0) {
    return (
      <div className="space-y-1">
        <Badge variant="destructive">
          ⚠️ Requiere Aprobación
        </Badge>
        {showDetails && (
          <div className="text-xs text-red-600 mt-1">
            {violations.map((v, idx) => (
              <div key={idx}>• {v}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (warnings.length > 0) {
    return (
      <div className="space-y-1">
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          ⚡ Advertencia
        </Badge>
        {showDetails && (
          <div className="text-xs text-yellow-600 mt-1">
            {warnings.map((w, idx) => (
              <div key={idx}>• {w}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}

interface PolicyAlertProps {
  violations: string[]
  warnings: string[]
}

export function PolicyAlert({ violations, warnings }: PolicyAlertProps) {
  if (violations.length === 0 && warnings.length === 0) {
    return null
  }

  return (
    <div className="mt-3 space-y-2">
      {violations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-red-600 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">
                Excede Política Corporativa
              </p>
              <ul className="text-xs text-red-700 space-y-1">
                {violations.map((violation, idx) => (
                  <li key={idx}>• {violation}</li>
                ))}
              </ul>
              <p className="text-xs text-red-600 mt-2 italic">
                Esta reserva requerirá aprobación de un manager
              </p>
            </div>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg">💡</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900 mb-1">
                Advertencias
              </p>
              <ul className="text-xs text-yellow-700 space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

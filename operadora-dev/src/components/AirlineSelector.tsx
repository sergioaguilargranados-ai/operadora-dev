"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plane, Check } from 'lucide-react'

// Aerolíneas disponibles organizadas por región
const AIRLINES = {
  mexican: [
    { code: 'AM', name: 'Aeroméxico', logo: '🇲🇽' },
    { code: 'Y4', name: 'Volaris', logo: '🇲🇽' },
    { code: 'VB', name: 'VivaAerobus', logo: '🇲🇽' },
    { code: 'VW', name: 'Aeromar', logo: '🇲🇽' },
  ],
  us: [
    { code: 'UA', name: 'United Airlines', logo: '🇺🇸' },
    { code: 'AA', name: 'American Airlines', logo: '🇺🇸' },
    { code: 'DL', name: 'Delta Air Lines', logo: '🇺🇸' },
    { code: 'B6', name: 'JetBlue', logo: '🇺🇸' },
  ],
  european: [
    { code: 'IB', name: 'Iberia', logo: '🇪🇸' },
    { code: 'LH', name: 'Lufthansa', logo: '🇩🇪' },
    { code: 'AF', name: 'Air France', logo: '🇫🇷' },
    { code: 'KL', name: 'KLM', logo: '🇳🇱' },
    { code: 'BA', name: 'British Airways', logo: '🇬🇧' },
  ],
  latam: [
    { code: 'LA', name: 'LATAM', logo: '🇨🇱' },
    { code: 'AV', name: 'Avianca', logo: '🇨🇴' },
    { code: 'CM', name: 'Copa Airlines', logo: '🇵🇦' },
    { code: 'AR', name: 'Aerolíneas Argentinas', logo: '🇦🇷' },
  ],
}

interface AirlineSelectorProps {
  value?: string[]
  onChange?: (airlines: string[]) => void
  mode?: 'include' | 'exclude'
}

export function AirlineSelector({ value = [], onChange, mode = 'include' }: AirlineSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'include' | 'exclude'>(mode)

  const toggleAirline = (code: string) => {
    const newValue = value.includes(code)
      ? value.filter(c => c !== code)
      : [...value, code]

    onChange?.(newValue)
  }

  const clearAll = () => {
    onChange?.([])
  }

  const selectRegion = (region: keyof typeof AIRLINES) => {
    const regionCodes = AIRLINES[region].map(a => a.code)
    const allSelected = regionCodes.every(code => value.includes(code))

    if (allSelected) {
      // Deselect all from this region
      onChange?.(value.filter(code => !regionCodes.includes(code)))
    } else {
      // Select all from this region
      const newValue = [...new Set([...value, ...regionCodes])]
      onChange?.(newValue)
    }
  }

  const getSelectedNames = () => {
    if (value.length === 0) {
      return selectedMode === 'include'
        ? 'Todas las aerolíneas'
        : 'Ninguna excluida'
    }

    const allAirlines = [
      ...AIRLINES.mexican,
      ...AIRLINES.us,
      ...AIRLINES.european,
      ...AIRLINES.latam,
    ]

    const names = value
      .map(code => allAirlines.find(a => a.code === code)?.name)
      .filter(Boolean)
      .slice(0, 2)

    if (value.length > 2) {
      return `${names.join(', ')} +${value.length - 2}`
    }

    return names.join(', ')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-12 font-normal"
        >
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-muted-foreground" />
            <div className="text-left">
              <div className="text-xs text-muted-foreground">
                {selectedMode === 'include' ? 'Solo volar en' : 'Excluir'}
              </div>
              <div className="text-sm font-medium truncate max-w-[200px]">
                {getSelectedNames()}
              </div>
            </div>
          </div>
          <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            {value.length}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Preferencias de aerolíneas</h4>
            {value.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 text-xs"
              >
                Limpiar
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={selectedMode === 'include' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('include')}
              className="flex-1 text-xs"
            >
              Solo estas
            </Button>
            <Button
              variant={selectedMode === 'exclude' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('exclude')}
              className="flex-1 text-xs"
            >
              Excluir estas
            </Button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {/* Aerolíneas Mexicanas */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold text-muted-foreground">
                AEROLÍNEAS MEXICANAS
              </h5>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectRegion('mexican')}
                className="h-6 text-xs"
              >
                {AIRLINES.mexican.every(a => value.includes(a.code)) ? 'Deseleccionar' : 'Todas'}
              </Button>
            </div>
            <div className="space-y-1">
              {AIRLINES.mexican.map(airline => (
                <button
                  key={airline.code}
                  onClick={() => toggleAirline(airline.code)}
                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{airline.logo}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{airline.name}</div>
                      <div className="text-xs text-muted-foreground">{airline.code}</div>
                    </div>
                  </div>
                  {value.includes(airline.code) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Aerolíneas Estadounidenses */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold text-muted-foreground">
                AEROLÍNEAS ESTADOUNIDENSES
              </h5>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectRegion('us')}
                className="h-6 text-xs"
              >
                {AIRLINES.us.every(a => value.includes(a.code)) ? 'Deseleccionar' : 'Todas'}
              </Button>
            </div>
            <div className="space-y-1">
              {AIRLINES.us.map(airline => (
                <button
                  key={airline.code}
                  onClick={() => toggleAirline(airline.code)}
                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{airline.logo}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{airline.name}</div>
                      <div className="text-xs text-muted-foreground">{airline.code}</div>
                    </div>
                  </div>
                  {value.includes(airline.code) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Aerolíneas Europeas */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold text-muted-foreground">
                AEROLÍNEAS EUROPEAS
              </h5>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectRegion('european')}
                className="h-6 text-xs"
              >
                {AIRLINES.european.every(a => value.includes(a.code)) ? 'Deseleccionar' : 'Todas'}
              </Button>
            </div>
            <div className="space-y-1">
              {AIRLINES.european.map(airline => (
                <button
                  key={airline.code}
                  onClick={() => toggleAirline(airline.code)}
                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{airline.logo}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{airline.name}</div>
                      <div className="text-xs text-muted-foreground">{airline.code}</div>
                    </div>
                  </div>
                  {value.includes(airline.code) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Aerolíneas Latinoamericanas */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold text-muted-foreground">
                AEROLÍNEAS LATINOAMERICANAS
              </h5>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectRegion('latam')}
                className="h-6 text-xs"
              >
                {AIRLINES.latam.every(a => value.includes(a.code)) ? 'Deseleccionar' : 'Todas'}
              </Button>
            </div>
            <div className="space-y-1">
              {AIRLINES.latam.map(airline => (
                <button
                  key={airline.code}
                  onClick={() => toggleAirline(airline.code)}
                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{airline.logo}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{airline.name}</div>
                      <div className="text-xs text-muted-foreground">{airline.code}</div>
                    </div>
                  </div>
                  {value.includes(airline.code) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t bg-gray-50">
          <p className="text-xs text-muted-foreground text-center">
            {value.length === 0
              ? 'Buscaremos en todas las aerolíneas disponibles'
              : selectedMode === 'include'
              ? `Buscaremos solo en ${value.length} aerolínea${value.length > 1 ? 's' : ''} seleccionada${value.length > 1 ? 's' : ''}`
              : `Excluiremos ${value.length} aerolínea${value.length > 1 ? 's' : ''}`
            }
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Star,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Wifi,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  ParkingCircle,
  Wind,
  Dog,
  Sparkles,
  Sun,
  Coffee,
  Tv,
  Bath,
  Snowflake,
  MapPin,
  Building2,
  Home,
  Hotel,
  Castle,
  Palmtree,
  CreditCard,
  Calendar,
  ShieldCheck,
  Eye,
  Accessibility,
} from 'lucide-react'

export interface HotelFiltersState {
  // Búsqueda
  searchName: string

  // Precio
  priceRange: number[]
  maxPrice: number

  // Filtros rápidos
  breakfastIncluded: boolean
  freeCancellation: boolean
  payLater: boolean
  payAtProperty: boolean
  beachfront: boolean
  allInclusive: boolean

  // Puntuación
  minRating: number

  // Estrellas
  selectedStars: number[]

  // Tipo de propiedad
  propertyTypes: string[]

  // Amenities/Servicios
  amenities: string[]

  // Forma de pago
  paymentOptions: string[]

  // Zona/Barrio
  zones: string[]

  // Cadenas hoteleras
  hotelChains: string[]

  // Accesibilidad
  accessibility: string[]

  // Vistas
  views: string[]

  // Distancia máxima del centro (km)
  maxDistance: number

  // Ordenamiento
  sortBy: string
}

interface HotelFiltersProps {
  filters: HotelFiltersState
  onFiltersChange: (filters: HotelFiltersState) => void
  totalResults: number
  filteredCount: number
  destination?: string
}

// Datos de filtros
const PROPERTY_TYPES = [
  { id: 'hotel', label: 'Hotel', icon: Hotel, count: 245 },
  { id: 'resort', label: 'Resort', icon: Palmtree, count: 89 },
  { id: 'apartment', label: 'Apartamento', icon: Building2, count: 156 },
  { id: 'villa', label: 'Villa', icon: Castle, count: 67 },
  { id: 'hostel', label: 'Hostal', icon: Home, count: 34 },
  { id: 'bnb', label: 'Bed & Breakfast', icon: Coffee, count: 45 },
  { id: 'apart-hotel', label: 'Apart-hotel', icon: Building2, count: 28 },
  { id: 'vacation-home', label: 'Casa vacacional', icon: Home, count: 112 },
]

const AMENITIES = [
  { id: 'wifi', label: 'WiFi gratis', icon: Wifi },
  { id: 'pool', label: 'Piscina', icon: Waves },
  { id: 'gym', label: 'Gimnasio', icon: Dumbbell },
  { id: 'spa', label: 'Spa', icon: Sparkles },
  { id: 'parking', label: 'Estacionamiento', icon: ParkingCircle },
  { id: 'ac', label: 'Aire acondicionado', icon: Snowflake },
  { id: 'restaurant', label: 'Restaurante', icon: UtensilsCrossed },
  { id: 'beach', label: 'Acceso a playa', icon: Sun },
  { id: 'pet-friendly', label: 'Pet friendly', icon: Dog },
  { id: 'bar', label: 'Bar', icon: Coffee },
  { id: 'room-service', label: 'Servicio a la habitación', icon: UtensilsCrossed },
  { id: 'tv', label: 'TV por cable', icon: Tv },
  { id: 'jacuzzi', label: 'Jacuzzi', icon: Bath },
  { id: 'kitchen', label: 'Cocina', icon: UtensilsCrossed },
]

const HOTEL_CHAINS = [
  { id: 'hilton', label: 'Hilton', count: 12 },
  { id: 'marriott', label: 'Marriott', count: 18 },
  { id: 'ihg', label: 'IHG (Holiday Inn)', count: 8 },
  { id: 'hyatt', label: 'Hyatt', count: 6 },
  { id: 'wyndham', label: 'Wyndham', count: 5 },
  { id: 'accor', label: 'Accor', count: 9 },
  { id: 'bestwestern', label: 'Best Western', count: 7 },
  { id: 'radisson', label: 'Radisson', count: 4 },
  { id: 'fiesta-americana', label: 'Fiesta Americana', count: 11 },
  { id: 'posadas', label: 'Grupo Posadas', count: 15 },
]

const POPULAR_ZONES = [
  { id: 'hotel-zone', label: 'Zona Hotelera', count: 89 },
  { id: 'downtown', label: 'Centro/Downtown', count: 67 },
  { id: 'beach', label: 'Frente a la playa', count: 45 },
  { id: 'airport', label: 'Cerca del aeropuerto', count: 23 },
]

const DISTANCE_OPTIONS = [
  { id: 'any', label: 'Cualquier distancia', km: 0 },
  { id: '1km', label: 'Menos de 1 km', km: 1 },
  { id: '3km', label: 'Menos de 3 km', km: 3 },
  { id: '5km', label: 'Menos de 5 km', km: 5 },
  { id: '10km', label: 'Menos de 10 km', km: 10 },
]

const ACCESSIBILITY_OPTIONS = [
  { id: 'wheelchair', label: 'Acceso para silla de ruedas' },
  { id: 'elevator', label: 'Ascensor' },
  { id: 'accessible-bathroom', label: 'Baño accesible' },
  { id: 'accessible-parking', label: 'Estacionamiento accesible' },
]

const VIEW_OPTIONS = [
  { id: 'sea-view', label: 'Vista al mar' },
  { id: 'pool-view', label: 'Vista a la piscina' },
  { id: 'city-view', label: 'Vista a la ciudad' },
  { id: 'garden-view', label: 'Vista al jardín' },
  { id: 'mountain-view', label: 'Vista a la montaña' },
]

const RATING_OPTIONS = [
  { value: 9, label: 'Excelente 9+', color: 'bg-green-600' },
  { value: 8, label: 'Muy bueno 8+', color: 'bg-green-500' },
  { value: 7, label: 'Bueno 7+', color: 'bg-yellow-500' },
  { value: 6, label: 'Aceptable 6+', color: 'bg-yellow-400' },
  { value: 0, label: 'Cualquiera', color: 'bg-gray-400' },
]

export function HotelFilters({
  filters,
  onFiltersChange,
  totalResults,
  filteredCount,
  destination
}: HotelFiltersProps) {
  // Estados para secciones colapsables
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    quickFilters: true,
    price: true,
    distance: true,
    rating: true,
    stars: true,
    propertyType: false,
    amenities: false,
    chains: false,
    zones: false,
    payment: false,
    accessibility: false,
    views: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateFilter = <K extends keyof HotelFiltersState>(
    key: K,
    value: HotelFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (
    key: 'propertyTypes' | 'amenities' | 'hotelChains' | 'zones' | 'selectedStars' | 'accessibility' | 'views' | 'paymentOptions',
    value: string | number
  ) => {
    const currentArray = filters[key] as (string | number)[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value]
    updateFilter(key, newArray as any)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      searchName: '',
      priceRange: [0, filters.maxPrice],
      maxPrice: filters.maxPrice,
      breakfastIncluded: false,
      freeCancellation: false,
      payLater: false,
      payAtProperty: false,
      beachfront: false,
      allInclusive: false,
      minRating: 0,
      selectedStars: [],
      propertyTypes: [],
      amenities: [],
      paymentOptions: [],
      zones: [],
      hotelChains: [],
      accessibility: [],
      views: [],
      maxDistance: 0,
      sortBy: 'recommended',
    })
  }

  const activeFiltersCount = [
    filters.searchName ? 1 : 0,
    filters.breakfastIncluded ? 1 : 0,
    filters.freeCancellation ? 1 : 0,
    filters.payLater ? 1 : 0,
    filters.payAtProperty ? 1 : 0,
    filters.beachfront ? 1 : 0,
    filters.allInclusive ? 1 : 0,
    filters.minRating > 0 ? 1 : 0,
    filters.selectedStars.length,
    filters.propertyTypes.length,
    filters.amenities.length,
    filters.hotelChains.length,
    filters.zones.length,
    filters.accessibility.length,
    filters.views.length,
    (filters.priceRange[0] > 0 || filters.priceRange[1] < filters.maxPrice) ? 1 : 0,
    filters.maxDistance > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <Card className="p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div>
          <h2 className="font-bold text-lg">Filtrar por</h2>
          <p className="text-xs text-muted-foreground">
            {filteredCount} de {totalResults} propiedades
          </p>
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Limpiar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Búsqueda por nombre */}
      <div className="mb-4">
        <Label className="text-sm font-medium mb-2 block">
          Busca por nombre de la propiedad
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ej. Marriott, Hilton..."
            value={filters.searchName}
            onChange={(e) => updateFilter('searchName', e.target.value)}
            className="pl-9 h-10"
          />
          {filters.searchName && (
            <button
              onClick={() => updateFilter('searchName', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros rápidos */}
      <Collapsible open={openSections.quickFilters} onOpenChange={() => toggleSection('quickFilters')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Filtros populares</span>
          {openSections.quickFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <Checkbox
              checked={filters.breakfastIncluded}
              onCheckedChange={(checked) => updateFilter('breakfastIncluded', !!checked)}
            />
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Desayuno incluido</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <Checkbox
              checked={filters.freeCancellation}
              onCheckedChange={(checked) => updateFilter('freeCancellation', !!checked)}
            />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-sm">Cancelación gratuita</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <Checkbox
              checked={filters.payLater}
              onCheckedChange={(checked) => updateFilter('payLater', !!checked)}
            />
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Reserva ahora, paga después</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <Checkbox
              checked={filters.payAtProperty}
              onCheckedChange={(checked) => updateFilter('payAtProperty', !!checked)}
            />
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-500" />
              <span className="text-sm">Pago en el hotel</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <Checkbox
              checked={filters.beachfront}
              onCheckedChange={(checked) => updateFilter('beachfront', !!checked)}
            />
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Playa / Frente al mar</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <Checkbox
              checked={filters.allInclusive}
              onCheckedChange={(checked) => updateFilter('allInclusive', !!checked)}
            />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm">Todo incluido</span>
            </div>
          </label>
        </CollapsibleContent>
      </Collapsible>

      {/* Precio por noche */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Precio por noche</span>
          {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4">
          <div className="px-1">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value)}
              max={filters.maxPrice}
              min={0}
              step={100}
              className="mb-3"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">MXN</span>
                <Input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                  className="w-24 h-8 text-sm"
                />
              </div>
              <span className="text-muted-foreground">—</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">MXN</span>
                <Input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value) || filters.maxPrice])}
                  className="w-24 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Distancia del centro */}
      <Collapsible open={openSections.distance} onOpenChange={() => toggleSection('distance')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Distancia del centro</span>
          {openSections.distance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4 space-y-2">
          {DISTANCE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                filters.maxDistance === option.km ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="distance"
                checked={filters.maxDistance === option.km}
                onChange={() => updateFilter('maxDistance', option.km)}
                className="accent-blue-600"
              />
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{option.label}</span>
              </div>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Puntuación de huéspedes */}
      <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Puntuación de huéspedes</span>
          {openSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4 space-y-2">
          {RATING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                filters.minRating === option.value ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === option.value}
                onChange={() => updateFilter('minRating', option.value)}
                className="accent-blue-600"
              />
              <div className="flex items-center gap-2">
                <span className={`w-8 h-5 rounded text-white text-xs flex items-center justify-center font-bold ${option.color}`}>
                  {option.value > 0 ? option.value : '—'}
                </span>
                <span className="text-sm">{option.label}</span>
              </div>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Categoría (Estrellas) */}
      <Collapsible open={openSections.stars} onOpenChange={() => toggleSection('stars')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Categoría del alojamiento</span>
          {openSections.stars ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <label
              key={stars}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                filters.selectedStars.includes(stars) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <Checkbox
                checked={filters.selectedStars.includes(stars)}
                onCheckedChange={() => toggleArrayFilter('selectedStars', stars)}
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                {Array.from({ length: 5 - stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gray-300" />
                ))}
              </div>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Tipo de propiedad */}
      <Collapsible open={openSections.propertyType} onOpenChange={() => toggleSection('propertyType')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Tipo de propiedad</span>
          {openSections.propertyType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4 space-y-2">
          {PROPERTY_TYPES.map((type) => (
            <label
              key={type.id}
              className={`flex items-center justify-between cursor-pointer p-2 rounded-lg transition-colors ${
                filters.propertyTypes.includes(type.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={filters.propertyTypes.includes(type.id)}
                  onCheckedChange={() => toggleArrayFilter('propertyTypes', type.id)}
                />
                <type.icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{type.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{type.count}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Servicios / Amenities */}
      <Collapsible open={openSections.amenities} onOpenChange={() => toggleSection('amenities')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Servicios</span>
          {openSections.amenities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES.map((amenity) => (
              <label
                key={amenity.id}
                className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors text-sm ${
                  filters.amenities.includes(amenity.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <Checkbox
                  checked={filters.amenities.includes(amenity.id)}
                  onCheckedChange={() => toggleArrayFilter('amenities', amenity.id)}
                  className="h-4 w-4"
                />
                <amenity.icon className="w-3 h-3 text-gray-500" />
                <span className="text-xs truncate">{amenity.label}</span>
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Zona */}
      <Collapsible open={openSections.zones} onOpenChange={() => toggleSection('zones')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Zona</span>
          {openSections.zones ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4 space-y-2">
          {POPULAR_ZONES.map((zone) => (
            <label
              key={zone.id}
              className={`flex items-center justify-between cursor-pointer p-2 rounded-lg transition-colors ${
                filters.zones.includes(zone.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={filters.zones.includes(zone.id)}
                  onCheckedChange={() => toggleArrayFilter('zones', zone.id)}
                />
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{zone.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{zone.count}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Cadenas hoteleras */}
      <Collapsible open={openSections.chains} onOpenChange={() => toggleSection('chains')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Cadenas hoteleras</span>
          {openSections.chains ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4 space-y-2 max-h-48 overflow-y-auto">
          {HOTEL_CHAINS.map((chain) => (
            <label
              key={chain.id}
              className={`flex items-center justify-between cursor-pointer p-2 rounded-lg transition-colors ${
                filters.hotelChains.includes(chain.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={filters.hotelChains.includes(chain.id)}
                  onCheckedChange={() => toggleArrayFilter('hotelChains', chain.id)}
                />
                <span className="text-sm">{chain.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{chain.count}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Vistas */}
      <Collapsible open={openSections.views} onOpenChange={() => toggleSection('views')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Vistas de la habitación</span>
          {openSections.views ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4 space-y-2">
          {VIEW_OPTIONS.map((view) => (
            <label
              key={view.id}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                filters.views.includes(view.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <Checkbox
                checked={filters.views.includes(view.id)}
                onCheckedChange={() => toggleArrayFilter('views', view.id)}
              />
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{view.label}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Accesibilidad */}
      <Collapsible open={openSections.accessibility} onOpenChange={() => toggleSection('accessibility')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
          <span className="font-semibold text-sm">Accesibilidad</span>
          {openSections.accessibility ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4 space-y-2">
          {ACCESSIBILITY_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                filters.accessibility.includes(option.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <Checkbox
                checked={filters.accessibility.includes(option.id)}
                onCheckedChange={() => toggleArrayFilter('accessibility', option.id)}
              />
              <Accessibility className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Ordenar por - al final */}
      <div className="pt-4 border-t mt-4">
        <Label className="text-sm font-semibold mb-2 block">Ordenar por</Label>
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recomendados</SelectItem>
            <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
            <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
            <SelectItem value="rating">Mejor valorados</SelectItem>
            <SelectItem value="stars_desc">Más estrellas</SelectItem>
            <SelectItem value="distance">Más cercanos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  )
}

export default HotelFilters

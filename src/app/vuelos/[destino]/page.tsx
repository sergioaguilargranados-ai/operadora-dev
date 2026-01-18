"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from '@/components/PageHeader'
import {
  Plane, Calendar, Users, MapPin,
  Clock, ChevronDown, Plus, X, ChevronLeft, ChevronRight,
  ArrowRightLeft, Info, TrendingDown, Star, Briefcase,
  Sun, Sunrise, Sunset, Moon, Filter, Loader2, Check, AlertCircle
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

// Tipos
interface Vuelo {
  id: number
  aerolinea: string
  logo: string
  codigoVuelo: string
  origen: string
  destino: string
  salida: string
  llegada: string
  duracion: string
  escalas: number
  escalasCiudades?: string[]
  precio: number
  precioIda: number
  clase: string
  equipaje: string
  cambios: string
  amenidades: string[]
  tarifa: string
}

interface DatePrice {
  date: Date
  price: number
  isLowest: boolean
  isSelected: boolean
}

// Datos de vuelos mock
const todosVuelos: Vuelo[] = [
  {
    id: 1,
    aerolinea: "Aeroméxico",
    logo: "https://airhex.com/images/airline-logos/alt/aeromexico.png",
    codigoVuelo: "AM 601",
    origen: "MEX",
    destino: "CUN",
    salida: "05:00",
    llegada: "07:35",
    duracion: "2h 35m",
    escalas: 0,
    precio: 5648,
    precioIda: 2824,
    clase: "Economy",
    equipaje: "1 maleta incluida",
    cambios: "Cambios permitidos",
    amenidades: ["Comida", "Wifi", "Entretenimiento"],
    tarifa: "Standard"
  },
  {
    id: 2,
    aerolinea: "Volaris",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Volaris-logo.svg/200px-Volaris-logo.svg.png",
    codigoVuelo: "Y4 421",
    origen: "MEX",
    destino: "CUN",
    salida: "14:05",
    llegada: "16:55",
    duracion: "2h 50m",
    escalas: 0,
    precio: 5690,
    precioIda: 2845,
    clase: "Economy",
    equipaje: "Solo equipaje de mano",
    cambios: "No reembolsable",
    amenidades: ["Wifi"],
    tarifa: "Basic"
  },
  {
    id: 3,
    aerolinea: "VivaAerobus",
    logo: "https://airhex.com/images/airline-logos/alt/viva-aerobus.png",
    codigoVuelo: "VB 1501",
    origen: "MEX",
    destino: "CUN",
    salida: "06:55",
    llegada: "09:40",
    duracion: "2h 45m",
    escalas: 0,
    precio: 5406,
    precioIda: 2703,
    clase: "Economy",
    equipaje: "Solo equipaje de mano",
    cambios: "No reembolsable",
    amenidades: [],
    tarifa: "Light"
  },
  {
    id: 4,
    aerolinea: "Aeroméxico",
    logo: "https://airhex.com/images/airline-logos/alt/aeromexico.png",
    codigoVuelo: "AM 603",
    origen: "MEX",
    destino: "CUN",
    salida: "19:15",
    llegada: "21:55",
    duracion: "2h 40m",
    escalas: 0,
    precio: 4854,
    precioIda: 2427,
    clase: "Economy Plus",
    equipaje: "2 maletas incluidas",
    cambios: "Cambios gratis",
    amenidades: ["Comida", "Wifi", "Asiento extra", "Embarque prioritario"],
    tarifa: "Flexible"
  },
  {
    id: 5,
    aerolinea: "Volaris",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Volaris-logo.svg/200px-Volaris-logo.svg.png",
    codigoVuelo: "Y4 423",
    origen: "MEX",
    destino: "CUN",
    salida: "09:30",
    llegada: "12:20",
    duracion: "2h 50m",
    escalas: 0,
    precio: 5247,
    precioIda: 2623,
    clase: "Economy",
    equipaje: "1 maleta incluida",
    cambios: "Cambios con cargo",
    amenidades: ["Wifi", "Snack"],
    tarifa: "Standard"
  },
  {
    id: 6,
    aerolinea: "Aeroméxico",
    logo: "https://airhex.com/images/airline-logos/alt/aeromexico.png",
    codigoVuelo: "AM 605",
    origen: "MEX",
    destino: "CUN",
    salida: "22:40",
    llegada: "01:20",
    duracion: "2h 40m",
    escalas: 0,
    precio: 2782,
    precioIda: 1391,
    clase: "Economy",
    equipaje: "1 maleta incluida",
    cambios: "Cambios permitidos",
    amenidades: ["Comida", "Wifi", "Entretenimiento"],
    tarifa: "Standard"
  },
  {
    id: 7,
    aerolinea: "VivaAerobus",
    logo: "https://airhex.com/images/airline-logos/alt/viva-aerobus.png",
    codigoVuelo: "VB 1503",
    origen: "MEX",
    destino: "CUN",
    salida: "15:45",
    llegada: "18:30",
    duracion: "2h 45m",
    escalas: 0,
    precio: 6247,
    precioIda: 3123,
    clase: "Economy",
    equipaje: "Solo equipaje de mano",
    cambios: "No reembolsable",
    amenidades: [],
    tarifa: "Light"
  },
  {
    id: 8,
    aerolinea: "Volaris",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Volaris-logo.svg/200px-Volaris-logo.svg.png",
    codigoVuelo: "Y4 427",
    origen: "MEX",
    destino: "CUN",
    salida: "11:10",
    llegada: "14:00",
    duracion: "2h 50m",
    escalas: 0,
    precio: 6347,
    precioIda: 3173,
    clase: "Economy",
    equipaje: "Solo equipaje de mano",
    cambios: "No reembolsable",
    amenidades: ["Wifi"],
    tarifa: "Basic"
  },
  {
    id: 9,
    aerolinea: "Aeroméxico",
    logo: "https://airhex.com/images/airline-logos/alt/aeromexico.png",
    codigoVuelo: "AM 607",
    origen: "MEX",
    destino: "CUN",
    salida: "16:30",
    llegada: "19:15",
    duracion: "2h 45m",
    escalas: 0,
    precio: 5947,
    precioIda: 2973,
    clase: "Economy",
    equipaje: "1 maleta incluida",
    cambios: "Cambios permitidos",
    amenidades: ["Comida", "Wifi"],
    tarifa: "Standard"
  },
  {
    id: 10,
    aerolinea: "VivaAerobus",
    logo: "https://airhex.com/images/airline-logos/alt/viva-aerobus.png",
    codigoVuelo: "VB 1505",
    origen: "MEX",
    destino: "CUN",
    salida: "20:15",
    llegada: "23:00",
    duracion: "2h 45m",
    escalas: 0,
    precio: 4247,
    precioIda: 2123,
    clase: "Economy",
    equipaje: "Solo equipaje de mano",
    cambios: "No reembolsable",
    amenidades: [],
    tarifa: "Light"
  }
]

// Logos reales de aerolíneas - 50+ aerolíneas internacionales
const AIRLINE_LOGOS: Record<string, string> = {
  // México
  "Aeroméxico": "https://airhex.com/images/airline-logos/alt/aeromexico.png",
  "Volaris": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Volaris-logo.svg/200px-Volaris-logo.svg.png",
  "VivaAerobus": "https://airhex.com/images/airline-logos/alt/viva-aerobus.png",
  "Magnicharters": "https://airhex.com/images/airline-logos/alt/magnicharters.png",
  // Estados Unidos
  "American Airlines": "https://airhex.com/images/airline-logos/alt/american-airlines.png",
  "United Airlines": "https://airhex.com/images/airline-logos/alt/united-airlines.png",
  "Delta": "https://airhex.com/images/airline-logos/alt/delta-air-lines.png",
  "Delta Air Lines": "https://airhex.com/images/airline-logos/alt/delta-air-lines.png",
  "JetBlue": "https://airhex.com/images/airline-logos/alt/jetblue-airways.png",
  "JetBlue Airways": "https://airhex.com/images/airline-logos/alt/jetblue-airways.png",
  "Southwest": "https://airhex.com/images/airline-logos/alt/southwest-airlines.png",
  "Southwest Airlines": "https://airhex.com/images/airline-logos/alt/southwest-airlines.png",
  "Spirit": "https://airhex.com/images/airline-logos/alt/spirit-airlines.png",
  "Spirit Airlines": "https://airhex.com/images/airline-logos/alt/spirit-airlines.png",
  "Frontier": "https://airhex.com/images/airline-logos/alt/frontier-airlines.png",
  "Frontier Airlines": "https://airhex.com/images/airline-logos/alt/frontier-airlines.png",
  "Alaska Airlines": "https://airhex.com/images/airline-logos/alt/alaska-airlines.png",
  "Hawaiian Airlines": "https://airhex.com/images/airline-logos/alt/hawaiian-airlines.png",
  "Sun Country": "https://airhex.com/images/airline-logos/alt/sun-country-airlines.png",
  // Canadá
  "Air Canada": "https://airhex.com/images/airline-logos/alt/air-canada.png",
  "WestJet": "https://airhex.com/images/airline-logos/alt/westjet.png",
  "Porter Airlines": "https://airhex.com/images/airline-logos/alt/porter-airlines.png",
  // Latinoamérica
  "Avianca": "https://airhex.com/images/airline-logos/alt/avianca.png",
  "Copa Airlines": "https://airhex.com/images/airline-logos/alt/copa-airlines.png",
  "LATAM": "https://airhex.com/images/airline-logos/alt/latam-airlines.png",
  "LATAM Airlines": "https://airhex.com/images/airline-logos/alt/latam-airlines.png",
  "Gol": "https://airhex.com/images/airline-logos/alt/gol-linhas-aereas.png",
  "Azul": "https://airhex.com/images/airline-logos/alt/azul-brazilian-airlines.png",
  "Aerolíneas Argentinas": "https://airhex.com/images/airline-logos/alt/aerolineas-argentinas.png",
  "JetSMART": "https://airhex.com/images/airline-logos/alt/jetsmart.png",
  "SKY Airline": "https://airhex.com/images/airline-logos/alt/sky-airline.png",
  "Wingo": "https://airhex.com/images/airline-logos/alt/wingo.png",
  // Europa
  "Iberia": "https://airhex.com/images/airline-logos/alt/iberia.png",
  "Air France": "https://airhex.com/images/airline-logos/alt/air-france.png",
  "British Airways": "https://airhex.com/images/airline-logos/alt/british-airways.png",
  "Lufthansa": "https://airhex.com/images/airline-logos/alt/lufthansa.png",
  "KLM": "https://airhex.com/images/airline-logos/alt/klm.png",
  "Swiss": "https://airhex.com/images/airline-logos/alt/swiss.png",
  "Austrian": "https://airhex.com/images/airline-logos/alt/austrian.png",
  "TAP Portugal": "https://airhex.com/images/airline-logos/alt/tap-air-portugal.png",
  "Alitalia": "https://airhex.com/images/airline-logos/alt/alitalia.png",
  "ITA Airways": "https://airhex.com/images/airline-logos/alt/ita-airways.png",
  "Vueling": "https://airhex.com/images/airline-logos/alt/vueling.png",
  "Ryanair": "https://airhex.com/images/airline-logos/alt/ryanair.png",
  "EasyJet": "https://airhex.com/images/airline-logos/alt/easyjet.png",
  "Norwegian": "https://airhex.com/images/airline-logos/alt/norwegian.png",
  "SAS": "https://airhex.com/images/airline-logos/alt/sas.png",
  "Finnair": "https://airhex.com/images/airline-logos/alt/finnair.png",
  "Aer Lingus": "https://airhex.com/images/airline-logos/alt/aer-lingus.png",
  "Turkish Airlines": "https://airhex.com/images/airline-logos/alt/turkish-airlines.png",
  "LOT Polish": "https://airhex.com/images/airline-logos/alt/lot-polish-airlines.png",
  // Medio Oriente
  "Emirates": "https://airhex.com/images/airline-logos/alt/emirates.png",
  "Qatar Airways": "https://airhex.com/images/airline-logos/alt/qatar-airways.png",
  "Etihad": "https://airhex.com/images/airline-logos/alt/etihad-airways.png",
  "Etihad Airways": "https://airhex.com/images/airline-logos/alt/etihad-airways.png",
  "Royal Jordanian": "https://airhex.com/images/airline-logos/alt/royal-jordanian.png",
  "Saudia": "https://airhex.com/images/airline-logos/alt/saudia.png",
  "El Al": "https://airhex.com/images/airline-logos/alt/el-al.png",
  // Asia
  "Singapore Airlines": "https://airhex.com/images/airline-logos/alt/singapore-airlines.png",
  "Cathay Pacific": "https://airhex.com/images/airline-logos/alt/cathay-pacific.png",
  "Japan Airlines": "https://airhex.com/images/airline-logos/alt/japan-airlines.png",
  "JAL": "https://airhex.com/images/airline-logos/alt/japan-airlines.png",
  "ANA": "https://airhex.com/images/airline-logos/alt/ana.png",
  "All Nippon Airways": "https://airhex.com/images/airline-logos/alt/ana.png",
  "Korean Air": "https://airhex.com/images/airline-logos/alt/korean-air.png",
  "Asiana": "https://airhex.com/images/airline-logos/alt/asiana-airlines.png",
  "Thai Airways": "https://airhex.com/images/airline-logos/alt/thai-airways.png",
  "Vietnam Airlines": "https://airhex.com/images/airline-logos/alt/vietnam-airlines.png",
  "Malaysia Airlines": "https://airhex.com/images/airline-logos/alt/malaysia-airlines.png",
  "Philippine Airlines": "https://airhex.com/images/airline-logos/alt/philippine-airlines.png",
  "Garuda Indonesia": "https://airhex.com/images/airline-logos/alt/garuda-indonesia.png",
  "Air China": "https://airhex.com/images/airline-logos/alt/air-china.png",
  "China Airlines": "https://airhex.com/images/airline-logos/alt/china-airlines.png",
  "China Eastern": "https://airhex.com/images/airline-logos/alt/china-eastern.png",
  "China Southern": "https://airhex.com/images/airline-logos/alt/china-southern.png",
  "EVA Air": "https://airhex.com/images/airline-logos/alt/eva-air.png",
  "Air India": "https://airhex.com/images/airline-logos/alt/air-india.png",
  // Oceanía
  "Qantas": "https://airhex.com/images/airline-logos/alt/qantas.png",
  "Air New Zealand": "https://airhex.com/images/airline-logos/alt/air-new-zealand.png",
  "Virgin Australia": "https://airhex.com/images/airline-logos/alt/virgin-australia.png",
  // África
  "Ethiopian Airlines": "https://airhex.com/images/airline-logos/alt/ethiopian-airlines.png",
  "South African Airways": "https://airhex.com/images/airline-logos/alt/south-african-airways.png",
  "Kenya Airways": "https://airhex.com/images/airline-logos/alt/kenya-airways.png",
  "Royal Air Maroc": "https://airhex.com/images/airline-logos/alt/royal-air-maroc.png",
  "EgyptAir": "https://airhex.com/images/airline-logos/alt/egyptair.png",
}

// Ciudades disponibles - LISTA EXPANDIDA
const ciudades = [
  // México - Principales
  { code: "MEX", name: "Ciudad de México", airport: "Aeropuerto Internacional Benito Juárez" },
  { code: "CUN", name: "Cancún", airport: "Aeropuerto Internacional de Cancún" },
  { code: "GDL", name: "Guadalajara", airport: "Aeropuerto Internacional Miguel Hidalgo" },
  { code: "MTY", name: "Monterrey", airport: "Aeropuerto Internacional Mariano Escobedo" },
  { code: "TIJ", name: "Tijuana", airport: "Aeropuerto Internacional Abelardo L. Rodríguez" },
  { code: "PVR", name: "Puerto Vallarta", airport: "Aeropuerto Internacional Gustavo Díaz Ordaz" },
  { code: "SJD", name: "Los Cabos", airport: "Aeropuerto Internacional de Los Cabos" },
  { code: "MID", name: "Mérida", airport: "Aeropuerto Internacional Manuel Crescencio Rejón" },
  // México - Secundarios
  { code: "HMO", name: "Hermosillo", airport: "Aeropuerto Internacional Ignacio Pesqueira" },
  { code: "CUL", name: "Culiacán", airport: "Aeropuerto Internacional de Bachigualato" },
  { code: "BJX", name: "León/Guanajuato", airport: "Aeropuerto Internacional del Bajío" },
  { code: "OAX", name: "Oaxaca", airport: "Aeropuerto Internacional Xoxocotlán" },
  { code: "VER", name: "Veracruz", airport: "Aeropuerto Internacional Heriberto Jara" },
  { code: "ACA", name: "Acapulco", airport: "Aeropuerto Internacional Juan N. Álvarez" },
  { code: "HUX", name: "Huatulco", airport: "Aeropuerto Internacional de Huatulco" },
  { code: "ZIH", name: "Ixtapa/Zihuatanejo", airport: "Aeropuerto Internacional de Ixtapa" },
  { code: "MZT", name: "Mazatlán", airport: "Aeropuerto Internacional Rafael Buelna" },
  { code: "AGU", name: "Aguascalientes", airport: "Aeropuerto Internacional de Aguascalientes" },
  { code: "QRO", name: "Querétaro", airport: "Aeropuerto Internacional de Querétaro" },
  { code: "SLP", name: "San Luis Potosí", airport: "Aeropuerto Internacional Ponciano Arriaga" },
  { code: "PBC", name: "Puebla", airport: "Aeropuerto Internacional de Puebla" },
  { code: "CME", name: "Ciudad del Carmen", airport: "Aeropuerto Internacional de Ciudad del Carmen" },
  { code: "VSA", name: "Villahermosa", airport: "Aeropuerto Internacional Carlos Rovirosa" },
  { code: "TRC", name: "Torreón", airport: "Aeropuerto Internacional Francisco Sarabia" },
  { code: "CJS", name: "Ciudad Juárez", airport: "Aeropuerto Internacional Abraham González" },
  { code: "CUU", name: "Chihuahua", airport: "Aeropuerto Internacional Roberto Fierro" },
  { code: "DGO", name: "Durango", airport: "Aeropuerto Internacional Guadalupe Victoria" },
  { code: "ZCL", name: "Zacatecas", airport: "Aeropuerto Internacional Leobardo C. Ruiz" },
  { code: "MLM", name: "Morelia", airport: "Aeropuerto Internacional Francisco J. Mujica" },
  { code: "TAM", name: "Tampico", airport: "Aeropuerto Internacional Francisco Javier Mina" },
  { code: "LAP", name: "La Paz (BCS)", airport: "Aeropuerto Internacional Manuel Márquez de León" },
  { code: "CZM", name: "Cozumel", airport: "Aeropuerto Internacional de Cozumel" },
  { code: "TGZ", name: "Tuxtla Gutiérrez", airport: "Aeropuerto Internacional Ángel Albino Corzo" },
  // Estados Unidos
  { code: "LAX", name: "Los Angeles", airport: "Los Angeles International Airport" },
  { code: "JFK", name: "Nueva York (JFK)", airport: "John F. Kennedy International Airport" },
  { code: "MIA", name: "Miami", airport: "Miami International Airport" },
  { code: "ORD", name: "Chicago", airport: "O'Hare International Airport" },
  { code: "DFW", name: "Dallas", airport: "Dallas/Fort Worth International Airport" },
  { code: "IAH", name: "Houston", airport: "George Bush Intercontinental Airport" },
  { code: "SFO", name: "San Francisco", airport: "San Francisco International Airport" },
  { code: "LAS", name: "Las Vegas", airport: "Harry Reid International Airport" },
  { code: "PHX", name: "Phoenix", airport: "Phoenix Sky Harbor International Airport" },
  { code: "ATL", name: "Atlanta", airport: "Hartsfield-Jackson Atlanta International Airport" },
  { code: "SEA", name: "Seattle", airport: "Seattle-Tacoma International Airport" },
  { code: "DEN", name: "Denver", airport: "Denver International Airport" },
  { code: "SAN", name: "San Diego", airport: "San Diego International Airport" },
  { code: "MCO", name: "Orlando", airport: "Orlando International Airport" },
  { code: "EWR", name: "Nueva York (Newark)", airport: "Newark Liberty International Airport" },
  { code: "BOS", name: "Boston", airport: "Logan International Airport" },
  // Canadá
  { code: "YYZ", name: "Toronto", airport: "Toronto Pearson International Airport" },
  { code: "YVR", name: "Vancouver", airport: "Vancouver International Airport" },
  { code: "YUL", name: "Montreal", airport: "Montréal-Trudeau International Airport" },
  // Centroamérica y Caribe
  { code: "GUA", name: "Guatemala City", airport: "Aeropuerto Internacional La Aurora" },
  { code: "SAL", name: "San Salvador", airport: "Aeropuerto Internacional Monseñor Romero" },
  { code: "SJO", name: "San José (Costa Rica)", airport: "Aeropuerto Internacional Juan Santamaría" },
  { code: "PTY", name: "Ciudad de Panamá", airport: "Aeropuerto Internacional de Tocumen" },
  { code: "HAV", name: "La Habana", airport: "Aeropuerto Internacional José Martí" },
  { code: "SDQ", name: "Santo Domingo", airport: "Aeropuerto Internacional Las Américas" },
  { code: "SJU", name: "San Juan (PR)", airport: "Aeropuerto Internacional Luis Muñoz Marín" },
  { code: "MBJ", name: "Montego Bay", airport: "Sangster International Airport" },
  // Sudamérica
  { code: "BOG", name: "Bogotá", airport: "Aeropuerto Internacional El Dorado" },
  { code: "LIM", name: "Lima", airport: "Aeropuerto Internacional Jorge Chávez" },
  { code: "SCL", name: "Santiago (Chile)", airport: "Aeropuerto Internacional Arturo Merino Benítez" },
  { code: "EZE", name: "Buenos Aires", airport: "Aeropuerto Internacional Ezeiza" },
  { code: "GRU", name: "São Paulo", airport: "Aeropuerto Internacional de Guarulhos" },
  // Europa
  { code: "MAD", name: "Madrid", airport: "Aeropuerto Adolfo Suárez Madrid-Barajas" },
  { code: "BCN", name: "Barcelona", airport: "Aeropuerto de Barcelona-El Prat" },
  { code: "CDG", name: "París", airport: "Aéroport Paris-Charles de Gaulle" },
  { code: "LHR", name: "Londres", airport: "London Heathrow Airport" },
  { code: "FCO", name: "Roma", airport: "Aeroporto di Roma-Fiumicino" },
  { code: "AMS", name: "Ámsterdam", airport: "Amsterdam Airport Schiphol" },
  { code: "FRA", name: "Frankfurt", airport: "Frankfurt Airport" },
]

// Función para buscar vuelos desde Amadeus API
async function buscarVuelos(origen: string, destino: string, fecha: string, pasajeros: number): Promise<Vuelo[]> {
  try {
    const response = await fetch(`/api/search/flights?origin=${origen}&destination=${destino}&date=${fecha}&adults=${pasajeros}`)
    if (!response.ok) {
      console.warn('Error en API Amadeus, usando datos mock')
      return todosVuelos
    }
    const data = await response.json()
    if (data.success && data.data?.length > 0) {
      return data.data.map((vuelo: any, index: number) => ({
        id: index + 1,
        aerolinea: vuelo.airline || 'Aerolínea',
        logo: AIRLINE_LOGOS[vuelo.airline] || 'https://airhex.com/images/airline-logos/alt/aeromexico.png',
        codigoVuelo: vuelo.flightNumber || `FL${index + 100}`,
        origen: vuelo.origin || origen,
        destino: vuelo.destination || destino,
        salida: vuelo.departureTime || '08:00',
        llegada: vuelo.arrivalTime || '10:30',
        duracion: vuelo.duration || '2h 30m',
        escalas: vuelo.stops || 0,
        precio: vuelo.price || 5000,
        precioIda: vuelo.price ? vuelo.price / 2 : 2500,
        clase: vuelo.cabinClass || 'Economy',
        equipaje: vuelo.baggage || '1 maleta incluida',
        cambios: vuelo.flexibility || 'Cambios permitidos',
        amenidades: vuelo.amenities || ['Wifi'],
        tarifa: vuelo.fareType || 'Standard'
      }))
    }
    return todosVuelos
  } catch (error) {
    console.error('Error buscando vuelos:', error)
    return todosVuelos
  }
}

// Función para generar vuelos de regreso basados en el vuelo de ida
function generarVuelosRegreso(vueloIda: Vuelo, fechaRegreso: string): Vuelo[] {
  return todosVuelos.map((vuelo, index) => ({
    ...vuelo,
    id: vuelo.id + 100,
    origen: vueloIda.destino,
    destino: vueloIda.origen,
    codigoVuelo: vuelo.codigoVuelo.replace(/\d+/, (n) => String(parseInt(n) + 100)),
    // Variar precios ligeramente para el regreso
    precio: Math.round(vuelo.precio * (0.9 + Math.random() * 0.2)),
    precioIda: Math.round(vuelo.precioIda * (0.9 + Math.random() * 0.2)),
  }))
}

export default function VuelosDestinoPage() {
  const router = useRouter()
  const params = useParams()
  const destino = params.destino as string

  // Estado del flujo de 2 pasos
  const [pasoActual, setPasoActual] = useState<1 | 2>(1)
  const [vueloIdaSeleccionado, setVueloIdaSeleccionado] = useState<Vuelo | null>(null)
  const [vueloRegresoSeleccionado, setVueloRegresoSeleccionado] = useState<Vuelo | null>(null)
  const [vuelosRegreso, setVuelosRegreso] = useState<Vuelo[]>([])

  // Estados de búsqueda
  const [vuelos, setVuelos] = useState<Vuelo[]>(todosVuelos)
  const [loading, setLoading] = useState(false)
  const [tipoViaje, setTipoViaje] = useState<'ida_vuelta' | 'solo_ida'>('ida_vuelta')
  const [origen, setOrigen] = useState('MEX')
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(destino?.toUpperCase() || 'CUN')
  const [fechaIda, setFechaIda] = useState('')
  const [fechaRegreso, setFechaRegreso] = useState('')
  const [pasajeros, setPasajeros] = useState(1)
  const [clase, setClase] = useState('Economy')

  // Filtros
  const [filtroAerolinea, setFiltroAerolinea] = useState<string[]>([])
  const [filtroPrecioMax, setFiltroPrecioMax] = useState(10000)
  const [filtroEscalas, setFiltroEscalas] = useState<string[]>([])
  const [filtroHorarioSalida, setFiltroHorarioSalida] = useState<string[]>([])
  const [filtroHorarioLlegada, setFiltroHorarioLlegada] = useState<string[]>([])
  const [filtroClase, setFiltroClase] = useState<string[]>([])
  const [filtroTarifa, setFiltroTarifa] = useState<string[]>([])
  const [filtroEquipaje, setFiltroEquipaje] = useState<string[]>([])
  const [ordenamiento, setOrdenamiento] = useState('precio')

  // Monitor de precios
  const [precioMonitorActivo, setPrecioMonitorActivo] = useState(false)
  const [emailAlerta, setEmailAlerta] = useState('')

  // Strip de fechas
  const [fechasConPrecios, setFechasConPrecios] = useState<DatePrice[]>([])
  const [fechaSeleccionadaStrip, setFechaSeleccionadaStrip] = useState<Date | null>(null)

  // Inicializar fechas
  useEffect(() => {
    const hoy = new Date()
    const manana = new Date(hoy)
    manana.setDate(manana.getDate() + 1)
    const enUnaSemana = new Date(hoy)
    enUnaSemana.setDate(enUnaSemana.getDate() + 7)

    setFechaIda(manana.toISOString().split('T')[0])
    setFechaRegreso(enUnaSemana.toISOString().split('T')[0])

    // Generar strip de fechas con precios
    const fechas: DatePrice[] = []
    for (let i = -3; i <= 7; i++) {
      const fecha = new Date(manana)
      fecha.setDate(fecha.getDate() + i)
      fechas.push({
        date: fecha,
        price: 2000 + Math.floor(Math.random() * 3000),
        isLowest: false,
        isSelected: i === 0
      })
    }
    const minPrice = Math.min(...fechas.map(f => f.price))
    fechas.forEach(f => f.isLowest = f.price === minPrice)
    setFechasConPrecios(fechas)
    setFechaSeleccionadaStrip(manana)
  }, [])

  // Buscar vuelos al cambiar parámetros
  useEffect(() => {
    if (fechaIda && origen && destinoSeleccionado) {
      handleBuscarVuelos()
    }
  }, [fechaIda, origen, destinoSeleccionado, pasajeros])

  const handleBuscarVuelos = async () => {
    setLoading(true)
    try {
      const resultados = await buscarVuelos(origen, destinoSeleccionado, fechaIda, pasajeros)
      setVuelos(resultados)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para seleccionar vuelo de ida
  const seleccionarVueloIda = useCallback((vuelo: Vuelo) => {
    setVueloIdaSeleccionado(vuelo)
    if (tipoViaje === 'ida_vuelta') {
      // Generar vuelos de regreso
      const vuelosReg = generarVuelosRegreso(vuelo, fechaRegreso)
      setVuelosRegreso(vuelosReg)
      setPasoActual(2)
    } else {
      // Solo ida - ir directo a confirmación
      irAConfirmacion(vuelo, null)
    }
  }, [tipoViaje, fechaRegreso])

  // Función para seleccionar vuelo de regreso
  const seleccionarVueloRegreso = useCallback((vuelo: Vuelo) => {
    setVueloRegresoSeleccionado(vuelo)
    if (vueloIdaSeleccionado) {
      irAConfirmacion(vueloIdaSeleccionado, vuelo)
    }
  }, [vueloIdaSeleccionado])

  // Función para ir a confirmación
  const irAConfirmacion = (vueloIda: Vuelo, vueloRegreso: Vuelo | null) => {
    const precioTotal = vueloIda.precioIda + (vueloRegreso?.precioIda || 0)

    const serviceData = {
      type: 'flight',
      service: {
        price: precioTotal * pasajeros,
        currency: 'MXN',
        details: {
          airline: vueloIda.aerolinea,
          outbound: {
            flightNumber: vueloIda.codigoVuelo,
            origin: vueloIda.origen,
            destination: vueloIda.destino,
            departureTime: vueloIda.salida,
            arrivalTime: vueloIda.llegada,
            duration: vueloIda.duracion,
            stops: vueloIda.escalas,
            class: vueloIda.clase,
            date: fechaIda
          },
          inbound: vueloRegreso ? {
            flightNumber: vueloRegreso.codigoVuelo,
            origin: vueloRegreso.origen,
            destination: vueloRegreso.destino,
            departureTime: vueloRegreso.salida,
            arrivalTime: vueloRegreso.llegada,
            duration: vueloRegreso.duracion,
            stops: vueloRegreso.escalas,
            class: vueloRegreso.clase,
            date: fechaRegreso
          } : null
        }
      },
      searchParams: {
        adults: pasajeros,
        tripType: tipoViaje
      }
    }

    localStorage.setItem('selected_service', JSON.stringify(serviceData))
    router.push('/confirmar-reserva?tipo=flight')
  }

  // Función para verificar horario
  const cumpleHorario = (hora: string, filtros: string[]): boolean => {
    if (filtros.length === 0) return true
    const h = parseInt(hora.split(':')[0])
    return filtros.some(filtro => {
      if (filtro === 'madrugada') return h >= 0 && h < 6
      if (filtro === 'manana') return h >= 6 && h < 12
      if (filtro === 'tarde') return h >= 12 && h < 18
      if (filtro === 'noche') return h >= 18 && h < 24
      return false
    })
  }

  // Aplicar filtros
  const vuelosFiltrados = useMemo(() => {
    const vuelosBase = pasoActual === 1 ? vuelos : vuelosRegreso

    return vuelosBase
      .filter(v => {
        if (filtroAerolinea.length > 0 && !filtroAerolinea.includes(v.aerolinea)) return false
        if (v.precioIda > filtroPrecioMax) return false
        if (filtroEscalas.length > 0) {
          if (filtroEscalas.includes('directo') && v.escalas !== 0) return false
          if (filtroEscalas.includes('1_escala') && v.escalas !== 1) return false
          if (filtroEscalas.includes('2_escalas') && v.escalas < 2) return false
        }
        if (!cumpleHorario(v.salida, filtroHorarioSalida)) return false
        if (!cumpleHorario(v.llegada, filtroHorarioLlegada)) return false
        if (filtroClase.length > 0 && !filtroClase.includes(v.clase)) return false
        if (filtroTarifa.length > 0 && !filtroTarifa.includes(v.tarifa)) return false
        if (filtroEquipaje.length > 0) {
          if (filtroEquipaje.includes('maleta') && !v.equipaje.includes('maleta')) return false
          if (filtroEquipaje.includes('solo_mano') && !v.equipaje.includes('Solo')) return false
        }
        return true
      })
      .sort((a, b) => {
        if (ordenamiento === 'precio') return a.precioIda - b.precioIda
        if (ordenamiento === 'duracion') {
          const durA = parseInt(a.duracion.replace(/\D/g, ''))
          const durB = parseInt(b.duracion.replace(/\D/g, ''))
          return durA - durB
        }
        if (ordenamiento === 'salida') return a.salida.localeCompare(b.salida)
        if (ordenamiento === 'llegada') return a.llegada.localeCompare(b.llegada)
        return 0
      })
  }, [vuelos, vuelosRegreso, pasoActual, filtroAerolinea, filtroPrecioMax, filtroEscalas,
      filtroHorarioSalida, filtroHorarioLlegada, filtroClase, filtroTarifa, filtroEquipaje, ordenamiento])

  const precioMasBarato = vuelosFiltrados.length > 0
    ? Math.min(...vuelosFiltrados.map(v => v.precioIda))
    : 0

  const limpiarTodosFiltros = () => {
    setFiltroAerolinea([])
    setFiltroPrecioMax(10000)
    setFiltroEscalas([])
    setFiltroHorarioSalida([])
    setFiltroHorarioLlegada([])
    setFiltroClase([])
    setFiltroTarifa([])
    setFiltroEquipaje([])
  }

  const contadorFiltros = filtroAerolinea.length + filtroEscalas.length +
    filtroHorarioSalida.length + filtroHorarioLlegada.length +
    filtroClase.length + filtroTarifa.length + filtroEquipaje.length +
    (filtroPrecioMax < 10000 ? 1 : 0)

  const getCiudadNombre = (code: string) => {
    const ciudad = ciudades.find(c => c.code === code)
    return ciudad?.name || code
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <PageHeader showBackButton={true} backButtonHref="/" />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb y título */}
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-2">
            Vuelos → {getCiudadNombre(origen)} → {getCiudadNombre(destinoSeleccionado)}
          </div>
          <h1 className="text-3xl font-bold">
            {pasoActual === 1 ? 'Selecciona tu vuelo de ida' : 'Selecciona tu vuelo de regreso'}
          </h1>
          {tipoViaje === 'ida_vuelta' && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={pasoActual === 1 ? 'default' : 'secondary'}>
                1. Ida
              </Badge>
              <ChevronRight className="w-4 h-4" />
              <Badge variant={pasoActual === 2 ? 'default' : 'secondary'}>
                2. Regreso
              </Badge>
            </div>
          )}
        </div>

        {/* Vuelo de ida seleccionado (mostrar en paso 2) */}
        {pasoActual === 2 && vueloIdaSeleccionado && (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Check className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold">Vuelo de ida seleccionado</p>
                  <p className="text-sm text-muted-foreground">
                    {vueloIdaSeleccionado.aerolinea} {vueloIdaSeleccionado.codigoVuelo} ·
                    {vueloIdaSeleccionado.origen} → {vueloIdaSeleccionado.destino} ·
                    {vueloIdaSeleccionado.salida} - {vueloIdaSeleccionado.llegada}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${vueloIdaSeleccionado.precioIda.toLocaleString()}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPasoActual(1)
                    setVueloIdaSeleccionado(null)
                  }}
                >
                  Cambiar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Barra de búsqueda */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label>Tipo de viaje</Label>
              <Select value={tipoViaje} onValueChange={(v: 'ida_vuelta' | 'solo_ida') => setTipoViaje(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ida_vuelta">Ida y vuelta</SelectItem>
                  <SelectItem value="solo_ida">Solo ida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Origen</Label>
              <Select value={origen} onValueChange={setOrigen}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ciudades.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Destino</Label>
              <Select value={destinoSeleccionado} onValueChange={setDestinoSeleccionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ciudades.filter(c => c.code !== origen).map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha ida</Label>
              <Input type="date" value={fechaIda} onChange={(e) => setFechaIda(e.target.value)} />
            </div>
            {tipoViaje === 'ida_vuelta' && (
              <div>
                <Label>Fecha regreso</Label>
                <Input type="date" value={fechaRegreso} onChange={(e) => setFechaRegreso(e.target.value)} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Label>Pasajeros:</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPasajeros(Math.max(1, pasajeros - 1))}>-</Button>
                <span className="w-8 text-center">{pasajeros}</span>
                <Button variant="outline" size="sm" onClick={() => setPasajeros(Math.min(9, pasajeros + 1))}>+</Button>
              </div>
            </div>
            <Button onClick={handleBuscarVuelos} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plane className="w-4 h-4 mr-2" />}
              Buscar
            </Button>
          </div>
        </Card>

        {/* Strip de fechas con precios */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fechas flexibles
            </h3>
            <Button variant="ghost" size="sm">
              <TrendingDown className="w-4 h-4 mr-1" />
              Ver calendario de precios
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {fechasConPrecios.map((fp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setFechaIda(fp.date.toISOString().split('T')[0])
                  setFechaSeleccionadaStrip(fp.date)
                  setFechasConPrecios(prev => prev.map(f => ({
                    ...f,
                    isSelected: f.date.getTime() === fp.date.getTime()
                  })))
                }}
                className={`flex-shrink-0 p-3 rounded-lg border transition-all ${
                  fp.isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : fp.isLowest
                      ? 'bg-green-50 border-green-300 hover:border-green-500'
                      : 'bg-white border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="text-xs font-medium">
                  {fp.date.toLocaleDateString('es-MX', { weekday: 'short' })}
                </div>
                <div className="text-sm font-bold">
                  {fp.date.getDate()}
                </div>
                <div className={`text-xs ${fp.isSelected ? 'text-white' : fp.isLowest ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                  ${fp.price.toLocaleString()}
                </div>
                {fp.isLowest && !fp.isSelected && (
                  <Badge variant="secondary" className="text-xs mt-1 bg-green-100 text-green-700">
                    Mejor precio
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Monitor de precios */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold">Monitor de precios</p>
                <p className="text-sm text-muted-foreground">
                  Te avisaremos cuando el precio baje
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {precioMonitorActivo ? (
                <Badge className="bg-green-600">Activo</Badge>
              ) : (
                <>
                  <Input
                    placeholder="tu@email.com"
                    className="w-48"
                    value={emailAlerta}
                    onChange={(e) => setEmailAlerta(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (emailAlerta) {
                        setPrecioMonitorActivo(true)
                      }
                    }}
                  >
                    Activar alerta
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Panel de filtros */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                  {contadorFiltros > 0 && (
                    <Badge variant="secondary">{contadorFiltros}</Badge>
                  )}
                </h3>
                {contadorFiltros > 0 && (
                  <Button variant="ghost" size="sm" onClick={limpiarTodosFiltros}>
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Precio */}
              <div className="mb-6">
                <Label className="mb-2 block">Precio máximo: ${filtroPrecioMax.toLocaleString()}</Label>
                <Slider
                  value={[filtroPrecioMax]}
                  onValueChange={([v]) => setFiltroPrecioMax(v)}
                  max={10000}
                  min={1000}
                  step={500}
                />
              </div>

              {/* Escalas */}
              <div className="mb-6">
                <Label className="mb-2 block">Escalas</Label>
                <div className="space-y-2">
                  {[
                    { id: 'directo', label: 'Directo' },
                    { id: '1_escala', label: '1 escala' },
                    { id: '2_escalas', label: '2+ escalas' }
                  ].map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={filtroEscalas.includes(item.id)}
                        onCheckedChange={(checked) => {
                          setFiltroEscalas(prev =>
                            checked ? [...prev, item.id] : prev.filter(x => x !== item.id)
                          )
                        }}
                      />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aerolíneas */}
              <div className="mb-6">
                <Label className="mb-2 block">Aerolíneas</Label>
                <div className="space-y-2">
                  {['Aeroméxico', 'Volaris', 'VivaAerobus'].map(aero => (
                    <div key={aero} className="flex items-center gap-2">
                      <Checkbox
                        checked={filtroAerolinea.includes(aero)}
                        onCheckedChange={(checked) => {
                          setFiltroAerolinea(prev =>
                            checked ? [...prev, aero] : prev.filter(x => x !== aero)
                          )
                        }}
                      />
                      <span className="text-sm">{aero}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horario de salida */}
              <div className="mb-6">
                <Label className="mb-2 block">🌅 Horario de salida</Label>
                <div className="space-y-2">
                  {[
                    { id: 'madrugada', label: '🌙 Madrugada (00-06)', icon: Moon },
                    { id: 'manana', label: '🌅 Mañana (06-12)', icon: Sunrise },
                    { id: 'tarde', label: '☀️ Tarde (12-18)', icon: Sun },
                    { id: 'noche', label: '🌆 Noche (18-24)', icon: Sunset }
                  ].map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={filtroHorarioSalida.includes(item.id)}
                        onCheckedChange={(checked) => {
                          setFiltroHorarioSalida(prev =>
                            checked ? [...prev, item.id] : prev.filter(x => x !== item.id)
                          )
                        }}
                      />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horario de llegada */}
              <div className="mb-6">
                <Label className="mb-2 block">🛬 Horario de llegada</Label>
                <div className="space-y-2">
                  {[
                    { id: 'madrugada', label: '🌙 Madrugada (00-06)' },
                    { id: 'manana', label: '🌅 Mañana (06-12)' },
                    { id: 'tarde', label: '☀️ Tarde (12-18)' },
                    { id: 'noche', label: '🌆 Noche (18-24)' }
                  ].map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={filtroHorarioLlegada.includes(item.id)}
                        onCheckedChange={(checked) => {
                          setFiltroHorarioLlegada(prev =>
                            checked ? [...prev, item.id] : prev.filter(x => x !== item.id)
                          )
                        }}
                      />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clase */}
              <div className="mb-6">
                <Label className="mb-2 block">Clase</Label>
                <div className="space-y-2">
                  {['Economy', 'Economy Plus', 'Business', 'First Class'].map(c => (
                    <div key={c} className="flex items-center gap-2">
                      <Checkbox
                        checked={filtroClase.includes(c)}
                        onCheckedChange={(checked) => {
                          setFiltroClase(prev =>
                            checked ? [...prev, c] : prev.filter(x => x !== c)
                          )
                        }}
                      />
                      <span className="text-sm">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tarifa */}
              <div className="mb-6">
                <Label className="mb-2 block">Tipo de tarifa</Label>
                <div className="space-y-2">
                  {['Light', 'Basic', 'Standard', 'Flexible'].map(t => (
                    <div key={t} className="flex items-center gap-2">
                      <Checkbox
                        checked={filtroTarifa.includes(t)}
                        onCheckedChange={(checked) => {
                          setFiltroTarifa(prev =>
                            checked ? [...prev, t] : prev.filter(x => x !== t)
                          )
                        }}
                      />
                      <span className="text-sm">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Lista de vuelos */}
          <div className="lg:col-span-3">
            {/* Header de resultados */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                {vuelosFiltrados.length} de {pasoActual === 1 ? vuelos.length : vuelosRegreso.length} vuelos
              </p>
              <Select value={ordenamiento} onValueChange={setOrdenamiento}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="precio">Precio: menor a mayor</SelectItem>
                  <SelectItem value="duracion">Duración: menor a mayor</SelectItem>
                  <SelectItem value="salida">Hora de salida</SelectItem>
                  <SelectItem value="llegada">Hora de llegada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : vuelosFiltrados.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium">No se encontraron vuelos</p>
                <p className="text-muted-foreground">Intenta ajustar los filtros o cambiar las fechas</p>
                <Button className="mt-4" onClick={limpiarTodosFiltros}>
                  Limpiar filtros
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {vuelosFiltrados.map((vuelo) => (
                  <Card
                    key={vuelo.id}
                    className={`p-4 hover:shadow-lg transition-shadow ${
                      vuelo.precioIda === precioMasBarato ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    {vuelo.precioIda === precioMasBarato && (
                      <Badge className="bg-green-600 mb-2">Mejor precio</Badge>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-white rounded border border-gray-100 p-1 flex items-center justify-center flex-shrink-0">
                          <img
                            src={vuelo.logo}
                            alt={vuelo.aerolinea}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{vuelo.aerolinea}</p>
                          <p className="text-sm text-muted-foreground">{vuelo.codigoVuelo}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xl font-bold">{vuelo.salida}</p>
                          <p className="text-sm text-muted-foreground">{vuelo.origen}</p>
                        </div>

                        <div className="flex flex-col items-center">
                          <p className="text-sm text-muted-foreground">{vuelo.duracion}</p>
                          <div className="w-24 h-0.5 bg-gray-300 relative">
                            <Plane className="w-4 h-4 absolute -top-2 left-1/2 -translate-x-1/2 text-blue-600" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {vuelo.escalas === 0 ? 'Directo' : `${vuelo.escalas} escala(s)`}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xl font-bold">{vuelo.llegada}</p>
                          <p className="text-sm text-muted-foreground">{vuelo.destino}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          ${vuelo.precioIda.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">por persona</p>
                        <Button
                          className="mt-2"
                          onClick={() => pasoActual === 1
                            ? seleccionarVueloIda(vuelo)
                            : seleccionarVueloRegreso(vuelo)
                          }
                        >
                          Seleccionar
                        </Button>
                      </div>
                    </div>

                    {/* Detalles adicionales */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{vuelo.clase}</Badge>
                        <Badge variant="outline">{vuelo.tarifa}</Badge>
                        <span className="text-muted-foreground">{vuelo.equipaje}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {vuelo.amenidades.map((a, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Build: 23 Jul 2026 - 12:10 CST - v2.427 - New confirmed guests details page with sub-referrals count - PRODUCTION
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { ChevronLeft, Search, Users, Loader2 } from "lucide-react"

export default function ConfirmedGuestsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { companyName } = useWhiteLabel()

  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user) return
    const fetchReferrals = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/mobile/referrals?user_id=${user?.id}`)
        const data = await res.json()
        if (data.success && data.data?.user?.referrals) {
          setReferrals(data.data.user.referrals)
        }
      } catch (error) {
        console.error("Error fetching referrals:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchReferrals()
  }, [user])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ""
      const months = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."]
      return `Invitado el ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    } catch (e) {
      return ""
    }
  }

  // Filtrar invitados por búsqueda
  const filteredGuests = referrals.filter((guest) => {
    return (guest.referred_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12 font-sans flex flex-col">
      {/* Header Section */}
      <div className="relative h-[250px] w-full flex-shrink-0">
        <div className="absolute inset-0 bg-black/55 z-10" />
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
          alt="Sunset horizon from plane window"
          className="w-full h-full object-cover"
        />

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <button
            type="button"
            onClick={() => router.push("/mobile/rewards")}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Title and Subtitle */}
        <div className="absolute bottom-8 left-6 right-6 z-20 text-white">
          <h1 className="text-3xl font-serif font-bold mb-2">Invitados confirmados</h1>
          <p className="text-xs text-gray-200 leading-relaxed max-w-[310px]">
            Estas son las personas que ya aceptaron tu invitación y se unieron a la comunidad {companyName || "AS"}.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-30 flex-1 shadow-sm border-t border-gray-100 flex flex-col">
        {/* Search Control */}
        <div className="p-5 border-b border-gray-50 flex-shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar invitado"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-sm text-black placeholder-gray-400 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-black transition-all"
            />
          </div>
        </div>

        {/* Guests List */}
        <div className="flex-1 p-5 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
              <p className="text-sm">Cargando invitados...</p>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">No se encontraron invitados confirmados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuests.map((guest, idx) => (
                <div
                  key={guest.id || idx}
                  className="flex items-center gap-4 p-4 bg-white hover:bg-gray-50/50 border border-gray-100/75 rounded-2xl transition-all"
                >
                  {/* Circle green badge with sub-referrals count */}
                  <div
                    className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm"
                    title={`${guest.sub_referrals_count || 0} invitados de ellos`}
                  >
                    {guest.sub_referrals_count || 0}
                  </div>

                  {/* Avatar Icon */}
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {guest.referred_name || "Usuario"}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatDate(guest.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary Card */}
        <div className="p-5 border-t border-gray-100 bg-[#FBFBFC] rounded-b-3xl flex-shrink-0">
          <div className="bg-white border border-gray-100/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-black">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Total de invitados confirmados</span>
            </div>
            <span className="text-lg font-bold text-black">{filteredGuests.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

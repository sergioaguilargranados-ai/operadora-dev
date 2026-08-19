import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../services/api'
import config from '../constants/config'

export interface TenantContent {
  tenantId: number
  companyName: string
  logoUrl: string | null
  logoDarkUrl: string | null
  logoMobileUrl: string | null
  primaryColor: string
  welcomePhrase: string
  bannerUrl: string | null
  helpPhone: string
  sectionsJson: any
}

interface TenantState extends TenantContent {
  isLoading: boolean
  loadTenant: (tenantId?: number) => Promise<void>
  setTenantContent: (content: Partial<TenantContent>) => void
  reset: () => void
}

const DEFAULT_TENANT: TenantContent = {
  tenantId: 1,
  companyName: 'AS Operadora',
  logoUrl: null,
  logoDarkUrl: null,
  logoMobileUrl: null,
  primaryColor: '#1D4ED8',
  welcomePhrase: '¿Listo para tu próxima experiencia?',
  bannerUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
  helpPhone: '+521234567890',
  sectionsJson: null,
}

export const useTenantStore = create<TenantState>((set, get) => ({
  ...DEFAULT_TENANT,
  isLoading: false,

  loadTenant: async (tenantId = 1) => {
    set({ isLoading: true })
    try {
      // 1. Try to load cached tenant config
      const cached = await AsyncStorage.getItem(`tenant_config_${tenantId}`)
      if (cached) {
        set({ ...JSON.parse(cached), isLoading: false })
      }

      // 2. Fetch fresh from backend
      const timestamp = new Date().getTime()
      const res = await api.get(`/mobile/content?tenant_id=${tenantId}&t=${timestamp}`)
      const data = res.data

      if (data?.success && data?.data) {
        const item = data.data
        const updated: TenantContent = {
          tenantId,
          companyName: item.company_name || 'AS Operadora',
          logoUrl: item.logo_url || null,
          logoDarkUrl: item.logo_dark_url || null,
          logoMobileUrl: item.logo_mobile_url || item.logo_url || null,
          primaryColor: item.primary_color || '#1D4ED8',
          welcomePhrase: item.welcome_phrase || '¿Listo para tu próxima experiencia?',
          bannerUrl: item.banner_url || item.sections_json?.home_banner_url || DEFAULT_TENANT.bannerUrl,
          helpPhone: item.help_phone || '+521234567890',
          sectionsJson: item.sections_json || null,
        }

        set({ ...updated, isLoading: false })
        await AsyncStorage.setItem(`tenant_config_${tenantId}`, JSON.stringify(updated))
      }
    } catch (e) {
      console.warn('Could not fetch tenant content, using defaults or cache', e)
      set({ isLoading: false })
    }
  },

  setTenantContent: (content) => set((state) => ({ ...state, ...content })),
  reset: () => set(DEFAULT_TENANT),
}))

export default useTenantStore

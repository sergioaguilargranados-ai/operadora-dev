import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useTenantStore } from '../../store/tenant.store'
import MobileLogo from '../../components/features/MobileLogo'
import NotificationBell from '../../components/features/NotificationBell'
import DrawerMenu from '../../components/layout/DrawerMenu'
import api from '../../services/api'

const { width } = Dimensions.get('window')

export default function MobileHomeScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { bannerUrl, welcomePhrase, loadTenant } = useTenantStore()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user?.tenant_id) {
      loadTenant(user.tenant_id)
    }
  }, [user?.tenant_id])

  // Prefetching silencioso para cache offline (itinerarios y reservas)
  useEffect(() => {
    if (!user?.id) return
    const prefetch = async () => {
      try {
        const res = await api.get(`/bookings?userId=${user.id}`)
        const bookings = res.data?.data || []
        bookings.forEach((b: any) => {
          try {
            const details = typeof b.special_requests === 'string' ? JSON.parse(b.special_requests) : (b.special_requests || {})
            const tripId = details.tour_id || b.id.toString()
            if (tripId) {
              api.get(`/itineraries/${tripId}`).catch(() => {})
            }
          } catch (e) {}
        })
      } catch (e) {
        // silent
      }
    }
    prefetch()
  }, [user?.id])

  const name = user?.name ? user.name.split(' ')[0] : 'Viajero'

  const menuItems = [
    {
      title: 'Perfil',
      desc: 'Consulta el detalle de tu viaje, vuelos, hospedaje y actividades.',
      icon: 'person-outline',
      route: '/perfil',
    },
    {
      title: 'Itinerario',
      desc: 'Revisa tus itinerarios, vuelos y detalles de tu viaje.',
      icon: 'briefcase-outline',
      route: '/itinerario/active',
    },
    {
      title: 'Pagos',
      desc: 'Revisa tus pagos, saldos y métodos de pago.',
      icon: 'card-outline',
      route: '/pagos',
    },
    {
      title: 'Crea tu grupo',
      desc: 'Invita amigos, acumula beneficios y gana descuentos para tus próximos viajes.',
      icon: 'people-outline',
      route: '/viajes-grupales',
    },
    {
      title: 'Tienda',
      desc: 'Descubre productos y servicios para tu viaje.',
      icon: 'bag-handle-outline',
      route: '/tienda',
    },
  ]

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Banner Hero */}
        <ImageBackground
          source={{
            uri: bannerUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
          }}
          style={styles.heroBanner}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />

          {/* Top Bar: Hamburguesa | Logo | Campana */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => setMenuOpen(true)}
              style={styles.menuBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <MobileLogo variant="light" size="md" />
            </View>

            <NotificationBell isWhite size={24} />
          </View>

          {/* Hero Text */}
          <View style={styles.heroTextContainer}>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingLight}>Hola, </Text>
              <Text style={styles.greetingBold}>{name}</Text>
              <Ionicons name="airplane-outline" size={24} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </View>
            <Text style={styles.welcomePhrase}>{welcomePhrase}</Text>
          </View>
        </ImageBackground>

        {/* Main Menu Container */}
        <View style={styles.menuContainer}>
          {/* Items Principales */}
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.menuRow, idx > 0 && styles.menuRowBorder]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.iconTile}>
                <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDesc} numberOfLines={2}>
                  {item.desc}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}

          {/* AS Retos */}
          <TouchableOpacity
            style={[styles.menuRow, styles.menuRowBorder]}
            onPress={() => router.push('/(tabs)/rewards' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.iconTile}>
              <Ionicons name="trophy" size={22} color="#FBBF24" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>AS Retos</Text>
              <Text style={styles.menuDesc} numberOfLines={2}>
                ¡Vive los retos, ten una mejor experiencia en tu viaje y gana premios!
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* ¿Necesitas ayuda? */}
          <TouchableOpacity
            style={[styles.menuRow, styles.menuRowBorder]}
            onPress={() => router.push('/ayuda' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.helpIconTile}>
              <Feather name="headphones" size={22} color="#374151" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>¿Necesitas ayuda?</Text>
              <Text style={styles.menuDesc} numberOfLines={2}>
                Nuestro equipo está listo para asesorarte en todo momento.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Espacio inferior de scroll */}
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>

      {/* Drawer Lateral */}
      <DrawerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  heroBanner: {
    height: 280,
    width: '100%',
    position: 'relative',
    justifyContent: 'space-between',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    zIndex: 10,
  },
  menuBtn: {
    padding: 6,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextContainer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    zIndex: 10,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingLight: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  greetingBold: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  welcomePhrase: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIconTile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  menuDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
})

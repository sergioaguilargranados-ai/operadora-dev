import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Linking,
  Image,
  Dimensions,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useTenantStore } from '../../store/tenant.store'
import MobileLogo from '../features/MobileLogo'

const { width } = Dimensions.get('window')

interface DrawerMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { primaryColor, sectionsJson } = useTenantStore()

  const handleNavigate = (route: string) => {
    onClose()
    router.push(route as any)
  }

  const handleLogout = async () => {
    onClose()
    await logout()
    router.replace('/(auth)/login')
  }

  const openUrl = (url: string) => {
    if (url) {
      Linking.openURL(url)
    }
  }

  const travelItems = [
    { label: 'Mis viajes', icon: 'briefcase-outline', route: '/(tabs)/itinerario' },
    { label: 'Itinerario', icon: 'calendar-outline', route: '/itinerario/active' },
    { label: 'Pagos', icon: 'card-outline', route: '/pagos' },
    { label: 'Crea tu grupo', icon: 'people-outline', route: '/viajes-grupales' },
    { label: 'Tienda', icon: 'bag-handle-outline', route: '/tienda' },
    { label: 'Wishlist', icon: 'heart-outline', route: '/(tabs)/wishlist' },
    { label: 'Mapa', icon: 'map-outline', route: '/(tabs)/mapa' },
    { label: 'AS Rewards', icon: 'gift-outline', route: '/(tabs)/rewards' },
    { label: '¿Necesitas ayuda?', icon: 'help-circle-outline', route: '/ayuda' },
  ]

  const legalItems = [
    {
      label: 'Términos y condiciones',
      icon: 'document-text-outline',
      url: sectionsJson?.docs?.terms_url || 'https://www.as-ope-viajes.company/legal/terminos',
    },
    {
      label: 'Aviso de privacidad',
      icon: 'shield-checkmark-outline',
      url: sectionsJson?.docs?.privacy_url || 'https://www.as-ope-viajes.company/legal/privacidad',
    },
    {
      label: 'Programa de lealtad',
      icon: 'star-outline',
      url: sectionsJson?.docs?.loyalty_url || 'https://www.as-ope-viajes.company/legal/lealtad',
    },
  ]

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Drawer justificado a la izquierda */}
        <View style={styles.drawer}>
          {/* Header Negro */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <MobileLogo variant="light" size="sm" />
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {user?.image ? (
                  <Image source={{ uri: user.image }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={28} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.userText}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || 'Viajero'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || 'correo@ejemplo.com'}
                </Text>
              </View>
            </View>
          </View>

          {/* Menú Scrollable */}
          <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuContent} showsVerticalScrollIndicator={false}>
            {/* Sección VIAJES */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>VIAJES</Text>
              <View style={styles.sectionDivider} />
            </View>

            {travelItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.itemLeft}>
                  <Ionicons name={item.icon as any} size={20} color="#1F2937" />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}

            {/* Sección LEGAL */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>INFORMACIÓN LEGAL</Text>
              <View style={styles.sectionDivider} />
            </View>

            {legalItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.menuItem}
                onPress={() => openUrl(item.url)}
                activeOpacity={0.7}
              >
                <View style={styles.itemLeft}>
                  <Ionicons name={item.icon as any} size={20} color="#1F2937" />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}

            {/* Sección CONFIGURACIÓN */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>CONFIGURACIÓN</Text>
              <View style={styles.sectionDivider} />
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/perfil')}
              activeOpacity={0.7}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="settings-outline" size={20} color="#1F2937" />
                <Text style={styles.itemLabel}>Configuración de Perfil</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </ScrollView>

          {/* Botón Logout */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: primaryColor || '#1D4ED8' }]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: Math.min(width * 0.85, 340),
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeBtn: {
    padding: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1F2937',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userText: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
})

export default DrawerMenu

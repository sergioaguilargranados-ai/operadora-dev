import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Linking,
  Share,
  Alert,
  Dimensions,
  Platform,
} from 'react-native'

const { width } = Dimensions.get('window')
import { Ionicons, Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../store/auth.store'
import { useTenantStore } from '../store/tenant.store'
import MobileLogo from '../components/features/MobileLogo'
import NotificationBell from '../components/features/NotificationBell'
import api from '../services/api'

export default function MobileGroupTripsScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { companyName } = useTenantStore()

  const [referralCode, setReferralCode] = useState('AS-V1589')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchReferral()
    }
  }, [user?.id])

  const fetchReferral = async () => {
    try {
      const res = await api.get(`/mobile/referrals?user_id=${user?.id}`)
      if (res.data?.success && res.data.data?.user) {
        setReferralCode(res.data.data.user.referral_code || 'AS-VIP')
      }
    } catch (e) {
      console.warn('Error loading referrals', e)
    }
  }

  const handleShare = (type: 'whatsapp' | 'facebook' | 'native') => {
    const baseMessage = `¡Te invito a viajar con ${companyName || 'AS Operadora'}! Usa mi código de invitación ${referralCode} al registrarte y obtén beneficios especiales.`
    const registrationUrl = `https://www.as-ope-viajes.company/registro?ref=${referralCode}`

    if (type === 'whatsapp') {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(`${baseMessage} Regístrate aquí: ${registrationUrl}`)}`)
    } else if (type === 'facebook') {
      Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(registrationUrl)}`)
    } else {
      Share.share({
        title: 'Únete a mi grupo de viaje',
        message: `${baseMessage}\n${registrationUrl}`,
      })
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <MobileLogo variant="dark" size="md" />
        <NotificationBell size={24} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Promocional */}
        <View style={styles.bannerWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Título */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Crea tu grupo</Text>
          <Text style={styles.pageSubtitle}>
            Invita a tus amigos y familiares para viajar juntos y desbloquear descuentos y beneficios exclusivos.
          </Text>
        </View>

        {/* Tarjeta de Código de Invitación */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Invita más viajeros</Text>
          <Text style={styles.cardSub}>
            Comparte tu código personal para sumar acompañantes a tu grupo.
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>TU CÓDIGO DE INVITACIÓN</Text>
            <Text style={styles.codeValue}>{referralCode}</Text>
          </View>

          <TouchableOpacity
            style={styles.mainShareBtn}
            onPress={() => handleShare('native')}
            activeOpacity={0.85}
          >
            <Ionicons name="share-social" size={18} color="#FFFFFF" />
            <Text style={styles.mainShareBtnText}>Compartir invitación</Text>
          </TouchableOpacity>

          <Text style={[styles.cardHeading, { marginTop: 16, fontSize: 13, textAlign: 'center' }]}>
            O compartir por red social directa:
          </Text>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: '#25D366' }]}
              onPress={() => handleShare('whatsapp')}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: '#1877F2' }]}
              onPress={() => handleShare('facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: '#E1306C' }]}
              onPress={() => handleShare('native')}
            >
              <Ionicons name="logo-instagram" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Beneficios */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Beneficios de grupo</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIconTile, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="gift-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.benefitText}>Descuentos por volumen</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIconTile, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="airplane-outline" size={20} color="#1D4ED8" />
              </View>
              <Text style={styles.benefitText}>Tours grupales</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIconTile, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="bed-outline" size={20} color="#D97706" />
              </View>
              <Text style={styles.benefitText}>Upgrade de hotel</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIconTile, { backgroundColor: '#FDF2F8' }]}>
                <Ionicons name="trophy-outline" size={20} color="#DB2777" />
              </View>
              <Text style={styles.benefitText}>Viajes gratis</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  bannerWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 160,
    borderRadius: 22,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  pageTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 16,
  },
  codeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  mainShareBtn: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mainShareBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  socialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  benefitItem: {
    width: (width - 84) / 2,
    alignItems: 'center',
    gap: 6,
    padding: 10,
  },
  benefitIconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
})

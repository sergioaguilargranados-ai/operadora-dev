import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Share,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { useAuthStore } from '../../store/auth.store'
import MobileLogo from '../../components/features/MobileLogo'
import NotificationBell from '../../components/features/NotificationBell'
import api from '../../services/api'

export default function MobileRewardsScreen() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'retos' | 'rewards'>('retos')
  const [progress, setProgress] = useState(1450)
  const [loading, setLoading] = useState(false)
  const [challenges, setChallenges] = useState<any[]>([])
  const [referralCode, setReferralCode] = useState('AS-V1589')
  const [referralCount, setReferralCount] = useState(3)
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])
  const [checkingGPS, setCheckingGPS] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadRewardsData()
    }
  }, [user?.id])

  const loadRewardsData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/rewards/challenges?user_id=${user?.id}`)
      if (res.data?.success && Array.isArray(res.data.data)) {
        setChallenges(res.data.data)
      } else {
        // Mock fallback challenges
        setChallenges([
          {
            id: '1',
            name: 'Visita la Plaza Mayor',
            points: 500,
            city: 'Madrid',
            lat: 40.4155,
            lng: -3.7074,
          },
          {
            id: '2',
            name: 'Paseo por el Parque del Retiro',
            points: 800,
            city: 'Madrid',
            lat: 40.4153,
            lng: -3.6845,
          },
          {
            id: '3',
            name: 'Museo Nacional del Prado',
            points: 1000,
            city: 'Madrid',
            lat: 40.4138,
            lng: -3.6921,
          },
        ])
      }

      // Referrals
      const refRes = await api.get(`/mobile/referrals?user_id=${user?.id}`)
      if (refRes.data?.success && refRes.data.data?.user) {
        setReferralCode(refRes.data.data.user.referral_code || 'AS-VIP')
        setReferralCount(refRes.data.data.user.referrals_count || 0)
      }
    } catch (e) {
      console.warn('Error loading rewards', e)
    } finally {
      setLoading(false)
    }
  }

  const handleGPSCheckIn = async (ch: any) => {
    setCheckingGPS(ch.id)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('GPS Requerido', 'Necesitamos tu ubicación para validar tu visita.')
        setCheckingGPS(null)
        return
      }

      // Validar GPS
      await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setCompletedChallenges((prev) => [...prev, ch.id])
      setProgress((prev) => prev + ch.points)
      Alert.alert('¡Check-in Exitoso! 🏆', `Has completado el reto y ganado ${ch.points} puntos.`)
    } catch (e) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual.')
    } finally {
      setCheckingGPS(null)
    }
  }

  const handleShareInvite = (platform: 'whatsapp' | 'facebook' | 'native') => {
    const text = `¡Te invito a viajar con AS Operadora! Usa mi código de invitación ${referralCode} al registrarte y obtén beneficios. https://www.as-ope-viajes.company/registro?ref=${referralCode}`

    if (platform === 'whatsapp') {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`)
    } else if (platform === 'facebook') {
      Linking.openURL(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          `https://www.as-ope-viajes.company/registro?ref=${referralCode}`
        )}`
      )
    } else {
      Share.share({ message: text })
    }
  }

  const MAX_STEPS = 10000
  const percentage = Math.min((progress / MAX_STEPS) * 100, 100)

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Hero Banner */}
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80',
          }}
          style={styles.heroBanner}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />

          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <MobileLogo variant="light" size="sm" />
            <NotificationBell isWhite size={24} />
          </View>

          {/* Hero Details */}
          <View style={styles.heroTextCenter}>
            <Text style={styles.heroMainTitle}>Rewards AS</Text>
            <Text style={styles.heroMainSub}>
              Viaja, explora y gana beneficios exclusivos en cada experiencia.
            </Text>
          </View>
        </ImageBackground>

        {/* 2 Main Tabs: AS Retos | AS Rewards */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'retos' && styles.tabBtnActive]}
            onPress={() => setActiveTab('retos')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="footsteps-outline"
              size={18}
              color={activeTab === 'retos' ? '#111827' : '#9CA3AF'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'retos' && styles.tabBtnTextActive]}>
              AS Retos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'rewards' && styles.tabBtnActive]}
            onPress={() => setActiveTab('rewards')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="gift-outline"
              size={18}
              color={activeTab === 'rewards' ? '#111827' : '#9CA3AF'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'rewards' && styles.tabBtnTextActive]}>
              AS Rewards
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: AS RETOS */}
        {activeTab === 'retos' ? (
          <View style={styles.contentPadding}>
            {/* Tarjeta de Progreso */}
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Tu progreso de pasos</Text>
              <View style={styles.progressRow}>
                <View style={styles.stepCircle}>
                  <Ionicons name="footsteps" size={28} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.progressValue}>
                    {progress.toLocaleString()} <Text style={styles.progressMax}>/ 10,000 pasos</Text>
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {Math.floor(percentage)}% de la meta diaria
                  </Text>
                  {/* Progress bar */}
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* Retos Disponibles */}
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Retos del próximo viaje</Text>
              <Text style={styles.cardSub}>
                Visita los puntos de interés con tu GPS para acumular puntos extras.
              </Text>

              <View style={styles.challengesList}>
                {challenges.map((ch) => {
                  const isDone = completedChallenges.includes(ch.id)
                  const isChecking = checkingGPS === ch.id

                  return (
                    <View key={ch.id} style={styles.challengeItem}>
                      <View style={styles.challengeIcon}>
                        <Ionicons
                          name={isDone ? 'checkmark-circle' : 'trophy-outline'}
                          size={22}
                          color={isDone ? '#10B981' : '#F59E0B'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.challengeTitle}>{ch.name}</Text>
                        <Text style={styles.challengePoints}>+{ch.points} puntos de viaje</Text>
                      </View>

                      {isDone ? (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedBadgeText}>Completado</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.checkInBtn}
                          onPress={() => handleGPSCheckIn(ch)}
                          disabled={isChecking}
                        >
                          {isChecking ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.checkInBtnText}>Check-in GPS</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )
                })}
              </View>
            </View>

            {/* Insignias Obtenidas */}
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Insignias de viajero</Text>
              <View style={styles.badgesGrid}>
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeEmoji}>🥉</Text>
                  <Text style={styles.badgeTitle}>Explorador</Text>
                  <Text style={styles.badgeDesc}>+1,000 pasos</Text>
                </View>
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeEmoji}>🥈</Text>
                  <Text style={styles.badgeTitle}>Aventurero</Text>
                  <Text style={styles.badgeDesc}>3 monumentos</Text>
                </View>
                <View style={[styles.badgeItem, { opacity: 0.5 }]}>
                  <Text style={styles.badgeEmoji}>🥇</Text>
                  <Text style={styles.badgeTitle}>Maestro</Text>
                  <Text style={styles.badgeDesc}>10,000 pasos</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* TAB 2: AS REWARDS (INVITACIONES & REFERIDOS) */
          <View style={styles.contentPadding}>
            {/* Progreso de Invitaciones */}
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Tu progreso de invitaciones</Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min((referralCount / 30) * 100, 100)}%`, backgroundColor: '#111827' },
                  ]}
                />
              </View>
              <Text style={styles.referralStatsText}>
                <Text style={{ fontWeight: '800', color: '#111827', fontSize: 20 }}>
                  {referralCount}
                </Text>{' '}
                / 30 viajeros invitados
              </Text>
              <Text style={styles.cardSub}>
                Invita más amigos y acerca tu próximo viaje a ser completamente gratuito.
              </Text>
            </View>

            {/* Código de Invitación y Compartir */}
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Tu código de invitación</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{referralCode}</Text>
              </View>

              <Text style={[styles.cardHeading, { marginTop: 16, fontSize: 13 }]}>
                Compartir invitación en redes sociales:
              </Text>
              <View style={styles.socialButtonsRow}>
                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: '#25D366' }]}
                  onPress={() => handleShareInvite('whatsapp')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
                  <Text style={styles.socialBtnText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: '#1877F2' }]}
                  onPress={() => handleShareInvite('facebook')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-facebook" size={22} color="#FFFFFF" />
                  <Text style={styles.socialBtnText}>Facebook</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: '#000000' }]}
                  onPress={() => handleShareInvite('native')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="share-social" size={20} color="#FFFFFF" />
                  <Text style={styles.socialBtnText}>Compartir</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tiers de Beneficios */}
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Tus beneficios por nivel</Text>
              <View style={styles.tierItem}>
                <Text style={styles.tierEmoji}>🥉</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tierTitle}>Explorador AS (5 invitados)</Text>
                  <Text style={styles.tierDesc}>Bono de $1,000 MXN para tu próximo tour.</Text>
                </View>
              </View>
              <View style={styles.tierDivider} />
              <View style={styles.tierItem}>
                <Text style={styles.tierEmoji}>🥈</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tierTitle}>Embajador AS (10 invitados)</Text>
                  <Text style={styles.tierDesc}>Bono de $2,500 MXN para tu próximo viaje.</Text>
                </View>
              </View>
              <View style={styles.tierDivider} />
              <View style={styles.tierItem}>
                <Text style={styles.tierEmoji}>💎</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tierTitle}>Leyenda AS (30 invitados)</Text>
                  <Text style={styles.tierDesc}>¡Viaje internacional gratuito!*</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  heroBanner: {
    height: 260,
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
  iconBtn: {
    padding: 4,
  },
  heroTextCenter: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    zIndex: 10,
  },
  heroMainTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroMainSub: {
    fontSize: 13,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 18,
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  tabBtnActive: {
    backgroundColor: '#F3F4F6',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabBtnTextActive: {
    color: '#111827',
    fontWeight: '800',
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },
  stepCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  progressMax: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressPercentage: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  challengesList: {
    gap: 10,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    gap: 10,
  },
  challengeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  challengePoints: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  checkInBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  badgesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 4,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  badgeDesc: {
    fontSize: 10,
    color: '#6B7280',
  },
  referralStatsText: {
    fontSize: 14,
    color: '#4B5563',
    marginVertical: 8,
  },
  codeBox: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#111827',
    fontFamily: 'monospace',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  socialBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  tierEmoji: {
    fontSize: 24,
  },
  tierTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  tierDesc: {
    fontSize: 11,
    color: '#6B7280',
  },
  tierDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
})

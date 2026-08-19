import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import MobileLogo from '../../components/features/MobileLogo'
import NotificationBell from '../../components/features/NotificationBell'
import api from '../../services/api'

export default function MobilePaymentsScreen() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'realizados' | 'pendientes'>('realizados')
  const [payments, setPayments] = useState<any[]>([])
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPending, setLoadingPending] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchPayments()
      fetchPendingPayments()
    }
  }, [user?.id])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/mobile/payments?user_id=${user?.id}`)
      if (res.data?.success) {
        setPayments(res.data.data || [])
      }
    } catch (err) {
      console.warn('Error loading payments', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchPendingPayments = async () => {
    try {
      setLoadingPending(true)
      const res = await api.get(`/mobile/payments/pending?user_id=${user?.id}`)
      if (res.data?.success) {
        setPendingPayments(res.data.data || [])
      }
    } catch (err) {
      console.warn('Error loading pending payments', err)
    } finally {
      setLoadingPending(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchPayments()
    fetchPendingPayments()
  }

  const filteredPayments = payments.filter((p) => {
    if (!search) return true
    const s = search.toLowerCase()
    const idMatch = p.id?.toString().includes(s)
    const amountMatch = p.amount?.toString().includes(s)
    const txMatch = p.transaction_id?.toLowerCase().includes(s)
    return idMatch || amountMatch || txMatch
  })

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <MobileLogo variant="dark" size="md" />
        <NotificationBell size={24} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Título */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Pagos</Text>
          <Text style={styles.pageSubtitle}>Revisa tus pagos, abonos y saldos pendientes.</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'realizados' && styles.tabBtnActive]}
            onPress={() => setActiveTab('realizados')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'realizados' && styles.tabTextActive]}>
              Realizados ({payments.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'pendientes' && styles.tabBtnActive]}
            onPress={() => setActiveTab('pendientes')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'pendientes' && styles.tabTextActive]}>
              Por realizar ({pendingPayments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: REALIZADOS */}
        {activeTab === 'realizados' ? (
          <View style={styles.contentSection}>
            {/* Search Bar */}
            <View style={styles.searchWrapper}>
              <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por monto, recibo, transacción..."
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {loading && !refreshing ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color="#1D4ED8" />
                <Text style={styles.loaderText}>Cargando historial de pagos...</Text>
              </View>
            ) : filteredPayments.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="wallet-outline" size={44} color="#D1D5DB" />
                <Text style={styles.emptyText}>No se encontraron pagos registrados.</Text>
              </View>
            ) : (
              <View style={styles.paymentsList}>
                {filteredPayments.map((p) => (
                  <View key={p.id} style={styles.paymentCard}>
                    <View style={styles.paymentIcon}>
                      <Ionicons name="card-outline" size={24} color="#1D4ED8" />
                    </View>

                    <View style={styles.paymentInfo}>
                      <View style={styles.paymentTopRow}>
                        <Text style={styles.paymentTitle}>Pago #{p.id}</Text>
                        <Text style={styles.paymentAmount}>
                          ${p.amount} {p.currency || 'MXN'}
                        </Text>
                      </View>

                      <Text style={styles.paymentSub} numberOfLines={1}>
                        {p.transaction_id || 'Transferencia directa / Stripe'}
                      </Text>

                      <View style={styles.paymentBottomRow}>
                        <View style={styles.statusIndicator}>
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: p.status === 'completed' ? '#10B981' : '#F59E0B' },
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusLabel,
                              { color: p.status === 'completed' ? '#047857' : '#B45309' },
                            ]}
                          >
                            {p.status === 'completed' ? 'Pagado' : 'Pendiente'}
                          </Text>
                        </View>

                        <Text style={styles.dateLabel}>
                          {new Date(p.created_at).toLocaleDateString('es-MX')}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* TAB 2: POR REALIZAR */
          <View style={styles.contentSection}>
            {loadingPending && !refreshing ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color="#1D4ED8" />
                <Text style={styles.loaderText}>Consultando saldos...</Text>
              </View>
            ) : pendingPayments.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                <Text style={styles.emptyText}>¡Felicidades! No tienes saldos pendientes.</Text>
              </View>
            ) : (
              <View style={styles.paymentsList}>
                {pendingPayments.map((p) => (
                  <View key={p.booking_id} style={styles.pendingCard}>
                    <View style={styles.pendingLeftBar} />

                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>SALDO PENDIENTE</Text>
                    </View>

                    <Text style={styles.pendingDest}>{p.destination || 'Viaje en curso'}</Text>
                    <Text style={styles.pendingRef}>Reserva #{p.booking_id}</Text>

                    <View style={styles.breakdownBox}>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Costo total</Text>
                        <Text style={styles.breakdownValue}>
                          ${Number(p.total_price || 0).toFixed(2)} {p.currency || 'MXN'}
                        </Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Pagado</Text>
                        <Text style={styles.breakdownValue}>
                          ${Number(p.paid_amount || 0).toFixed(2)} {p.currency || 'MXN'}
                        </Text>
                      </View>
                      <View style={styles.breakdownDivider} />
                      <View style={styles.breakdownRow}>
                        <Text style={styles.remainingLabel}>Monto restante</Text>
                        <Text style={styles.remainingValue}>
                          ${Number(p.pending_amount || 0).toFixed(2)} {p.currency || 'MXN'}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.payNowBtn}
                      onPress={() =>
                        router.push(
                          `/pagos/nuevo?bookingId=${p.booking_id}&amount=${p.pending_amount}` as any
                        )
                      }
                      activeOpacity={0.85}
                    >
                      <Ionicons name="card" size={18} color="#FFFFFF" />
                      <Text style={styles.payNowBtnText}>Pagar ahora</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
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
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 32,
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
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  contentSection: {
    paddingHorizontal: 20,
  },
  searchWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: 42,
    paddingRight: 16,
    fontSize: 14,
    color: '#111827',
  },
  loaderBox: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyBox: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  paymentsList: {
    gap: 14,
  },
  paymentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  paymentIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  paymentSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  paymentBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  pendingLeftBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#F59E0B',
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  pendingBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 1,
  },
  pendingDest: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  pendingRef: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  breakdownBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },
  remainingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  remainingValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
  },
  payNowBtn: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  payNowBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})

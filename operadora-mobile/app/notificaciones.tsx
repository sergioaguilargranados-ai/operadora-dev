import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../store/auth.store'
import MobileLogo from '../components/features/MobileLogo'
import api from '../services/api'

export default function MobileNotificationsScreen() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    }
  }, [user?.id])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/mobile/notifications?userId=${user?.id}`)
      if (res.data?.success && Array.isArray(res.data.data)) {
        setNotifications(res.data.data)
      } else {
        // Mock fallback
        setNotifications([
          {
            id: '1',
            title: '¡Tu viaje se acerca!',
            message: 'Recuerda revisar tus documentos de viaje y vuelos en la sección de Itinerario.',
            created_at: new Date().toISOString(),
            is_read: false,
            type: 'trip',
          },
          {
            id: '2',
            title: 'Bienvenido a AS Operadora',
            message: 'Explora nuestros retos y acumula beneficios exclusivos en cada destino.',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            is_read: true,
            type: 'system',
          },
        ])
      }
    } catch (e) {
      console.warn('Error fetching notifications', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    try {
      await api.put(`/mobile/notifications/read-all?userId=${user?.id}`)
    } catch (e) {}
  }

  const getIconForType = (type?: string) => {
    switch (type) {
      case 'trip':
        return { name: 'airplane', color: '#1D4ED8', bg: '#EFF6FF' }
      case 'payment':
        return { name: 'card', color: '#10B981', bg: '#ECFDF5' }
      case 'reward':
        return { name: 'trophy', color: '#F59E0B', bg: '#FEF3C7' }
      default:
        return { name: 'notifications', color: '#111827', bg: '#F3F4F6' }
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
        <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn}>
          <Ionicons name="checkmark-done" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Notificaciones</Text>
          <Text style={styles.pageSubtitle}>
            Entérate de las novedades, recordatorios y actualizaciones de tu viaje.
          </Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={styles.loaderText}>Cargando notificaciones...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No tienes notificaciones pendientes.</Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notif) => {
              const iconInfo = getIconForType(notif.type)

              return (
                <View
                  key={notif.id}
                  style={[styles.notifCard, !notif.is_read && styles.notifCardUnread]}
                >
                  <View style={[styles.notifIconTile, { backgroundColor: iconInfo.bg }]}>
                    <Ionicons name={iconInfo.name as any} size={20} color={iconInfo.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.notifHeaderRow}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      {!notif.is_read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMsg}>{notif.message}</Text>
                    <Text style={styles.notifDate}>
                      {new Date(notif.created_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              )
            })}
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
  iconBtn: {
    padding: 4,
  },
  readAllBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  titleSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  loaderBox: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyBox: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  notificationsList: {
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  notifCardUnread: {
    borderColor: '#DBEAFE',
    backgroundColor: '#F8FAFC',
  },
  notifIconTile: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D4ED8',
    marginLeft: 6,
  },
  notifMsg: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 6,
  },
  notifDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
})

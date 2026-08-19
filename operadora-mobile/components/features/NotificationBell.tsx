import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import api from '../../services/api'

interface NotificationBellProps {
  isWhite?: boolean
  size?: number
  onPress?: () => void
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  isWhite = false,
  size = 24,
  onPress,
}) => {
  const router = useRouter()
  const { user } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    const fetchUnread = async () => {
      try {
        const res = await api.get(`/mobile/notifications?userId=${user.id}`)
        if (res.data?.success && Array.isArray(res.data.data)) {
          const unread = res.data.data.filter((n: any) => !n.is_read).length
          setUnreadCount(unread)
        }
      } catch (e) {
        // silent
      }
    }

    fetchUnread()
  }, [user?.id])

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.push('/notificaciones' as any)
    }
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container} activeOpacity={0.7}>
      <Ionicons
        name="notifications-outline"
        size={size}
        color={isWhite ? '#FFFFFF' : '#111827'}
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <View style={styles.dot} />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 6,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  dot: {
    width: '100%',
    height: '100%',
  },
})

export default NotificationBell

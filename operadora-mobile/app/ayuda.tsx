import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTenantStore } from '../store/tenant.store'
import MobileLogo from '../components/features/MobileLogo'
import NotificationBell from '../components/features/NotificationBell'

export default function MobileHelpScreen() {
  const router = useRouter()
  const { helpPhone, companyName } = useTenantStore()

  const phone = helpPhone || '+525512345678'
  const cleanPhone = phone.replace(/[^0-9+]/g, '')

  const openWhatsApp = (msg: string) => {
    Linking.openURL(`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(msg)}`)
  }

  const openCall = () => {
    Linking.openURL(`tel:${cleanPhone}`)
  }

  const helpTopics = [
    {
      title: 'Estoy perdido',
      desc: 'Localiza tu posición actual y traza la ruta hacia tu hotel o punto de encuentro.',
      icon: 'navigate-outline',
      action: () => router.push('/(tabs)/mapa' as any),
    },
    {
      title: 'No sé qué actividades hacer',
      desc: 'Descubre experiencias, gastronomía y paseos recomendados para tu destino.',
      icon: 'compass-outline',
      action: () => router.push('/actividades' as any),
    },
    {
      title: 'Perdí mi tour / guía',
      desc: 'Comunícate de emergencia con la coordinación del viaje para reencontrarte.',
      icon: 'alert-circle-outline',
      action: () =>
        openWhatsApp('¡URGENTE! He perdido a mi grupo o guía de tour. Necesito asistencia.'),
    },
    {
      title: 'Problemas con mi equipaje',
      desc: 'Te asesoramos en el reclamo de equipaje demorado o extraviado con la aerolínea.',
      icon: 'briefcase-outline',
      action: () =>
        openWhatsApp('Hola, necesito asistencia con una incidencia en mi equipaje.'),
    },
  ]

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Título */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.pageSubtitle}>
            ¿En qué podemos apoyarte hoy? Elige una opción rápida o contacta a nuestro equipo de soporte 24/7.
          </Text>
        </View>

        {/* Tarjeta Call Center 24/7 */}
        <View style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <View style={styles.supportIcon}>
              <Feather name="headphones" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Atención al Viajero 24/7</Text>
              <Text style={styles.supportSubtitle}>
                Equipo de guardia {companyName || 'AS Operadora'}
              </Text>
            </View>
          </View>

          <View style={styles.supportButtonsRow}>
            <TouchableOpacity
              style={styles.waBtn}
              onPress={() => openWhatsApp('Hola, necesito apoyo con mi viaje en curso.')}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.waBtnText}>WhatsApp 24/7</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.callBtn} onPress={openCall} activeOpacity={0.85}>
              <Ionicons name="call-outline" size={18} color="#111827" />
              <Text style={styles.callBtnText}>Llamar directo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preguntas / Problemas Frecuentes */}
        <Text style={styles.sectionHeading}>Asistencia en viaje</Text>
        <View style={styles.topicsList}>
          {helpTopics.map((topic, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.topicCard}
              onPress={topic.action}
              activeOpacity={0.7}
            >
              <View style={styles.topicIconTile}>
                <Ionicons name={topic.icon as any} size={22} color="#111827" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDesc} numberOfLines={2}>
                  {topic.desc}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  titleSection: {
    marginBottom: 20,
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
  supportCard: {
    backgroundColor: '#000000',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  supportSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  supportButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  waBtn: {
    flex: 1,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  waBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  callBtnText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  topicsList: {
    gap: 12,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  topicIconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  topicDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
})

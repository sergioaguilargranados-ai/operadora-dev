import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
} from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useAuthStore } from '../../store/auth.store'
import MobileLogo from '../../components/features/MobileLogo'
import NotificationBell from '../../components/features/NotificationBell'
import BiometricService from '../../services/biometric.service'
import api from '../../services/api'

export default function MobileProfilePage() {
  const router = useRouter()
  const { user, logout, setUser } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [wantsInsurance, setWantsInsurance] = useState(false)
  const [biometricsEnabled, setBiometricsEnabled] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchProfile()
        checkBio()
      }
    }, [user?.id])
  )

  const checkBio = async () => {
    const isEn = await BiometricService.isBiometricEnabled()
    setBiometricsEnabled(isEn)
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/mobile/profile?user_id=${user?.id}&t=${Date.now()}`)
      if (res.data?.success) {
        const data = res.data.data
        setProfileData(data)
        setWantsInsurance(Boolean(data.wants_travel_insurance))
      }
    } catch (err) {
      console.warn('Error loading profile', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleInsurance = async (val: boolean) => {
    setWantsInsurance(val)
    try {
      await api.put('/mobile/profile', {
        id: user?.id,
        wants_travel_insurance: val,
      })
    } catch (e) {
      console.warn('Error updating insurance preference', e)
    }
  }

  const toggleBiometrics = async (val: boolean) => {
    setBiometricsEnabled(val)
    await BiometricService.setBiometricEnabled(val)
  }

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para cambiar tu avatar.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri
        setUploadingImage(true)

        // Upload to server
        const formData = new FormData()
        const filename = uri.split('/').pop() || 'avatar.jpg'
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : 'image/jpeg'

        formData.append('file', {
          uri,
          name: filename,
          type,
        } as any)

        const uploadRes = await api.post('/admin/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (uploadRes.data?.success && uploadRes.data?.url) {
          const newUrl = uploadRes.data.url
          await api.put('/mobile/profile', { id: user?.id, image: newUrl })
          setProfileData((prev: any) => ({ ...prev, image: newUrl }))
          if (user) {
            setUser({ ...user, image: newUrl })
          }
          Alert.alert('Éxito', 'Foto de perfil actualizada.')
        }
      }
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo subir la foto de perfil.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.replace('/(auth)/login')
    } catch (e) {
      console.error('Error logging out:', e)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Oscuro */}
        <View style={styles.darkHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <MobileLogo variant="light" size="md" />
            <NotificationBell isWhite size={24} />
          </View>

          <View style={styles.profileHeaderContent}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.headerTitle}>Perfil</Text>
              <Text style={styles.headerSubtitle}>
                Consulta y gestiona tu información personal y de viaje.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handlePickAvatar}
              style={styles.avatarWrapper}
              activeOpacity={0.8}
            >
              {uploadingImage ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : profileData?.image || user?.image ? (
                <Image
                  source={{ uri: profileData?.image || user?.image }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={36} color="#FFFFFF" />
              )}
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenido Principal Sobrepuesto */}
        <View style={styles.mainContent}>
          {loading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color="#1D4ED8" />
              <Text style={styles.loaderText}>Cargando perfil...</Text>
            </View>
          ) : (
            <>
              {/* Tarjeta de Información Personal (Clic para Editar) */}
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.navRow}
                  onPress={() => router.push('/perfil/editar' as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name="person" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemLabel}>NOMBRE</Text>
                    <Text style={styles.itemValue}>{profileData?.name || user?.name || 'No registrado'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.cardDivider} />

                <TouchableOpacity
                  style={styles.navRow}
                  onPress={() => router.push('/perfil/editar' as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemLabel}>FECHA DE NACIMIENTO</Text>
                    <Text style={styles.itemValue}>
                      {profileData?.date_of_birth
                        ? new Date(profileData.date_of_birth).toLocaleDateString('es-MX')
                        : 'No registrado'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.cardDivider} />

                <TouchableOpacity
                  style={styles.navRow}
                  onPress={() => router.push('/perfil/editar' as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name="mail" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemLabel}>CORREO ELECTRÓNICO</Text>
                    <Text style={styles.itemValue}>{profileData?.email || user?.email || 'No registrado'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.cardDivider} />

                <TouchableOpacity
                  style={styles.navRow}
                  onPress={() => router.push('/perfil/editar' as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name="call" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemLabel}>TELÉFONO</Text>
                    <Text style={styles.itemValue}>{profileData?.phone || user?.phone || 'No registrado'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Preferencias de Viaje & Seguridad */}
              <View style={styles.card}>
                <View style={styles.cardItemWithAction}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemLabel}>SEGURO DE VIAJERO</Text>
                    <Text style={styles.itemValue}>
                      {wantsInsurance ? 'Solicitado para próximos viajes' : 'No solicitado'}
                    </Text>
                  </View>
                  <Switch
                    value={wantsInsurance}
                    onValueChange={toggleInsurance}
                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                  />
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardItemWithAction}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="finger-print" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemLabel}>AUTENTICACIÓN BIOMÉTRICA</Text>
                    <Text style={styles.itemValue}>Face ID / Huella digital</Text>
                  </View>
                  <Switch
                    value={biometricsEnabled}
                    onValueChange={toggleBiometrics}
                    trackColor={{ false: '#E5E7EB', true: '#1D4ED8' }}
                  />
                </View>
              </View>

              {/* Documentos & Contraseña */}
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.navRow}
                  onPress={() => router.push('/perfil/documentos' as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name="document-text" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemLabel}>DOCUMENTACIÓN DE VIAJE</Text>
                    <Text style={styles.itemValue}>Pasaportes, visas y seguros</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.cardDivider} />

                <TouchableOpacity
                  style={styles.navRow}
                  onPress={() => router.push('/perfil/password' as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemLabel}>CAMBIAR CONTRASEÑA</Text>
                    <Text style={styles.itemValue}>Actualiza tu clave de acceso</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Botón Logout */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  darkHeader: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 48,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconBtn: {
    padding: 4,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  avatarWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1F2937',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    paddingVertical: 2,
  },
  mainContent: {
    paddingHorizontal: 16,
    marginTop: -20,
    gap: 14,
  },
  loaderBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
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
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  cardItemWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 6,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
})

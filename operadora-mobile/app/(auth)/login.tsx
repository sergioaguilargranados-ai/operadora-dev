import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useTenantStore } from '../../store/tenant.store'
import MobileLogo from '../../components/features/MobileLogo'
import BiometricService from '../../services/biometric.service'
import api from '../../services/api'

export default function LoginScreen() {
  const router = useRouter()
  const { login, isLoading: authLoading, error: authError, clearError } = useAuthStore()
  const { primaryColor, loadTenant } = useTenantStore()

  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tenantConfig, setTenantConfig] = useState<any>(null)
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)

  useEffect(() => {
    loadTenant(1)
    checkBiometrics()
  }, [])

  const checkBiometrics = async () => {
    const available = await BiometricService.isAvailable()
    setIsBiometricAvailable(available)
  }

  const handleNextStep = async () => {
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await api.get(`/mobile/tenant-lookup?email=${encodeURIComponent(email.trim())}`)
      if (res.data?.success && res.data?.data) {
        setTenantConfig(res.data.data)
        setStep(2)
      } else {
        setStep(2)
      }
    } catch (err) {
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!password) {
      setError('Ingresa tu contraseña')
      return
    }

    if (tenantConfig && !tenantConfig.has_accepted_terms && !acceptedTerms) {
      setError('Debes aceptar los Términos y Condiciones para continuar.')
      return
    }

    setError('')
    clearError()
    setLoading(true)

    try {
      const success = await login({
        email: email.trim(),
        password,
        accepted_terms: acceptedTerms,
      })

      if (success) {
        if (isBiometricAvailable) {
          const isEnrolled = await BiometricService.isEnrolled()
          if (isEnrolled) {
            Alert.alert(
              'Activar Biometría',
              '¿Deseas activar Face ID / Huella para inicios de sesión rápidos?',
              [
                { text: 'No por ahora', style: 'cancel' },
                {
                  text: 'Activar',
                  onPress: () => BiometricService.setBiometricEnabled(true),
                },
              ]
            )
          }
        }
        router.replace('/(tabs)')
      } else {
        setError(authError || 'Contraseña incorrecta o usuario no encontrado')
      }
    } catch (err: any) {
      setError('Ocurrió un error. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    const success = await BiometricService.authenticate()
    if (success) {
      router.replace('/(tabs)')
    }
  }

  const activeColor = step === 1 ? '#000000' : ((tenantConfig?.primary_color) || primaryColor || '#000000')

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Botón Volver en Step 2 */}
          {step === 2 && (
            <TouchableOpacity
              onPress={() => {
                setStep(1)
                setPassword('')
                setError('')
              }}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          )}

          {/* Logo Principal */}
          <View style={styles.logoWrapper}>
            <MobileLogo variant="dark" size="lg" />
          </View>

          {/* Textos de Bienvenida */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Bienvenido de nuevo</Text>
            <Text style={styles.welcomeSubtitle}>
              {step === 1 ? 'Inicia sesión para continuar' : `Ingresando como ${email}`}
            </Text>
          </View>

          {/* Mensajes de Error */}
          {(error || authError) && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error || authError}</Text>
            </View>
          )}

          {/* Formulario */}
          {step === 1 ? (
            /* STEP 1: EMAIL */
            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(txt) => {
                    setEmail(txt)
                    setError('')
                  }}
                  placeholder="Ingresa tu correo electrónico"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          ) : (
            /* STEP 2: PASSWORD */
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  value={password}
                  onChangeText={(txt) => {
                    setPassword(txt)
                    setError('')
                  }}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {/* Checkbox Términos */}
              {tenantConfig && !tenantConfig.has_accepted_terms && (
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={acceptedTerms ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={acceptedTerms ? activeColor : '#9CA3AF'}
                  />
                  <Text style={styles.termsText}>
                    Acepto los Términos y Condiciones y Aviso de Privacidad
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Botón de Acción Principal */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: activeColor }]}
            onPress={step === 1 ? handleNextStep : handleLogin}
            disabled={loading || authLoading}
            activeOpacity={0.85}
          >
            {loading || authLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>{step === 1 ? 'Siguiente' : 'Iniciar sesión'}</Text>
            )}
          </TouchableOpacity>

          {/* Acceso Biométrico */}
          {isBiometricAvailable && step === 1 && (
            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={handleBiometricLogin}
              activeOpacity={0.7}
            >
              <Ionicons name="finger-print-outline" size={24} color="#111827" />
              <Text style={styles.biometricText}>Iniciar con Huella / Face ID</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Imagen decorativa inferior (Santorini) con difuminado suave idéntico a PWA */}
        <View style={styles.bottomHero}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.bottomImage}
            resizeMode="cover"
          />
          {/* Difuminado superior idéntico a PWA (from-white via-transparent to-transparent) */}
          <LinearGradient
            colors={['#FFFFFF', 'rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.3)', 'transparent']}
            locations={[0, 0.25, 0.6, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.versionFooter}>
            <Text style={styles.versionText}>
              v2.375 | Build: {new Date().toLocaleDateString('es-MX')}, 10:22:54 p.m. CST
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 54,
    left: 24,
    zIndex: 10,
    padding: 4,
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  welcomeTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 15,
    color: '#111827',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  submitBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bottomHero: {
    height: 210,
    width: '100%',
    position: 'relative',
    marginTop: 12,
  },
  bottomImage: {
    width: '100%',
    height: '100%',
  },
  versionFooter: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})


import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useStripe } from '../../services/stripe'
import MobileLogo from '../../components/features/MobileLogo'
import api from '../../services/api'

export default function MobileNewPaymentScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ bookingId?: string; amount?: string }>()
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const [bookingId, setBookingId] = useState(params.bookingId || '')
  const [amount, setAmount] = useState(params.amount || '500')
  const [loading, setLoading] = useState(false)

  const handlePayWithStripe = async () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Monto inválido', 'Por favor ingresa un monto válido para pagar.')
      return
    }

    setLoading(true)
    try {
      // 1. Obtener PaymentIntent clientSecret del backend
      const res = await api.post('/payments/stripe/create-intent', {
        amount: numAmount,
        currency: 'mxn',
        bookingId: bookingId || '1',
      })

      const clientSecret = res.data?.clientSecret || res.data?.data?.clientSecret

      if (!clientSecret) {
        throw new Error('No se pudo inicializar la pasarela de pago.')
      }

      // 2. Inicializar Stripe PaymentSheet con Google Pay
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'AS Operadora',
        googlePay: {
          merchantCountryCode: 'MX',
          currencyCode: 'MXN',
          testEnv: true,
        },
        allowsDelayedPaymentMethods: false,
      })

      if (initError) {
        Alert.alert('Error', initError.message)
        setLoading(false)
        return
      }

      // 3. Presentar PaymentSheet nativo
      const { error: presentError } = await presentPaymentSheet()

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Pago no completado', presentError.message)
        }
      } else {
        Alert.alert('¡Pago Exitoso!', 'Tu abono ha sido procesado correctamente.', [
          { text: 'Aceptar', onPress: () => router.replace('/pagos' as any) },
        ])
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Ocurrió un error al procesar el pago.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <MobileLogo variant="dark" size="md" />
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Realizar pago</Text>
          <Text style={styles.pageSubtitle}>
            Paga de forma segura mediante tarjeta bancaria o Google Pay.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Número de Reserva</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 12345"
              placeholderTextColor="#9CA3AF"
              value={bookingId}
              onChangeText={setBookingId}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Monto a pagar (MXN)</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.secureBanner}>
            <Ionicons name="shield-checkmark" size={18} color="#10B981" />
            <Text style={styles.secureText}>
              Pagos encriptados de extremo a extremo con Stripe.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.payBtn}
            onPress={handlePayWithStripe}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                <Text style={styles.payBtnText}>Pagar con Tarjeta / Google Pay</Text>
              </>
            )}
          </TouchableOpacity>
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
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  secureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  secureText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
    flex: 1,
  },
  payBtn: {
    backgroundColor: '#000000',
    height: 54,
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
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})

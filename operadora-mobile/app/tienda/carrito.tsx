import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useStripe } from '../../services/stripe'
import { useCartStore } from '../../store/cart.store'
import { useAuthStore } from '../../store/auth.store'
import MobileLogo from '../../components/features/MobileLogo'
import api from '../../services/api'

export default function MobileCartScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { items, updateQuantity, removeFromCart, clearCart, getTotal } = useCartStore()
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const [loading, setLoading] = useState(false)
  const total = getTotal()

  const handleCheckout = async () => {
    if (items.length === 0) return
    if (!user?.id) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para completar la compra.')
      return
    }

    setLoading(true)
    try {
      // 1. Crear PaymentIntent en backend
      const res = await api.post('/payments/stripe/create-intent', {
        amount: total,
        currency: 'mxn',
        bookingId: 'store_order_' + Date.now(),
      })

      const clientSecret = res.data?.clientSecret || res.data?.data?.clientSecret
      if (!clientSecret) {
        throw new Error('No se pudo inicializar la pasarela de pago.')
      }

      // 2. Init Stripe Sheet
      const { error: initErr } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'AS Operadora Tienda',
        googlePay: { merchantCountryCode: 'MX', currencyCode: 'MXN', testEnv: true },
      })

      if (initErr) {
        Alert.alert('Error', initErr.message)
        setLoading(false)
        return
      }

      // 3. Present Sheet
      const { error: presentErr } = await presentPaymentSheet()

      if (presentErr) {
        if (presentErr.code !== 'Canceled') {
          Alert.alert('Error', presentErr.message)
        }
      } else {
        // Registrar orden en backend
        try {
          await api.post('/store/orders', {
            user_id: user.id,
            total,
            items: items.map((i) => ({ product_id: i.id, quantity: i.quantity, price: i.price })),
          })
        } catch (e) {}

        clearCart()
        Alert.alert('¡Compra Exitosa! 🎉', 'Tu pedido ha sido registrado con éxito.', [
          { text: 'Aceptar', onPress: () => router.replace('/tienda' as any) },
        ])
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo procesar la compra.')
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Mi Carrito</Text>
          <Text style={styles.pageSubtitle}>
            {items.length} {items.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyCartBox}>
            <Ionicons name="cart-outline" size={54} color="#D1D5DB" />
            <Text style={styles.emptyCartTitle}>Tu carrito está vacío</Text>
            <Text style={styles.emptyCartSub}>
              Explora nuestra tienda y encuentra artículos ideales para tu próximo viaje.
            </Text>
            <TouchableOpacity
              style={styles.exploreStoreBtn}
              onPress={() => router.replace('/tienda' as any)}
            >
              <Text style={styles.exploreStoreBtnText}>Explorar tienda</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                <Image source={{ uri: item.image_url }} style={styles.cartImage} resizeMode="cover" />
                <View style={styles.cartInfo}>
                  <View style={styles.cartHeaderRow}>
                    <Text style={styles.cartItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cartPrice}>${item.price} MXN</Text>

                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={14} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={14} color="#111827" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Resumen de Compra */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryVal}>${total.toFixed(2)} MXN</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={[styles.summaryVal, { color: '#10B981', fontWeight: '700' }]}>
                  Gratis
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total a pagar</Text>
                <Text style={styles.totalVal}>${total.toFixed(2)} MXN</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleCheckout}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                    <Text style={styles.checkoutBtnText}>Pagar con Tarjeta / Google Pay</Text>
                  </>
                )}
              </TouchableOpacity>
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
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyCartBox: {
    paddingVertical: 60,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    paddingHorizontal: 24,
  },
  emptyCartTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyCartSub: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreStoreBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  exploreStoreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  itemsList: {
    gap: 14,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  cartImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },
  cartInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    paddingRight: 6,
  },
  cartPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  summaryCard: {
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
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  checkoutBtn: {
    backgroundColor: '#000000',
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCartStore } from '../../store/cart.store'
import MobileLogo from '../../components/features/MobileLogo'
import NotificationBell from '../../components/features/NotificationBell'
import api from '../../services/api'

const { width } = Dimensions.get('window')

export default function MobileStoreScreen() {
  const router = useRouter()
  const { addToCart, getItemCount } = useCartStore()
  const cartCount = getItemCount()

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const categories = ['Todos', 'Equipaje', 'Accesorios', 'Viaje', 'Tecnología']

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/store-products?tenant_id=1')
      if (res.data?.success && Array.isArray(res.data.data)) {
        setProducts(res.data.data.filter((p: any) => p.status === 'active'))
      } else {
        // Fallback mock products
        setProducts([
          {
            id: '1',
            name: 'Maleta Carry-On Premium',
            description: 'Maleta rígida con ruedas 360 y candado TSA.',
            price: 1899,
            offer_price: 1599,
            category: 'Equipaje',
            image_url: 'https://images.unsplash.com/photo-1581553680321-4fffae59f42a?auto=format&fit=crop&w=400&q=80',
          },
          {
            id: '2',
            name: 'Adaptador Universal de Viaje',
            description: 'Compatible con enchufes de más de 150 países.',
            price: 499,
            offer_price: 399,
            category: 'Tecnología',
            image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
          },
          {
            id: '3',
            name: 'Almohada Ergonómica Memory Foam',
            description: 'Descanso perfecto para vuelos largos y traslados.',
            price: 599,
            category: 'Accesorios',
            image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80',
          },
          {
            id: '4',
            name: 'Botella Térmica de Acero 750ml',
            description: 'Mantiene bebidas frías 24h y calientes 12h.',
            price: 349,
            category: 'Viaje',
            image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80',
          },
        ])
      }
    } catch (err) {
      console.warn('Error fetching products', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: any) => {
    addToCart(product)
    Alert.alert('Agregado', `${product.name} ha sido agregado a tu carrito.`)
  }

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'Todos' || p.category === activeCategory
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <View style={styles.container}>
      {/* Header Oscuro */}
      <View style={styles.darkHeader}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <MobileLogo variant="light" size="md" />
          <View style={styles.topRightIcons}>
            <NotificationBell isWhite size={22} />
            <TouchableOpacity
              onPress={() => router.push('/tienda/carrito' as any)}
              style={styles.cartIconBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.storeHeaderContent}>
          <Text style={styles.headerTitle}>Tienda</Text>
          <Text style={styles.headerSubtitle}>
            Descubre productos y accesorios pensados para tu viaje.
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Buscador */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categorías Horizontales */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid de Productos */}
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={styles.loaderText}>Cargando catálogo...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="bag-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No hay productos disponibles en esta categoría.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((p) => (
              <View key={p.id} style={styles.productCard}>
                <Image source={{ uri: p.image_url }} style={styles.productImage} resizeMode="cover" />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.productDesc} numberOfLines={2}>
                    {p.description}
                  </Text>

                  <View style={styles.priceRow}>
                    <View>
                      {p.offer_price ? (
                        <>
                          <Text style={styles.offerPrice}>${p.offer_price}</Text>
                          <Text style={styles.originalPrice}>${p.price}</Text>
                        </>
                      ) : (
                        <Text style={styles.price}>${p.price}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.addCartBtn}
                      onPress={() => handleAddToCart(p)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="cart" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
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
  darkHeader: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBtn: {
    padding: 4,
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartIconBtn: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  storeHeaderContent: {
    marginTop: 4,
  },
  headerTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: 42,
    paddingRight: 16,
    fontSize: 14,
    color: '#111827',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryChipActive: {
    backgroundColor: '#000000',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
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
  grid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  productDesc: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  offerPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 10,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addCartBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

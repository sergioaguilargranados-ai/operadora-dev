import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useAuthStore } from '../../store/auth.store'
import MobileLogo from '../../components/features/MobileLogo'
import NotificationBell from '../../components/features/NotificationBell'
import FoodDetailModal from '../../components/features/FoodDetailModal'
import PlaceDetailModal from '../../components/features/PlaceDetailModal'
import api from '../../services/api'

export default function WishlistScreen() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'place' | 'food' | 'souvenir'>('all')

  // Modales de detalle
  const [selectedFood, setSelectedFood] = useState<any>(null)
  const [selectedPlace, setSelectedPlace] = useState<any>(null)

  // Modal agregar item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newType, setNewType] = useState<'place' | 'food' | 'souvenir'>('place')
  const [newDest, setNewDest] = useState('')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newImg, setNewImg] = useState('')
  const [uploadingImg, setUploadingImg] = useState(false)
  const [savingItem, setSavingItem] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchWishlist()
    }
  }, [user?.id])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/wishlist?userId=${user?.id}`)
      if (res.data?.success && Array.isArray(res.data.data)) {
        setItems(res.data.data)
      }
    } catch (e) {
      console.warn('Error fetching wishlist', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    try {
      await api.delete(`/wishlist?id=${id}`)
    } catch (err) {
      fetchWishlist()
    }
  }

  const handlePickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      })

      if (!res.canceled && res.assets?.[0]?.uri) {
        const uri = res.assets[0].uri
        setUploadingImg(true)

        const formData = new FormData()
        const filename = uri.split('/').pop() || 'wishlist.jpg'
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : 'image/jpeg'

        formData.append('file', { uri, name: filename, type } as any)

        const uploadRes = await api.post('/admin/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (uploadRes.data?.success && uploadRes.data?.url) {
          setNewImg(uploadRes.data.url)
        }
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar la imagen.')
    } finally {
      setUploadingImg(false)
    }
  }

  const handleSaveItem = async () => {
    if (!newName.trim() || !newDest.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa el nombre y el destino.')
      return
    }

    setSavingItem(true)
    try {
      const fallbackImgs = {
        food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        place: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80',
        souvenir: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80',
      }

      await api.post('/wishlist', {
        user_id: user?.id,
        item_name: newName.trim(),
        item_desc: newDesc.trim(),
        item_img: newImg || fallbackImgs[newType],
        city: newDest.trim(),
        category: newType,
      })

      setIsAddModalOpen(false)
      setNewName('')
      setNewDest('')
      setNewDesc('')
      setNewImg('')
      fetchWishlist()
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el elemento.')
    } finally {
      setSavingItem(false)
    }
  }

  const filteredItems =
    filter === 'all' ? items : items.filter((i) => (i.category || 'souvenir') === filter)

  // Group by city
  const groupedItems = filteredItems.reduce((acc, item) => {
    const city = item.city || 'Otros'
    if (!acc[city]) acc[city] = []
    acc[city].push(item)
    return acc
  }, {} as Record<string, any[]>)

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Título & Botón Agregar */}
        <View style={styles.titleSection}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={styles.pageTitle}>Mi Wishlist</Text>
            <Text style={styles.pageSubtitle}>
              Guarda tus artículos favoritos y encuéntralos aquí cuando los necesites.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setIsAddModalOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.addIconCircle}>
              <Ionicons name="add" size={22} color="#111827" />
            </View>
            <Text style={styles.addBtnLabel}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'place', label: 'Lugares' },
            { id: 'food', label: 'Comida' },
            { id: 'souvenir', label: 'Souvenirs' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
              onPress={() => setFilter(f.id as any)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de Items Agrupados */}
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={styles.loaderText}>Cargando favoritos...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Aún no hay elementos en tu Wishlist.</Text>
          </View>
        ) : (
          <View style={styles.groupedList}>
            {Object.keys(groupedItems).map((city) => (
              <View key={city} style={styles.citySection}>
                <View style={styles.cityHeader}>
                  <Ionicons name="location" size={18} color="#111827" />
                  <Text style={styles.cityTitle}>{city}</Text>
                  <Text style={styles.cityCount}>{groupedItems[city].length} guardados</Text>
                </View>

                <View style={styles.itemsList}>
                  {groupedItems[city].map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.itemCard}
                      onPress={() => {
                        const cat = item.category || 'souvenir'
                        if (cat === 'food') {
                          setSelectedFood({
                            name: item.item_name,
                            desc: item.item_desc,
                            img: item.item_img,
                            location: item.city,
                          })
                        } else {
                          setSelectedPlace({
                            name: item.item_name,
                            desc: item.item_desc,
                            img: item.item_img,
                            location: item.city,
                            category: cat === 'place' ? 'Lugar' : 'Souvenir',
                          })
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: item.item_img }} style={styles.itemImage} />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.item_name}
                        </Text>
                        <Text style={styles.itemCity}>{item.city}</Text>
                        <Text style={styles.itemDesc} numberOfLines={2}>
                          {item.item_desc || 'Guardado desde tu experiencia'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        style={styles.heartBtn}
                      >
                        <Ionicons name="heart" size={22} color="#EF4444" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Agregar Item */}
      <Modal visible={isAddModalOpen} transparent animationType="slide" onRequestClose={() => setIsAddModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar a tu wishlist</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Selector de Tipo */}
              <View style={styles.typeSelector}>
                {(['place', 'food', 'souvenir'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, newType === t && styles.typeBtnActive]}
                    onPress={() => setNewType(t)}
                  >
                    <Text style={[styles.typeBtnText, newType === t && styles.typeBtnTextActive]}>
                      {t === 'place' ? 'Lugar' : t === 'food' ? 'Comida' : 'Souvenir'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Destino / Ciudad</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. Madrid, España"
                placeholderTextColor="#9CA3AF"
                value={newDest}
                onChangeText={setNewDest}
              />

              <Text style={styles.formLabel}>Nombre</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. Museo del Prado / Paella"
                placeholderTextColor="#9CA3AF"
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.formLabel}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.formInput, { height: 72, textAlignVertical: 'top' }]}
                placeholder="Detalles para recordar..."
                placeholderTextColor="#9CA3AF"
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
              />

              <Text style={styles.formLabel}>Foto (opcional)</Text>
              <TouchableOpacity style={styles.imagePickerBox} onPress={handlePickImage}>
                {uploadingImg ? (
                  <ActivityIndicator color="#1D4ED8" />
                ) : newImg ? (
                  <Image source={{ uri: newImg }} style={styles.previewImage} />
                ) : (
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Ionicons name="camera-outline" size={24} color="#6B7280" />
                    <Text style={styles.imagePickerText}>Seleccionar foto de galería</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveItemBtn}
                onPress={handleSaveItem}
                disabled={savingItem}
              >
                {savingItem ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveItemBtnText}>Guardar en Wishlist</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modales de Detalle */}
      <FoodDetailModal isOpen={!!selectedFood} onClose={() => setSelectedFood(null)} food={selectedFood} />
      <PlaceDetailModal isOpen={!!selectedPlace} onClose={() => setSelectedPlace(null)} place={selectedPlace} />
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
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    lineHeight: 18,
  },
  addBtn: {
    alignItems: 'center',
    gap: 2,
  },
  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#000000',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterChipTextActive: {
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
  groupedList: {
    paddingHorizontal: 20,
    gap: 20,
  },
  citySection: {
    gap: 12,
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 6,
  },
  cityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  cityCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  itemCity: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  itemDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  heartBtn: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeBtnActive: {
    backgroundColor: '#000000',
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  formInput: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#111827',
    marginBottom: 14,
  },
  imagePickerBox: {
    height: 90,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  imagePickerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  saveItemBtn: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveItemBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})

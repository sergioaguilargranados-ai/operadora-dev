import React from 'react'
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const { width, height } = Dimensions.get('window')

interface PlaceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  place: {
    name: string
    desc?: string
    description?: string
    img?: string
    image?: string
    location?: string
    category?: string
    lat?: number
    lng?: number
    gallery?: string[]
  } | null
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  isOpen,
  onClose,
  place,
}) => {
  if (!place) return null

  const image = place.img || place.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80'
  const description = place.desc || place.description || 'Punto de interés turístico imperdible.'

  const handleOpenDirections = () => {
    if (place.lat && place.lng) {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`)
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.location || ''}`)}`)
    }
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 32 }}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{place.category?.toUpperCase() || 'LUGAR TURÍSTICO'}</Text>
            </View>

            <Text style={styles.title}>{place.name}</Text>
            {place.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color="#111827" />
                <Text style={styles.locationText}>{place.location}</Text>
              </View>
            )}

            <Text style={styles.desc}>{description}</Text>

            {/* Galería si existe */}
            {place.gallery && place.gallery.length > 0 && (
              <View style={styles.gallerySection}>
                <Text style={styles.sectionTitle}>Galería de fotos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
                  {place.gallery.map((imgUrl, idx) => (
                    <Image key={idx} source={{ uri: imgUrl }} style={styles.galleryImg} />
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.directionsBtn} onPress={handleOpenDirections} activeOpacity={0.8}>
              <Ionicons name="navigate-outline" size={18} color="#FFFFFF" />
              <Text style={styles.directionsBtnText}>Cómo llegar (Google Maps)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.85,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 24,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  desc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  gallerySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  galleryRow: {
    gap: 8,
  },
  galleryImg: {
    width: 120,
    height: 80,
    borderRadius: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  directionsBtn: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  directionsBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})

export default PlaceDetailModal

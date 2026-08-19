import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useAuthStore } from '../../store/auth.store'
import MobileLogo from '../../components/features/MobileLogo'
import api from '../../services/api'

export default function MobileDocumentsPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchDocuments()
    }
  }, [user?.id])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/mobile/profile?user_id=${user?.id}&t=${Date.now()}`)
      if (res.data?.success && res.data.data?.documents) {
        setDocuments(res.data.data.documents || [])
      }
    } catch (e) {
      console.warn('Error fetching documents', e)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadFile = async (docName: string) => {
    Alert.alert('Seleccionar archivo', '¿Cómo deseas subir el documento?', [
      {
        text: 'Cámara / Fotos',
        onPress: async () => {
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          })
          if (!res.canceled && res.assets?.[0]?.uri) {
            uploadToServer(res.assets[0].uri, docName)
          }
        },
      },
      {
        text: 'Documento PDF',
        onPress: async () => {
          const res = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'],
          })
          if (!res.canceled && res.assets?.[0]?.uri) {
            uploadToServer(res.assets[0].uri, docName)
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  const uploadToServer = async (uri: string, name: string) => {
    setUploading(true)
    try {
      const formData = new FormData()
      const filename = uri.split('/').pop() || 'documento.pdf'
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `application/${match[1]}` : 'application/octet-stream'

      formData.append('file', { uri, name: filename, type } as any)

      const uploadRes = await api.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (uploadRes.data?.success && uploadRes.data?.url) {
        const fileUrl = uploadRes.data.url
        await api.post('/mobile/documents', {
          user_id: user?.id,
          name,
          file_url: fileUrl,
        })
        Alert.alert('Éxito', `Documento ${name} guardado correctamente.`)
        fetchDocuments()
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo subir el archivo. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docName: string) => {
    Alert.alert('Eliminar documento', `¿Deseas eliminar el documento ${docName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(
              `/mobile/documents?user_id=${user?.id}&name=${encodeURIComponent(docName)}`
            )
            Alert.alert('Eliminado', 'Documento eliminado.')
            fetchDocuments()
          } catch (e) {
            Alert.alert('Error', 'No se pudo eliminar el documento.')
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <MobileLogo variant="dark" size="md" />
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Documentación</Text>
          <Text style={styles.pageSubtitle}>
            Mantén actualizados tus pasaportes, visas y pólizas de viaje.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={styles.loaderText}>Cargando documentos...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {/* Lista predefinida de documentos importantes */}
            {['Pasaporte Vigente', 'Visa / Permiso de entrada', 'Seguro de Asistencia Médica', 'Boleto / Voucher'].map(
              (docType, idx) => {
                const existing = documents.find(
                  (d) => d.name?.toLowerCase() === docType.toLowerCase()
                )

                return (
                  <View key={idx} style={[styles.docRow, idx > 0 && styles.docRowDivider]}>
                    <View style={styles.docNumber}>
                      <Text style={styles.docNumberText}>{idx + 1}</Text>
                    </View>

                    <View style={styles.docInfo}>
                      <Text style={styles.docName}>{docType}</Text>
                      <Text style={styles.docStatus} numberOfLines={1}>
                        {existing?.url
                          ? '✅ Archivo cargado'
                          : 'Pendiente de subir'}
                      </Text>
                    </View>

                    <View style={styles.docActions}>
                      {existing?.url ? (
                        <>
                          <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => Linking.openURL(existing.url)}
                          >
                            <Ionicons name="eye-outline" size={20} color="#1D4ED8" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => handleDelete(docType)}
                          >
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={styles.uploadBtn}
                          onPress={() => handleUploadFile(docType)}
                          disabled={uploading}
                        >
                          <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                          <Text style={styles.uploadBtnText}>Subir</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )
              }
            )}
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
  loaderBox: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  docRowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  docNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  docStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  docActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 6,
  },
  uploadBtn: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
})

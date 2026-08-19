import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import api from '../../services/api'

interface EmergencyContact {
  name: string
  phone: string
  relation: string
}

export default function MobileProfileEditScreen() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date_of_birth: '',
    wants_travel_insurance: false,
    emergency_contacts: [] as EmergencyContact[],
  })

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/mobile/profile?user_id=${user?.id}&t=${Date.now()}`)
      if (res.data?.success && res.data?.data) {
        const p = res.data.data
        let dob = ''
        if (p.date_of_birth) {
          const d = new Date(p.date_of_birth)
          dob = d.toISOString().split('T')[0]
        }
        setFormData({
          name: p.name || user?.name || '',
          phone: p.phone || user?.phone || '',
          date_of_birth: dob,
          wants_travel_insurance: !!p.wants_travel_insurance,
          emergency_contacts: Array.isArray(p.emergency_contacts) ? p.emergency_contacts : [],
        })
      }
    } catch (err) {
      console.error('Error loading profile for edit:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio')
      return
    }

    try {
      setSaving(true)
      const res = await api.put('/mobile/profile', {
        id: user?.id,
        ...formData,
      })

      if (res.data?.success) {
        if (user) {
          setUser({
            ...user,
            name: formData.name,
            phone: formData.phone,
          })
        }
        Alert.alert('Éxito', 'Perfil actualizado correctamente.', [
          { text: 'Aceptar', onPress: () => router.back() },
        ])
      } else {
        Alert.alert('Error', 'No se pudieron guardar los cambios.')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      Alert.alert('Error', 'Error de conexión al guardar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  const addEmergencyContact = () => {
    setFormData((prev) => ({
      ...prev,
      emergency_contacts: [...prev.emergency_contacts, { name: '', phone: '', relation: '' }],
    }))
  }

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.emergency_contacts]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, emergency_contacts: updated }
    })
  }

  const removeEmergencyContact = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.emergency_contacts]
      updated.splice(index, 1)
      return { ...prev, emergency_contacts: updated }
    })
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loaderText}>Cargando datos...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <Text style={styles.sectionHeaderTitle}>DATOS PERSONALES</Text>
          <View style={styles.card}>
            <View style={styles.formField}>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(val) => setFormData({ ...formData, name: val })}
                placeholder="Tu nombre completo"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.fieldDivider} />

            <View style={styles.formField}>
              <Text style={styles.label}>FECHA DE NACIMIENTO</Text>
              <TextInput
                style={styles.input}
                value={formData.date_of_birth}
                onChangeText={(val) => setFormData({ ...formData, date_of_birth: val })}
                placeholder="AAAA-MM-DD (Ej: 1990-05-15)"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.fieldDivider} />

            <View style={styles.formField}>
              <Text style={styles.label}>TELÉFONO</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(val) => setFormData({ ...formData, phone: val })}
                placeholder="Tu número telefónico"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* SECCIÓN 2: SEGURO DE VIAJERO */}
          <Text style={styles.sectionHeaderTitle}>SEGURO DE VIAJERO</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.switchTitle}>Solicitar Seguro de Viaje</Text>
                <Text style={styles.switchDesc}>¿Deseas que un asesor te asista para adquirirlo?</Text>
              </View>
              <Switch
                value={formData.wants_travel_insurance}
                onValueChange={(val) => setFormData({ ...formData, wants_travel_insurance: val })}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              />
            </View>
          </View>

          {/* SECCIÓN 3: CONTACTOS DE EMERGENCIA */}
          <View style={styles.emergencyHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>CONTACTOS DE EMERGENCIA</Text>
            <TouchableOpacity onPress={addEmergencyContact} style={styles.addContactBtn} activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={16} color="#1D4ED8" />
              <Text style={styles.addContactText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {formData.emergency_contacts.length === 0 ? (
            <View style={styles.emptyContactsBox}>
              <Text style={styles.emptyContactsText}>No has agregado contactos de emergencia aún.</Text>
            </View>
          ) : (
            formData.emergency_contacts.map((contact, idx) => (
              <View key={idx} style={[styles.card, { marginBottom: 12 }]}>
                <View style={styles.contactCardHeader}>
                  <Text style={styles.contactIndexLabel}>Contacto #{idx + 1}</Text>
                  <TouchableOpacity onPress={() => removeEmergencyContact(idx)} style={styles.deleteContactBtn}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>NOMBRE</Text>
                  <TextInput
                    style={styles.input}
                    value={contact.name}
                    onChangeText={(val) => updateEmergencyContact(idx, 'name', val)}
                    placeholder="Nombre completo"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.fieldDivider} />

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>PARENTESCO</Text>
                    <TextInput
                      style={styles.input}
                      value={contact.relation}
                      onChangeText={(val) => updateEmergencyContact(idx, 'relation', val)}
                      placeholder="Ej: Hermano"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>TELÉFONO</Text>
                    <TextInput
                      style={styles.input}
                      value={contact.phone}
                      onChangeText={(val) => updateEmergencyContact(idx, 'phone', val)}
                      placeholder="Teléfono"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            ))
          )}

          {/* BOTÓN GUARDAR CAMBIOS */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.saveBtnContent}>
                <Ionicons name="checkmark-sharp" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  headerTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  loaderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  addContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addContactText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  formField: {
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    height: 44,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fieldDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  switchDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyContactsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyContactsText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  contactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contactIndexLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  deleteContactBtn: {
    padding: 4,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'

interface WeatherWidgetProps {
  city?: string
  temp?: number | string
  condition?: string
  humidity?: string
  wind?: string
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  city = 'Destino',
  temp = '26°C',
  condition = 'Soleado',
  humidity = '45%',
  wind = '12 km/h',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.cityRow}>
          <Ionicons name="sunny" size={20} color="#F59E0B" />
          <Text style={styles.cityName}>Pronóstico del clima en {city}</Text>
        </View>
        <Text style={styles.tempText}>{temp}</Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Feather name="sun" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{condition}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <Feather name="droplet" size={14} color="#6B7280" />
          <Text style={styles.detailText}>Humedad: {humidity}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <Feather name="wind" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{wind}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cityName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  tempText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#166534',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#BBF7D0',
  },
})

export default WeatherWidget

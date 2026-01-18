import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button, Searchbar } from 'react-native-paper'
import { useState } from 'react'
import { useAuthStore } from '../../store/auth.store'
import { Colors, Spacing, FontSizes } from '../../constants/theme'
import { Ionicons } from '@expo/vector-icons'

export default function HomeScreen() {
    const [searchQuery, setSearchQuery] = useState('')
    const user = useAuthStore((state) => state.user)

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hola, {user?.name || 'Usuario'} 👋</Text>
                <Text style={styles.subtitle}>¿A dónde quieres viajar hoy?</Text>
            </View>

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Buscar destinos, hoteles, vuelos..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Búsqueda Rápida</Text>
                <View style={styles.actionsGrid}>
                    <Card style={styles.actionCard}>
                        <Card.Content style={styles.actionContent}>
                            <Ionicons name="bed" size={32} color={Colors.primary} />
                            <Text style={styles.actionText}>Hoteles</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.actionCard}>
                        <Card.Content style={styles.actionContent}>
                            <Ionicons name="airplane" size={32} color={Colors.primary} />
                            <Text style={styles.actionText}>Vuelos</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.actionCard}>
                        <Card.Content style={styles.actionContent}>
                            <Ionicons name="car" size={32} color={Colors.primary} />
                            <Text style={styles.actionText}>Autos</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.actionCard}>
                        <Card.Content style={styles.actionContent}>
                            <Ionicons name="briefcase" size={32} color={Colors.primary} />
                            <Text style={styles.actionText}>Paquetes</Text>
                        </Card.Content>
                    </Card>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Destinos Populares</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Card style={styles.destinationCard}>
                        <Card.Cover source={{ uri: 'https://source.unsplash.com/400x300/?cancun,beach' }} />
                        <Card.Content>
                            <Text style={styles.destinationName}>Cancún</Text>
                            <Text style={styles.destinationPrice}>Desde $5,999</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.destinationCard}>
                        <Card.Cover source={{ uri: 'https://source.unsplash.com/400x300/?paris,eiffel' }} />
                        <Card.Content>
                            <Text style={styles.destinationName}>París</Text>
                            <Text style={styles.destinationPrice}>Desde $15,999</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.destinationCard}>
                        <Card.Cover source={{ uri: 'https://source.unsplash.com/400x300/?tokyo,japan' }} />
                        <Card.Content>
                            <Text style={styles.destinationName}>Tokio</Text>
                            <Text style={styles.destinationPrice}>Desde $22,999</Text>
                        </Card.Content>
                    </Card>
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ofertas Especiales</Text>
                <Card style={styles.offerCard}>
                    <Card.Content>
                        <Text style={styles.offerTitle}>🎉 Descuento del 20%</Text>
                        <Text style={styles.offerDescription}>
                            En tu primera reserva de hotel. Usa el código: BIENVENIDO20
                        </Text>
                        <Button mode="contained" style={styles.offerButton}>
                            Ver Ofertas
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: Spacing.lg,
        paddingTop: Spacing.xxl,
        backgroundColor: Colors.primary,
    },
    greeting: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.white,
        opacity: 0.9,
    },
    searchContainer: {
        padding: Spacing.md,
        marginTop: -Spacing.lg,
    },
    searchBar: {
        elevation: 4,
    },
    quickActions: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: '48%',
        marginBottom: Spacing.md,
    },
    actionContent: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    actionText: {
        marginTop: Spacing.sm,
        fontSize: FontSizes.md,
        fontWeight: '500',
        color: Colors.text,
    },
    section: {
        padding: Spacing.md,
    },
    destinationCard: {
        width: 200,
        marginRight: Spacing.md,
    },
    destinationName: {
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        marginTop: Spacing.sm,
    },
    destinationPrice: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
    offerCard: {
        backgroundColor: Colors.primaryLight,
    },
    offerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: Spacing.sm,
    },
    offerDescription: {
        fontSize: FontSizes.md,
        color: Colors.white,
        marginBottom: Spacing.md,
    },
    offerButton: {
        backgroundColor: Colors.white,
    },
})

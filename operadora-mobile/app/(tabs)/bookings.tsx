import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { Colors, Spacing, FontSizes } from '../../constants/theme'

export default function BookingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Reservas</Text>
            <Text style={styles.subtitle}>Próximamente: Historial de reservas</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.background,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
})

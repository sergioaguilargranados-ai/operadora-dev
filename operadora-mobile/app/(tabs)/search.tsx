import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { Colors, Spacing, FontSizes } from '../../constants/theme'

export default function SearchScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Búsqueda</Text>
            <Text style={styles.subtitle}>Próximamente: Búsqueda de hoteles y vuelos</Text>
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

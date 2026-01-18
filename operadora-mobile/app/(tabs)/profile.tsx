import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, List, Button, Divider, Avatar } from 'react-native-paper'
import { useAuthStore } from '../../store/auth.store'
import { useRouter } from 'expo-router'
import { Colors, Spacing, FontSizes } from '../../constants/theme'
import { Ionicons } from '@expo/vector-icons'

export default function ProfileScreen() {
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const router = useRouter()

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        await logout()
                        router.replace('/(auth)/login')
                    },
                },
            ]
        )
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text
                    size={80}
                    label={user?.name?.substring(0, 2).toUpperCase() || 'U'}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <Text style={styles.userType}>
                    {user?.user_type === 'cliente' ? 'Cliente' :
                        user?.user_type === 'corporativo' ? 'Corporativo' : 'Agencia'}
                </Text>
            </View>

            <Divider />

            <List.Section>
                <List.Subheader>Cuenta</List.Subheader>

                <List.Item
                    title="Editar Perfil"
                    left={(props) => <List.Icon {...props} icon="account-edit" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => { }}
                />

                <List.Item
                    title="Cambiar Contraseña"
                    left={(props) => <List.Icon {...props} icon="lock" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => { }}
                />

                <List.Item
                    title="Notificaciones"
                    left={(props) => <List.Icon {...props} icon="bell" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => { }}
                />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>Preferencias</List.Subheader>

                <List.Item
                    title="Idioma"
                    description="Español"
                    left={(props) => <List.Icon {...props} icon="translate" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => { }}
                />

                <List.Item
                    title="Moneda"
                    description="MXN - Peso Mexicano"
                    left={(props) => <List.Icon {...props} icon="currency-usd" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => { }}
                />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>Soporte</List.Subheader>

                <List.Item
                    title="Centro de Ayuda"
                    left={(props) => <List.Icon {...props} icon="help-circle" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => { }}
                />

                <List.Item
                    title="Términos y Condiciones"
                    left={(props) => <List.Icon {...props} icon="file-document" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => { }}
                />

                <List.Item
                    title="Política de Privacidad"
                    left={(props) => <List.Icon {...props} icon="shield-check" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => { }}
                />
            </List.Section>

            <View style={styles.logoutContainer}>
                <Button
                    mode="contained"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                    buttonColor={Colors.error}
                    icon="logout"
                >
                    Cerrar Sesión
                </Button>
            </View>

            <Text style={styles.version}>Versión 1.0.0</Text>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.backgroundDark,
    },
    avatar: {
        backgroundColor: Colors.primary,
        marginBottom: Spacing.md,
    },
    name: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    email: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    userType: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    logoutContainer: {
        padding: Spacing.lg,
        marginTop: Spacing.md,
    },
    logoutButton: {
        paddingVertical: Spacing.xs,
    },
    version: {
        textAlign: 'center',
        color: Colors.textLight,
        fontSize: FontSizes.sm,
        paddingBottom: Spacing.xl,
    },
})

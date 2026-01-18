import { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import { Text, TextInput, Button, Divider } from 'react-native-paper'
import { useRouter, Link } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { Colors, Spacing, FontSizes } from '../../constants/theme'

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const login = useAuthStore((state) => state.login)
    const error = useAuthStore((state) => state.error)
    const clearError = useAuthStore((state) => state.clearError)
    const router = useRouter()

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor completa todos los campos')
            return
        }

        setLoading(true)
        clearError()

        try {
            await login({ email, password })
            // La navegación se maneja automáticamente en _layout.tsx
        } catch (err) {
            Alert.alert('Error', error || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>AS Operadora</Text>
                    <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                    />

                    <TextInput
                        label="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                    />

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Iniciar Sesión
                    </Button>

                    <Divider style={styles.divider} />

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>¿No tienes cuenta? </Text>
                        <Link href="/(auth)/register" asChild>
                            <Text style={styles.registerLink}>Regístrate</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    title: {
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.lg,
        color: Colors.textSecondary,
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: Spacing.md,
    },
    button: {
        marginTop: Spacing.md,
        backgroundColor: Colors.primary,
    },
    buttonContent: {
        paddingVertical: Spacing.sm,
    },
    divider: {
        marginVertical: Spacing.lg,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
    },
    registerLink: {
        color: Colors.primary,
        fontSize: FontSizes.md,
        fontWeight: 'bold',
    },
})

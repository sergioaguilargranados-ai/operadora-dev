import { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper'
import { useRouter, Link } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { Colors, Spacing, FontSizes } from '../../constants/theme'

export default function RegisterScreen() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [userType, setUserType] = useState<'cliente' | 'corporativo' | 'agencia'>('cliente')
    const [loading, setLoading] = useState(false)

    const register = useAuthStore((state) => state.register)
    const error = useAuthStore((state) => state.error)
    const clearError = useAuthStore((state) => state.clearError)
    const router = useRouter()

    const handleRegister = async () => {
        if (!name || !email || !phone || !password) {
            Alert.alert('Error', 'Por favor completa todos los campos')
            return
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden')
            return
        }

        if (password.length < 8) {
            Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres')
            return
        }

        setLoading(true)
        clearError()

        try {
            await register({ name, email, phone, password, user_type: userType })
            Alert.alert(
                'Registro Exitoso',
                'Tu cuenta ha sido creada. Por favor inicia sesión.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
            )
        } catch (err) {
            Alert.alert('Error', error || 'Error al registrarse')
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
                    <Text style={styles.title}>Crear Cuenta</Text>
                    <Text style={styles.subtitle}>Únete a AS Operadora</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Nombre completo"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                    />

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
                        label="Teléfono"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                    />

                    <Text style={styles.label}>Tipo de cuenta</Text>
                    <SegmentedButtons
                        value={userType}
                        onValueChange={(value) => setUserType(value as any)}
                        buttons={[
                            { value: 'cliente', label: 'Cliente' },
                            { value: 'corporativo', label: 'Corporativo' },
                            { value: 'agencia', label: 'Agencia' },
                        ]}
                        style={styles.segmented}
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

                    <TextInput
                        label="Confirmar contraseña"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                    />

                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Registrarse
                    </Button>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                        <Link href="/(auth)/login" asChild>
                            <Text style={styles.loginLink}>Inicia sesión</Text>
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
        padding: Spacing.lg,
        paddingTop: Spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
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
    label: {
        fontSize: FontSizes.md,
        color: Colors.text,
        marginBottom: Spacing.sm,
        fontWeight: '500',
    },
    segmented: {
        marginBottom: Spacing.md,
    },
    button: {
        marginTop: Spacing.md,
        backgroundColor: Colors.primary,
    },
    buttonContent: {
        paddingVertical: Spacing.sm,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    loginText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
    },
    loginLink: {
        color: Colors.primary,
        fontSize: FontSizes.md,
        fontWeight: 'bold',
    },
})

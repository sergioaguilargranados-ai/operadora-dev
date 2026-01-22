import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Card as PaperCard } from 'react-native-paper'
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme'

interface CardProps {
    children: React.ReactNode
    onPress?: () => void
    style?: any
    elevated?: boolean
}

export function Card({ children, onPress, style, elevated = true }: CardProps) {
    const Component = onPress ? TouchableOpacity : View

    return (
        <Component
            onPress={onPress}
            style={[
                styles.card,
                elevated && styles.elevated,
                style,
            ]}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {children}
        </Component>
    )
}

interface ButtonProps {
    children: React.ReactNode
    onPress: () => void
    variant?: 'primary' | 'secondary' | 'outline' | 'text'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
    loading?: boolean
    fullWidth?: boolean
    style?: any
}

export function Button({
    children,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
}: ButtonProps) {
    const buttonStyles = [
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        fullWidth && styles.buttonFullWidth,
        disabled && styles.buttonDisabled,
        style,
    ]

    const textStyles = [
        styles.buttonText,
        styles[`buttonText_${variant}`],
        styles[`buttonText_${size}`],
        disabled && styles.buttonTextDisabled,
    ]

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={buttonStyles}
            activeOpacity={0.7}
        >
            <Text style={textStyles}>
                {loading ? 'Cargando...' : children}
            </Text>
        </TouchableOpacity>
    )
}

interface BadgeProps {
    children: React.ReactNode
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
    style?: any
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
    return (
        <View style={[styles.badge, styles[`badge_${variant}`], style]}>
            <Text style={[styles.badgeText, styles[`badgeText_${variant}`]]}>
                {children}
            </Text>
        </View>
    )
}

interface DividerProps {
    style?: any
    vertical?: boolean
}

export function Divider({ style, vertical = false }: DividerProps) {
    return (
        <View
            style={[
                vertical ? styles.dividerVertical : styles.dividerHorizontal,
                style,
            ]}
        />
    )
}

interface SpacerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
}

export function Spacer({ size = 'md' }: SpacerProps) {
    const spacing = {
        xs: Spacing.xs,
        sm: Spacing.sm,
        md: Spacing.md,
        lg: Spacing.lg,
        xl: Spacing.xl,
        xxl: Spacing.xxl,
    }

    return <View style={{ height: spacing[size] }} />
}

const styles = StyleSheet.create({
    // Card
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // Button
    button: {
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    button_primary: {
        backgroundColor: Colors.primary,
    },
    button_secondary: {
        backgroundColor: Colors.secondary,
    },
    button_outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    button_text: {
        backgroundColor: 'transparent',
    },
    button_small: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    button_medium: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    button_large: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    buttonFullWidth: {
        width: '100%',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontWeight: '600',
    },
    buttonText_primary: {
        color: Colors.white,
    },
    buttonText_secondary: {
        color: Colors.white,
    },
    buttonText_outline: {
        color: Colors.primary,
    },
    buttonText_text: {
        color: Colors.primary,
    },
    buttonText_small: {
        fontSize: FontSizes.sm,
    },
    buttonText_medium: {
        fontSize: FontSizes.md,
    },
    buttonText_large: {
        fontSize: FontSizes.lg,
    },
    buttonTextDisabled: {
        color: Colors.textSecondary,
    },

    // Badge
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
    },
    badge_success: {
        backgroundColor: '#10B981',
    },
    badge_warning: {
        backgroundColor: '#F59E0B',
    },
    badge_error: {
        backgroundColor: '#EF4444',
    },
    badge_info: {
        backgroundColor: '#3B82F6',
    },
    badge_default: {
        backgroundColor: Colors.border,
    },
    badgeText: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },
    badgeText_success: {
        color: Colors.white,
    },
    badgeText_warning: {
        color: Colors.white,
    },
    badgeText_error: {
        color: Colors.white,
    },
    badgeText_info: {
        color: Colors.white,
    },
    badgeText_default: {
        color: Colors.text,
    },

    // Divider
    dividerHorizontal: {
        height: 1,
        backgroundColor: Colors.border,
        width: '100%',
    },
    dividerVertical: {
        width: 1,
        backgroundColor: Colors.border,
        height: '100%',
    },
})

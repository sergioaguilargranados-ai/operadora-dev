'use client'

import React, { ReactNode } from 'react'
import { usePermissions } from '@/contexts/PermissionsContext'

interface PermissionGateProps {
    permission?: string
    anyPermissions?: string[]
    allPermissions?: string[]
    children: ReactNode
    fallback?: ReactNode
}

/**
 * Componente para renderizar condicionalmente elementos de la UI
 * en función de los permisos granulares del usuario.
 */
export function PermissionGate({
    permission,
    anyPermissions,
    allPermissions,
    children,
    fallback = null
}: PermissionGateProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading, isSuperAdmin } = usePermissions()

    if (isLoading && !isSuperAdmin) {
        return null
    }

    if (isSuperAdmin) {
        return <>{children}</>
    }

    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>
    }

    if (anyPermissions && !hasAnyPermission(anyPermissions)) {
        return <>{fallback}</>
    }

    if (allPermissions && !hasAllPermissions(allPermissions)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface PermissionsContextType {
    permissions: string[]
    isLoading: boolean
    isSuperAdmin: boolean
    hasPermission: (permissionCode: string) => boolean
    hasAnyPermission: (permissionCodes: string[]) => boolean
    hasAllPermissions: (permissionCodes: string[]) => boolean
    can: (permissionCode: string) => boolean
    refreshPermissions: () => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const [permissions, setPermissions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)

    const fetchPermissions = useCallback(async () => {
        try {
            setIsLoading(true)
            const token = typeof window !== 'undefined' ? localStorage.getItem('as_token') : null

            const headers: HeadersInit = {}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const res = await fetch('/api/auth/permissions', {
                headers,
                cache: 'no-store'
            })

            if (res.ok) {
                const data = await res.json()
                if (data.success && data.data) {
                    setPermissions(data.data.permissions || [])
                    setIsSuperAdmin(data.data.isSuperAdmin || user?.role === 'SUPER_ADMIN')
                }
            } else {
                // Fallback público (GUEST)
                if (user?.role === 'SUPER_ADMIN') {
                    setIsSuperAdmin(true)
                }
            }
        } catch (error) {
            console.error('Error loading permissions:', error)
        } finally {
            setIsLoading(false)
        }
    }, [user?.role])

    useEffect(() => {
        if (!authLoading) {
            fetchPermissions()
        }
    }, [authLoading, isAuthenticated, user?.role, fetchPermissions])

    const hasPermission = useCallback((permissionCode: string): boolean => {
        if (isSuperAdmin || user?.role === 'SUPER_ADMIN') return true
        if (!permissionCode) return true
        return permissions.includes(permissionCode)
    }, [isSuperAdmin, user?.role, permissions])

    const hasAnyPermission = useCallback((permissionCodes: string[]): boolean => {
        if (isSuperAdmin || user?.role === 'SUPER_ADMIN') return true
        if (!permissionCodes || permissionCodes.length === 0) return true
        return permissionCodes.some(code => permissions.includes(code))
    }, [isSuperAdmin, user?.role, permissions])

    const hasAllPermissions = useCallback((permissionCodes: string[]): boolean => {
        if (isSuperAdmin || user?.role === 'SUPER_ADMIN') return true
        if (!permissionCodes || permissionCodes.length === 0) return true
        return permissionCodes.every(code => permissions.includes(code))
    }, [isSuperAdmin, user?.role, permissions])

    const can = hasPermission

    return (
        <PermissionsContext.Provider
            value={{
                permissions,
                isLoading,
                isSuperAdmin,
                hasPermission,
                hasAnyPermission,
                hasAllPermissions,
                can,
                refreshPermissions: fetchPermissions
            }}
        >
            {children}
        </PermissionsContext.Provider>
    )
}

export function usePermissions() {
    const context = useContext(PermissionsContext)
    if (context === undefined) {
        // Fallback seguro si se usa fuera del Provider
        return {
            permissions: [],
            isLoading: false,
            isSuperAdmin: false,
            hasPermission: () => true,
            hasAnyPermission: () => true,
            hasAllPermissions: () => true,
            can: () => true,
            refreshPermissions: async () => {}
        }
    }
    return context
}

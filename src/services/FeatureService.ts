// FeatureService.ts - Servicio para gestión de features y permisos
// Build: 23 Jul 2026 - v2.430b - Sistema de Administración Granular

import { pool } from '@/lib/db';

export interface Feature {
    id: number;
    code: string;
    name: string;
    description: string | null;
    category: string;
    is_global_enabled: boolean;
    web_enabled: boolean;
    mobile_enabled: boolean;
    icon: string | null;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}

export interface FeatureAccess {
    feature_id: number;
    role: string;
    web_enabled: boolean;
    mobile_enabled: boolean;
}

export interface AppSetting {
    key: string;
    value: string;
    description: string | null;
}

export type Platform = 'web' | 'mobile';

export class FeatureService {

    /**
     * Obtiene todos los features del sistema
     */
    static async getAllFeatures(): Promise<Feature[]> {
        try {
            const result = await pool.query(`
        SELECT * FROM features 
        ORDER BY category, sort_order
      `);
            return result.rows;
        } catch (error) {
            console.error('Error getting all features:', error);
            return [];
        }
    }

    /**
     * Obtiene features por categoría
     */
    static async getFeaturesByCategory(category: string): Promise<Feature[]> {
        try {
            const result = await pool.query(`
        SELECT * FROM features 
        WHERE category = $1
        ORDER BY sort_order
      `, [category]);
            return result.rows;
        } catch (error) {
            console.error('Error getting features by category:', error);
            return [];
        }
    }

    /**
     * Obtiene un feature específico por código
     */
    static async getFeatureByCode(code: string): Promise<Feature | null> {
        try {
            const result = await pool.query(`
        SELECT * FROM features WHERE code = $1
      `, [code]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting feature by code:', error);
            return null;
        }
    }

    /**
     * Verifica si un feature está habilitado para un rol y plataforma
     */
    static async isFeatureEnabled(
        code: string,
        role: string,
        platform: Platform = 'web'
    ): Promise<boolean> {
        // En entorno de desarrollo (o local), forzamos TODAS las banderas activas para facilitar pruebas integrales.
        if (process.env.NODE_ENV === 'development') {
            return true;
        }

        try {
            // Primero verificar si está habilitado globalmente
            const featureResult = await pool.query(`
        SELECT id, is_global_enabled, web_enabled, mobile_enabled 
        FROM features WHERE code = $1
      `, [code]);

            if (featureResult.rows.length === 0) {
                return false; // Feature no existe
            }

            const feature = featureResult.rows[0];

            // Si no está habilitado globalmente, return false
            if (!feature.is_global_enabled) {
                return false;
            }

            // Verificar plataforma a nivel global
            if (platform === 'web' && !feature.web_enabled) {
                return false;
            }
            if (platform === 'mobile' && !feature.mobile_enabled) {
                return false;
            }

            // Verificar permisos por rol
            const roleResult = await pool.query(`
        SELECT web_enabled, mobile_enabled 
        FROM feature_role_access 
        WHERE feature_id = $1 AND role = $2
      `, [feature.id, role]);

            // Si no hay configuración específica de rol, usar la global
            if (roleResult.rows.length === 0) {
                return true; // Está habilitado globalmente, sin restricción de rol
            }

            const roleAccess = roleResult.rows[0];

            if (platform === 'web') {
                return roleAccess.web_enabled;
            } else {
                return roleAccess.mobile_enabled;
            }
        } catch (error) {
            console.error('Error checking feature enabled:', error);
            return false; // Por seguridad, si hay error, feature deshabilitado
        }
    }

    /**
     * Obtiene todos los features habilitados para un usuario
     */
    static async getEnabledFeaturesForUser(
        role: string,
        platform: Platform = 'web'
    ): Promise<string[]> {
        try {
            // En desarrollo, retornar todos los códigos de feature disponibles
            if (process.env.NODE_ENV === 'development') {
                const all = await pool.query('SELECT code FROM features');
                return all.rows.map((r: any) => r.code);
            }

            const platformColumn = platform === 'web' ? 'web_enabled' : 'mobile_enabled';

            const result = await pool.query(`
        SELECT f.code
        FROM features f
        LEFT JOIN feature_role_access fra ON f.id = fra.feature_id AND fra.role = $1
        WHERE f.is_global_enabled = true
          AND f.${platformColumn} = true
          AND (fra.id IS NULL OR fra.${platformColumn} = true)
        ORDER BY f.category, f.sort_order
      `, [role]);

            return result.rows.map(r => r.code);
        } catch (error) {
            console.error('Error getting enabled features for user:', error);
            return [];
        }
    }

    /**
     * Actualiza un feature
     */
    static async updateFeature(
        code: string,
        data: Partial<Pick<Feature, 'is_global_enabled' | 'web_enabled' | 'mobile_enabled' | 'name' | 'description'>>
    ): Promise<Feature | null> {
        try {
            const updates: string[] = [];
            const values: (string | boolean | null)[] = [];
            let paramCount = 1;

            if (data.is_global_enabled !== undefined) {
                updates.push(`is_global_enabled = $${paramCount++}`);
                values.push(data.is_global_enabled);
            }
            if (data.web_enabled !== undefined) {
                updates.push(`web_enabled = $${paramCount++}`);
                values.push(data.web_enabled);
            }
            if (data.mobile_enabled !== undefined) {
                updates.push(`mobile_enabled = $${paramCount++}`);
                values.push(data.mobile_enabled);
            }
            if (data.name !== undefined) {
                updates.push(`name = $${paramCount++}`);
                values.push(data.name);
            }
            if (data.description !== undefined) {
                updates.push(`description = $${paramCount++}`);
                values.push(data.description);
            }

            if (updates.length === 0) {
                return await this.getFeatureByCode(code);
            }

            values.push(code);

            const result = await pool.query(`
        UPDATE features 
        SET ${updates.join(', ')}
        WHERE code = $${paramCount}
        RETURNING *
      `, values);

            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating feature:', error);
            return null;
        }
    }

    /**
     * Actualiza permisos de un feature para un rol
     */
    static async updateFeatureRoleAccess(
        code: string,
        role: string,
        webEnabled: boolean,
        mobileEnabled: boolean
    ): Promise<boolean> {
        try {
            const feature = await this.getFeatureByCode(code);
            if (!feature) return false;

            await pool.query(`
        INSERT INTO feature_role_access (feature_id, role, web_enabled, mobile_enabled)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (feature_id, role) 
        DO UPDATE SET web_enabled = $3, mobile_enabled = $4
      `, [feature.id, role, webEnabled, mobileEnabled]);

            return true;
        } catch (error) {
            console.error('Error updating feature role access:', error);
            return false;
        }
    }

    /**
     * Obtiene configuración de la aplicación
     */
    static async getAppSetting(key: string): Promise<string | null> {
        try {
            const result = await pool.query(`
        SELECT value FROM app_settings WHERE key = $1
      `, [key]);
            return result.rows[0]?.value || null;
        } catch (error) {
            console.error('Error getting app setting:', error);
            return null;
        }
    }

    /**
     * Obtiene todas las configuraciones
     */
    static async getAllAppSettings(): Promise<AppSetting[]> {
        try {
            const result = await pool.query(`
        SELECT key, value, description FROM app_settings ORDER BY key
      `);
            return result.rows;
        } catch (error) {
            console.error('Error getting all app settings:', error);
            return [];
        }
    }

    /**
     * Actualiza una configuración
     */
    static async updateAppSetting(key: string, value: string): Promise<boolean> {
        try {
            await pool.query(`
        UPDATE app_settings SET value = $1 WHERE key = $2
      `, [value, key]);
            return true;
        } catch (error) {
            console.error('Error updating app setting:', error);
            return false;
        }
    }

    /**
     * Verifica si el login es obligatorio
     */
    static async isLoginRequired(platform: Platform = 'web'): Promise<boolean> {
        const key = platform === 'web' ? 'LOGIN_REQUIRED_WEB' : 'LOGIN_REQUIRED_MOBILE';
        const value = await this.getAppSetting(key);
        return value === 'true';
    }

    /**
     * Obtiene features con información de acceso por rol
     */
    static async getFeaturesWithRoleAccess(role: string): Promise<(Feature & { role_web_enabled: boolean; role_mobile_enabled: boolean })[]> {
        try {
            const result = await pool.query(`
        SELECT 
          f.*,
          COALESCE(fra.web_enabled, true) as role_web_enabled,
          COALESCE(fra.mobile_enabled, true) as role_mobile_enabled
        FROM features f
        LEFT JOIN feature_role_access fra ON f.id = fra.feature_id AND fra.role = $1
        ORDER BY f.category, f.sort_order
      `, [role]);
            return result.rows;
        } catch (error) {
            console.error('Error getting features with role access:', error);
            return [];
        }
    }

    /**
     * Obtiene las categorías disponibles
     */
    static async getCategories(): Promise<string[]> {
        try {
            const result = await pool.query(`
        SELECT DISTINCT category FROM features ORDER BY category
      `);
            return result.rows.map(r => r.category);
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }
}

export default FeatureService;

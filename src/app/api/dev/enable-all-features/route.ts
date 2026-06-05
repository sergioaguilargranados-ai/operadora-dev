import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
    try {
        // Habilitar todos los features globalmente
        const featuresResult = await pool.query(`
            UPDATE features 
            SET is_global_enabled = true, 
                web_enabled = true, 
                mobile_enabled = true
            RETURNING code;
        `);

        // Habilitar todos los accesos por rol
        const rolesResult = await pool.query(`
            UPDATE feature_role_access 
            SET web_enabled = true, 
                mobile_enabled = true
        `);

        // Habilitar las configuraciones del Home (Buscador de hoteles, secciones, etc)
        const homeSettingsKeys = [
            'HOME_SEARCH_HOTELS',
            'HOME_PACKAGES_CTA',
            'HOME_OFFERS_SECTION',
            'HOME_FLIGHTS_SECTION',
            'HOME_ACCOMMODATION_SECTION',
            'HOME_WEEKEND_SECTION',
            'HOME_VACATION_PACKAGES',
            'HOME_UNIQUE_STAYS',
            'HOME_EXPLORE_WORLD'
        ];

        let settingsUpdated = 0;
        for (const key of homeSettingsKeys) {
            const res = await pool.query(`
                INSERT INTO app_settings (key, value, description) 
                VALUES ($1, 'true', 'Autogenerado por script dev')
                ON CONFLICT (key) DO UPDATE SET value = 'true';
            `, [key]);
            settingsUpdated += res.rowCount || 0;
        }

        return NextResponse.json({
            success: true,
            message: 'Todas las banderas de funcionalidades y configuraciones del Home han sido activadas.',
            features_updated: featuresResult.rowCount,
            roles_updated: rolesResult.rowCount,
            settings_updated: settingsUpdated,
            codes: featuresResult.rows.map(r => r.code)
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

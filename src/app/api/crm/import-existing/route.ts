// Build: 19 Feb 2026 - 00:14 CST - v2.317 - API para importar datos existentes al CRM
import { NextResponse } from 'next/server'
import { CRMService } from '@/services/CRMService'
import { query } from '@/lib/db'

export async function POST() {
    try {
        const crm = new CRMService()

        // 1. Importar agency_clients → crm_contacts
        let clientsResult = { imported: 0, skipped: 0 }
        try {
            clientsResult = await crm.importExistingClients()
        } catch (e) {
            console.error('⚠️ Error importando agency_clients (puede no existir la tabla):', e)
        }

        // 2. Importar tour_quotes → crm_contacts
        let quotesResult = { imported: 0, skipped: 0 }
        try {
            quotesResult = await crm.importExistingQuotes()
        } catch (e) {
            console.error('⚠️ Error importando tour_quotes (puede no existir la tabla):', e)
        }

        // 3. Importar usuarios registrados que no estén en el CRM
        let usersImported = 0
        let usersSkipped = 0

        try {
            const usersNotInCRM = await query(`
                SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
                       u.oauth_provider, u.avatar_url
                FROM users u
                WHERE u.role NOT IN ('SUPER_ADMIN', 'ADMIN')
                  AND NOT EXISTS (
                    SELECT 1 FROM crm_contacts cc WHERE cc.user_id = u.id
                  )
                  AND NOT EXISTS (
                    SELECT 1 FROM crm_contacts cc WHERE cc.email = u.email
                  )
            `)

            for (const user of usersNotInCRM.rows) {
                try {
                    await crm.createContact({
                        user_id: user.id,
                        contact_type: 'lead',
                        full_name: user.name || user.email?.split('@')[0] || 'Sin nombre',
                        email: user.email,
                        phone: user.phone,
                        source: user.oauth_provider ? 'google' : 'web_register',
                        source_detail: `Registro en plataforma (${user.role})`,
                        pipeline_stage: 'new',
                    })
                    usersImported++
                } catch (e) {
                    console.error(`Error importando usuario ${user.id}:`, e)
                    usersSkipped++
                }
            }
        } catch (e) {
            console.error('⚠️ Error importando usuarios:', e)
        }

        console.log('✅ Importación al CRM completada:', {
            clients: clientsResult,
            quotes: quotesResult,
            users: { imported: usersImported, skipped: usersSkipped },
        })

        return NextResponse.json({
            success: true,
            clients_imported: clientsResult.imported,
            clients_skipped: clientsResult.skipped,
            quotes_imported: quotesResult.imported,
            quotes_skipped: quotesResult.skipped,
            users_imported: usersImported,
            users_skipped: usersSkipped,
        })
    } catch (error) {
        console.error('Error en importación CRM:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error en importación',
            },
            { status: 500 }
        )
    }
}

/**
 * ClientDocumentService.ts
 * Servicio para gestión de documentos de clientes (agency_clients)
 * v2.316 — 12 Feb 2026
 * 
 * Funcionalidades:
 *   - CRUD de documentos vinculados a agency_clients
 *   - Alertas de vencimiento
 *   - Estadísticas de expediente
 *   - Verificación / rechazo de documentos
 */

import { query, queryOne } from '@/lib/db'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface ClientDocumentInput {
    tenant_id: number
    agency_client_id: number
    crm_contact_id?: number
    user_id?: number
    document_type: string
    file_name: string
    file_size: number
    file_type: string
    url: string
    document_number?: string
    issuing_country?: string
    issuing_authority?: string
    expiry_date?: string
    category?: string
    description?: string
    metadata?: Record<string, string>
}

export interface ClientDocument {
    id: string
    tenant_id: number
    agency_client_id: number | null
    crm_contact_id: number | null
    user_id: number
    document_type: string
    file_name: string
    file_size: number
    file_type: string
    url: string
    document_number: string | null
    issuing_country: string | null
    issuing_authority: string | null
    expiry_date: string | null
    category: string
    status: string
    verified: boolean
    verified_by: number | null
    verified_at: string | null
    rejection_reason: string | null
    description: string | null
    metadata: Record<string, string> | null
    created_at: string
    updated_at: string
    // Joined fields
    client_name?: string
    client_email?: string
    expiry_status?: string
}

export interface ExpiringDocument {
    document_id: string
    document_type: string
    file_name: string
    expiry_date: string
    days_until_expiry: number
    agency_client_id: number
    client_name: string
    client_email: string
}

// ═══════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════

export class ClientDocumentService {

    /**
     * Crear documento de cliente
     */
    static async createDocument(data: ClientDocumentInput): Promise<ClientDocument> {
        const id = `cdoc_${Date.now()}_${Math.random().toString(36).substring(7)}`

        const result = await queryOne<ClientDocument>(
            `INSERT INTO documents (
        id, tenant_id, user_id, agency_client_id, crm_contact_id,
        document_type, file_name, file_size, file_type, url,
        document_number, issuing_country, issuing_authority,
        expiry_date, category, description, metadata, status
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16, $17, 'pending'
      ) RETURNING *`,
            [
                id,
                data.tenant_id,
                data.user_id || 0,
                data.agency_client_id,
                data.crm_contact_id || null,
                data.document_type,
                data.file_name,
                data.file_size,
                data.file_type,
                data.url,
                data.document_number || null,
                data.issuing_country || null,
                data.issuing_authority || null,
                data.expiry_date || null,
                data.category || 'identification',
                data.description || null,
                data.metadata ? JSON.stringify(data.metadata) : null
            ]
        )

        return result!
    }

    /**
     * Listar documentos por agency_client
     */
    static async getDocumentsByClient(
        agencyClientId: number,
        filters?: { category?: string; status?: string; document_type?: string }
    ): Promise<ClientDocument[]> {
        let sql = `
      SELECT d.*,
        ac.client_name,
        ac.client_email,
        CASE
          WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE THEN 'expired'
          WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
          WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN 'expiring_warning'
          ELSE 'valid'
        END AS expiry_status
      FROM documents d
      LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
      WHERE d.agency_client_id = $1
        AND d.deleted_at IS NULL
    `
        const params: unknown[] = [agencyClientId]
        let idx = 2

        if (filters?.category) {
            sql += ` AND d.category = $${idx++}`
            params.push(filters.category)
        }
        if (filters?.status) {
            sql += ` AND d.status = $${idx++}`
            params.push(filters.status)
        }
        if (filters?.document_type) {
            sql += ` AND d.document_type = $${idx++}`
            params.push(filters.document_type)
        }

        sql += ` ORDER BY d.created_at DESC`

        const result = await query<ClientDocument>(sql, params)
        return result.rows
    }

    /**
     * Listar documentos por tenant con filtros
     */
    static async getDocumentsByTenant(
        tenantId: number,
        filters?: {
            agency_client_id?: number
            category?: string
            status?: string
            document_type?: string
            search?: string
            limit?: number
            offset?: number
        }
    ): Promise<{ documents: ClientDocument[]; total: number }> {
        let countSql = `
      SELECT COUNT(*) as total
      FROM documents d
      LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
      WHERE d.tenant_id = $1
        AND d.deleted_at IS NULL
        AND d.agency_client_id IS NOT NULL
    `
        let dataSql = `
      SELECT d.*,
        ac.client_name,
        ac.client_email,
        CASE
          WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE THEN 'expired'
          WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
          WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN 'expiring_warning'
          ELSE 'valid'
        END AS expiry_status
      FROM documents d
      LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
      WHERE d.tenant_id = $1
        AND d.deleted_at IS NULL
        AND d.agency_client_id IS NOT NULL
    `
        const params: unknown[] = [tenantId]
        let idx = 2

        if (filters?.agency_client_id) {
            const clause = ` AND d.agency_client_id = $${idx++}`
            countSql += clause
            dataSql += clause
            params.push(filters.agency_client_id)
        }
        if (filters?.category) {
            const clause = ` AND d.category = $${idx++}`
            countSql += clause
            dataSql += clause
            params.push(filters.category)
        }
        if (filters?.status) {
            const clause = ` AND d.status = $${idx++}`
            countSql += clause
            dataSql += clause
            params.push(filters.status)
        }
        if (filters?.document_type) {
            const clause = ` AND d.document_type = $${idx++}`
            countSql += clause
            dataSql += clause
            params.push(filters.document_type)
        }
        if (filters?.search) {
            const clause = ` AND (d.file_name ILIKE $${idx} OR d.document_number ILIKE $${idx} OR ac.client_name ILIKE $${idx})`
            countSql += clause
            dataSql += clause
            params.push(`%${filters.search}%`)
            idx++
        }

        dataSql += ` ORDER BY d.created_at DESC`

        if (filters?.limit) {
            dataSql += ` LIMIT $${idx++}`
            params.push(filters.limit)
        }
        if (filters?.offset) {
            dataSql += ` OFFSET $${idx++}`
            params.push(filters.offset)
        }

        const [countResult, dataResult] = await Promise.all([
            queryOne<{ total: string }>(countSql, params.slice(0, idx - (filters?.limit ? 1 : 0) - (filters?.offset ? 1 : 0))),
            query<ClientDocument>(dataSql, params)
        ])

        return {
            documents: dataResult.rows,
            total: parseInt(countResult?.total || '0')
        }
    }

    /**
     * Obtener documento por ID
     */
    static async getDocumentById(documentId: string): Promise<ClientDocument | null> {
        return queryOne<ClientDocument>(
            `SELECT d.*,
        ac.client_name,
        ac.client_email,
        CASE
          WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE THEN 'expired'
          WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
          ELSE 'valid'
        END AS expiry_status
      FROM documents d
      LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
      WHERE d.id = $1 AND d.deleted_at IS NULL`,
            [documentId]
        )
    }

    /**
     * Verificar documento
     */
    static async verifyDocument(documentId: string, userId: number, approved: boolean, reason?: string): Promise<ClientDocument | null> {
        return queryOne<ClientDocument>(
            `UPDATE documents SET
        verified = $2,
        verified_by = $3,
        verified_at = NOW(),
        status = $4,
        rejection_reason = $5,
        updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *`,
            [documentId, approved, userId, approved ? 'approved' : 'rejected', reason || null]
        )
    }

    /**
     * Soft delete de documento 
     */
    static async deleteDocument(documentId: string): Promise<boolean> {
        const result = await queryOne(
            `UPDATE documents SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
            [documentId]
        )
        return !!result
    }

    /**
     * Obtener documentos próximos a vencer
     */
    static async getExpiringDocuments(tenantId: number, daysAhead: number = 30): Promise<ExpiringDocument[]> {
        const result = await query<ExpiringDocument>(
            `SELECT
        d.id AS document_id,
        d.document_type,
        d.file_name,
        d.expiry_date,
        (d.expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry,
        d.agency_client_id,
        ac.client_name,
        ac.client_email
      FROM documents d
      LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
      WHERE d.tenant_id = $1
        AND d.deleted_at IS NULL
        AND d.expiry_date IS NOT NULL
        AND d.expiry_date <= CURRENT_DATE + ($2 || ' days')::INTERVAL
        AND d.expiry_date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY d.expiry_date ASC`,
            [tenantId, daysAhead]
        )
        return result.rows
    }

    /**
     * Estadísticas de documentos por tenant
     */
    static async getDocumentStats(tenantId: number): Promise<{
        total: number
        pending: number
        approved: number
        rejected: number
        expired: number
        expiring_soon: number
        by_type: { document_type: string; count: number }[]
        by_category: { category: string; count: number }[]
    }> {
        const [stats, byType, byCategory] = await Promise.all([
            queryOne<{
                total: string
                pending: string
                approved: string
                rejected: string
                expired: string
                expiring_soon: string
            }>(
                `SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
          COUNT(*) FILTER (WHERE expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE) as expired,
          COUNT(*) FILTER (WHERE expiry_date IS NOT NULL AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') as expiring_soon
        FROM documents
        WHERE tenant_id = $1 AND deleted_at IS NULL AND agency_client_id IS NOT NULL`,
                [tenantId]
            ),
            query<{ document_type: string; count: string }>(
                `SELECT document_type, COUNT(*) as count
        FROM documents
        WHERE tenant_id = $1 AND deleted_at IS NULL AND agency_client_id IS NOT NULL
        GROUP BY document_type
        ORDER BY count DESC`,
                [tenantId]
            ),
            query<{ category: string; count: string }>(
                `SELECT COALESCE(category, 'other') as category, COUNT(*) as count
        FROM documents
        WHERE tenant_id = $1 AND deleted_at IS NULL AND agency_client_id IS NOT NULL
        GROUP BY category
        ORDER BY count DESC`,
                [tenantId]
            )
        ])

        return {
            total: parseInt(stats?.total || '0'),
            pending: parseInt(stats?.pending || '0'),
            approved: parseInt(stats?.approved || '0'),
            rejected: parseInt(stats?.rejected || '0'),
            expired: parseInt(stats?.expired || '0'),
            expiring_soon: parseInt(stats?.expiring_soon || '0'),
            by_type: byType.rows.map(r => ({ document_type: r.document_type, count: parseInt(r.count) })),
            by_category: byCategory.rows.map(r => ({ category: r.category, count: parseInt(r.count) }))
        }
    }

    /**
     * Obtener checklist de documentos por cliente
     */
    static async getDocumentChecklist(agencyClientId: number): Promise<{
        required: string[]
        uploaded: string[]
        missing: string[]
        completion_percentage: number
    }> {
        const REQUIRED_DOCS = ['ine', 'comprobante_domicilio', 'rfc']

        const result = await query<{ document_type: string }>(
            `SELECT DISTINCT document_type 
      FROM documents 
      WHERE agency_client_id = $1 
        AND deleted_at IS NULL
        AND status != 'rejected'`,
            [agencyClientId]
        )

        const uploaded = result.rows.map(r => r.document_type)
        const missing = REQUIRED_DOCS.filter(d => !uploaded.includes(d))

        return {
            required: REQUIRED_DOCS,
            uploaded,
            missing,
            completion_percentage: Math.round(((REQUIRED_DOCS.length - missing.length) / REQUIRED_DOCS.length) * 100)
        }
    }
}

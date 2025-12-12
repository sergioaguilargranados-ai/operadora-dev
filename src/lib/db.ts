import { Pool, QueryResult, QueryResultRow } from 'pg'

// Configuración de conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Número máximo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Verificar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL')
})

pool.on('error', (err) => {
  console.error('❌ Error en PostgreSQL:', err)
})

export { pool }

// Helper para ejecutar queries
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const res = await pool.query<T>(text, params)
    const duration = Date.now() - start

    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount })
    }

    return res
  } catch (error) {
    console.error('Error executing query', { text, error })
    throw error
  }
}

// Helper para obtener un solo registro
export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await query<T>(text, params)
  return result.rows[0] || null
}

// Helper para obtener múltiples registros
export async function queryMany<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await query<T>(text, params)
  return result.rows
}

// Helper para insertar y retornar el registro creado
export async function insertOne<T extends QueryResultRow = any>(
  table: string,
  data: Record<string, any>
): Promise<T> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')

  const text = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `

  const result = await query<T>(text, values)
  return result.rows[0]
}

// Helper para actualizar un registro
export async function updateOne<T extends QueryResultRow = any>(
  table: string,
  id: number,
  data: Record<string, any>
): Promise<T | null> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ')

  const text = `
    UPDATE ${table}
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `

  const result = await query<T>(text, [id, ...values])
  return result.rows[0] || null
}

// Helper para soft delete
export async function softDelete(table: string, id: number): Promise<boolean> {
  const text = `
    UPDATE ${table}
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `

  const result = await query(text, [id])
  return (result.rowCount ?? 0) > 0
}

// Helper para transacciones
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Helper para paginación
export interface PaginationParams {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'ASC' | 'DESC'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function queryPaginated<T extends QueryResultRow = any>(
  baseQuery: string,
  params: unknown[] = [],
  pagination: PaginationParams = {}
): Promise<PaginatedResult<T>> {
  const page = pagination.page || 1
  const limit = pagination.limit || 10
  const offset = (page - 1) * limit
  const orderBy = pagination.orderBy || 'id'
  const orderDirection = pagination.orderDirection || 'DESC'

  // Query para datos
  const dataQuery = `
    ${baseQuery}
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `

  // Query para total
  const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`

  const [dataResult, countResult] = await Promise.all([
    query<T>(dataQuery, [...params, limit, offset]),
    query<{ total: string }>(countQuery, params)
  ])

  const total = parseInt(countResult.rows[0]?.total || '0', 10)
  const totalPages = Math.ceil(total / limit)

  return {
    data: dataResult.rows,
    total,
    page,
    limit,
    totalPages
  }
}

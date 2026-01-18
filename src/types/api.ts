// Common API Types

// Query parameter types for PostgreSQL
export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = QueryParamValue[];

// Legacy support
export type QueryParam = QueryParamValue;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Database query result types
export interface DbQueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

// Common entity types
export interface BaseEntity {
  id: number;
  created_at?: string;
  updated_at?: string;
}

export interface TenantEntity extends BaseEntity {
  tenant_id: number;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

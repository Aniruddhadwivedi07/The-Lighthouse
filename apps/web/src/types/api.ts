/**
 * Shared frontend types for Lighthouse.
 *
 * This includes mirror definitions for backend schemas, standard API error envelopes,
 * and UI component state contracts.
 */

// ---------------------------------------------------------------------------
// Backend Error Envelope (Mirrors backend/app/schemas/errors.py)
// ---------------------------------------------------------------------------
export interface ApiErrorDetail {
  location: string
  message: string
  error_type: string
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: ApiErrorDetail[] | null
}

export interface ApiErrorResponse {
  error: ApiErrorBody
}

/**
 * Normalised frontend application error.
 */
export interface AppError {
  message: string
  code?: string
  status?: number
  details?: ApiErrorDetail[]
  raw?: unknown
}

// ---------------------------------------------------------------------------
// Health & System Status (Mirrors backend/app/routers/health.py)
// ---------------------------------------------------------------------------
export interface ComponentStatus {
  ok: boolean
  detail: string | null
}

export interface ReadinessResponse {
  status: 'ready' | 'degraded' | 'not_ready'
  database: ComponentStatus
  generation: ComponentStatus
  embeddings: ComponentStatus
}

export interface LivenessResponse {
  status: string
  uptime_seconds: number
  environment: string
}

// ---------------------------------------------------------------------------
// Planned Navigation / Workflow Views (for UI shell only)
// ---------------------------------------------------------------------------
export type AppView =
  | 'system-status'
  | 'component-showcase'
  | 'profile'
  | 'knowledge'
  | 'candidates'
  | 'blueprint'

/**
 * Shared TypeScript types mirroring the Pydantic schemas in the backend.
 * Keep these in sync manually (or generate them from the OpenAPI spec later).
 */

// ---------------------------------------------------------------------------
// Health
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

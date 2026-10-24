import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/FeedbackStates'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { ReadinessResponse, LivenessResponse } from '@/types/api'
import { RefreshCw, Server, Activity, Database, Sparkles, Cpu } from 'lucide-react'

export const SystemStatusView: React.FC = () => {
  // Query Readiness endpoint
  const readinessQuery = useQuery<ReadinessResponse>({
    queryKey: ['health', 'ready'],
    queryFn: () => apiClient.get<ReadinessResponse>('/health/ready'),
    retry: false,
    refetchInterval: 10_000,
  })

  // Query Liveness endpoint
  const livenessQuery = useQuery<LivenessResponse>({
    queryKey: ['health', 'live'],
    queryFn: () => apiClient.get<LivenessResponse>('/health'),
    retry: false,
  })

  const isLoading = readinessQuery.isLoading && livenessQuery.isLoading
  const isError = readinessQuery.isError && livenessQuery.isError

  const refetchAll = () => {
    readinessQuery.refetch()
    livenessQuery.refetch()
  }

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Server className="w-6 h-6 text-lighthouse-600" />
            Backend Connectivity & Readiness
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status reported by the FastAPI backend (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">/health</code> & <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">/health/ready</code>).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            isLoading={readinessQuery.isFetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Information Notice */}
      <Alert variant="info" title="Application Shell Foundation">
        The application is running in scaffold mode. Only backend health and configuration endpoints are actively wired. Domain workflows (profiles, seed knowledge base, retrieval, generation) will be progressively integrated as respective backend services are implemented.
      </Alert>

      {/* Connection Failure Error State */}
      {isError && (
        <ErrorState
          title="Cannot Connect to Backend"
          message="Failed to communicate with the FastAPI backend through the Vite proxy (/api). Ensure uvicorn is running on port 8000."
          details={readinessQuery.error?.message || 'Network error or connection refused'}
          onRetry={refetchAll}
        />
      )}

      {/* Loading state */}
      {isLoading && !isError && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
              <Spinner size="lg" label="Checking backend health..." />
              <span className="text-sm font-medium">Querying backend readiness endpoints…</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Data Display */}
      {!isLoading && (readinessQuery.data || livenessQuery.data) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Liveness Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4 text-lighthouse-600" />
                  API Process Liveness
                </CardTitle>
                {livenessQuery.data && (
                  <Badge variant="success" size="sm">
                    {livenessQuery.data.status}
                  </Badge>
                )}
              </div>
              <CardDescription>
                Verifies the HTTP server is serving requests without external dependency checks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {livenessQuery.isLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <Spinner size="sm" />
                </div>
              ) : livenessQuery.data ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Environment</span>
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      {livenessQuery.data.environment}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Process Uptime</span>
                    <span className="font-mono text-xs text-slate-800">
                      {Math.floor(livenessQuery.data.uptime_seconds)} seconds
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Endpoint</span>
                    <code className="text-xs font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      GET /health
                    </code>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No liveness data available</p>
              )}
            </CardContent>
          </Card>

          {/* Readiness Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Server className="w-4 h-4 text-lighthouse-600" />
                  Subsystem Readiness
                </CardTitle>
                {readinessQuery.data && (
                  <Badge
                    variant={
                      readinessQuery.data.status === 'ready'
                        ? 'success'
                        : readinessQuery.data.status === 'degraded'
                        ? 'warning'
                        : 'error'
                    }
                    size="sm"
                  >
                    {readinessQuery.data.status}
                  </Badge>
                )}
              </div>
              <CardDescription>
                Live verification of database connectivity, LLM provider settings, and embedding libraries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readinessQuery.data ? (
                <ul className="space-y-3 text-sm divide-y divide-slate-100">
                  <li className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-700">Database Connection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {readinessQuery.data.database.ok ? (
                        <Badge variant="success" size="sm">
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Not ready
                        </Badge>
                      )}
                    </div>
                  </li>
                  {readinessQuery.data.database.detail && (
                    <li className="pt-2 text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded">
                      {readinessQuery.data.database.detail}
                    </li>
                  )}

                  <li className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-700">Generation Model (LLM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {readinessQuery.data.generation.ok ? (
                        <Badge variant="success" size="sm">
                          Configured
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Not configured
                        </Badge>
                      )}
                    </div>
                  </li>
                  {readinessQuery.data.generation.detail && (
                    <li className="pt-2 text-xs text-amber-800 bg-amber-50/80 p-2 rounded border border-amber-200">
                      {readinessQuery.data.generation.detail}
                    </li>
                  )}

                  <li className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-700">Embeddings Subsystem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {readinessQuery.data.embeddings.ok ? (
                        <Badge variant="success" size="sm">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Not available
                        </Badge>
                      )}
                    </div>
                  </li>
                  {readinessQuery.data.embeddings.detail && (
                    <li className="pt-2 text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded">
                      {readinessQuery.data.embeddings.detail}
                    </li>
                  )}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

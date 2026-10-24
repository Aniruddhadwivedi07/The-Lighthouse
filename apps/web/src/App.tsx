/**
 * Lighthouse App — placeholder root component.
 *
 * This file will be replaced with full routing once the backend is ready.
 * For now it renders a health-status indicator that calls GET /api/health/ready.
 */
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { ReadinessResponse } from '@/types/api'

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
        ok ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {ok ? 'OK' : 'Not configured'}
    </span>
  )
}

export default function App() {
  const { data, isLoading, isError } = useQuery<ReadinessResponse>({
    queryKey: ['health'],
    queryFn: () => api.get('/health/ready').then((r) => r.data),
    retry: false,
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      {/* Logo / wordmark placeholder */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-5xl">🔦</div>
        <h1 className="text-3xl font-bold text-lighthouse-600 tracking-tight">Lighthouse</h1>
        <p className="text-slate-500 text-sm max-w-xs text-center">
          Personalised hackathon problem discovery powered by historical intelligence.
        </p>
      </div>

      {/* System status card */}
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">System status</h2>

        {isLoading && (
          <p className="text-slate-400 text-sm animate-pulse">Checking backend…</p>
        )}

        {isError && (
          <p className="text-red-600 text-sm">
            Cannot reach the backend. Is <code>uvicorn</code> running on port 8000?
          </p>
        )}

        {data && (
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between items-center">
              <span className="text-slate-600">Overall</span>
              <span
                className={`font-medium ${
                  data.status === 'ready'
                    ? 'text-green-600'
                    : data.status === 'degraded'
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {data.status}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-slate-600">Database</span>
              <StatusBadge ok={data.database.ok} />
            </li>
            <li className="flex justify-between items-center">
              <span className="text-slate-600">Generation (LLM)</span>
              <StatusBadge ok={data.generation.ok} />
            </li>
            <li className="flex justify-between items-center">
              <span className="text-slate-600">Embeddings</span>
              <StatusBadge ok={data.embeddings.ok} />
            </li>
            {!data.generation.ok && data.generation.detail && (
              <li className="pt-2 text-xs text-amber-700 bg-amber-50 rounded p-2">
                {data.generation.detail}
              </li>
            )}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Full questionnaire UI coming in the next build step.
      </p>
    </div>
  )
}

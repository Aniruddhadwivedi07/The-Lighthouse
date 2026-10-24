import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/FeedbackStates'
import { Compass, Database, Layers, MapPin, BookOpen } from 'lucide-react'
import type { AppView } from '@/types/api'

interface PlannedWorkflowViewProps {
  viewId: AppView
  onNavigateToDesignSystem?: () => void
}

interface WorkflowMeta {
  title: string
  subtitle: string
  phase: string
  icon: React.ReactNode
  plannedCapabilities: string[]
  backendContract: string
  schemaReference: string
}

const VIEW_METADATA: Record<string, WorkflowMeta> = {
  profile: {
    title: 'Team Profile & Capabilities',
    subtitle: 'Capture team composition, skills, experience levels, and project constraints.',
    phase: 'Phase 1 MVP (P1-03)',
    icon: <Compass className="w-6 h-6 text-lighthouse-600" />,
    plannedCapabilities: [
      'Multi-member skill & track inventory (e.g. Frontend, ML/AI, Backend, Hardware)',
      'Deterministic validation of team constraints (hours available, compute access)',
      'Strict schema verification preventing hallucinated capabilities',
      'Team baseline exportable for recommendation ranking',
    ],
    backendContract: 'POST /profile/validate and POST /profile',
    schemaReference: 'backend/app/schemas/profile.py (To be created in P1-03)',
  },
  knowledge: {
    title: 'Historical Knowledge Base',
    subtitle: 'Explore genuine hackathon problem statements and verified project records.',
    phase: 'Phase 1 MVP (P1-04)',
    icon: <Database className="w-6 h-6 text-lighthouse-600" />,
    plannedCapabilities: [
      'Search curated historical records with full provenance links',
      'Filter by challenge domain, complexity, and technology categories',
      'View field-level verification status (verified facts vs. inferences)',
      'Strict licence adherence with zero synthetic/fabricated records',
    ],
    backendContract: 'GET /knowledge/records and GET /knowledge/search',
    schemaReference: 'data/schemas/historical_record.schema.json & data/SOURCES.md',
  },
  candidates: {
    title: 'Candidate Generation & Comparison',
    subtitle: 'Retrieve relevant problem statements and synthesize evidence-backed candidate problems.',
    phase: 'Phase 1 MVP (P1-05 & P1-06)',
    icon: <Layers className="w-6 h-6 text-lighthouse-600" />,
    plannedCapabilities: [
      'Semantic retrieval matching team skills against historical challenges',
      'LLM-assisted problem candidate generation with explicit citation links',
      'Deterministic feasibility scores (skill fit, time fit, dependency risk)',
      'Side-by-side comparison matrix with clear evidence backing',
    ],
    backendContract: 'POST /generate/candidates and POST /feasibility/evaluate',
    schemaReference: 'docs/PROJECT_PLAN.md (§3 Pipeline Specification)',
  },
  blueprint: {
    title: 'Execution Blueprint',
    subtitle: 'Translate selected problem candidate into an actionable build roadmap.',
    phase: 'Phase 1 MVP (P1-07)',
    icon: <MapPin className="w-6 h-6 text-lighthouse-600" />,
    plannedCapabilities: [
      'Milestone-driven roadmap tailored to remaining hackathon hours',
      'Architecture recommendations and technical dependency checklist',
      'Risk mitigation strategies derived from historical bottlenecks',
      'Structured task checklist exportable to GitHub or markdown',
    ],
    backendContract: 'POST /blueprint/generate',
    schemaReference: 'docs/PROJECT_PLAN.md (§3 Pipeline Specification)',
  },
}

export const PlannedWorkflowView: React.FC<PlannedWorkflowViewProps> = ({
  viewId,
  onNavigateToDesignSystem,
}) => {
  const meta = VIEW_METADATA[viewId] || {
    title: 'Planned Feature',
    subtitle: 'This feature is part of the planned roadmap.',
    phase: 'Phase 1 MVP',
    icon: <BookOpen className="w-6 h-6 text-lighthouse-600" />,
    plannedCapabilities: [],
    backendContract: 'TBD',
    schemaReference: 'docs/PROJECT_PLAN.md',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lighthouse-50 rounded-xl border border-lighthouse-100">
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {meta.title}
              </h1>
              <Badge variant="warning" size="sm">
                Planned
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{meta.subtitle}</p>
          </div>
        </div>
        <Badge variant="neutral" size="sm">
          {meta.phase}
        </Badge>
      </div>

      {/* Development Transparency Banner */}
      <Alert variant="warning" title="Development Boundary Notice">
        Per the Lighthouse project charter, this workflow view is not yet connected to a live backend endpoint. We do not synthesize simulated responses or display placeholder claims that give a false impression of completed AI generation.
      </Alert>

      {/* Planned Feature Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planned Core Capabilities</CardTitle>
          <CardDescription>
            These capabilities will be integrated once the respective backend domain service is implemented.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2.5">
            {meta.plannedCapabilities.map((cap, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lighthouse-50 text-lighthouse-700 text-xs font-semibold">
                  {idx + 1}
                </span>
                <span>{cap}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700 block mb-1">
                Planned REST API Contract
              </span>
              <code className="text-lighthouse-700 font-mono">{meta.backendContract}</code>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700 block mb-1">
                Schema & Policy Reference
              </span>
              <code className="text-slate-600 font-mono break-all">{meta.schemaReference}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State Showcase */}
      <EmptyState
        title={`${meta.title} is Awaiting Backend Integration`}
        description="The frontend shell and design tokens are ready. Components will activate as database models and API routers are delivered in subsequent tasks."
        actionLabel="Explore Reusable Design System"
        onAction={onNavigateToDesignSystem}
      />
    </div>
  )
}

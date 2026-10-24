import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select, FormField } from '@/components/ui/FormControls'
import { Spinner, Skeleton, LoadingOverlay } from '@/components/ui/Loading'
import { EmptyState, ErrorState } from '@/components/ui/FeedbackStates'
import { Sparkles, Send, Search, Check, AlertCircle, RefreshCw } from 'lucide-react'

export const ComponentShowcaseView: React.FC = () => {
  const [btnLoading, setBtnLoading] = useState(false)
  const [formInput, setFormInput] = useState('')
  const [formError, setFormError] = useState<string | undefined>()
  const [showAlert, setShowAlert] = useState(true)

  const handleValidateForm = () => {
    if (!formInput.trim()) {
      setFormError('This field cannot be empty.')
    } else {
      setFormError(undefined)
    }
  }

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Intro Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-lighthouse-600" />
          Reusable Design System & Components
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          A typed, accessible component library built with React, TypeScript, and Tailwind CSS.
          Demonstrating consistent branding, micro-interactions, responsive form controls, and feedback states.
        </p>
      </div>

      {/* 1. Buttons */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Buttons</h2>
            <p className="text-xs text-slate-500">Variants, sizes, loading states, and icon placements</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBtnLoading(!btnLoading)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Toggle Loading State ({btnLoading ? 'ON' : 'OFF'})
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Variants</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" isLoading={btnLoading}>
                  Primary Button
                </Button>
                <Button variant="secondary" isLoading={btnLoading}>
                  Secondary Button
                </Button>
                <Button variant="outline" isLoading={btnLoading}>
                  Outline Button
                </Button>
                <Button variant="ghost" isLoading={btnLoading}>
                  Ghost Button
                </Button>
                <Button variant="danger" isLoading={btnLoading}>
                  Danger Button
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Sizes & Icons</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
                  Small (sm)
                </Button>
                <Button size="md" rightIcon={<Send className="w-4 h-4" />}>
                  Medium (md)
                </Button>
                <Button size="lg" leftIcon={<Sparkles className="w-5 h-5 text-amber-400" />}>
                  Large (lg)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Badges */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Badges</h2>
          <p className="text-xs text-slate-500">Semantic indicators for status, provenance, and verification</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="default">Brand / Default</Badge>
              <Badge variant="success">Verified Fact</Badge>
              <Badge variant="warning">Inferred / Caution</Badge>
              <Badge variant="error">Feasibility Risk</Badge>
              <Badge variant="neutral">Metadata</Badge>
              <Badge variant="outline">Unverified / Open</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Badge variant="success" size="sm">
                <Check className="w-3 h-3" />
                Verified
              </Badge>
              <Badge variant="warning" size="sm">
                <AlertCircle className="w-3 h-3" />
                Inferred
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Form Controls & Validation */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Form Controls & Validation</h2>
          <p className="text-xs text-slate-500">Accessible inputs, selects, textareas, and field validation</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  label="Team Identifier or Project Name"
                  htmlFor="input-demo"
                  helperText="Required identifier for team context."
                  errorText={formError}
                  required
                >
                  <Input
                    id="input-demo"
                    placeholder="e.g. Apollo-11"
                    value={formInput}
                    onChange={(e) => {
                      setFormInput(e.target.value)
                      if (formError) setFormError(undefined)
                    }}
                    error={Boolean(formError)}
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                </FormField>

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleValidateForm}>
                    Validate Input
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFormInput('')
                      setFormError(undefined)
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  label="Primary Track / Challenge"
                  htmlFor="select-demo"
                  helperText="Select the relevant domain."
                >
                  <Select id="select-demo" defaultValue="ai">
                    <option value="ai">AI & Machine Learning</option>
                    <option value="web3">FinTech & Web3</option>
                    <option value="health">Healthcare & BioTech</option>
                    <option value="climate">Climate & Sustainability</option>
                  </Select>
                </FormField>

                <FormField
                  label="Brief Constraint Summary"
                  htmlFor="textarea-demo"
                  helperText="Provide technical constraints or available hardware."
                >
                  <Textarea
                    id="textarea-demo"
                    rows={2}
                    placeholder="e.g. 2 developers, 24 hours available, CPU-only inference."
                  />
                </FormField>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Alerts & Notifications */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Alerts & Notifications</h2>
            <p className="text-xs text-slate-500">Contextual feedback banners</p>
          </div>
          {!showAlert && (
            <Button variant="outline" size="sm" onClick={() => setShowAlert(true)}>
              Restore Dismissible Alert
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <Alert variant="info" title="Informational Notice">
            Lighthouse prioritises verifiable facts from documented sources over ungrounded generative claims.
          </Alert>

          <Alert variant="success" title="Validation Passed">
            Team profile schema constraints satisfy minimum feasibility thresholds.
          </Alert>

          <Alert variant="warning" title="Feasibility Warning">
            The selected candidate requires GPU hardware acceleration which is absent from the stated team profile.
          </Alert>

          {showAlert && (
            <Alert
              variant="error"
              title="Dismissible Error Alert"
              onClose={() => setShowAlert(false)}
            >
              Could not complete vector indexing. Click the close button on the right to dismiss.
            </Alert>
          )}
        </div>
      </section>

      {/* 5. Loading Indicators & Skeletons */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Loading States & Skeletons</h2>
          <p className="text-xs text-slate-500">Accessible ARIA spinners, skeleton screens, and loading overlays</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spinners & Overlay</CardTitle>
              <CardDescription>Indeterminate progress feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
              <div className="border border-slate-100 rounded-lg">
                <LoadingOverlay message="Embedding query vectors…" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skeleton Placeholders</CardTitle>
              <CardDescription>Smooth placeholder transitions while data fetches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 6. Empty & Error States */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Empty & Error Feedback States</h2>
          <p className="text-xs text-slate-500">Friendly, actionable placeholders for empty collections and server errors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmptyState
            title="No Candidates Generated Yet"
            description="Complete the team profile questionnaire to compute matched problem candidates from historical hackathon records."
            actionLabel="Start Profile"
            onAction={() => alert('Empty state action triggered!')}
          />

          <ErrorState
            title="API Evaluation Failed"
            message="The external inference endpoint returned a non-retryable 422 schema validation error."
            details="Error: ModelAdapterResponseValidationError: field 'complexity' missing."
            onRetry={() => alert('Retry action triggered!')}
          />
        </div>
      </section>
    </div>
  )
}

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { SystemStatusView } from '@/views/SystemStatusView'
import { ComponentShowcaseView } from '@/views/ComponentShowcaseView'
import { PlannedWorkflowView } from '@/views/PlannedWorkflowView'
import type { AppView } from '@/types/api'

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('system-status')

  return (
    <AppLayout currentView={currentView} onSelectView={setCurrentView}>
      {currentView === 'system-status' && <SystemStatusView />}
      {currentView === 'component-showcase' && <ComponentShowcaseView />}
      {(currentView === 'profile' ||
        currentView === 'knowledge' ||
        currentView === 'candidates' ||
        currentView === 'blueprint') && (
        <PlannedWorkflowView
          viewId={currentView}
          onNavigateToDesignSystem={() => setCurrentView('component-showcase')}
        />
      )}
    </AppLayout>
  )
}

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'

export type CompetencyLevel =
  | 'no_data'
  | 'not_met'
  | 'developing'
  | 'achieved'

export type AgeExperiencePolicy = {
  uiPolicy: {
    density: 'airy' | 'balanced' | 'detailed'
    maxChoicesPerStep: number
    largeControls: boolean
    oneActivityPerScreen: boolean
    showDetailedProgress: boolean
  }
  copyPolicy: {
    instructionLength: 'short' | 'balanced' | 'detailed'
    readingSupport: boolean
    errorTone: 'gentle' | 'neutral'
    actionLabels: Record<string, string>
    competencyLevelLabels: Record<CompetencyLevel, string>
  }
  permissionPolicy: {
    canDownloadLessons: boolean
    canShareCredentials: boolean
    canEditProfile: boolean
    canRequestReschedule: boolean
    requireParentConfirmationFor: string[]
  }
  assessmentPolicy: {
    allowedQuestionTypes: string[]
    maxShortTextLength: number
    preferOneQuestionPerScreen: boolean
  }
}

type AgeExperienceState = {
  ageBand: string | null
  status:
    | 'not_applicable'
    | 'loading'
    | 'ready'
    | 'configuration_required'
  policy: AgeExperiencePolicy | null
  actionLabel: (key: string, fallback: string) => string
}

const AgeExperienceContext = createContext<AgeExperienceState>({
  ageBand: null,
  status: 'not_applicable',
  policy: null,
  actionLabel: (_key, fallback) => fallback,
})

export function AgeExperienceProvider({ children }: { children: ReactNode }) {
  const userId = useAuth((state) => state.user?.id)
  const role = useAuth((state) => state.user?.role)
  const authLoading = useAuth((state) => state.loading)
  const [result, setResult] = useState<{
    ageBand: string | null
    status: AgeExperienceState['status']
    policy: AgeExperiencePolicy | null
  }>({ ageBand: null, status: 'not_applicable', policy: null })

  useEffect(() => {
    let active = true
    if (authLoading) {
      setResult({ ageBand: null, status: 'loading', policy: null })
      return () => {
        active = false
      }
    }
    if (!userId || role !== 'student') {
      setResult({ ageBand: null, status: 'not_applicable', policy: null })
      return () => {
        active = false
      }
    }
    setResult((current) => ({ ...current, status: 'loading' }))
    void api<{
      ageBand: string
      status: 'ready' | 'configuration_required'
      policy: AgeExperiencePolicy | null
    }>('/api/learning/age-policy')
      .then((response) => {
        if (!active) return
        setResult({
          ageBand: response.ageBand,
          status: response.status,
          policy: response.policy,
        })
      })
      .catch(() => {
        if (!active) return
        // Permissions stay closed when policy cannot be loaded.
        setResult({
          ageBand: null,
          status: 'configuration_required',
          policy: null,
        })
      })
    return () => {
      active = false
    }
  }, [authLoading, role, userId])

  useEffect(() => {
    const root = document.documentElement
    if (result.ageBand) root.dataset.ageBand = result.ageBand
    else delete root.dataset.ageBand
    if (result.policy) {
      root.dataset.ageDensity = result.policy.uiPolicy.density
      root.dataset.ageLargeControls = String(
        result.policy.uiPolicy.largeControls,
      )
    } else {
      delete root.dataset.ageDensity
      delete root.dataset.ageLargeControls
    }
  }, [result.ageBand, result.policy])

  const value = useMemo<AgeExperienceState>(
    () => ({
      ...result,
      actionLabel: (key, fallback) =>
        result.policy?.copyPolicy.actionLabels[key] ?? fallback,
    }),
    [result],
  )

  return (
    <AgeExperienceContext.Provider value={value}>
      {children}
    </AgeExperienceContext.Provider>
  )
}

export function useAgeExperience() {
  return useContext(AgeExperienceContext)
}

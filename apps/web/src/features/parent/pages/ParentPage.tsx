import { useCallback, useEffect, useState } from 'react'
import {
  ParentSubscriptionCheckoutModal,
  type CheckoutProductMode,
} from '@/features/parent/components/ParentSubscriptionCheckoutModal'
import { ParentDashboardTab } from '@/features/parent/components/tabs/ParentDashboardTab'
import { ParentKidsTab } from '@/features/parent/components/tabs/ParentKidsTab'
import { ParentPlanTab } from '@/features/parent/components/tabs/ParentPlanTab'
import { ParentApprovalsTab } from '@/features/parent/components/tabs/ParentApprovalsTab'
import { ParentProfileTab } from '@/features/parent/components/tabs/ParentProfileTab'
import type { TabKey } from '@/features/parent/types/parent.types'

export type { TabKey }

export function ParentPage({
  tab: initTab = 'dashboard',
}: {
  tab?: TabKey
}) {
  const [tab, setTab] = useState<TabKey>(initTab)

  // Checkout modal state shared across tabs
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutMode, setCheckoutMode] = useState<CheckoutProductMode>('sub')
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | undefined>()
  const [checkoutPlanAmount, setCheckoutPlanAmount] = useState<number | undefined>()
  const [checkoutPlanName, setCheckoutPlanName] = useState<string | undefined>()
  const [checkoutPackId, setCheckoutPackId] = useState<string | undefined>()

  const handleOpenCheckout = useCallback(
    (
      mode: CheckoutProductMode = 'sub',
      planId?: string,
      amount?: number,
      planName?: string,
      packId?: string,
    ) => {
      setCheckoutMode(mode)
      setCheckoutPlanId(planId)
      setCheckoutPlanAmount(amount)
      setCheckoutPlanName(planName)
      setCheckoutPackId(packId)
      setIsCheckoutOpen(true)
    },
    [],
  )

  useEffect(() => {
    setTab(initTab)
  }, [initTab])

  return (
    <div className="flex flex-col gap-6">
      {/* Only the active route owns effects and server state. */}
      {tab === 'dashboard' && <ParentDashboardTab onOpenCheckout={handleOpenCheckout} />}
      {tab === 'kids' && <ParentKidsTab />}
      {tab === 'plan' && <ParentPlanTab onOpenCheckout={handleOpenCheckout} />}
      {tab === 'approvals' && <ParentApprovalsTab />}
      {tab === 'profile' && <ParentProfileTab />}

      <ParentSubscriptionCheckoutModal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false)
          window.dispatchEvent(new CustomEvent('parent:reload-data'))
        }}
        initialMode={checkoutMode}
        defaultPlanId={checkoutPlanId || 'aikids_official_129k'}
        planAmount={checkoutPlanAmount}
        planName={checkoutPlanName}
        initialPackId={checkoutPackId}
      />
    </div>
  )
}

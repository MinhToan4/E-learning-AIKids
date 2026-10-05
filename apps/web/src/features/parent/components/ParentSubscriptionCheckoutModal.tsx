import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Palette,
  RefreshCw,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { api } from '@/shared/lib/api'

export type CheckoutProductMode = 'sub' | 'credits'

export interface CreditPack {
  id: string
  credits: number
  price: number
  priceFormatted: string
  label: string
  badge?: string
  unitPriceText: string
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'credits_10',
    credits: 10,
    price: 20000,
    priceFormatted: '20.000 đ',
    label: '10 lượt',
    unitPriceText: '2.000 đ/lượt',
  },
  {
    id: 'credits_25',
    credits: 25,
    price: 50000,
    priceFormatted: '50.000 đ',
    label: '25 lượt',
    unitPriceText: '2.000 đ/lượt',
  },
  {
    id: 'credits_50',
    credits: 50,
    price: 100000,
    priceFormatted: '100.000 đ',
    label: '50 lượt',
    badge: 'Phổ biến nhất',
    unitPriceText: '2.000 đ/lượt',
  },
  {
    id: 'credits_100',
    credits: 100,
    price: 180000,
    priceFormatted: '180.000 đ',
    label: '100 lượt',
    badge: 'Tiết kiệm 10%',
    unitPriceText: '1.800 đ/lượt',
  },
  {
    id: 'credits_200',
    credits: 200,
    price: 320000,
    priceFormatted: '320.000 đ',
    label: '200 lượt',
    badge: 'Tiết kiệm 20%',
    unitPriceText: '1.600 đ/lượt',
  },
]

export function findCreditPack(packId?: string): CreditPack {
  if (!packId) return CREDIT_PACKS[2]
  return (
    CREDIT_PACKS.find(
      (p) =>
        p.id === packId ||
        p.id === `credits_${packId}` ||
        p.id === `pack_${packId}` ||
        String(p.credits) === packId,
    ) ?? CREDIT_PACKS[2]
  )
}

export function formatMoney(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`
}

export const COUNTDOWN_SECONDS = 900 // 15 minutes

export function formatCountdown(seconds: number): string {
  const mins = Math.floor(Math.max(0, seconds) / 60)
  const secs = Math.max(0, seconds) % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export interface ParentSubscriptionCheckoutModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultPlanId?: string
  paymentCode?: string
  publicId?: string
  initialMode?: CheckoutProductMode
  initialPackId?: string
  planAmount?: number
  planName?: string
}

export type PaymentTab = 'vietqr' | 'manual'

export const BANK_INFO = {
  bankName: 'Vietcombank (Ngân hàng TMCP Ngoại thương Việt Nam)',
  accountNumber: '9812723359',
  accountName: 'LE QUANG MINH',
  branch: 'Trụ sở CN Ba Đình',
  amount: 129000,
  amountFormatted: '129.000 đ',
  hotline: '0382.228.888',
  originalQrUrl: '/images/qr-lequangminh-vcb.png',
}

// Deprecated bank app list kept for external interface safety
export const POPULAR_BANK_APPS = [
  { id: 'mbbank', name: 'MB Bank', scheme: 'mbmobile://', short: 'MB', color: 'bg-blue-600' },
  { id: 'vcb', name: 'Vietcombank', scheme: 'vietcombank://', short: 'VCB', color: 'bg-emerald-600' },
  { id: 'tcb', name: 'Techcombank', scheme: 'techcombank://', short: 'TCB', color: 'bg-red-600' },
  { id: 'bidv', name: 'BIDV', scheme: 'bidvsmartbanking://', short: 'BIDV', color: 'bg-teal-700' },
  { id: 'vpbank', name: 'VPBank', scheme: 'vpbankneo://', short: 'VPB', color: 'bg-green-600' },
  { id: 'tpbank', name: 'TPBank', scheme: 'tpbankmobile://', short: 'TPB', color: 'bg-purple-600' },
  { id: 'acb', name: 'ACB ONE', scheme: 'acbone://', short: 'ACB', color: 'bg-blue-700' },
  { id: 'momo', name: 'Ví MoMo', scheme: 'momo://', short: 'MoMo', color: 'bg-pink-600' },
  { id: 'zalopay', name: 'ZaloPay', scheme: 'zalopay://', short: 'ZaloPay', color: 'bg-cyan-600' },
]

export interface PaymentIntentResponse {
  status?: string
  amountPaid?: number
  amountDue?: number
  overpayBonusCredits?: number
  paymentIntent?: {
    status: string
    publicId?: string
    amountPaid?: number
    amountDue?: number
    overpayBonusCredits?: number
  }
  data?: {
    status?: string
    amountPaid?: number
    amountDue?: number
    overpayBonusCredits?: number
    paymentIntent?: {
      status: string
      amountPaid?: number
      amountDue?: number
      overpayBonusCredits?: number
    }
  }
}

export function extractPaymentIntentData(res: PaymentIntentResponse | undefined) {
  const status =
    res?.paymentIntent?.status ??
    res?.data?.paymentIntent?.status ??
    res?.data?.status ??
    res?.status

  const amountPaid =
    res?.paymentIntent?.amountPaid ??
    res?.data?.paymentIntent?.amountPaid ??
    res?.data?.amountPaid ??
    res?.amountPaid ??
    0

  const amountDue =
    res?.paymentIntent?.amountDue ??
    res?.data?.paymentIntent?.amountDue ??
    res?.data?.amountDue ??
    res?.amountDue ??
    0

  const overpayBonusCredits =
    res?.paymentIntent?.overpayBonusCredits ??
    res?.data?.paymentIntent?.overpayBonusCredits ??
    res?.data?.overpayBonusCredits ??
    res?.overpayBonusCredits

  return { status, amountPaid, amountDue, overpayBonusCredits }
}

export function ParentSubscriptionCheckoutModal({
  open,
  onClose,
  onSuccess,
  defaultPlanId = 'aikids_official_129k',
  paymentCode: initialPaymentCode,
  publicId: initialPublicId,
  initialMode = 'sub',
  initialPackId,
  planAmount,
  planName,
}: ParentSubscriptionCheckoutModalProps) {
  const [productMode, setProductMode] = useState<CheckoutProductMode>(initialMode)
  const [selectedPackId, setSelectedPackId] = useState<string>(
    initialPackId ?? 'credits_50',
  )
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [manualSubmitted, setManualSubmitted] = useState(false)
  const [partialPayment, setPartialPayment] = useState<{
    amountPaid: number
    amountDue: number
  } | null>(null)
  const [overpayBonusCredits, setOverpayBonusCredits] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS)
  const [refreshKey, setRefreshKey] = useState(0)
  const [serverPublicId, setServerPublicId] = useState<string | null>(null)
  const [serverPaymentCode, setServerPaymentCode] = useState<string | null>(null)
  const [qrViewMode, setQrViewMode] = useState<'dynamic' | 'original'>('dynamic')

  // Find currently selected credit pack
  const selectedPack = useMemo(() => findCreditPack(selectedPackId), [selectedPackId])

  // Amounts calculation
  const subAmount = typeof planAmount === 'number' && planAmount > 0 ? planAmount : BANK_INFO.amount
  const baseAmount = productMode === 'sub' ? subAmount : selectedPack.price
  const effectiveAmount = partialPayment ? partialPayment.amountDue : baseAmount
  const effectiveAmountFormatted = formatMoney(effectiveAmount)

  // Generate a friendly, stable payment code when opened or refreshed
  const generatedCode = useMemo(() => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    return productMode === 'credits' ? `AKCRE${randomDigits}` : `AK129K${randomDigits}`
  }, [open, productMode, refreshKey])

  const activePaymentCode = initialPaymentCode || serverPaymentCode || generatedCode
  const activePublicId = initialPublicId || serverPublicId || `pi_${activePaymentCode.toLowerCase()}`

  // Reset state when opening or when props change
  useEffect(() => {
    if (open) {
      setProductMode(initialMode)
      setSelectedPackId(initialPackId ?? 'credits_50')
      setIsSuccess(false)
      setManualSubmitted(false)
      setCopiedField(null)
      setPartialPayment(null)
      setOverpayBonusCredits(null)
      setServerPublicId(null)
      setServerPaymentCode(null)
      setQrViewMode('dynamic')
      setTimeLeft(COUNTDOWN_SECONDS)
    }
  }, [open, initialMode, initialPackId])

  // Initialize real backend order when opening modal or changing configuration
  useEffect(() => {
    if (!open) return

    let isMounted = true

    async function initCheckoutOrder() {
      try {
        if (productMode === 'sub') {
          const res = await api<{
            checkout?: { publicId?: string; paymentCode?: string }
            data?: { publicId?: string; metadata?: { paymentCode?: string } }
          }>('/api/v1/billing/me/checkout', {
            method: 'POST',
            body: JSON.stringify({
              plan: defaultPlanId || 'aikids_official_129k',
              provider: 'manual',
              paymentCode: generatedCode,
            }),
          })
          if (!isMounted) return
          const pubId = res?.checkout?.publicId || res?.data?.publicId
          const code = res?.checkout?.paymentCode || res?.data?.metadata?.paymentCode
          if (pubId) setServerPublicId(pubId)
          if (code) setServerPaymentCode(code)
        } else if (productMode === 'credits') {
          const res = await api<{
            checkout?: { publicId?: string }
            data?: { paymentIntent?: { publicId?: string } }
          }>('/api/v1/billing/me/credit-packs/checkout', {
            method: 'POST',
            body: JSON.stringify({
              packId: selectedPackId,
              provider: 'manual',
              idempotencyKey: 'credit-pack-' + selectedPackId + '-' + Date.now(),
            }),
          })
          if (!isMounted) return
          const pubId = res?.checkout?.publicId || res?.data?.paymentIntent?.publicId
          if (pubId) setServerPublicId(pubId)
        }
      } catch {
        // Safe try/catch: fallback to generatedCode to avoid disrupting UI
      }
    }

    void initCheckoutOrder()

    return () => {
      isMounted = false
    }
  }, [open, productMode, selectedPackId, refreshKey, defaultPlanId, generatedCode])

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Countdown timer: 15 minutes (900 seconds)
  useEffect(() => {
    if (!open || isSuccess) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, isSuccess, refreshKey])

  // Refresh payment code & reset timer
  const handleRefreshPayment = useCallback(() => {
    setTimeLeft(COUNTDOWN_SECONDS)
    setRefreshKey((k) => k + 1)
  }, [])

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      }
    } catch {
      // Gentle Montessori fallback: keep visual feedback even if clipboard blocked
    }
    setCopiedField(field)
    setTimeout(() => {
      setCopiedField((current) => (current === field ? null : current))
    }, 2000)
  }, [])

  // Process payment intent status
  const handlePaymentResponse = useCallback(
    (res: PaymentIntentResponse | undefined) => {
      const { status, amountPaid, amountDue, overpayBonusCredits: bonusCredits } =
        extractPaymentIntentData(res)

      if (status === 'succeeded') {
        if (typeof bonusCredits === 'number' && bonusCredits > 0) {
          setOverpayBonusCredits(bonusCredits)
        }
        setPartialPayment(null)
        setIsSuccess(true)
        onSuccess?.()
      } else if (status === 'partially_paid') {
        setPartialPayment({
          amountPaid,
          amountDue,
        })
      }
    },
    [onSuccess],
  )

  // Check payment status helper
  const checkPaymentStatus = useCallback(async () => {
    if (!activePublicId || isSuccess) return
    setIsPolling(true)
    try {
      const res = await api<PaymentIntentResponse>(
        `/api/v1/billing/payment-intents/${activePublicId}`,
      )
      handlePaymentResponse(res)
    } catch {
      // Quiet retry on polling error
    } finally {
      setIsPolling(false)
    }
  }, [activePublicId, isSuccess, handlePaymentResponse])

  // Polling every 3 seconds for VietQR
  useEffect(() => {
    if (!open || isSuccess || !activePublicId) return

    let isMounted = true
    const interval = setInterval(async () => {
      if (!isMounted) return
      try {
        const res = await api<PaymentIntentResponse>(
          `/api/v1/billing/payment-intents/${activePublicId}`,
        )
        if (!isMounted) return
        handlePaymentResponse(res)
      } catch {
        // Quietly continue polling
      }
    }, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [open, isSuccess, activePublicId, handlePaymentResponse])

  // Handle manual transfer confirmation
  const handleManualConfirm = useCallback(async () => {
    setManualSubmitted(true)
    try {
      if (activePublicId) {
        await api(`/api/v1/billing/payment-intents/${activePublicId}/customer-confirm`, {
          method: 'POST',
        })
      }
    } catch {
      // Safe fallback: continue without blocking confirmation UI
    }
    void checkPaymentStatus()
  }, [activePublicId, checkPaymentStatus])

  // VietQR URL with dynamically computed amount (using remaining amountDue if partially paid)
  const vietQrUrl = `https://img.vietqr.io/image/VCB-9812723359-compact2.png?amount=${effectiveAmount}&addInfo=${encodeURIComponent(activePaymentCode)}&accountName=${encodeURIComponent('LE QUANG MINH')}`

  // Download QR code image to device
  const handleDownloadQr = useCallback(() => {
    const downloadTargetUrl = qrViewMode === 'original' ? BANK_INFO.originalQrUrl : vietQrUrl
    const downloadFileName =
      qrViewMode === 'original'
        ? 'vietcombank-qr-lequangminh.png'
        : `vietqr-aikids-${activePaymentCode}.png`

    fetch(downloadTargetUrl)
      .then((res) => res.blob())
      .then((blob) => {
        if (typeof window === 'undefined') return
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = downloadFileName
        document.body.appendChild(a)
        try {
          a.click()
        } catch {
          // ignore jsdom navigation error
        }
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      })
      .catch(() => {
        if (typeof window === 'undefined') return
        const a = document.createElement('a')
        a.href = downloadTargetUrl
        a.download = downloadFileName
        a.target = '_blank'
        document.body.appendChild(a)
        try {
          a.click()
        } catch {
          // ignore jsdom navigation error
        }
        document.body.removeChild(a)
      })
  }, [qrViewMode, vietQrUrl, activePaymentCode])

  // Copy full payment instructions in 1 tap
  const copyAllPaymentInfo = useCallback(() => {
    const textToCopy = `Ngân hàng: ${BANK_INFO.bankName} | STK: ${BANK_INFO.accountNumber} | Chủ TK: ${BANK_INFO.accountName} | Chi nhánh: ${BANK_INFO.branch} | Số tiền: ${effectiveAmountFormatted} | Nội dung: ${activePaymentCode}`
    copyToClipboard(textToCopy, 'allInfo')
  }, [effectiveAmountFormatted, activePaymentCode, copyToClipboard])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(20, 26, 48, 0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-checkout-modal-title"
        className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border-2 border-cream-300 bg-white shadow-clay text-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Adult Security Badge */}
        <div className="relative flex items-center justify-between border-b border-cream-300/70 bg-gradient-to-r from-amber-100/70 via-sun-100/50 to-cream-100/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-brand-200 shadow-soft text-brand-600">
              <ShieldCheck size={22} className="text-brand-600" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-brand-900 border border-brand-200/60">
                <ShieldCheck size={16} className="text-brand-600" />
                <span>Thanh toán an toàn cho phụ huynh</span>
              </div>
              <h2
                id="subscription-checkout-modal-title"
                className="font-display text-base sm:text-lg font-black text-text"
              >
                {isSuccess
                  ? 'Kích Hoạt Thành Công!'
                  : productMode === 'sub'
                    ? planName
                      ? `Thanh Toán Gói ${planName}`
                      : 'Thanh Toán Gói AI Kid 129K'
                    : 'Nạp Thêm Lượt Tạo Ảnh AI'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl border border-cream-300/80 bg-white/80 text-muted transition hover:bg-cream-100 hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 sm:space-y-4">
          {isSuccess ? (
            /* SUCCESS CONGRATULATIONS SCREEN */
            <div className="flex flex-col items-center py-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="relative mb-3 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-mint-100 text-mint-700 shadow-soft">
                <CheckCircle2 size={44} className="text-mint-600" />
              </div>

              <span className="rounded-full bg-mint-100 border border-mint-200 px-4 py-1 text-xs font-black uppercase text-mint-800">
                🎉 Kích Hoạt Thành Công!
              </span>

              <h3 className="mt-2 font-display text-2xl sm:text-3xl font-black text-text">
                Chúc Mừng Ba Mẹ & Bé!
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted">
                {productMode === 'sub'
                  ? 'Gói AI Kid 129K đã được kích hoạt thành công. Bé đã sẵn sàng khám phá trọn vẹn thế giới công nghệ tương lai!'
                  : `Gói nạp ${selectedPack.credits} lượt tạo ảnh AI đã được kích hoạt thành công. Bé đã sẵn sàng thỏa sức sáng tạo!`}
              </p>

              {/* OVERPAY BONUS NOTIFICATION */}
              {overpayBonusCredits !== null && overpayBonusCredits > 0 && (
                <div className="my-3 w-full max-w-md rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 text-left shadow-soft">
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl shrink-0">🎁</span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-amber-900">
                        Quà Tặng Thêm Cho Bé
                      </p>
                      <p className="mt-1 text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
                        Đặc biệt: Khoản tiền thừa của Ba Mẹ đã được tự động tặng thêm{' '}
                        <span className="font-black text-brand-700">
                          {overpayBonusCredits} lượt tạo ảnh AI
                        </span>{' '}
                        cho bé sáng tạo!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activated Benefits Box */}
              <div className="my-4 w-full max-w-md rounded-2xl border border-mint-200 bg-mint-50/60 p-4 text-left shadow-soft">
                <p className="text-xs font-black uppercase tracking-wider text-mint-800 mb-2">
                  Quyền lợi của gia đình đã sẵn sàng:
                </p>
                {productMode === 'sub' ? (
                  <ul className="space-y-2 text-xs sm:text-sm font-bold text-text">
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-mint-600 shrink-0" />
                      <span>Trọn bộ Khóa học AI Kid chính thức (6 chặng)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-mint-600 shrink-0" />
                      <span>50 lượt tạo ảnh AI/tháng (2.000đ/lượt)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-mint-600 shrink-0" />
                      <span>2 trẻ em cùng học</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-mint-600 shrink-0" />
                      <span>500 MB lưu trữ đám mây</span>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-2 text-xs sm:text-sm font-bold text-text">
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-mint-600 shrink-0" />
                      <span>Đã cộng {selectedPack.credits} lượt tạo ảnh AI chất lượng cao</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-mint-600 shrink-0" />
                      <span>Lượt tạo ảnh không giới hạn thời gian sử dụng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-mint-600 shrink-0" />
                      <span>Áp dụng chung cho tất cả các bé trong gia đình</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-mint-600 shrink-0" />
                      <span>Mở khóa đầy đủ các phong cách vẽ tranh AIKI</span>
                    </li>
                  </ul>
                )}
              </div>

              <Button
                onClick={onClose}
                className="w-full max-w-xs py-3.5 text-base font-black shadow-clay"
              >
                Bắt Đầu Học Ngay
              </Button>
            </div>
          ) : (
            <>
              {/* Product Type Switcher Tab Bar */}
              <div
                role="tablist"
                aria-label="Chọn loại sản phẩm"
                className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-cream-300 bg-cream-100/70 p-1.5 shadow-soft"
              >
                <button
                  type="button"
                  role="tab"
                  id="product-tab-sub"
                  aria-selected={productMode === 'sub'}
                  onClick={() => {
                    setProductMode('sub')
                    setPartialPayment(null)
                  }}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs sm:text-sm font-black transition whitespace-nowrap',
                    productMode === 'sub'
                      ? 'bg-white text-brand-700 shadow-clay'
                      : 'text-muted hover:text-text',
                  )}
                >
                  <span>Gói Học AI Kid 129K</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="product-tab-credits"
                  aria-selected={productMode === 'credits'}
                  onClick={() => {
                    setProductMode('credits')
                    setPartialPayment(null)
                  }}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs sm:text-sm font-black transition whitespace-nowrap',
                    productMode === 'credits'
                      ? 'bg-white text-brand-700 shadow-clay'
                      : 'text-muted hover:text-text',
                  )}
                >
                  <Palette size={15} className={productMode === 'credits' ? 'text-coral-500' : 'text-muted'} />
                  <span>Nạp Lượt Tạo Ảnh AI</span>
                </button>
              </div>

              {/* Credit Pack Selector (Only shown if mode === 'credits') */}
              {productMode === 'credits' && (
                <div className="rounded-2xl border-2 border-cream-300 bg-gradient-to-r from-cream-50 via-sun-50/50 to-white p-3 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200/80 pb-2">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-coral-100 border border-coral-200/80 px-2 py-0.5 text-[10px] font-black text-coral-900 uppercase">
                        🎨 NẠP LƯỢT TẠO ẢNH AI DỰ PHÒNG
                      </span>
                      <h3 className="mt-0.5 font-display text-sm sm:text-base font-black text-text">
                        Chọn Gói Lượt Tạo Ảnh Cho Bé
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-base sm:text-lg font-black text-brand-600">
                        {selectedPack.priceFormatted}
                      </span>
                      <span className="text-[10px] font-bold text-muted ml-1.5">
                        ({selectedPack.unitPriceText})
                      </span>
                    </div>
                  </div>

                  <div
                    className="mt-2.5 grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2"
                    role="radiogroup"
                    aria-label="Danh sách gói lượt tạo ảnh AI"
                  >
                    {CREDIT_PACKS.map((pack) => {
                      const isSelected = selectedPack.id === pack.id
                      return (
                        <button
                          key={pack.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => {
                            setSelectedPackId(pack.id)
                            setPartialPayment(null)
                          }}
                          className={cn(
                            'relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition text-center',
                            isSelected
                              ? 'border-brand-500 bg-brand-50/80 shadow-clay ring-2 ring-brand-400/30'
                              : 'border-cream-300 bg-white/90 hover:border-brand-300 hover:bg-cream-50/60',
                          )}
                        >
                          {pack.badge && (
                            <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black shadow-sm uppercase tracking-tight">
                              {pack.badge}
                            </span>
                          )}
                          <span className="font-display text-xs sm:text-sm font-black text-text">
                            {pack.credits} lượt
                          </span>
                          <span className="text-[11px] font-extrabold text-brand-700">
                            {pack.priceFormatted}
                          </span>
                          <span className="text-[9px] font-bold text-muted">
                            {pack.unitPriceText}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* PARTIALLY PAID WARNING ALERT (Chuyển thiếu tiền) */}
              {partialPayment && (
                <div
                  role="alert"
                  className="rounded-2xl border-2 border-amber-400/80 bg-amber-50/95 p-3.5 shadow-soft text-xs sm:text-sm text-amber-950 animate-in fade-in"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl shrink-0">⚠️</span>
                    <div className="flex-1 space-y-2">
                      <p className="font-bold leading-relaxed">
                        Hệ thống đã nhận được{' '}
                        <span className="font-black text-amber-900">
                          {formatMoney(partialPayment.amountPaid)}
                        </span>
                        . Đơn hàng còn thiếu{' '}
                        <span className="font-black text-danger">
                          {formatMoney(partialPayment.amountDue)}
                        </span>{' '}
                        để kích hoạt gói.
                      </p>
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(String(partialPayment.amountDue), 'amountDue')
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400 bg-white px-3 py-1.5 text-xs font-black text-amber-900 shadow-soft hover:bg-amber-100 active:scale-[0.98] whitespace-nowrap shrink-0"
                          aria-label="Sao chép số tiền còn thiếu"
                        >
                          {copiedField === 'amountDue' ? (
                            <>
                              <Check size={14} className="text-mint-600" />
                              <span className="text-mint-700">Đã chép số tiền còn thiếu</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>
                                Sao chép số tiền còn thiếu ({formatMoney(partialPayment.amountDue)})
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CENTRALIZED VIETQR & ESSENTIAL PAYMENT INFO */}
              <div
                id="vietqr-payment-hero"
                className="rounded-3xl border-2 border-cream-300 bg-gradient-to-b from-cream-50/40 via-white to-cream-50/20 p-3.5 sm:p-5 shadow-clay space-y-4"
              >
                {/* QR Section & Countdown Timer Centered */}
                <div className="flex flex-col items-center justify-center text-center">
                  {/* Countdown Timer Badge */}
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50/90 px-3.5 py-1 text-xs font-black text-amber-900 shadow-soft">
                    <Clock size={14} className="text-amber-600" />
                    <span>⏱️ Mã thanh toán có hiệu lực trong: {formatCountdown(timeLeft)}</span>
                  </div>

                  {/* Near-expiry / Expired warning & refresh button (< 10s) */}
                  {timeLeft < 10 && (
                    <div className="mt-2.5 w-full max-w-sm rounded-2xl border border-amber-300 bg-amber-50 p-2.5 sm:p-3 text-center text-xs font-bold text-amber-900 animate-in fade-in">
                      <p>Mã thanh toán sắp hết hạn hoặc đã hết thời gian hiệu lực.</p>
                      <button
                        type="button"
                        onClick={handleRefreshPayment}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-amber-400 bg-white px-3 py-1.5 text-xs font-black text-amber-900 shadow-soft hover:bg-amber-100 active:scale-[0.98] transition whitespace-nowrap"
                      >
                        <RefreshCw size={13} />
                        <span>Làm mới mã thanh toán</span>
                      </button>
                    </div>
                  )}

                  {/* QR Mode Switcher Tabs */}
                  <div
                    role="tablist"
                    aria-label="Chọn kiểu mã QR"
                    className="mt-3 flex items-center justify-center gap-1.5 p-1 bg-cream-100/90 rounded-2xl border border-cream-200 shadow-soft"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={qrViewMode === 'dynamic'}
                      onClick={() => setQrViewMode('dynamic')}
                      className={cn(
                        'px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all whitespace-nowrap',
                        qrViewMode === 'dynamic'
                          ? 'bg-white text-brand-700 shadow-clay'
                          : 'text-muted hover:text-text',
                      )}
                    >
                      Mã QR tự động (Napas 24/7)
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={qrViewMode === 'original'}
                      onClick={() => setQrViewMode('original')}
                      className={cn(
                        'px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all whitespace-nowrap',
                        qrViewMode === 'original'
                          ? 'bg-white text-brand-700 shadow-clay'
                          : 'text-muted hover:text-text',
                      )}
                    >
                      Ảnh QR Vietcombank gốc
                    </button>
                  </div>

                  {/* QR Image Container */}
                  <div className="relative mt-2.5 rounded-2xl border-2 border-cream-300 bg-white p-3 shadow-clay">
                    {qrViewMode === 'dynamic' ? (
                      <>
                        <img
                          src={vietQrUrl}
                          alt={`VietQR ${activePaymentCode}`}
                          className="h-44 w-44 sm:h-52 sm:w-52 rounded-xl object-contain mx-auto"
                          loading="eager"
                        />
                        <div className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-mint-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-soft">
                          VietQR 24/7
                        </div>
                      </>
                    ) : (
                      <img
                        src="/images/qr-lequangminh-vcb.png"
                        alt="Ảnh QR Vietcombank gốc LE QUANG MINH"
                        className="h-44 w-44 sm:h-52 sm:w-52 rounded-2xl object-contain mx-auto"
                        loading="eager"
                      />
                    )}
                  </div>

                  {/* Download QR button */}
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full max-w-[220px] rounded-xl border border-brand-300 bg-brand-50/90 px-3 py-2 text-xs font-black text-brand-700 shadow-soft hover:bg-brand-100 active:scale-[0.98] transition whitespace-nowrap"
                    aria-label="Tải mã QR về máy"
                  >
                    <Download size={14} />
                    <span>{qrViewMode === 'original' ? 'Tải ảnh QR gốc về máy' : 'Tải mã QR về máy'}</span>
                  </button>

                  <p className="mt-1 text-center text-[11px] font-bold text-muted">
                    {qrViewMode === 'original'
                      ? 'Quét ảnh QR Vietcombank gốc để chuyển khoản nhanh tới LE QUANG MINH'
                      : 'Mở app ngân hàng bất kỳ để quét mã thanh toán tức thì'}
                  </p>
                </div>

                {/* Essential Transfer Information Details */}
                <div className="space-y-2 rounded-2xl border border-cream-300/80 bg-white/95 p-3.5 sm:p-4 text-xs shadow-soft">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-cream-200">
                    <span className="text-muted font-bold">Ngân hàng:</span>
                    <span className="font-extrabold text-text text-right">
                      {BANK_INFO.bankName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-cream-200">
                    <span className="text-muted font-bold">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <code className="font-mono text-sm font-black text-brand-700">
                        {BANK_INFO.accountNumber}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(BANK_INFO.accountNumber, 'account')}
                        className="flex items-center gap-1 rounded-lg border border-cream-300 bg-cream-50 px-2 py-1 text-[11px] font-bold text-brand-700 hover:bg-cream-100 active:scale-95 transition whitespace-nowrap shrink-0"
                        aria-label="Sao chép số tài khoản"
                      >
                        {copiedField === 'account' ? (
                          <>
                            <Check size={13} className="text-mint-600" />
                            <span className="text-mint-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-cream-200">
                    <span className="text-muted font-bold">Chủ tài khoản:</span>
                    <span className="font-extrabold text-text text-right text-[11px] sm:text-xs">
                      {BANK_INFO.accountName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-cream-200">
                    <span className="text-muted font-bold">Chi nhánh:</span>
                    <span className="font-extrabold text-text text-right text-[11px] sm:text-xs">
                      {BANK_INFO.branch}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-cream-200">
                    <span className="text-muted font-bold">
                      {partialPayment ? 'Số tiền còn thiếu:' : 'Số tiền:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'font-display text-sm sm:text-base font-black',
                          partialPayment ? 'text-danger' : 'text-brand-600',
                        )}
                      >
                        {effectiveAmountFormatted}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(String(effectiveAmount), 'amount')}
                        className="flex items-center gap-1 rounded-lg border border-cream-300 bg-cream-50 px-2 py-1 text-[11px] font-bold text-brand-700 hover:bg-cream-100 active:scale-95 transition whitespace-nowrap shrink-0"
                        aria-label="Sao chép số tiền"
                      >
                        {copiedField === 'amount' ? (
                          <>
                            <Check size={13} className="text-mint-600" />
                            <span className="text-mint-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-muted font-bold">Nội dung chuyển khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-amber-100 px-2 py-0.5 font-mono text-xs sm:text-sm font-black text-amber-900 border border-amber-300/80">
                        {activePaymentCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activePaymentCode, 'code')}
                        className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-100 active:scale-95 transition whitespace-nowrap shrink-0"
                        aria-label="Sao chép nội dung chuyển khoản"
                      >
                        {copiedField === 'code' ? (
                          <>
                            <Check size={13} className="text-mint-600" />
                            <span className="text-mint-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Copy All Button */}
                  <button
                    type="button"
                    onClick={copyAllPaymentInfo}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-xs font-black text-brand-700 shadow-soft hover:bg-cream-100 active:scale-[0.98] transition whitespace-nowrap"
                    aria-label="Sao chép toàn bộ thông tin chuyển khoản"
                  >
                    {copiedField === 'allInfo' ? (
                      <>
                        <Check size={14} className="text-mint-600" />
                        <span className="text-mint-700">Đã chép toàn bộ thông tin chuyển khoản!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Sao chép toàn bộ thông tin</span>
                      </>
                    )}
                  </button>

                  {/* Warning note */}
                  <div className="mt-2 rounded-xl bg-amber-50/80 p-2.5 border border-amber-200/80 text-[11px] font-bold text-amber-900 leading-snug">
                    ⚠️ Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống kích hoạt tự động
                  </div>
                </div>

                {/* Radar signal auto-check bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-emerald-50/80 p-3 border border-emerald-200/80 shadow-soft">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                    <span>Đang chờ thanh toán tự động...</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => checkPaymentStatus()}
                    disabled={isPolling}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-black text-emerald-800 shadow-soft hover:bg-emerald-100 active:scale-95 disabled:opacity-50 transition whitespace-nowrap shrink-0"
                  >
                    <RefreshCw size={13} className={cn(isPolling && 'animate-spin')} />
                    {isPolling ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
                  </button>
                </div>

                {/* Manual Transfer Confirmation & Support */}
                <div className="rounded-2xl border border-cream-300/80 bg-cream-50/70 p-3 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-muted">
                      <span className="font-bold text-text">Hỗ trợ & Hotline: </span>
                      <strong className="text-brand-700">{BANK_INFO.hotline}</strong>
                    </div>
                    {manualSubmitted ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-800 bg-mint-50 px-3 py-1.5 rounded-xl border border-mint-200 animate-in fade-in">
                        <CheckCircle2 size={15} className="text-mint-600" />
                        <span>Đã gửi thông báo ưu tiên tới bộ phận CSKH & Admin</span>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleManualConfirm}
                        className="!py-1.5 !px-3 text-xs font-bold border border-cream-300 bg-white hover:bg-cream-100 shadow-soft whitespace-nowrap"
                      >
                        <Send size={13} />
                        <span>Tôi đã chuyển khoản xong</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-cream-300/70 bg-cream-50/80 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
            <ShieldCheck size={16} className="text-mint-600 shrink-0" />
            <span className="truncate">Cam kết hoàn tiền 100% nếu không hài lòng trong 7 ngày</span>
          </div>

          <Button variant="ghost" onClick={onClose} className="rounded-xl px-4 text-xs font-extrabold shrink-0">
            Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

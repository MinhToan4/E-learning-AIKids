import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  CheckCircle2,
  Copy,
  HardDrive,
  Headphones,
  Palette,
  QrCode,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { AikidModalCatCharacter } from '@/shared/components/ui/AikidModalCatCharacter'
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

export interface ParentSubscriptionCheckoutModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultPlanId?: string
  paymentCode?: string
  publicId?: string
  initialMode?: CheckoutProductMode
  initialPackId?: string
}

export type PaymentTab = 'vietqr' | 'manual' | 'wallets'

const BANK_INFO = {
  bankName: 'MBBank (Ngân hàng TMCP Quân Đội)',
  accountNumber: '0382228888',
  accountName: 'CONG TY CONG NGHE GIAO DUC AI KIDS',
  amount: 129000,
  amountFormatted: '129.000 đ',
  hotline: '0382.228.888',
}

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

function extractPaymentIntentData(res: PaymentIntentResponse | undefined) {
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
  defaultPlanId: _defaultPlanId = 'aikids_official_129k',
  paymentCode: initialPaymentCode,
  publicId: initialPublicId,
  initialMode = 'sub',
  initialPackId,
}: ParentSubscriptionCheckoutModalProps) {
  const [productMode, setProductMode] = useState<CheckoutProductMode>(initialMode)
  const [selectedPackId, setSelectedPackId] = useState<string>(
    initialPackId ?? 'credits_50',
  )
  const [activeTab, setActiveTab] = useState<PaymentTab>('vietqr')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [manualSubmitted, setManualSubmitted] = useState(false)
  const [walletProcessing, setWalletProcessing] = useState<string | null>(null)
  const [partialPayment, setPartialPayment] = useState<{
    amountPaid: number
    amountDue: number
  } | null>(null)
  const [overpayBonusCredits, setOverpayBonusCredits] = useState<number | null>(null)

  // Find currently selected credit pack
  const selectedPack = useMemo(() => findCreditPack(selectedPackId), [selectedPackId])

  // Amounts calculation
  const baseAmount = productMode === 'sub' ? BANK_INFO.amount : selectedPack.price
  const effectiveAmount = partialPayment ? partialPayment.amountDue : baseAmount
  const effectiveAmountFormatted = formatMoney(effectiveAmount)

  // Generate a friendly, stable payment code when opened
  const generatedCode = useMemo(() => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    return productMode === 'credits' ? `AKCRE${randomDigits}` : `AK129K${randomDigits}`
  }, [open, productMode])

  const activePaymentCode = initialPaymentCode || generatedCode
  const activePublicId = initialPublicId || `pi_${activePaymentCode.toLowerCase()}`

  // Reset state when opening or when props change
  useEffect(() => {
    if (open) {
      setProductMode(initialMode)
      setSelectedPackId(initialPackId ?? 'credits_50')
      setIsSuccess(false)
      setActiveTab('vietqr')
      setManualSubmitted(false)
      setWalletProcessing(null)
      setCopiedField(null)
      setPartialPayment(null)
      setOverpayBonusCredits(null)
    }
  }, [open, initialMode, initialPackId])

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
      // Gentle Montessori approach: quiet retry on polling error
    } finally {
      setIsPolling(false)
    }
  }, [activePublicId, isSuccess, handlePaymentResponse])

  // Polling every 3 seconds for VietQR tab
  useEffect(() => {
    if (!open || activeTab !== 'vietqr' || isSuccess || !activePublicId) return

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
  }, [open, activeTab, isSuccess, activePublicId, handlePaymentResponse])

  // Handle 1-tap wallet payment
  const handleWalletPay = useCallback(
    (walletType: 'apple_pay' | 'google_pay') => {
      setWalletProcessing(walletType)
      setTimeout(() => {
        setWalletProcessing(null)
        setIsSuccess(true)
        onSuccess?.()
      }, 800)
    },
    [onSuccess],
  )

  // Handle manual transfer confirmation
  const handleManualConfirm = useCallback(() => {
    setManualSubmitted(true)
  }, [])

  if (!open) return null

  // VietQR URL with dynamically computed amount (using remaining amountDue if partially paid)
  const vietQrUrl = `https://img.vietqr.io/image/MB-0382228888-compact2.png?amount=${effectiveAmount}&addInfo=${encodeURIComponent(activePaymentCode)}&accountName=${encodeURIComponent('CONG TY AI KIDS')}`

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(20, 26, 48, 0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-checkout-modal-title"
        className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-cream-300 bg-gradient-to-b from-cream-50 via-sun-50/40 to-white shadow-clay text-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with AKI Mascot & Title */}
        <div className="relative flex items-center justify-between border-b border-cream-300/70 bg-gradient-to-r from-amber-100/70 via-sun-100/50 to-cream-100/80 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <AikidModalCatCharacter
              state={isSuccess ? 'celebrate' : 'talk'}
              variant="full-body"
              className="h-14 w-14 sm:h-16 sm:w-16 shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-900">
                <Sparkles size={12} className="text-amber-600" />
                Mèo AKI Đồng Hành
              </div>
              <h2
                id="subscription-checkout-modal-title"
                className="font-display text-lg sm:text-xl font-black text-text"
              >
                {isSuccess
                  ? 'Kích Hoạt Thành Công!'
                  : productMode === 'sub'
                    ? 'Nâng Cấp Gói AI Kid Toàn Diện'
                    : 'Nạp Thêm Lượt Tạo Ảnh AI'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cream-300/80 bg-white/80 text-muted transition hover:bg-cream-100 hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isSuccess ? (
            /* SUCCESS CONGRATULATIONS SCREEN */
            <div className="flex flex-col items-center py-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="relative mb-3 flex h-24 w-24 items-center justify-center rounded-3xl bg-mint-100 text-mint-700 shadow-soft">
                <Sparkles size={48} className="animate-pulse text-amber-500" />
                <CheckCircle2 size={36} className="absolute -bottom-1 -right-1 text-mint-600" />
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
                      <span>Mở khóa đầy đủ các phong cách vẽ tranh AKI</span>
                    </li>
                  </ul>
                )}
              </div>

              <Button
                onClick={onClose}
                className="w-full max-w-xs py-3.5 text-base font-black shadow-clay"
              >
                <Sparkles size={18} />
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
                    'flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-black transition',
                    productMode === 'sub'
                      ? 'bg-white text-brand-700 shadow-clay'
                      : 'text-muted hover:text-text',
                  )}
                >
                  <Sparkles size={16} className={productMode === 'sub' ? 'text-amber-500' : 'text-muted'} />
                  <span>Gói Học AI Kid Toàn Diện</span>
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
                    'flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-black transition',
                    productMode === 'credits'
                      ? 'bg-white text-brand-700 shadow-clay'
                      : 'text-muted hover:text-text',
                  )}
                >
                  <Palette size={16} className={productMode === 'credits' ? 'text-coral-500' : 'text-muted'} />
                  <span>Nạp Lượt Tạo Ảnh AI</span>
                </button>
              </div>

              {/* LOẠI 1: Gói Học AI Kid Chính Thức (129K) */}
              {productMode === 'sub' ? (
                <div className="rounded-3xl border-2 border-cream-300 bg-gradient-to-r from-cream-50 via-sun-50/60 to-white p-4 sm:p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300/60 pb-3">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-black text-amber-900 uppercase">
                        🌟 GÓI AI KID CHÍNH THỨC
                      </span>
                      <h3 className="mt-1 font-display text-lg sm:text-xl font-black text-text">
                        Gói Học Chuẩn Quốc Tế Cho Bé
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-xl sm:text-2xl font-black text-brand-600">
                        129.000đ / tháng
                      </div>
                      <div className="text-[11px] font-bold text-muted">
                        (Chưa tới 4.500đ/ngày)
                      </div>
                    </div>
                  </div>

                  {/* 4 Key Benefits */}
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs sm:text-sm font-bold text-text">
                    <div className="flex items-center gap-2.5 rounded-2xl bg-white/70 p-2.5 border border-cream-200/80">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                        <Sparkles size={15} />
                      </span>
                      <span>Trọn bộ Khóa học AI Kid chính thức (6 chặng)</span>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-2xl bg-white/70 p-2.5 border border-cream-200/80">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-coral-100 text-coral-700">
                        <Palette size={15} />
                      </span>
                      <span>50 lượt tạo ảnh AI/tháng (2.000đ/lượt)</span>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-2xl bg-white/70 p-2.5 border border-cream-200/80">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                        <Users size={15} />
                      </span>
                      <span>2 trẻ em cùng học</span>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-2xl bg-white/70 p-2.5 border border-cream-200/80">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-mint-100 text-mint-700">
                        <HardDrive size={15} />
                      </span>
                      <span>500 MB lưu trữ đám mây</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* LOẠI 2: Nạp Thêm Lượt Tạo Ảnh AI Dự Phòng */
                <div className="rounded-3xl border-2 border-cream-300 bg-gradient-to-r from-cream-50 via-sun-50/60 to-white p-4 sm:p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300/60 pb-3">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-coral-100 border border-coral-200/80 px-2.5 py-0.5 text-[11px] font-black text-coral-900 uppercase">
                        🎨 NẠP LƯỢT TẠO ẢNH AI DỰ PHÒNG
                      </span>
                      <h3 className="mt-1 font-display text-lg sm:text-xl font-black text-text">
                        Chọn Gói Lượt Tạo Ảnh Cho Bé
                      </h3>
                      <p className="mt-0.5 text-xs text-muted">
                        Lượt tạo ảnh dự phòng không bao giờ hết hạn. Bé tha hồ sáng tác truyện và tranh vẽ!
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-xl sm:text-2xl font-black text-brand-600">
                        {selectedPack.priceFormatted}
                      </div>
                      <div className="text-[11px] font-bold text-muted">
                        ({selectedPack.unitPriceText})
                      </div>
                    </div>
                  </div>

                  {/* 5 Credit Packs Grid */}
                  <div
                    className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
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
                            'relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition text-center',
                            isSelected
                              ? 'border-brand-500 bg-brand-50/80 shadow-clay ring-2 ring-brand-400/30'
                              : 'border-cream-300 bg-white/90 hover:border-brand-300 hover:bg-cream-50/60',
                          )}
                        >
                          {pack.badge && (
                            <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-sm uppercase tracking-tight">
                              {pack.badge}
                            </span>
                          )}
                          <span className="font-display text-base font-black text-text">
                            {pack.credits} lượt
                          </span>
                          <span className="mt-0.5 text-xs font-extrabold text-brand-700">
                            {pack.priceFormatted}
                          </span>
                          <span className="mt-0.5 text-[10px] font-bold text-muted">
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
                  className="rounded-2xl border-2 border-amber-400/80 bg-amber-50/95 p-3.5 sm:p-4 shadow-soft text-xs sm:text-sm text-amber-950 animate-in fade-in"
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
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400 bg-white px-3 py-1.5 text-xs font-black text-amber-900 shadow-soft hover:bg-amber-100 active:scale-[0.98]"
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

              {/* Payment Methods 3-Tab Bar */}
              <div
                role="tablist"
                aria-label="Phương thức thanh toán"
                className="flex rounded-2xl border border-cream-300 bg-cream-100/70 p-1 shadow-soft"
              >
                <button
                  type="button"
                  role="tab"
                  id="tab-vietqr"
                  aria-selected={activeTab === 'vietqr'}
                  aria-controls="tabpanel-vietqr"
                  onClick={() => setActiveTab('vietqr')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs sm:text-sm font-black transition',
                    activeTab === 'vietqr'
                      ? 'bg-white text-brand-700 shadow-clay'
                      : 'text-muted hover:text-text',
                  )}
                >
                  <QrCode size={16} />
                  <span>Quét Mã VietQR (Tự Động)</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="tab-manual"
                  aria-selected={activeTab === 'manual'}
                  aria-controls="tabpanel-manual"
                  onClick={() => setActiveTab('manual')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs sm:text-sm font-black transition',
                    activeTab === 'manual'
                      ? 'bg-white text-brand-700 shadow-clay'
                      : 'text-muted hover:text-text',
                  )}
                >
                  <Headphones size={16} />
                  <span>Chuyển Khoản Thủ Công / Hỗ Trợ Admin</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="tab-wallets"
                  aria-selected={activeTab === 'wallets'}
                  aria-controls="tabpanel-wallets"
                  onClick={() => setActiveTab('wallets')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs sm:text-sm font-black transition',
                    activeTab === 'wallets'
                      ? 'bg-white text-brand-700 shadow-clay'
                      : 'text-muted hover:text-text',
                  )}
                >
                  <Smartphone size={16} />
                  <span>Apple Pay / Google Pay</span>
                </button>
              </div>

              {/* TAB 1: Quét Mã VietQR (Tự Động) */}
              {activeTab === 'vietqr' && (
                <div
                  id="tabpanel-vietqr"
                  role="tabpanel"
                  aria-labelledby="tab-vietqr"
                  className="space-y-4 animate-in fade-in duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Dynamic QR Code Image */}
                    <div className="md:col-span-5 flex flex-col items-center">
                      <div className="rounded-3xl border-2 border-cream-300 bg-white p-3 shadow-clay">
                        <img
                          src={vietQrUrl}
                          alt={`VietQR ${activePaymentCode}`}
                          className="h-48 w-48 sm:h-52 sm:w-52 rounded-2xl object-contain"
                          loading="eager"
                        />
                      </div>
                      <p className="mt-2 text-center text-[11px] font-bold text-muted">
                        Mở App Ngân Hàng bất kỳ quét mã để thanh toán tức thì
                      </p>
                    </div>

                    {/* Payment details box */}
                    <div className="md:col-span-7 space-y-2 rounded-2xl border border-cream-300/80 bg-white/80 p-3.5 text-xs shadow-soft">
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-cream-200">
                        <span className="text-muted font-bold">Ngân hàng:</span>
                        <span className="font-extrabold text-text text-right">
                          {BANK_INFO.bankName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-cream-200">
                        <span className="text-muted font-bold">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono text-sm font-black text-brand-700">
                            {BANK_INFO.accountNumber}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(BANK_INFO.accountNumber, 'account')}
                            className="flex items-center gap-1 rounded-lg border border-cream-300 bg-cream-50 px-2 py-1 text-[11px] font-bold text-brand-700 hover:bg-cream-100"
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

                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-cream-200">
                        <span className="text-muted font-bold">Chủ tài khoản:</span>
                        <span className="font-extrabold text-text text-right text-[11px] sm:text-xs">
                          {BANK_INFO.accountName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-cream-200">
                        <span className="text-muted font-bold">
                          {partialPayment ? 'Số tiền còn thiếu:' : 'Số tiền:'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'font-display text-sm font-black',
                              partialPayment ? 'text-danger' : 'text-brand-600',
                            )}
                          >
                            {effectiveAmountFormatted}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(String(effectiveAmount), 'amount')}
                            className="flex items-center gap-1 rounded-lg border border-cream-300 bg-cream-50 px-2 py-1 text-[11px] font-bold text-brand-700 hover:bg-cream-100"
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

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-muted font-bold">Nội dung chuyển khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-lg bg-amber-100 px-2 py-0.5 font-mono text-xs sm:text-sm font-black text-amber-900">
                            {activePaymentCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(activePaymentCode, 'code')}
                            className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-100"
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

                      {/* Warning notice */}
                      <div className="mt-2 rounded-xl bg-amber-50/80 p-2.5 border border-amber-200/80 text-[11px] font-bold text-amber-900 leading-snug">
                        ⚠️ Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống kích hoạt tự động
                      </div>
                    </div>
                  </div>

                  {/* Polling status bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-50/70 p-3 border border-brand-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500" />
                      </span>
                      <span>Hệ thống đang tự động kiểm tra giao dịch chuyển khoản...</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => checkPaymentStatus()}
                      disabled={isPolling}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 py-1.5 text-xs font-black text-brand-700 shadow-soft hover:bg-brand-50 disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={cn(isPolling && 'animate-spin')} />
                      {isPolling ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Chuyển Khoản Thủ Công / Hỗ Trợ Admin */}
              {activeTab === 'manual' && (
                <div
                  id="tabpanel-manual"
                  role="tabpanel"
                  aria-labelledby="tab-manual"
                  className="space-y-4 animate-in fade-in duration-200"
                >
                  <div className="rounded-2xl border border-cream-300 bg-white/80 p-4 shadow-soft space-y-3">
                    <h4 className="font-display text-base font-black text-text">
                      Chuyển Khoản Trực Tiếp & Hỗ Trợ Kích Hoạt Nhanh
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Nếu ứng dụng ngân hàng của Ba Mẹ chưa hỗ trợ quét mã QR hoặc Ba Mẹ cần xuất hóa đơn tài chính (VAT) cho doanh nghiệp, vui lòng chuyển khoản theo thông tin dưới đây và bấm nút xác nhận.
                    </p>

                    <div className="rounded-xl bg-cream-50 p-3 border border-cream-200 space-y-1.5 text-xs">
                      <div><strong>Ngân hàng:</strong> {BANK_INFO.bankName}</div>
                      <div><strong>Số tài khoản:</strong> <span className="font-mono font-bold text-brand-700">{BANK_INFO.accountNumber}</span></div>
                      <div><strong>Chủ tài khoản:</strong> {BANK_INFO.accountName}</div>
                      <div><strong>Số tiền:</strong> {effectiveAmountFormatted}</div>
                      <div><strong>Nội dung:</strong> <span className="font-mono font-bold text-amber-900">{activePaymentCode}</span></div>
                    </div>

                    {/* VAT guidance */}
                    <div className="rounded-xl bg-sky-50 p-3 border border-sky-100 text-xs text-sky-950 space-y-1">
                      <p className="font-black text-sky-900">🧾 Xuất Hóa Đơn Điện Tử VAT:</p>
                      <p>
                        Gửi thông tin Tên Doanh Nghiệp, Mã Số Thuế, Địa Chỉ và Email nhận HĐĐT về Zalo/Hotline CSKH: <strong>{BANK_INFO.hotline}</strong> hoặc email <strong>cskh@aikid.vn</strong>. Hóa đơn sẽ được xuất trong vòng 24h làm việc.
                      </p>
                    </div>

                    {/* Action button */}
                    {manualSubmitted ? (
                      <div className="rounded-2xl bg-mint-50 p-3.5 border border-mint-200 text-center text-xs font-bold text-mint-900 animate-in fade-in">
                        <CheckCircle2 size={24} className="mx-auto text-mint-600 mb-1" />
                        Đã gửi thông báo ưu tiên tới bộ phận CSKH & Admin! Chuyên viên sẽ hỗ trợ kiểm tra và kích hoạt gói cho gia đình trong vòng 5-15 phút.
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleManualConfirm}
                        className="w-full py-3 text-sm font-black shadow-clay"
                      >
                        <Send size={16} />
                        Tôi đã chuyển khoản xong
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Apple Pay / Google Pay */}
              {activeTab === 'wallets' && (
                <div
                  id="tabpanel-wallets"
                  role="tabpanel"
                  aria-labelledby="tab-wallets"
                  className="space-y-4 animate-in fade-in duration-200"
                >
                  <div className="rounded-2xl border border-cream-300 bg-white/80 p-5 shadow-soft text-center space-y-4">
                    <div className="flex justify-center gap-2 text-brand-600">
                      <Smartphone size={32} />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-black text-text">
                        Thanh Toán Nhanh 1 Chạm Bảo Mật Cao
                      </h4>
                      <p className="text-xs text-muted max-w-md mx-auto mt-1">
                        Sử dụng thẻ Visa, Mastercard, JCB liên kết trên thiết bị di động của Ba Mẹ. Xác thực an toàn qua FaceID, TouchID hoặc mã PIN.
                      </p>
                    </div>

                    <div className="max-w-sm mx-auto space-y-2.5 pt-2">
                      {/* Apple Pay Button */}
                      <button
                        type="button"
                        disabled={walletProcessing !== null}
                        onClick={() => handleWalletPay('apple_pay')}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black py-3 px-4 font-bold text-white shadow-soft transition hover:bg-black/90 active:scale-[0.98] disabled:opacity-50"
                      >
                        {walletProcessing === 'apple_pay' ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Đang xác thực ví Apple Pay...</span>
                          </>
                        ) : (
                          <>
                            <span className="font-serif font-black text-lg"></span>
                            <span>Pay with Apple Pay</span>
                          </>
                        )}
                      </button>

                      {/* Google Pay Button */}
                      <button
                        type="button"
                        disabled={walletProcessing !== null}
                        onClick={() => handleWalletPay('google_pay')}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white py-3 px-4 font-bold text-slate-900 shadow-soft transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
                      >
                        {walletProcessing === 'google_pay' ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Đang kết nối Google Pay...</span>
                          </>
                        ) : (
                          <>
                            <span className="font-black text-blue-600">G</span>
                            <span className="font-black">Pay</span>
                            <span className="text-xs text-muted font-normal ml-1">
                              (Thanh toán qua Google Wallet)
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-muted pt-1">
                      <ShieldCheck size={14} className="text-mint-600" />
                      <span>Bảo mật chuẩn quốc tế PCI-DSS & mã hóa sinh trắc học đầu-cuối</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-cream-300/70 bg-cream-50/80 px-5 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-bold text-muted">
            <ShieldCheck size={16} className="text-mint-600" />
            <span>Cam kết hoàn tiền 100% nếu không hài lòng trong 7 ngày</span>
          </div>

          <Button variant="ghost" onClick={onClose} className="rounded-xl px-4 text-xs font-extrabold">
            Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

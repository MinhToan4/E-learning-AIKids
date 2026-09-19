import React, { useState } from 'react'
import {
  ReceiptText,
  FileCheck2,
  Building2,
  ExternalLink,
  Eye,
  FileCode,
  Pencil,
  Plus,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import {
  type EInvoice,
  type CompanyInvoiceInfo,
  getStoredInvoices,
  getStoredCompanyInvoiceInfo,
  saveCompanyInvoiceInfo,
  generateMisaXml,
  downloadFile,
} from '@/features/billing/einvoice-types'
import { EInvoiceModal } from '@/features/billing/components/EInvoiceModal'

interface ParentInvoiceHistoryProps {
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function ParentInvoiceHistory({ onNotify }: ParentInvoiceHistoryProps) {
  const [invoices] = useState<EInvoice[]>(getStoredInvoices)
  const [companyInfo, setCompanyInfo] = useState<CompanyInvoiceInfo | null>(getStoredCompanyInvoiceInfo)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<EInvoice | null>(null)

  // State cho form thông tin xuất hóa đơn cơ quan / công ty
  const [formValues, setFormValues] = useState<CompanyInvoiceInfo>({
    companyName: companyInfo?.companyName || '',
    taxCode: companyInfo?.taxCode || '',
    address: companyInfo?.address || '',
    email: companyInfo?.email || '',
  })

  const handleOpenForm = () => {
    setFormValues({
      companyName: companyInfo?.companyName || '',
      taxCode: companyInfo?.taxCode || '',
      address: companyInfo?.address || '',
      email: companyInfo?.email || '',
    })
    setIsFormOpen(true)
  }

  const handleSaveCompanyInfo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formValues.companyName.trim() || !formValues.taxCode.trim() || !formValues.address.trim()) {
      onNotify?.('Vui lòng điền đầy đủ Tên công ty/trường học, Mã số thuế và Địa chỉ', 'error')
      return
    }

    const info: CompanyInvoiceInfo = {
      companyName: formValues.companyName.trim(),
      taxCode: formValues.taxCode.trim(),
      address: formValues.address.trim(),
      email: formValues.email.trim(),
    }

    saveCompanyInvoiceInfo(info)
    setCompanyInfo(info)
    setIsFormOpen(false)
    onNotify?.('Đã lưu thông tin xuất hóa đơn cơ quan / công ty thành công!', 'success')
  }

  const handleDownloadXml = (inv: EInvoice) => {
    const xml = generateMisaXml(inv)
    const filename = `HDDT_${inv.invoiceSeries}_${inv.invoiceNumber}.xml`
    downloadFile(xml, filename, 'application/xml;charset=utf-8;')
    onNotify?.(`Đã tải file XML gốc hóa đơn số ${inv.invoiceNumber} có chữ ký số điện tử`, 'success')
  }

  return (
    <section className="ui-card p-5 sm:p-6 rounded-3xl border border-border/80 shadow-2xs mt-6">
      {/* ── Tiêu đề khối Hóa đơn điện tử & Lịch sử chứng từ ──────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold">
              <ReceiptText size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-black text-slate-900">
                Hóa đơn điện tử & Lịch sử chứng từ
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Chứng từ học phí hợp lệ có mã Cơ quan Thuế phát hành qua MISA meInvoice (Không chịu thuế GTGT KCT theo TT 219).
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenForm}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/80 hover:bg-brand-100/80 px-3 py-1.5 text-xs font-bold text-brand-700 transition cursor-pointer shadow-2xs"
        >
          {companyInfo ? (
            <>
              <Pencil size={13} />
              <span>Chỉnh sửa thông tin công ty / cơ quan</span>
            </>
          ) : (
            <>
              <Building2 size={13} />
              <span>Cấu hình xuất HĐ cơ quan / công ty</span>
            </>
          )}
        </button>
      </div>

      {/* ── Banner / Card Thông tin xuất hóa đơn công ty đã lưu ──── */}
      {companyInfo && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Building2 size={15} />
              </span>
              <div className="text-xs space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold uppercase text-slate-900">{companyInfo.companyName}</span>
                  <span className="rounded-md bg-white border border-emerald-300 px-2 py-0.5 font-mono font-bold text-emerald-800">
                    MST: {companyInfo.taxCode}
                  </span>
                </div>
                <p className="text-slate-600">Địa chỉ: {companyInfo.address}</p>
                {companyInfo.email && <p className="text-slate-600 font-mono">Email nhận HĐ: {companyInfo.email}</p>}
                <p className="text-[11px] text-emerald-700 font-bold mt-1">
                  ✓ Hệ thống sẽ tự động xuất HĐĐT đúng thông tin này khi thanh toán gói học
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenForm}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 cursor-pointer"
            >
              Sửa
            </button>
          </div>
        </div>
      )}

      {/* ── Danh sách hóa đơn học phí của gia đình ───────────────── */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-border/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border/70 text-slate-700">
                <th className="px-4 py-3 font-extrabold">Gói học / Dịch vụ</th>
                <th className="px-4 py-3 font-extrabold">Số tiền thanh toán</th>
                <th className="px-4 py-3 font-extrabold">Số hóa đơn & Ký hiệu</th>
                <th className="px-4 py-3 font-extrabold">Mã Cơ quan Thuế</th>
                <th className="px-4 py-3 font-extrabold">Trạng thái HĐĐT</th>
                <th className="px-4 py-3 font-extrabold text-right">Chứng từ</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const dateStr = new Date(inv.issuedDate).toLocaleDateString('vi-VN')
                return (
                  <tr key={inv.id} className="border-b border-border/40 hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{inv.planName}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Ngày xuất: {dateStr} · {inv.buyerLegalName}
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-black text-sm text-brand-700">
                        {inv.totalAmount.toLocaleString('vi-VN')}₫
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                      <span className="text-[11px] text-slate-500 block font-mono">{inv.invoiceSeries}</span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-700">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        <span className="font-bold">{inv.cqtCode}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200">
                        <ShieldCheck size={11} />
                        <span>Đã cấp mã CQT</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                        >
                          <Eye size={12} />
                          <span>Xem hóa đơn (PDF)</span>
                        </button>

                        {inv.einvoiceViewUrl && (
                          <a
                            href={inv.einvoiceViewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100 transition cursor-pointer shadow-2xs"
                          >
                            <ExternalLink size={12} />
                            <span>Tra cứu meInvoice</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownloadXml(inv)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                          title="Tải file XML gốc có chữ ký số điện tử"
                        >
                          <FileCode size={12} />
                          <span>XML</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Form thông tin xuất hóa đơn cơ quan / công ty ───── */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="company-invoice-form-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden border border-border">
            <div className="flex items-center justify-between border-b border-border bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold">
                  <Building2 size={16} />
                </span>
                <h3 id="company-invoice-form-title" className="font-extrabold text-sm sm:text-base text-slate-900">
                  Thông tin xuất hóa đơn cơ quan / công ty
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCompanyInfo} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Ba / Mẹ vui lòng điền chính xác thông tin doanh nghiệp, trường học hoặc cơ quan để hệ thống tự động xuất
                hóa đơn tài chính MISA meInvoice khi thanh toán các gói học.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên công ty / Cơ quan / Trường học <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CÔNG TY CỔ PHẦN CÔNG NGHỆ..."
                  value={formValues.companyName}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="w-full rounded-xl border border-border p-2.5 outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mã số thuế (MST) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 0109999999"
                  value={formValues.taxCode}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, taxCode: e.target.value }))}
                  className="w-full rounded-xl border border-border p-2.5 outline-none focus:border-brand-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Địa chỉ trụ sở doanh nghiệp / cơ quan <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Địa chỉ theo đăng ký kinh doanh..."
                  value={formValues.address}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-xl border border-border p-2.5 outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email nhận hóa đơn điện tử
                </label>
                <input
                  type="email"
                  placeholder="ketoan@congty.com"
                  value={formValues.email}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border border-border p-2.5 outline-none focus:border-brand-500 font-mono font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl text-xs py-2 px-4"
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" className="rounded-xl text-xs py-2 px-5">
                  Lưu thông tin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Xem Bản Thể Hiện HĐĐT ──────────────────────────── */}
      {selectedInvoice && (
        <EInvoiceModal
          invoice={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </section>
  )
}

import React, { useState, useMemo } from 'react'
import {
  FileSpreadsheet,
  Download,
  Search,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCode,
  Building2,
  ReceiptText,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import {
  type EInvoice,
  getStoredInvoices,
  saveInvoices,
  generateTaxReport01_1_GTGT_CSV,
  generateGeneralJournalCSV,
  generateMisaXml,
  downloadFile,
} from '@/features/billing/einvoice-types'
import { EInvoiceModal } from '@/features/billing/components/EInvoiceModal'

interface AdminInvoiceManagerProps {
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function AdminInvoiceManager({ onNotify }: AdminInvoiceManagerProps) {
  const [invoices, setInvoices] = useState<EInvoice[]>(getStoredInvoices)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<EInvoice | null>(null)

  // Thống kê nhanh
  const stats = useMemo(() => {
    const totalCount = invoices.length
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const cqtIssuedCount = invoices.filter(
      (inv) => inv.status === 'signed_with_cqt' || inv.cqtCode,
    ).length
    return { totalCount, totalRevenue, cqtIssuedCount }
  }, [invoices])

  // Lọc danh sách hóa đơn
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchName = inv.buyerLegalName.toLowerCase().includes(q)
        const matchEmail = (inv.buyerEmail || '').toLowerCase().includes(q)
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(q)
        const matchTax = (inv.buyerTaxCode || '').toLowerCase().includes(q)
        const matchCqt = inv.cqtCode.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchNumber && !matchTax && !matchCqt) {
          return false
        }
      }

      // 2. Period filter
      if (selectedPeriod !== 'all') {
        const d = new Date(inv.issuedDate)
        const year = d.getFullYear()
        const month = d.getMonth() + 1
        const quarter = Math.ceil(month / 3)
        const periodKey = `${year}-Q${quarter}`
        if (periodKey !== selectedPeriod) {
          return false
        }
      }

      return true
    })
  }, [invoices, searchTerm, selectedPeriod])

  // Hành động Kế toán 1: Tải Bảng kê bán ra Mẫu 01-1/GTGT
  const handleExportTaxReport = () => {
    try {
      const periodLabel = selectedPeriod === 'all' ? 'Quý 3/2026' : selectedPeriod
      const csv = generateTaxReport01_1_GTGT_CSV(filteredInvoices, periodLabel)
      const filename = `Bang_Ke_Ban_Ra_Mau_01-1_GTGT_${periodLabel.replace(/[\s/]/g, '_')}.csv`
      downloadFile(csv, filename, 'text/csv;charset=utf-8;')
      onNotify?.(
        'Đã kết xuất Bảng kê bán ra (Mẫu 01-1/GTGT) theo chuẩn Thông tư 80/2021/TT-BTC nộp cho Cơ quan Thuế.',
        'success',
      )
    } catch {
      onNotify?.('Lỗi kết xuất Bảng kê thuế bán ra', 'error')
    }
  }

  // Hành động Kế toán 2: Xuất Sổ Nhật Ký Chung (Excel/CSV)
  const handleExportGeneralJournal = () => {
    try {
      const csv = generateGeneralJournalCSV(filteredInvoices)
      const filename = `So_Nhat_Ky_Chung_AIKids_MISA_${new Date().toISOString().slice(0, 10)}.csv`
      downloadFile(csv, filename, 'text/csv;charset=utf-8;')
      onNotify?.(
        'Đã kết xuất Sổ Nhật Ký Chung bút toán kép (Nợ 1121 / Có 131 và Nợ 131 / Có 5113) chuẩn nhập MISA SME / AMIS.',
        'success',
      )
    } catch {
      onNotify?.('Lỗi kết xuất Sổ Nhật Ký Chung', 'error')
    }
  }

  // Tải file XML ký số
  const handleDownloadXml = (inv: EInvoice) => {
    const xml = generateMisaXml(inv)
    const filename = `HDDT_${inv.invoiceSeries}_${inv.invoiceNumber}.xml`
    downloadFile(xml, filename, 'application/xml;charset=utf-8;')
    onNotify?.(`Đã tải file XML gốc hóa đơn số ${inv.invoiceNumber} có chữ ký số điện tử.`, 'success')
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Khối thẻ tóm tắt Thuế & Pháp lý VN ────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ui-card flex items-center gap-3.5 p-4 bg-emerald-50/70 border border-emerald-200 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 font-black shadow-2xs">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">
              Đã cấp mã CQT
            </p>
            <p className="font-display text-2xl font-black text-emerald-700">
              {stats.cqtIssuedCount} / {stats.totalCount} HĐ
            </p>
          </div>
        </div>

        <div className="ui-card flex items-center gap-3.5 p-4 bg-brand-50/70 border border-brand-200 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 font-black shadow-2xs">
            <ReceiptText size={20} />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-800">
              Doanh thu KCT
            </p>
            <p className="font-display text-xl sm:text-2xl font-black text-brand-700">
              {stats.totalRevenue.toLocaleString('vi-VN')}₫
            </p>
          </div>
        </div>

        <div className="ui-card flex items-center gap-3.5 p-4 bg-sky-50/70 border border-sky-200 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 font-black shadow-2xs">
            %
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-sky-800">
              Thuế suất GTGT
            </p>
            <p className="font-display text-base font-black text-sky-700">
              KCT (0₫ thuế đầu ra)
            </p>
          </div>
        </div>

        <div className="ui-card flex items-center gap-3.5 p-4 bg-violet-50/70 border border-violet-200 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-600 font-black shadow-2xs">
            <Building2 size={20} />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-violet-800">
              Cổng HĐĐT MISA
            </p>
            <p className="text-xs font-bold text-violet-900 mt-0.5">
              meInvoice HSM v2.0
            </p>
            <p className="text-[10px] text-violet-600">Ký số từ xa tự động</p>
          </div>
        </div>
      </div>

      {/* ── Bảng danh sách HĐĐT & Toolbar hành động kế toán thuế ── */}
      <div className="ui-card overflow-hidden shadow-sm">
        {/* Toolbar chính */}
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 bg-brand-50/20 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🧾</span>
                <h3 className="font-display text-base sm:text-lg font-black text-text">
                  Quản Lý Hóa Đơn Điện Tử MISA & Báo Cáo Thuế Việt Nam
                </h3>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Căn cứ Nghị định 123/2020/NĐ-CP, Thông tư 78/2021/TT-BTC & Khoản 13, 21 Điều 4 Thông tư 219/2013/TT-BTC
                (Dịch vụ giáo dục E-learning & Phần mềm AI Kids thuộc diện Không chịu thuế GTGT).
              </p>
            </div>

            {/* Bộ 2 nút hành động kế toán thuế */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportTaxReport}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-3.5 py-2 text-xs font-black text-white shadow-2xs transition cursor-pointer"
                title="Kết xuất Bảng kê bán ra theo chuẩn Thông tư 80/2021/TT-BTC nộp cho Chi cục Thuế"
              >
                <FileSpreadsheet size={15} />
                <span>Tải Bảng kê bán ra (Mẫu 01-1/GTGT)</span>
              </button>

              <button
                type="button"
                onClick={handleExportGeneralJournal}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 px-3.5 py-2 text-xs font-black text-white shadow-2xs transition cursor-pointer"
                title="Kết xuất bảng kê bút toán kép Nợ 1121 / Có 131 và Nợ 131 / Có 5113 chuẩn nhập khẩu vào MISA SME / AMIS"
              >
                <Download size={15} />
                <span>Xuất Sổ Nhật Ký Chung (Excel/CSV)</span>
              </button>
            </div>
          </div>

          {/* Hàng tìm kiếm & bộ lọc */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-brand-100/60">
            <div className="relative flex-1 min-w-[220px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                <Search size={15} aria-hidden="true" />
              </span>
              <input
                type="search"
                aria-label="Tìm kiếm hóa đơn theo tên, email, số HĐ, MST"
                placeholder="Tìm tên người mua, email, số HĐ, MST..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-h-9 rounded-xl border border-border bg-white pl-9 pr-3 text-xs outline-none transition focus:border-brand-400"
              />
            </div>

            {/* Lọc theo kỳ thuế */}
            <div className="flex items-center gap-1">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                aria-label="Lọc theo kỳ tính thuế"
                className="min-h-9 rounded-xl border border-border bg-white px-3 py-1 text-xs font-bold text-text outline-none transition focus:border-brand-400 cursor-pointer shadow-2xs"
              >
                <option value="all">Tất cả các kỳ thuế</option>
                <option value="2026-Q3">Kỳ thuế Quý 3/2026</option>
                <option value="2026-Q2">Kỳ thuế Quý 2/2026</option>
                <option value="2026-Q1">Kỳ thuế Quý 1/2026</option>
              </select>
            </div>

            {(searchTerm || selectedPeriod !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedPeriod('all')
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                title="Xóa bộ lọc"
              >
                <RotateCcw size={12} />
                <span>Đặt lại</span>
              </button>
            )}

            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 border border-brand-200 ml-auto">
              {filteredInvoices.length}/{invoices.length} hóa đơn
            </span>
          </div>
        </div>

        {/* Bảng dữ liệu hóa đơn */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-brand-50/60">
                <th className="px-4 py-3 font-extrabold text-slate-800">Số HĐ & Ký hiệu</th>
                <th className="px-4 py-3 font-extrabold text-slate-800">Ngày xuất</th>
                <th className="px-4 py-3 font-extrabold text-slate-800">Người mua / Doanh nghiệp</th>
                <th className="px-4 py-3 font-extrabold text-slate-800">Gói dịch vụ</th>
                <th className="px-4 py-3 font-extrabold text-slate-800">Doanh thu (VND)</th>
                <th className="px-4 py-3 font-extrabold text-slate-800">Thuế suất</th>
                <th className="px-4 py-3 font-extrabold text-slate-800">Mã Cơ quan Thuế</th>
                <th className="px-4 py-3 font-extrabold text-slate-800">Trạng thái HĐĐT</th>
                <th className="px-4 py-3 font-extrabold text-right text-slate-800">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-muted">
                    <p className="font-bold text-sm text-text">Không tìm thấy hóa đơn điện tử nào</p>
                    <p className="text-xs text-muted mt-1">
                      Các hóa đơn phát sinh khi phụ huynh thanh toán gói học sẽ được lưu trữ và cấp mã CQT tại đây.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const dateFormatted = new Date(inv.issuedDate).toLocaleDateString('vi-VN')

                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-border/30 hover:bg-brand-50/30 transition"
                    >
                      {/* Số HĐ & Ký hiệu */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-mono text-sm font-black text-brand-700">
                          {inv.invoiceNumber}
                        </p>
                        <p className="font-mono text-[11px] font-bold text-slate-500">
                          {inv.invoiceSeries} · Mẫu {inv.templateCode}
                        </p>
                      </td>

                      {/* Ngày xuất */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                        {dateFormatted}
                      </td>

                      {/* Người mua & MST */}
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-bold text-slate-900 truncate" title={inv.buyerLegalName}>
                          {inv.buyerLegalName}
                        </p>
                        <p className="text-slate-500 font-mono text-[11px] truncate">
                          {inv.buyerEmail || '—'}
                        </p>
                        {inv.buyerTaxCode && (
                          <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 mt-0.5 border border-slate-200">
                            MST: {inv.buyerTaxCode}
                          </span>
                        )}
                      </td>

                      {/* Gói dịch vụ */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 line-clamp-1" title={inv.planName}>
                          {inv.planName}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          PT: {inv.paymentMethod}
                        </span>
                      </td>

                      {/* Doanh thu */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono font-black text-sm text-slate-900">
                        {inv.totalAmount.toLocaleString('vi-VN')}₫
                      </td>

                      {/* Thuế suất */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-300"
                          title="Không chịu thuế GTGT theo Thông tư 219/2013/TT-BTC"
                        >
                          KCT (Không chịu thuế)
                        </span>
                      </td>

                      {/* Mã Cơ quan Thuế */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-700">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span className="font-bold">{inv.cqtCode}</span>
                        </div>
                      </td>

                      {/* Trạng thái HĐĐT */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                          <span>{inv.statusLabel || 'Đã cấp mã CQT'}</span>
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Xem bản thể hiện */}
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForModal(inv)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                            title="Xem chi tiết bản thể hiện Hóa đơn điện tử"
                          >
                            <Eye size={12} />
                            <span>Xem HĐ</span>
                          </button>

                          {/* Tra cứu meInvoice */}
                          {inv.einvoiceViewUrl && (
                            <a
                              href={inv.einvoiceViewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700 hover:bg-brand-100 transition cursor-pointer shadow-2xs"
                              title="Tra cứu trực tiếp trên Cổng HĐĐT MISA meInvoice"
                            >
                              <ExternalLink size={12} />
                              <span>meInvoice</span>
                            </a>
                          )}

                          {/* Tải XML gốc ký số */}
                          <button
                            type="button"
                            onClick={() => handleDownloadXml(inv)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                            title="Tải file XML gốc có chữ ký số điện tử"
                          >
                            <FileCode size={12} />
                            <span>XML</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal bản thể hiện HĐĐT */}
      {selectedInvoiceForModal && (
        <EInvoiceModal
          invoice={selectedInvoiceForModal}
          isOpen={!!selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
        />
      )}
    </div>
  )
}

import React, { useRef } from 'react'
import { X, Printer, Download, ExternalLink, CheckCircle2, ShieldCheck, FileCode } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import {
  type EInvoice,
  generateMisaXml,
  downloadFile,
  numberToVietnameseWords,
} from '../einvoice-types'

interface EInvoiceModalProps {
  invoice: EInvoice | null
  isOpen: boolean
  onClose: () => void
}

export function EInvoiceModal({ invoice, isOpen, onClose }: EInvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !invoice) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadXml = () => {
    const xml = generateMisaXml(invoice)
    const filename = `HDDT_${invoice.invoiceSeries}_${invoice.invoiceNumber}.xml`
    downloadFile(xml, filename, 'application/xml;charset=utf-8;')
  }

  const dateObj = new Date(invoice.issuedDate)
  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const year = dateObj.getFullYear()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="einvoice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white shadow-2xl overflow-hidden border border-border">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-border bg-slate-50 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h3 id="einvoice-modal-title" className="text-sm sm:text-base font-extrabold text-slate-900">
                Hóa Đơn Điện Tử MISA meInvoice · Số {invoice.invoiceNumber}
              </h3>
              <p className="text-[11px] text-muted">
                Ký hiệu: <span className="font-mono font-bold text-slate-700">{invoice.invoiceSeries}</span> · Mẫu số:{' '}
                <span className="font-mono font-bold text-slate-700">{invoice.templateCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="!py-1.5 !px-2.5 text-xs font-bold gap-1.5 rounded-xl hidden sm:inline-flex"
              onClick={handlePrint}
            >
              <Printer size={14} />
              <span>In hóa đơn</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="!py-1.5 !px-2.5 text-xs font-bold gap-1.5 rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 border-brand-200"
              onClick={handleDownloadXml}
            >
              <FileCode size={14} />
              <span>Tải file XML ký số</span>
            </Button>
            {invoice.einvoiceViewUrl && (
              <a
                href={invoice.einvoiceViewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
              >
                <ExternalLink size={13} />
                <span className="hidden md:inline">Tra cứu meInvoice</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Paper Canvas (Scrollable) */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div
            ref={printRef}
            className="mx-auto max-w-3xl rounded-2xl border-2 border-slate-300 bg-white p-6 sm:p-8 shadow-md text-slate-800 font-sans relative"
          >
            {/* Watermark badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none text-center">
              <span className="text-8xl sm:text-9xl font-black uppercase tracking-widest text-slate-900 block">
                AI KIDS
              </span>
              <span className="text-3xl font-bold uppercase tracking-wide text-slate-900 block mt-2">
                MISA meInvoice
              </span>
            </div>

            {/* Header: Đơn vị phát hành */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 border-b-2 border-brand-500 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black text-brand-600 tracking-tight">AI KIDS</span>
                  <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-black text-brand-700 uppercase">
                    E-Learning Platform
                  </span>
                </div>
                <h4 className="font-extrabold text-sm sm:text-base uppercase text-slate-900 leading-tight">
                  CÔNG TY CỔ PHẦN CÔNG NGHỆ GIÁO DỤC STORYMEE
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Mã số thuế:</strong> <span className="font-mono font-bold text-slate-900">0109999999</span>
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  <strong>Địa chỉ:</strong> Tầng 6, Tòa nhà Công nghệ số, TP. Hà Nội, Việt Nam
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  <strong>Hotline:</strong> 1900-AIKIDS · <strong>Email:</strong> support@aikid.vn
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  <strong>Số tài khoản:</strong> 038612345678 tại Ngân hàng Quân Đội (MBBank)
                </p>
              </div>

              {/* Box thông số hóa đơn */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs flex flex-col justify-center min-w-[200px]">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500 font-medium">Mẫu số:</span>
                  <span className="font-mono font-bold text-slate-900">{invoice.templateCode}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500 font-medium">Ký hiệu:</span>
                  <span className="font-mono font-bold text-brand-700">{invoice.invoiceSeries}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500 font-medium">Số hóa đơn:</span>
                  <span className="font-mono text-base font-black text-danger">{invoice.invoiceNumber}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                    <CheckCircle2 size={11} /> {invoice.statusLabel || 'Đã cấp mã CQT'}
                  </span>
                </div>
              </div>
            </div>

            {/* Title Tiêu đề hóa đơn */}
            <div className="text-center my-5">
              <h2 className="text-xl sm:text-2xl font-black text-brand-700 tracking-wide uppercase">
                HÓA ĐƠN GIÁ TRỊ GIA TĂNG
              </h2>
              <p className="text-xs italic text-slate-500 mt-0.5 font-medium">
                (Hóa đơn điện tử có mã của Cơ quan Thuế khởi tạo từ MISA meInvoice)
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Ngày {day} tháng {month} năm {year}
              </p>

              {/* Khối Mã Cơ quan Thuế */}
              <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-xs text-emerald-900 shadow-2xs">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>Mã của Cơ quan Thuế:</strong>{' '}
                  <span className="font-mono font-bold tracking-wider">{invoice.cqtCode}</span>
                </span>
              </div>
            </div>

            {/* Thông tin người mua */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs space-y-1.5 mb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <strong className="text-slate-600">Tên người mua hàng / Đơn vị:</strong>{' '}
                  <span className="font-bold text-slate-900 uppercase">{invoice.buyerLegalName}</span>
                </p>
                <p>
                  <strong className="text-slate-600">Mã số thuế:</strong>{' '}
                  <span className="font-mono font-bold text-slate-900">{invoice.buyerTaxCode || '—'}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <strong className="text-slate-600">Địa chỉ:</strong>{' '}
                  <span className="text-slate-800">{invoice.buyerAddress || 'Việt Nam'}</span>
                </p>
                <p>
                  <strong className="text-slate-600">Email nhận HĐĐT:</strong>{' '}
                  <span className="font-mono text-slate-800">{invoice.buyerEmail || '—'}</span>
                </p>
              </div>
              <p>
                <strong className="text-slate-600">Hình thức thanh toán:</strong>{' '}
                <span className="font-bold text-slate-800">{invoice.paymentMethod}</span>
              </p>
            </div>

            {/* Bảng kê chi tiết hàng hóa / dịch vụ */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-extrabold text-slate-700 text-center">
                    <th className="p-2.5 border-r border-slate-200 w-12">STT</th>
                    <th className="p-2.5 border-r border-slate-200 text-left">Tên hàng hóa, dịch vụ</th>
                    <th className="p-2.5 border-r border-slate-200 w-16">ĐVT</th>
                    <th className="p-2.5 border-r border-slate-200 w-16">Số lượng</th>
                    <th className="p-2.5 border-r border-slate-200 text-right w-24">Đơn giá (VND)</th>
                    <th className="p-2.5 text-right w-28">Thành tiền (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-2.5 text-center font-bold border-r border-slate-100">{item.stt}</td>
                      <td className="p-2.5 font-medium border-r border-slate-100">
                        <p className="font-bold text-slate-900">{item.itemName}</p>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          Dịch vụ E-learning giáo dục trực tuyến không chịu thuế GTGT (KCT)
                        </p>
                      </td>
                      <td className="p-2.5 text-center border-r border-slate-100">{item.unitName}</td>
                      <td className="p-2.5 text-center font-mono font-bold border-r border-slate-100">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono border-r border-slate-100">
                        {item.unitPrice.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {item.amount.toLocaleString('vi-VN')}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bảng tổng hợp thuế & tiền thanh toán */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs space-y-1.5 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-bold text-slate-700">Cộng tiền hàng (Doanh thu chưa thuế):</span>
                <span className="font-mono font-bold text-slate-900">{invoice.totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Thuế suất GTGT:</span>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-800 border border-emerald-300">
                    KCT (Không chịu thuế)
                  </span>
                  <span className="text-[10px] text-slate-500 italic hidden sm:inline">
                    (Khoản 13, 21 Điều 4 Thông tư 219/2013/TT-BTC)
                  </span>
                </div>
                <div className="font-mono font-bold text-slate-900">
                  Tiền thuế GTGT: <span className="text-emerald-700">0₫</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="font-black text-sm text-brand-800 uppercase">Tổng cộng tiền thanh toán:</span>
                <span className="font-mono text-lg font-black text-brand-700">
                  {invoice.totalAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="pt-1 text-slate-700">
                <strong>Số tiền viết bằng chữ:</strong>{' '}
                <span className="font-bold italic text-slate-900">
                  {numberToVietnameseWords(invoice.totalAmount)}
                </span>
              </div>
            </div>

            {/* Footer Ký số điện tử */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              <div className="text-center">
                <p className="font-bold text-xs uppercase text-slate-700">Người mua hàng</p>
                <p className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
                <p className="mt-8 font-bold text-xs text-slate-800">{invoice.buyerLegalName}</p>
              </div>

              <div className="text-center">
                <p className="font-bold text-xs uppercase text-slate-700">Người bán hàng</p>
                <p className="text-[11px] text-slate-400 italic">(Ký số điện tử)</p>

                {/* Box chữ ký số MISA HSM */}
                <div className="mt-2 inline-block rounded-xl border-2 border-emerald-500 bg-emerald-50/70 p-2.5 text-left text-[11px] max-w-xs shadow-2xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-black mb-1">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>ĐÃ KÝ SỐ ĐIỆN TỬ HỢP LỆ</span>
                  </div>
                  <p className="text-slate-800">
                    <strong>Đơn vị ký:</strong> CÔNG TY CỔ PHẦN CÔNG NGHỆ GIÁO DỤC STORYMEE
                  </p>
                  <p className="text-slate-800">
                    <strong>Ngày ký:</strong> {dateObj.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Chứng thư số HSM MISA-CA · NĐ 123/2020/NĐ-CP
                  </p>
                </div>
              </div>
            </div>

            {/* Chú dẫn tra cứu meInvoice */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[11px] text-slate-500">
              <p>
                Tra cứu hóa đơn điện tử tại: <strong className="text-brand-700">https://meinvoice.vn/tra-cuu</strong> với
                mã xác thực: <span className="font-mono font-bold text-slate-800">{invoice.cqtCode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between border-t border-border bg-slate-50 px-5 py-3 shrink-0">
          <div className="text-xs text-muted">
            Hóa đơn được lưu trữ an toàn tối thiểu 10 năm theo Luật Kế toán Việt Nam.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleDownloadXml} className="rounded-xl text-xs py-1.5">
              <Download size={13} className="mr-1" />
              Tải XML
            </Button>
            <Button variant="primary" onClick={onClose} className="rounded-xl text-xs py-1.5">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

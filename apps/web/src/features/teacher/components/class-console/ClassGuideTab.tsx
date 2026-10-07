import React from 'react'
import { RefreshCw, AlertTriangle, Check, Copy } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { ClassInfo, StudentRow } from './types'

export interface ClassGuideTabProps {
  classInfo: ClassInfo
  students: StudentRow[]
  loadData: () => Promise<void>
  isRefreshing: boolean
  handleCopyCode: () => Promise<void>
  copiedCode: boolean
}

export function ClassGuideTab({
  classInfo,
  students,
  loadData,
  isRefreshing,
  handleCopyCode,
  copiedCode,
}: ClassGuideTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Card 1: Cơ Chế Ghi Danh Tự Động (Auto-Enrollment System) */}
      <section className="ui-card p-6 border border-border space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-emerald-600">CƠ CHẾ TỰ ĐỘNG HÓA</p>
          <h2 className="font-display text-2xl text-slate-900 mt-1">Ghi danh & Xếp lớp {classInfo.name}</h2>
        </div>

        <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-6 text-center space-y-3">
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 border border-emerald-200">
            ⚡ TỰ ĐỘNG GHI DANH 100% HỌC SINH MỚI
          </span>
          <p className="text-sm text-slate-700 leading-relaxed">
            Tất cả học sinh khi đăng ký tài khoản hoặc được phụ huynh mở hồ sơ con sẽ được hệ thống <strong>TỰ ĐỘNG GHI DANH</strong> vào Lớp học AIKids Chính thức. Bé đăng nhập là vào học ngay Bản Đồ 6 Vùng Đảo mà <strong>không cần nhập mã lớp</strong>.
          </p>
          <Button
            onClick={() => void loadData()}
            className="mx-auto flex items-center gap-2 !min-h-10 !px-5"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            <span>Đồng bộ danh sách học sinh</span>
          </Button>
        </div>

        <div className="space-y-2 text-xs text-muted">
          <div className="flex justify-between py-1 border-b border-border/60">
            <span>Khóa học liên kết:</span>
            <span className="font-bold text-slate-700 text-right">Chương trình Chuẩn AIKids<br/>(6 Vùng Đảo - 32 Trạm Học)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/60">
            <span>Sĩ số lớp hiện tại:</span>
            <span className="font-bold text-slate-700">{students.length} bạn</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/60">
            <span>Trạng thái:</span>
            <span className="font-bold text-emerald-700">🟢 Tự động đồng bộ học sinh: Đang kích hoạt</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Mã định danh lớp (ID):</span>
            <span className="font-mono text-slate-700">{classInfo.id}</span>
          </div>
        </div>
      </section>

      {/* Card 2: Mã Lớp Mở Rộng & Trường Liên Kết (Optional Class Code) */}
      <section className="ui-card p-6 border border-border space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-amber-600">TÙY CHỌN MỞ RỘNG</p>
          <h2 className="font-display text-xl text-slate-900 mt-1">Mã lớp dự phòng & Trường liên kết</h2>
        </div>

        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5 text-center space-y-4">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>CHỈ DÀNH CHO TRƯỜNG LIÊN KẾT NGOÀI HOẶC LỚP NGOẠI KHÓA</span>
          </div>
          <p className="text-xs text-amber-900/80 leading-relaxed">
            Học sinh học chương trình AIKids tiêu chuẩn <strong>KHÔNG CẦN</strong> mã này. Mã này chỉ dành riêng cho các trường đối tác liên kết hoặc khi mở lớp workshop ngoại khóa đặc thù.
          </p>
          <div className="inline-block rounded-xl bg-white px-6 py-2 shadow-sm border border-amber-100">
            <p className="font-mono text-3xl font-black tracking-widest text-slate-800 select-all">
              {classInfo.code}
            </p>
          </div>
          <Button
            variant="secondary"
            type="button"
            onClick={() => void handleCopyCode()}
            className="mx-auto flex items-center gap-2 !min-h-9 !px-4 text-xs"
          >
            {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedCode ? 'Đã sao chép mã!' : 'Sao chép mã mời dự phòng'}</span>
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-700 border-b border-border/60 pb-1">Hướng dẫn vận hành 3 bước chuẩn:</p>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-bold text-emerald-700 text-[11px]">
                1
              </span>
              <div>
                <strong className="block text-xs font-bold text-slate-900">Tự động xếp lớp</strong>
                <span className="text-[11px] text-muted leading-relaxed">
                  Hệ thống tự động nhận diện và xếp học sinh mới vào lớp.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-bold text-emerald-700 text-[11px]">
                2
              </span>
              <div>
                <strong className="block text-xs font-bold text-slate-900">Đồng hành & Theo dõi</strong>
                <span className="text-[11px] text-muted leading-relaxed">
                  Thầy cô theo dõi tiến độ trên Radar lớp học và chấm sản phẩm sáng tạo.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 font-bold text-amber-700 text-[11px]">
                3
              </span>
              <div>
                <strong className="block text-xs font-bold text-slate-900">Học sinh trường ngoài (Tùy chọn)</strong>
                <span className="text-[11px] text-muted leading-relaxed">
                  Chỉ học sinh từ các dự án trường đối tác liên kết mới dùng mã dự phòng này để phân loại nguồn tuyển sinh.
                </span>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </div>
  )
}

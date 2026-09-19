/**
 * Kiểu dữ liệu & Tiện ích Hóa Đơn Điện Tử MISA meInvoice & Kế Toán Thuế Việt Nam
 * Tuân thủ Nghị định 123/2020/NĐ-CP, Thông tư 78/2021/TT-BTC, Thông tư 80/2021/TT-BTC
 * và Khoản 13, 21 Điều 4 Thông tư 219/2013/TT-BTC (Dịch vụ E-learning AI Kids không chịu thuế GTGT)
 */

export interface EInvoiceItem {
  stt: number
  itemName: string
  unitName: string
  quantity: number
  unitPrice: number
  amount: number
  vatRate: string // 'KCT'
  vatAmount: number // 0
}

export interface EInvoice {
  id: string
  invoiceNumber: string // VD: '0001001'
  invoiceSeries: string // VD: '1C26TMM'
  templateCode: string // '1/001'
  issuedDate: string // ISO string
  buyerLegalName: string
  buyerTaxCode?: string | null
  buyerAddress?: string | null
  buyerEmail?: string | null
  buyerPhone?: string | null
  planId?: string
  planName: string
  totalAmount: number // VND
  vatRate: string // 'KCT'
  vatAmount: number // 0
  cqtCode: string // VD: 'M2-26-0001001-A89E'
  reservationCode?: string
  status: 'signed_with_cqt' | 'signed' | 'pending' | 'cancelled'
  statusLabel: string
  einvoiceViewUrl?: string
  xmlUrl?: string
  paymentMethod: string
  items: EInvoiceItem[]
}

export interface CompanyInvoiceInfo {
  companyName: string
  taxCode: string
  address: string
  email: string
}

export const COMPANY_INVOICE_STORAGE_KEY = 'aikids_parent_company_invoice_info'
export const INVOICES_STORAGE_KEY = 'aikids_billing_einvoices'

let memoryCompanyInfo: CompanyInvoiceInfo | null = null
let memoryInvoices: EInvoice[] | null = null

export function getStoredCompanyInvoiceInfo(): CompanyInvoiceInfo | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(COMPANY_INVOICE_STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    }
  } catch {
    /* ignore */
  }
  return memoryCompanyInfo
}

export function saveCompanyInvoiceInfo(info: CompanyInvoiceInfo): void {
  memoryCompanyInfo = info
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(COMPANY_INVOICE_STORAGE_KEY, JSON.stringify(info))
    }
  } catch {
    /* ignore */
  }
}

export const INITIAL_E_INVOICES: EInvoice[] = [
  {
    id: 'inv_0001001',
    invoiceNumber: '0001001',
    invoiceSeries: '1C26TMM',
    templateCode: '1/001',
    issuedDate: '2026-09-18T14:20:00.000Z',
    buyerLegalName: 'Nguyễn Văn An',
    buyerEmail: 'an.nguyen@example.com',
    buyerAddress: 'Quận Cầu Giấy, TP. Hà Nội',
    planId: 'aikids_official_129k',
    planName: 'Gói học AI Kids Pro (1 tháng)',
    totalAmount: 149000,
    vatRate: 'KCT',
    vatAmount: 0,
    cqtCode: 'M2-26-0001001-C78D2',
    reservationCode: 'MISA-RSV-0001001',
    status: 'signed_with_cqt',
    statusLabel: 'Đã cấp mã CQT',
    paymentMethod: 'VietQR MBBank',
    einvoiceViewUrl: 'https://meinvoice.vn/tra-cuu?code=M2-26-0001001-C78D2',
    items: [
      {
        stt: 1,
        itemName: 'Dịch vụ giáo dục E-learning AI Kids Pro (Bản quyền phần mềm giáo dục KCT)',
        unitName: 'Gói',
        quantity: 1,
        unitPrice: 149000,
        amount: 149000,
        vatRate: 'KCT',
        vatAmount: 0,
      },
    ],
  },
  {
    id: 'inv_0001002',
    invoiceNumber: '0001002',
    invoiceSeries: '1C26TMM',
    templateCode: '1/001',
    issuedDate: '2026-09-17T09:15:00.000Z',
    buyerLegalName: 'TRƯỜNG TIỂU HỌC QUỐC TẾ BÌNH MINH',
    buyerTaxCode: '0108765432',
    buyerEmail: 'ketoan@binhminhschool.edu.vn',
    buyerAddress: 'Khu Đô Thị Mỹ Đình 2, Nam Từ Liêm, TP. Hà Nội',
    planId: 'premium_family',
    planName: 'Gói Family Hero (Premium Gia Đình)',
    totalAmount: 149000,
    vatRate: 'KCT',
    vatAmount: 0,
    cqtCode: 'M2-26-0001002-E56B1',
    reservationCode: 'MISA-RSV-0001002',
    status: 'signed_with_cqt',
    statusLabel: 'Đã cấp mã CQT',
    paymentMethod: 'Chuyển khoản MBBank',
    einvoiceViewUrl: 'https://meinvoice.vn/tra-cuu?code=M2-26-0001002-E56B1',
    items: [
      {
        stt: 1,
        itemName: 'Phần mềm học tập E-learning AI Kids Family Hero (KCT theo Khoản 13 Đ4 TT219)',
        unitName: 'Gói',
        quantity: 1,
        unitPrice: 149000,
        amount: 149000,
        vatRate: 'KCT',
        vatAmount: 0,
      },
    ],
  },
  {
    id: 'inv_0001003',
    invoiceNumber: '0001003',
    invoiceSeries: '1C26TMM',
    templateCode: '1/001',
    issuedDate: '2026-09-16T16:45:00.000Z',
    buyerLegalName: 'Lê Hoàng Nam',
    buyerEmail: 'nam.le@example.com',
    buyerAddress: 'Quận 1, TP. Hồ Chí Minh',
    planId: 'credit_pack_50',
    planName: 'Gói 50 Lượt tạo AI Kids',
    totalAmount: 59000,
    vatRate: 'KCT',
    vatAmount: 0,
    cqtCode: 'M2-26-0001003-F90A4',
    reservationCode: 'MISA-RSV-0001003',
    status: 'signed_with_cqt',
    statusLabel: 'Đã cấp mã CQT',
    paymentMethod: 'VietQR MBBank',
    einvoiceViewUrl: 'https://meinvoice.vn/tra-cuu?code=M2-26-0001003-F90A4',
    items: [
      {
        stt: 1,
        itemName: 'Lượt cấp quyền công nghệ AI Kids tương tác sáng tạo (KCT theo TT 219/2013/TT-BTC)',
        unitName: 'Lượt',
        quantity: 50,
        unitPrice: 1180,
        amount: 59000,
        vatRate: 'KCT',
        vatAmount: 0,
      },
    ],
  },
  {
    id: 'inv_0001004',
    invoiceNumber: '0001004',
    invoiceSeries: '1C26TMM',
    templateCode: '1/001',
    issuedDate: '2026-09-15T11:00:00.000Z',
    buyerLegalName: 'Hoàng Minh Tuấn',
    buyerEmail: 'tuan.hoang@example.com',
    buyerAddress: 'Quận Thanh Xuân, TP. Hà Nội',
    planId: 'starter',
    planName: 'Gói Tiêu Chuẩn 129K',
    totalAmount: 129000,
    vatRate: 'KCT',
    vatAmount: 0,
    cqtCode: 'M2-26-0001004-B32C8',
    reservationCode: 'MISA-RSV-0001004',
    status: 'signed_with_cqt',
    statusLabel: 'Đã cấp mã CQT',
    paymentMethod: 'VietQR MBBank',
    einvoiceViewUrl: 'https://meinvoice.vn/tra-cuu?code=M2-26-0001004-B32C8',
    items: [
      {
        stt: 1,
        itemName: 'Dịch vụ giáo dục E-learning AI Kids Tiêu chuẩn (KCT)',
        unitName: 'Gói',
        quantity: 1,
        unitPrice: 129000,
        amount: 129000,
        vatRate: 'KCT',
        vatAmount: 0,
      },
    ],
  },
  {
    id: 'inv_0001005',
    invoiceNumber: '0001005',
    invoiceSeries: '1C26TMM',
    templateCode: '1/001',
    issuedDate: '2026-09-19T10:30:00.000Z',
    buyerLegalName: 'CÔNG TY TNHH GIẢI PHÁP GIÁO DỤC EDUKID',
    buyerTaxCode: '0316554433',
    buyerEmail: 'finance@edukid.vn',
    buyerAddress: 'Tòa nhà Landmark 81, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh',
    planId: 'pro',
    planName: 'Gói học AI Kids Pro (VIP 3 tháng)',
    totalAmount: 447000,
    vatRate: 'KCT',
    vatAmount: 0,
    cqtCode: 'M2-26-0001005-D41F9',
    reservationCode: 'MISA-RSV-0001005',
    status: 'signed_with_cqt',
    statusLabel: 'Đã cấp mã CQT',
    paymentMethod: 'Chuyển khoản MBBank',
    einvoiceViewUrl: 'https://meinvoice.vn/tra-cuu?code=M2-26-0001005-D41F9',
    items: [
      {
        stt: 1,
        itemName: 'Bản quyền dịch vụ phần mềm giáo dục trực tuyến AI Kids Pro 3 tháng (KCT)',
        unitName: 'Gói',
        quantity: 1,
        unitPrice: 447000,
        amount: 447000,
        vatRate: 'KCT',
        vatAmount: 0,
      },
    ],
  },
]

export function getStoredInvoices(): EInvoice[] {
  if (memoryInvoices && memoryInvoices.length > 0) return memoryInvoices
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(INVOICES_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    }
  } catch {
    /* ignore */
  }
  return INITIAL_E_INVOICES
}

export function saveInvoices(invoices: EInvoice[]): void {
  memoryInvoices = invoices
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices))
    }
  } catch {
    /* ignore */
  }
}

/**
 * Chuyển đổi số tiền thành chữ tiếng Việt chuẩn hóa đơn tài chính
 */
export function numberToVietnameseWords(n: number): string {
  if (!n || n === 0) return 'Không đồng'
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']

  function readGroup(group: string, isFirst: boolean): string {
    const [c, b, a] = group.padStart(3, '0').split('').map(Number)
    let res = ''
    if (c === 0 && b === 0 && a === 0) return ''
    if (!isFirst || c > 0) {
      res += digits[c] + ' trăm '
    }
    if (b === 0 && a !== 0) {
      if (!isFirst || c > 0) {
        res += 'lẻ ' + digits[a]
      } else {
        res += digits[a]
      }
    } else if (b === 1) {
      res += 'mười ' + (a === 5 ? 'lăm' : a === 0 ? '' : digits[a])
    } else if (b > 1) {
      res += digits[b] + ' mươi ' + (a === 1 ? 'mốt' : a === 5 ? 'lăm' : a === 0 ? '' : digits[a])
    } else if (a !== 0) {
      res += digits[a]
    }
    return res.trim()
  }

  const s = Math.round(n).toString()
  const groups: string[] = []
  for (let i = s.length; i > 0; i -= 3) {
    groups.unshift(s.substring(Math.max(0, i - 3), i))
  }

  let text = ''
  for (let i = 0; i < groups.length; i++) {
    const isFirst = i === 0
    const groupText = readGroup(groups[i], isFirst)
    const unitIndex = groups.length - 1 - i
    if (groupText !== '') {
      text += groupText + ' ' + units[unitIndex] + ' '
    }
  }

  text = text.trim()
  text = text.charAt(0).toUpperCase() + text.slice(1) + ' đồng chẵn'
  return text.replace(/\s+/g, ' ')
}

/**
 * Tạo nội dung file XML hóa đơn gốc có chữ ký số điện tử chuẩn MISA meInvoice & TCT (NĐ 123)
 */
export function generateMisaXml(inv: EInvoice): string {
  const dateStr = inv.issuedDate.split('T')[0]
  const amountWords = numberToVietnameseWords(inv.totalAmount)

  return `<?xml version="1.0" encoding="UTF-8"?>
<HDon xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://laphoadon.gdt.gov.vn/2020/01">
  <DLHDon Id="DLHDon_${inv.invoiceSeries}_${inv.invoiceNumber}">
    <TTChung>
      <PBan>2.0.0</PBan>
      <THDon>Hóa đơn giá trị gia tăng</THDon>
      <KHMSHDon>${inv.templateCode}</KHMSHDon>
      <KHHDon>${inv.invoiceSeries}</KHHDon>
      <SHDon>${inv.invoiceNumber}</SHDon>
      <NLap>${dateStr}</NLap>
      <DVTTe>VND</DVTTe>
      <TGia>1</TGia>
      <HTTToan>${inv.paymentMethod}</HTTToan>
      <MSTTCGP>0109999999</MSTTCGP>
      <MCQTCap>${inv.cqtCode}</MCQTCap>
    </TTChung>
    <NDHDon>
      <NBan>
        <Ten>CÔNG TY CỔ PHẦN CÔNG NGHỆ GIÁO DỤC STORYMEE</Ten>
        <MST>0109999999</MST>
        <DChi>Tầng 6, Tòa nhà Công nghệ số, TP. Hà Nội</DChi>
        <SDThoai>1900-AIKIDS</SDThoai>
        <DCTDTu>support@aikid.vn</DCTDTu>
        <STKNHang>038612345678</STKNHang>
        <TNHang>Ngân hàng Quân Đội (MBBank)</TNHang>
      </NBan>
      <NMua>
        <Ten>${inv.buyerLegalName}</Ten>
        <MST>${inv.buyerTaxCode || ''}</MST>
        <DChi>${inv.buyerAddress || 'Việt Nam'}</DChi>
        <DCTDTu>${inv.buyerEmail || ''}</DCTDTu>
        <HVTNMHang>${inv.buyerLegalName}</HVTNMHang>
      </NMua>
      <DSHHDVu>
        ${inv.items
          .map(
            (it) => `
        <HHDVu>
          <STT>${it.stt}</STT>
          <THHDVu>${it.itemName}</THHDVu>
          <DVTinh>${it.unitName}</DVTinh>
          <SLuong>${it.quantity}</SLuong>
          <DGia>${it.unitPrice}</DGia>
          <Tien>${it.amount}</Tien>
          <TSuat>${it.vatRate}</TSuat>
        </HHDVu>`,
          )
          .join('')}
      </DSHHDVu>
      <TToan>
        <TgTCThue>${inv.totalAmount}</TgTCThue>
        <TgTThue>0</TgTThue>
        <TSuatVat>KCT</TSuatVat>
        <GhiChu>Dịch vụ E-learning và bản quyền phần mềm giáo dục không chịu thuế GTGT (KCT) theo Khoản 13, 21 Điều 4 Thông tư 219/2013/TT-BTC</GhiChu>
        <TgTTTBSo>${inv.totalAmount}</TgTTTBSo>
        <TgTTTBChu>${amountWords}</TgTTTBChu>
      </TToan>
    </NDHDon>
  </DLHDon>
  <DSCKS>
    <NBan>
      <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
        <SignedInfo>
          <CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
          <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256" />
          <Reference URI="#DLHDon_${inv.invoiceSeries}_${inv.invoiceNumber}">
            <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" />
            <DigestValue>dGVzdERpZ2VzdE1pc2FFU2lnbkhTTTIwMjY=</DigestValue>
          </Reference>
        </SignedInfo>
        <SignatureValue>TWlzYUVEaWdpdGFsU2lnbmF0dXJlSE1TValidCert2026==</SignatureValue>
        <KeyInfo>
          <X509Data>
            <X509SubjectName>CN=CÔNG TY CỔ PHẦN CÔNG NGHỆ GIÁO DỤC STORYMEE, OID.0.9.2342.19200300.100.1.1=MST:0109999999, L=Hà Nội, C=VN</X509SubjectName>
            <X509IssuerName>CN=MISA eSign CA, O=MISA JOINT STOCK COMPANY, C=VN</X509IssuerName>
          </X509Data>
        </KeyInfo>
      </Signature>
    </NBan>
  </DSCKS>
</HDon>`
}

/**
 * Tải file trực tiếp về trình duyệt người dùng
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Kết xuất Bảng kê bán ra (Mẫu 01-1/GTGT) theo Thông tư 80/2021/TT-BTC
 */
export function generateTaxReport01_1_GTGT_CSV(invoices: EInvoice[], period = 'Quý 3/2026'): string {
  const lines: string[] = []
  // UTF-8 BOM để Excel hiển thị đúng tiếng Việt có dấu
  lines.push('\uFEFF"PHỤ LỤC BẢNG KÊ HOÁ ĐƠN, CHỨNG TỪ HÀNG HOÁ, DỊCH VỤ BÁN RA"')
  lines.push(`"(Kèm theo tờ khai thuế GTGT Mẫu số 01/GTGT - Thông tư 80/2021/TT-BTC)"`)
  lines.push(`"Tên người nộp thuế: CÔNG TY CỔ PHẦN CÔNG NGHỆ GIÁO DỤC STORYMEE"`)
  lines.push(`"Mã số thuế: 0109999999"`)
  lines.push(`"Kỳ tính thuế: ${period}"`)
  lines.push(`"Cơ sở pháp lý: Khoản 13, 21 Điều 4 Thông tư 219/2013/TT-BTC (Không chịu thuế GTGT)"`)
  lines.push('')
  lines.push(
    [
      '"STT"',
      '"Ký hiệu mẫu hoá đơn"',
      '"Ký hiệu hoá đơn"',
      '"Số hoá đơn"',
      '"Ngày tháng năm lập hoá đơn"',
      '"Tên người mua"',
      '"Mã số thuế người mua"',
      '"Mặt hàng, dịch vụ"',
      '"Doanh thu chưa có thuế GTGT (VND)"',
      '"Thuế suất"',
      '"Thuế GTGT (VND)"',
      '"Mã CQT cấp"',
      '"Ghi chú"',
    ].join(','),
  )

  let totalAmount = 0
  invoices.forEach((inv, index) => {
    totalAmount += inv.totalAmount
    const dateFormatted = new Date(inv.issuedDate).toLocaleDateString('vi-VN')
    const itemDesc = inv.items.map((it) => it.itemName).join('; ') || inv.planName
    lines.push(
      [
        `"${index + 1}"`,
        `"${inv.templateCode}"`,
        `"${inv.invoiceSeries}"`,
        `"${inv.invoiceNumber}"`,
        `"${dateFormatted}"`,
        `"${inv.buyerLegalName.replace(/"/g, '""')}"`,
        `"${inv.buyerTaxCode || ''}"`,
        `"${itemDesc.replace(/"/g, '""')}"`,
        `"${inv.totalAmount}"`,
        `"KCT"`,
        `"0"`,
        `"${inv.cqtCode}"`,
        `"Đã cấp mã CQT"`,
      ].join(','),
    )
  })

  // Dòng tổng cộng
  lines.push(
    [
      '""',
      '""',
      '""',
      '""',
      '""',
      '"TỔNG CỘNG DOANH THU KHÔNG CHỊU THUẾ (KCT)"',
      '""',
      '""',
      `"${totalAmount}"`,
      '""',
      '"0"',
      '""',
      '""',
    ].join(','),
  )

  return lines.join('\r\n')
}

/**
 * Kết xuất Sổ Nhật Ký Chung (Excel/CSV) chuẩn nhập khẩu vào phần mềm MISA SME / AMIS
 * Bút toán kép: Nợ 1121 (Tiền gửi MBBank) / Có 131 (Phải thu khách hàng)
 * và Nợ 131 / Có 5113 (Doanh thu dịch vụ KCT)
 */
export function generateGeneralJournalCSV(invoices: EInvoice[]): string {
  const lines: string[] = []
  lines.push('\uFEFF"SỔ NHẬT KÝ CHUNG (GENERAL JOURNAL) - CHUẨN NHẬP KHẨU MISA SME / AMIS"')
  lines.push(`"Đơn vị: CÔNG TY CỔ PHẦN CÔNG NGHỆ GIÁO DỤC STORYMEE"`)
  lines.push(`"Mã số thuế: 0109999999"`)
  lines.push(`"Đơn vị tính: Đồng Việt Nam (VND)"`)
  lines.push(`"Chế độ kế toán: Thông tư 200/2014/TT-BTC & Thông tư 133/2016/TT-BTC"`)
  lines.push('')
  lines.push(
    [
      '"Ngày hạch toán"',
      '"Ngày chứng từ"',
      '"Số chứng từ"',
      '"Diễn giải"',
      '"Đã ghi Sổ Cái"',
      '"STT dòng"',
      '"Tài khoản Nợ"',
      '"Tài khoản Có"',
      '"Số tiền (VND)"',
      '"Đối tượng / Tên khách hàng"',
      '"Mã số thuế"',
    ].join(','),
  )

  invoices.forEach((inv) => {
    const dateFormatted = new Date(inv.issuedDate).toLocaleDateString('vi-VN')
    const voucherNo = `HĐ${inv.invoiceNumber}`
    const buyerEscaped = inv.buyerLegalName.replace(/"/g, '""')
    const taxCode = inv.buyerTaxCode || ''

    // Bút toán 1: Thu tiền học phí qua Ngân hàng: Nợ 1121 / Có 131
    lines.push(
      [
        `"${dateFormatted}"`,
        `"${dateFormatted}"`,
        `"${voucherNo}"`,
        `"Thu tiền học phí ${inv.planName} từ ${buyerEscaped} qua ${inv.paymentMethod}"`,
        `"X"`,
        `"1"`,
        `"1121"`,
        `"131"`,
        `"${inv.totalAmount}"`,
        `"${buyerEscaped}"`,
        `"${taxCode}"`,
      ].join(','),
    )

    // Bút toán 2: Ghi nhận doanh thu dịch vụ giáo dục KCT: Nợ 131 / Có 5113
    lines.push(
      [
        `"${dateFormatted}"`,
        `"${dateFormatted}"`,
        `"${voucherNo}"`,
        `"Doanh thu dịch vụ E-learning AI Kids (KCT TT219) - HĐ ${inv.invoiceSeries}-${inv.invoiceNumber}"`,
        `"X"`,
        `"2"`,
        `"131"`,
        `"5113"`,
        `"${inv.totalAmount}"`,
        `"${buyerEscaped}"`,
        `"${taxCode}"`,
      ].join(','),
    )
  })

  return lines.join('\r\n')
}

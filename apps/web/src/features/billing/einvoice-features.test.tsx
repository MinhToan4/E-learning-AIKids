import { describe, it, expect, vi } from 'vitest'
import {
  INITIAL_E_INVOICES,
  generateMisaXml,
  generateTaxReport01_1_GTGT_CSV,
  generateGeneralJournalCSV,
  numberToVietnameseWords,
  getStoredCompanyInvoiceInfo,
  saveCompanyInvoiceInfo,
  getStoredInvoices,
  saveInvoices,
  INVOICES_STORAGE_KEY,
  type CompanyInvoiceInfo,
} from './einvoice-types'

describe('MISA e-Invoice & Vietnam Tax Accounting features', () => {
  it('converts numbers to Vietnamese currency words accurately', () => {
    expect(numberToVietnameseWords(0)).toBe('Không đồng')
    expect(numberToVietnameseWords(149000)).toBe('Một trăm bốn mươi chín nghìn đồng chẵn')
    expect(numberToVietnameseWords(129000)).toBe('Một trăm hai mươi chín nghìn đồng chẵn')
    expect(numberToVietnameseWords(59000)).toBe('Năm mươi chín nghìn đồng chẵn')
  })

  it('generates valid MISA meInvoice XML complying with Decree 123 & Circular 78', () => {
    const inv = INITIAL_E_INVOICES[0]
    const xml = generateMisaXml(inv)

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<THDon>Hóa đơn giá trị gia tăng</THDon>')
    expect(xml).toContain(`<KHMSHDon>${inv.templateCode}</KHMSHDon>`)
    expect(xml).toContain(`<KHHDon>${inv.invoiceSeries}</KHHDon>`)
    expect(xml).toContain(`<SHDon>${inv.invoiceNumber}</SHDon>`)
    expect(xml).toContain(`<MCQTCap>${inv.cqtCode}</MCQTCap>`)
    expect(xml).toContain('CÔNG TY CỔ PHẦN CÔNG NGHỆ GIÁO DỤC STORYMEE')
    expect(xml).toContain('<MST>0109999999</MST>')
    expect(xml).toContain('<TSuatVat>KCT</TSuatVat>')
    expect(xml).toContain('Dịch vụ E-learning và bản quyền phần mềm giáo dục không chịu thuế GTGT (KCT)')
    expect(xml).toContain('<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">')
    expect(xml).toContain('CN=MISA eSign CA')
  })

  it('generates tax report Form 01-1/GTGT according to Circular 80/2021/TT-BTC', () => {
    const csv = generateTaxReport01_1_GTGT_CSV(INITIAL_E_INVOICES, 'Quý 3/2026')

    expect(csv).toContain('PHỤ LỤC BẢNG KÊ HOÁ ĐƠN, CHỨNG TỪ HÀNG HOÁ, DỊCH VỤ BÁN RA')
    expect(csv).toContain('Thông tư 80/2021/TT-BTC')
    expect(csv).toContain('CÔNG TY CỔ PHẦN CÔNG NGHỆ GIÁO DỤC STORYMEE')
    expect(csv).toContain('Mã số thuế: 0109999999')
    expect(csv).toContain('Kỳ tính thuế: Quý 3/2026')
    expect(csv).toContain('"KCT"')
    expect(csv).toContain('"Đã cấp mã CQT"')
    expect(csv).toContain('TỔNG CỘNG DOANH THU KHÔNG CHỊU THUẾ (KCT)')
  })

  it('generates double-entry general journal CSV for MISA SME / AMIS', () => {
    const csv = generateGeneralJournalCSV(INITIAL_E_INVOICES)

    expect(csv).toContain('SỔ NHẬT KÝ CHUNG (GENERAL JOURNAL) - CHUẨN NHẬP KHẨU MISA SME / AMIS')
    expect(csv).toContain('Thông tư 200/2014/TT-BTC')
    // Double entry Debit 1121 / Credit 131
    expect(csv).toContain('"1121","131"')
    // Double entry Debit 131 / Credit 5113
    expect(csv).toContain('"131","5113"')
    expect(csv).toContain('Nguyễn Văn An')
  })

  it('persists and retrieves parent company invoice configuration', () => {
    const fakeInfo: CompanyInvoiceInfo = {
      companyName: 'TRƯỜNG TIỂU HỌC QUỐC TẾ BÌNH MINH',
      taxCode: '0108765432',
      address: 'Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
      email: 'ketoan@binhminhschool.edu.vn',
    }

    saveCompanyInvoiceInfo(fakeInfo)
    const saved = getStoredCompanyInvoiceInfo()
    expect(saved).not.toBeNull()
    expect(saved?.companyName).toBe(fakeInfo.companyName)
    expect(saved?.taxCode).toBe(fakeInfo.taxCode)
  })

  it('getStoredInvoices returns empty array by default and purges legacy mockup invoices', () => {
    // 1. Initial state without memory/localStorage returns []
    saveInvoices([])
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(INVOICES_STORAGE_KEY)
    }
    expect(getStoredInvoices()).toEqual([])

    // 2. If legacy mockup data existed, it is filtered out
    saveInvoices(INITIAL_E_INVOICES)
    expect(getStoredInvoices()).toEqual([])
  })
})

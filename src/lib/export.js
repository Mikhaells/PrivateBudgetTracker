import { TYPE_LABELS } from './constants'
import { formatCurrency, formatDate } from './format'

function categoryLabel(type, id, categories) {
  const defs = categories?.[type] || []
  return defs.find((c) => c.id === id)?.label || id || '-'
}

function rowsFrom(transactions, categories) {
  return transactions
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((t) => ({
      Tanggal: formatDate(t.date),
      Tipe: TYPE_LABELS[t.type] || t.type,
      Kategori: categoryLabel(t.type, t.category, categories),
      Catatan: t.note || '-',
      Tag: (t.tags || []).join(', ') || '-',
      Jumlah: t.amount,
    }))
}

function toCSV(value) {
  const str = String(value ?? '')
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function exportCSV(transactions, categories, filename = 'transaksi') {
  const rows = rowsFrom(transactions, categories)
  const header = ['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Tag', 'Jumlah']
  const lines = [
    header.join(','),
    ...rows.map((r) => [r.Tanggal, r.Tipe, r.Kategori, r.Catatan, r.Tag, r.Jumlah].map(toCSV).join(',')),
  ]
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function exportPDF(transactions, summary, categories, filename = 'laporan-keuangan') {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  const contentWidth = pageWidth - margin * 2

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Laporan Keuangan Pribadi', margin, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 113, 108)
  doc.text(`Dibuat: ${new Date().toLocaleString('id-ID')}  |  ${transactions.length} transaksi`, margin, 27)

  doc.setTextColor(0)
  doc.setFillColor(5, 150, 105)
  doc.roundedRect(margin, 34, (contentWidth - 8) / 2, 16, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255)
  doc.text(`Pemasukan: ${formatCurrency(summary.income)}`, margin + 4, 45)
  doc.setFillColor(220, 38, 38)
  doc.roundedRect(margin + (contentWidth + 8) / 2, 34, (contentWidth - 8) / 2, 16, 2, 2, 'F')
  doc.text(`Pengeluaran: ${formatCurrency(summary.expense)}`, margin + (contentWidth + 8) / 2 + 4, 45)

  doc.setFillColor(31, 41, 55)
  doc.roundedRect(margin, 54, contentWidth, 16, 2, 2, 'F')
  doc.setTextColor(255)
  doc.text(`Saldo: ${formatCurrency(summary.income - summary.expense)}`, margin + 4, 65)
  doc.setTextColor(0)

  // Header tabel
  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Tag', 'Jumlah']
  const widths = [26, 24, 40, 40, 34, contentWidth - 26 - 24 - 40 - 40 - 34]
  const rows = rowsFrom(transactions, categories)

  const drawHeader = (y) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setFillColor(244, 239, 229)
    doc.rect(margin, y, contentWidth, headerHeight, 'F')
    let x = margin
    headers.forEach((h, i) => {
      doc.setTextColor(31, 41, 55)
      doc.text(h, x + 2, y + 6)
      x += widths[i]
    })
  }

  const rowHeight = 9
  const headerHeight = 9
  const gapAfterHeader = 4
  const newPageTop = 20
  let top = 78 + headerHeight + gapAfterHeader
  drawHeader(78)
  doc.setFont('helvetica', 'normal')

  rows.forEach((r, idx) => {
    if (top > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage()
      drawHeader(newPageTop)
      top = newPageTop + headerHeight + gapAfterHeader
    }
    if (idx % 2 === 1) {
      doc.setFillColor(250, 247, 240)
      doc.rect(margin, top, contentWidth, rowHeight, 'F')
    }
    const values = [r.Tanggal, r.Tipe, r.Kategori, r.Catatan, r.Tag, formatCurrency(r.Jumlah)]
    let x = margin
    values.forEach((v, i) => {
      doc.setTextColor(17, 24, 39)
      doc.setFontSize(8.5)
      doc.text(String(v), x + 2, top + 6)
      x += widths[i]
    })
    top += rowHeight
  })

  doc.save(`${filename}-${new Date().toISOString().slice(0, 10)}.pdf`)
}

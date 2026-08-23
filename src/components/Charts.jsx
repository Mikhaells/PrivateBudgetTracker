import { Bar, Doughnut } from 'react-chartjs-2'
import { formatCurrency, formatNumber } from '../lib/format'
import useMediaQuery from '../lib/useMediaQuery'

const baseTooltip = {
  backgroundColor: 'rgba(15, 23, 42, 0.92)',
  padding: 10,
  cornerRadius: 8,
  titleFont: { size: 12, weight: 600 },
  bodyFont: { size: 12 },
  displayColors: true,
  boxWidth: 8,
  boxHeight: 8,
  usePointStyle: true,
}

export function ExpenseDoughnut({ data }) {
  const labels = data.map((d) => d.label)
  const values = data.map((d) => d.value)
  const colors = data.map((d) => d.color)
  const total = values.reduce((a, b) => a + b, 0)
  const isMobile = useMediaQuery('(max-width: 767px)')

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: isMobile ? '68%' : '62%',
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: isMobile ? 8 : 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11, weight: 500 },
        },
      },
      tooltip: {
        ...baseTooltip,
        callbacks: {
          label: (ctx) => {
            const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0
            return ` ${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`
          },
        },
      },
    },
  }

  return (
    <div className={`relative ${isMobile ? 'h-[22rem]' : 'h-72'}`}>
      <Doughnut data={chartData} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs font-medium text-slate-500">Total Pengeluaran</p>
        <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
          {total ? formatCurrency(total) : '—'}
        </p>
      </div>
    </div>
  )
}

export function ExpenseBar({ data }) {
  const labels = data.map((d) => d.label)
  const values = data.map((d) => d.value)
  const colors = data.map((d) => d.color)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Pengeluaran',
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
        maxBarThickness: 42,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...baseTooltip, callbacks: { label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 45, font: { size: 11, weight: 500 } } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        border: { display: false },
        ticks: { callback: (v) => formatNumber(v), font: { size: 11 } },
      },
    },
  }

  return (
    <div className="h-72">
      <Bar data={chartData} options={options} />
    </div>
  )
}

export function MonthlyBar({ labels, income, expense }) {
  const chartData = {
    labels,
    datasets: [
      { label: 'Pemasukan', data: income, backgroundColor: '#10b981', borderRadius: 6, maxBarThickness: 24 },
      { label: 'Pengeluaran', data: expense, backgroundColor: '#f43f5e', borderRadius: 6, maxBarThickness: 24 },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { boxWidth: 10, boxHeight: 10, padding: 14, usePointStyle: true, pointStyle: 'circle', font: { size: 11, weight: 500 } },
      },
      tooltip: {
        ...baseTooltip,
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11, weight: 500 } } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        border: { display: false },
        ticks: { callback: (v) => formatNumber(v), font: { size: 11 } },
      },
    },
  }

  return (
    <div className="h-72">
      <Bar data={chartData} options={options} />
    </div>
  )
}

export function ChartEmpty({ message }) {
  return (
    <div className="grid h-72 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-sm text-slate-500">
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-slate-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 15l4-4 3 3 5-6" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  )
}

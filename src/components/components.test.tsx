import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import EmptyState from './EmptyState'
import ErrorBanner from './ErrorBanner'
import ConfirmButton from './ConfirmButton'
import SlideOver from './SlideOver'
import StatCard from './StatCard'
import Select from './Select'
import DateRangePicker from './DateRangePicker'

describe('EmptyState', () => {
  it('renders title and action', () => {
    render(<EmptyState title="Belum ada data" action={<button>Buat</button>} />)
    expect(screen.getByText('Belum ada data')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buat' })).toBeInTheDocument()
  })
})

describe('ErrorBanner', () => {
  it('renders message and triggers retry', () => {
    const onRetry = vi.fn()
    render(<ErrorBanner message="Gagal memuat" onRetry={onRetry} />)
    expect(screen.getByText('Gagal memuat')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe('ConfirmButton', () => {
  it('reveals confirm action then fires onConfirm', () => {
    const onConfirm = vi.fn()
    render(<ConfirmButton onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hapus' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yakin' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancels without firing onConfirm', () => {
    const onConfirm = vi.fn()
    render(<ConfirmButton onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hapus' }))
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

describe('SlideOver', () => {
  it('renders content when open and hides when closed', () => {
    const { rerender } = render(
      <SlideOver open title="Catat Transaksi" onClose={() => {}}>
        <p>isi</p>
      </SlideOver>,
    )
    expect(screen.getByText('Catat Transaksi')).toBeInTheDocument()
    rerender(
      <SlideOver open={false} title="Catat Transaksi" onClose={() => {}}>
        <p>isi</p>
      </SlideOver>,
    )
    expect(screen.queryByText('Catat Transaksi')).not.toBeInTheDocument()
  })
})

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Pemasukan" value="Rp 1.000.000" tone="income" />)
    expect(screen.getByText('Pemasukan')).toBeInTheDocument()
    expect(screen.getByText('Rp 1.000.000')).toBeInTheDocument()
  })
})

describe('Select', () => {
  it('selects an option', () => {
    const onChange = vi.fn()
    render(
      <Select
        value=""
        onChange={onChange}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        placeholder="Pilih"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Pilih' }))
    fireEvent.click(screen.getByRole('option', { name: 'B' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })
})

describe('DateRangePicker', () => {
  it('renders placeholder when empty', () => {
    render(
      <DateRangePicker from={undefined} to={undefined} onChange={() => {}} onClear={() => {}} />,
    )
    expect(screen.getByText('Dari — Sampai')).toBeInTheDocument()
  })

  it('opens the calendar on click', () => {
    render(
      <DateRangePicker from={undefined} to={undefined} onChange={() => {}} onClear={() => {}} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Dari — Sampai/ }))
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('shows clear button and fires onClear when a range is set', () => {
    const onClear = vi.fn()
    const from = new Date(2026, 7, 14)
    const to = new Date(2026, 7, 20)
    render(<DateRangePicker from={from} to={to} onChange={() => {}} onClear={onClear} />)
    fireEvent.click(screen.getByRole('button', { name: 'Bersihkan filter tanggal' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})

# Transactions Date Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah filter range tanggal (calendar) di halaman Transaksi, dikirim server-side ke `GET /api/transactions`.

**Architecture:** Komponen baru `DateRangePicker` (react-day-picker v9) diletakkan di bar filter TransactionsPage. State `dateFrom`/`dateTo` masuk queryKey TanStack Query dan dikirim sebagai ISO string `dateFrom`/`dateTo` ke endpoint yang sudah ada.

**Tech Stack:** React 19, TypeScript, TanStack Query, react-day-picker v9, date-fns v4, Tailwind, Vitest + Testing Library.

---

## File Structure

- Create: `src/components/DateRangePicker.tsx` — popover kalender range.
- Modify: `src/components/components.test.tsx` — tambah test DateRangePicker.
- Modify: `src/pages/TransactionsPage.tsx` — state + query + bar filter.
- Modify: `src/index.css` — override variabel CSS react-day-picker untuk tema gelap.

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install react-day-picker dan date-fns**

Run:
```bash
npm install react-day-picker date-fns
```

- [ ] **Step 2: Verifikasi versi**

Run: `npm ls react-day-picker date-fns`
Expected: `react-day-picker@9.x`, `date-fns@4.x` (bukan `UNMET`).

---

## Task 2: Test gagal untuk DateRangePicker

**Files:**
- Modify: `src/components/components.test.tsx`

- [ ] **Step 1: Tambah import dan test block**

Tambahkan import di baris paling atas (setelah import `Select`):

```tsx
import DateRangePicker from './DateRangePicker'
```

Tambahkan `describe` block di akhir file (setelah `Select` describe):

```tsx
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
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npm test`
Expected: FAIL — `Cannot find module './DateRangePicker'`.

---

## Task 3: Implement DateRangePicker

**Files:**
- Create: `src/components/DateRangePicker.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Buat komponen**

Create `src/components/DateRangePicker.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { CalendarBlank, CaretDown, X } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function DateRangePicker({
  from,
  to,
  onChange,
  onClear,
}: {
  from?: Date
  to?: Date
  onChange: (from: Date | undefined, to: Date | undefined) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const label = from && to
    ? `${format(from, 'dd MMM yyyy', { locale: id })} — ${format(to, 'dd MMM yyyy', { locale: id })}`
    : from
      ? `${format(from, 'dd MMM yyyy', { locale: id })} — …`
      : 'Dari — Sampai'

  const selected: DateRange = { from, to }
  const active = Boolean(from || to)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-xl border bg-white/5 px-3 py-2 text-left text-sm transition-colors hover:border-line-strong focus:border-brand focus:outline-none ${
          open ? 'border-brand' : 'border-line'
        } ${active ? 'pr-8' : ''}`}
      >
        <CalendarBlank size={16} className="shrink-0 text-fg-muted" />
        <span className={active ? 'text-fg-primary' : 'text-fg-muted'}>{label}</span>
        <CaretDown
          size={14}
          className={`ml-auto text-fg-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {active && (
        <button
          type="button"
          aria-label="Bersihkan filter tanggal"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-fg-muted transition-colors hover:bg-white/10 hover:text-fg-primary"
        >
          <X size={14} />
        </button>
      )}
      {open && (
        <div className="absolute right-0 z-20 mt-1 rounded-xl border border-line-strong bg-ink-900 p-2 shadow-card">
          <DayPicker
            mode="range"
            locale={id}
            selected={selected}
            onSelect={(r) => {
              onChange(r?.from, r?.to)
              if (r?.from && r?.to) setOpen(false)
            }}
            numberOfMonths={1}
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Tambah override tema gelap**

Tambahkan di akhir `src/index.css` (di dalam `@layer components`, setelah blok `.grain`):

```css
.rdp-root {
  --rdp-accent-color: #34d399;
  --rdp-accent-background-color: rgba(16, 185, 129, 0.12);
  --rdp-background-color: transparent;
  --rdp-today-color: #34d399;
  --rdp-range_start-date-background-color: #10b981;
  --rdp-range_start-color: #0c0f0e;
  --rdp-range_end-date-background-color: #10b981;
  --rdp-range_end-color: #0c0f0e;
  --rdp-range_middle-background-color: rgba(16, 185, 129, 0.15);
  --rdp-range_middle-color: #34d399;
  --rdp-outside-opacity: 0.4;
  --rdp-day-width: 36px;
  --rdp-day-height: 36px;
  --rdp-day_button-border-radius: 8px;
}
.rdp-month_caption,
.rdp-weekday {
  color: #9aa4a0;
}
.rdp-day_button {
  color: #e7ebe9;
}
.rdp-day_button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.06);
}
```

- [ ] **Step 3: Jalankan test, pastikan pass**

Run: `npm test`
Expected: PASS — semua test hijau (termasuk 3 test DateRangePicker baru).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/components/DateRangePicker.tsx src/components/components.test.tsx src/index.css
git commit -m "feat: add DateRangePicker component"
```

---

## Task 4: Wire ke TransactionsPage

**Files:**
- Modify: `src/pages/TransactionsPage.tsx`

- [ ] **Step 1: Tambah import DateRangePicker**

Di blok import komponen, setelah `import Select from '../components/Select'`:

```tsx
import DateRangePicker from '../components/DateRangePicker'
```

- [ ] **Step 2: Tambah state tanggal**

Di baris 30-31, setelah deklarasi `typeFilter`/`search`:

```tsx
const [typeFilter, setTypeFilter] = useState<TypeFilter>('')
const [search, setSearch] = useState('')
const [dateFrom, setDateFrom] = useState<Date>()
const [dateTo, setDateTo] = useState<Date>()
```

- [ ] **Step 3: Ubah query untuk kirim filter tanggal**

Ganti blok `transactionsQ` (baris 32-36) menjadi:

```tsx
const transactionsQ = useQuery({
  queryKey: ['transactions', typeFilter, dateFrom, dateTo],
  queryFn: () =>
    getTransactions({
      ...(typeFilter === '' ? {} : { type: Number(typeFilter) as CategoryType }),
      ...(dateFrom
        ? { dateFrom: new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate()).toISOString() }
        : {}),
      ...(dateTo
        ? { dateTo: new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate(), 23, 59, 59, 999).toISOString() }
        : {}),
    }),
})
```

- [ ] **Step 4: Tambah DateRangePicker di bar filter**

Di bar filter (setelah `<div className="w-40">…</Select>…</div>`, sebelum penutup `</div>` luar baris 159), tambahkan:

```tsx
<DateRangePicker
  from={dateFrom}
  to={dateTo}
  onChange={(f, t) => {
    setDateFrom(f)
    setDateTo(t)
  }}
  onClear={() => {
    setDateFrom(undefined)
    setDateTo(undefined)
  }}
/>
```

Struktur akhir blok `flex items-center gap-2`:

```tsx
<div className="flex items-center gap-2">
  <Funnel size={16} className="text-fg-muted" />
  <div className="w-40">
    <Select
      ariaLabel="Filter tipe"
      value={typeFilter}
      onChange={(v) => setTypeFilter(v as TypeFilter)}
      options={[
        { value: '', label: 'Semua tipe' },
        { value: '0', label: 'Pemasukan' },
        { value: '1', label: 'Pengeluaran' },
      ]}
    />
  </div>
  <DateRangePicker
    from={dateFrom}
    to={dateTo}
    onChange={(f, t) => {
      setDateFrom(f)
      setDateTo(t)
    }}
    onClear={() => {
      setDateFrom(undefined)
      setDateTo(undefined)
    }}
  />
</div>
```

- [ ] **Step 5: Jalankan test, lint, dan build**

Run:
```bash
npm test
npm run lint
npm run build
```
Expected: test PASS, lint tanpa error, build sukses.

- [ ] **Step 6: Commit**

```bash
git add src/pages/TransactionsPage.tsx
git commit -m "feat: add date range filter to transactions page"
```

---

## Self-Review Notes

- Spec coverage: dependency ✓ (Task 1), komponen baru ✓ (Task 3), perubahan TransactionsPage ✓ (Task 4), format ISO awal/akhir hari ✓ (Task 4 Step 3), label `dd MMM yyyy` id-ID ✓ (Task 3 Step 1), testing UI ✓ (Task 2).
- Placeholder scan: tidak ada TBD/TODO.
- Type consistency: prop `from`/`to`/`onChange`/`onClear` konsisten antara komponen, test, dan penggunaan di halaman.

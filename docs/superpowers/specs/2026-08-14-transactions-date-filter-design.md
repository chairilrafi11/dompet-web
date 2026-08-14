# Transactions Date Filter — Design

## Tujuan

Tambahkan filter range tanggal di halaman Transaksi. User bisa memilih periode "dari — sampai" lewat kalender, hasil transaksi difilter server-side.

## Lingkup

- Halaman: `src/pages/TransactionsPage.tsx`
- Filter tanggal bekerja bersama filter tipe (`typeFilter`) yang sudah ada.
- Search tetap client-side (tidak berubah).

## Dependency

- `react-day-picker` (v9, kompatibel React 19).
- `date-fns` (sudah jadi dependency react-day-picker; import `format` untuk label).

## Komponen baru

`src/components/DateRangePicker.tsx`

- Props: `from: Date | undefined`, `to: Date | undefined`, `onChange(from, to)`, `onClear`.
- Popover kalender mode `range`, style konsisten dengan `Select` (border-line, bg-ink-900, shadow-card).
- Tampilkan label `dd MMM yyyy` (id-ID) untuk dari/sampai; placeholder "Dari — Sampai" saat kosong.
- Tombol clear untuk reset filter.

## Perubahan TransactionsPage

- State baru: `const [dateFrom, setDateFrom] = useState<Date>()`, `const [dateTo, setDateTo] = useState<Date>()`.
- Query:
  - queryKey: `['transactions', typeFilter, dateFrom, dateTo]`
  - queryFn mengirim `getTransactions({ dateFrom: isoFrom(dateFrom), dateTo: isoTo(dateTo), type })`.
  - `isoFrom(d)`: `new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()` — awal hari lokal.
  - `isoTo(d)`: `new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).toISOString()` — akhir hari lokal.
- Bar filter: tambahkan `DateRangePicker` di samping `Select` tipe.
- EmptyState hasil filter: pesan "Tidak ada transaksi yang cocok dengan filter." tetap dipakai.

## Format tanggal

- Endpoint `GET /api/transactions` menerima `DateTimeOffset? dateFrom/dateTo` via query (lihat `dompet-api/Controllers/TransactionsController.cs:23-24`). Filter `t.Date >= dateFrom` dan `t.Date <= dateTo` di memory (lihat `dompet-api/Services/TransactionService.cs:29-31`).
- Kirim string ISO penuh via `Date.prototype.toISOString()` (axios `params` meng-encode `+` → `%2B`, aman dari masalah "`+` = spasi" di query string).
- `dateFrom` = awal hari (00:00:00 lokal), `dateTo` = akhir hari (23:59:59.999 lokal) supaya hari yang dipilih ikut terhitung.
- Label UI pakai `dd MMM yyyy` id-ID.

## Error handling

- Tidak ada handling khusus baru; `ErrorBanner` existing menangani kegagalan query.

## Testing

- `src/components/components.test.tsx`: render `DateRangePicker`, assert placeholder tampil, memilih range memanggil `onChange`.
- Tidak ada perubahan endpoint; cakupan test UI saja.

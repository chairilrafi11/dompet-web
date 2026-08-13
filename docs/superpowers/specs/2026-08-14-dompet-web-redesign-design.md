# Dompet Web — Redesign "Fintech Premium Dark"

Tanggal: 2026-08-14
Status: disetujui user (arah + scope)

## Ringkasan

Redesign tampilan & pengalaman pemakaian `dompet-web` (React + Vite + TypeScript + Tailwind v3 + TanStack Query + Recharts). Target: tampilan fintech premium — dark, glassmorphism, spotlight border, grain. Perbaiki juga UX states (loading/empty/error/404) dan aksesibilitas. Tidak migrasi stack. Tidak rewrite dari nol — perbaiki file yang ada, tambah komponen kecil.

## Keputusan desain (disetujui)

- Mood: fintech premium dark
- Mode: dark-only (tanpa toggle light)
- Accent: emerald/teal (kontinuitas brand)
- Scope: visual + UX lengkap (states, a11y, favicon, 404)
- Layout: top nav (bukan sidebar), sticky + blur
- Ikon: Phosphor (`@phosphor-icons/react`)
- Font: `Outfit` (Google Fonts) + `font-variant-numeric: tabular-nums` untuk angka uang

## Fondasi

### Font

- UI/headline: `Outfit` (dimuat via Google Fonts di `index.html`)
- Angka saldo/jumlah: `font-variant-numeric: tabular-nums`
- Weight yang dipakai: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Palet (dark-only, satu accent)

```
bg base        #0c0f0e  (dark charcoal, warm — bukan #000)
bg surface     rgba(255,255,255,0.03)
bg card        rgba(255,255,255,0.045) + backdrop-blur
border         rgba(255,255,255,0.08)
border strong  rgba(255,255,255,0.14)
text primary   #e7ebe9
text secondary #9aa4a0
accent         #10b981  (emerald; hover #34d399)
accent dim     rgba(16,185,129,0.12)
income         #34d399
expense        #f87171
grain          SVG noise overlay, opacity ~0.04, pointer-events:none
```

Aturan: tanpa pure black, tanpa pure white. Semua shadow tinted (hijau/gelap), bukan hitam. Satu accent emerald dipakai konsisten; merah hanya untuk "pengeluaran/negatif".

### Surfaces

- Kartu: `bg-card` glass + inner border 1px (`border-white/8`) + `backdrop-blur`
- Spotlight border: kartu menerangi border di dekat kursor (emerald lemah) via mouse position
- Hover: `translateY(-2px)` + border lebih terang + transisi 200ms
- Active/press: `scale(0.98)` / `translateY(1px)`
- Grain overlay global fixed, subtle

## Layout & Navigasi

- Container: `max-w-6xl`, auto margin, padding responsif
- Top nav sticky, `backdrop-blur`, border bawah tipis
- Nav link aktif = pill emerald (`bg-emerald/12 text-emerald`); non-aktif = text secondary
- Brand: logo dompet SVG kecil + "dompet"
- Kanan nav: nama user + avatar (squircle) + tombol Keluar
- Breakpoint mobile: nav collapse jadi menu (hamburger / scroll horizontal)

### Halaman

#### Dashboard (`/`)
- Hero saldo: label kecil, angka besar `tabular-nums`, persentase perubahan bulan ini (↗ hijau / ↘ merah)
- Stat kartu asimetris: 1 besar (Saldo Total) + 2 kecil (Pemasukan, Pengeluaran) — bukan 3 seragam
- Donut chart pengeluaran per kategori (donut, total di tengah), legend dengan nilai
- Sparkline / tren mini pemasukan-pengeluaran
- Empty state kalau belum ada data

#### Transaksi (`/transactions`)
- Tombol `[+ Catat]` membuka slide-over panel (form overlay dari kanan), bukan form inline panjang
- List transaksi: ikon kategori (Phosphor) + nama + wallet + tanggal; jumlah berwarna (income emerald / expense red), `tabular-nums`
- Hapus: konfirmasi inline (reveal tombol konfirmasi), bukan `window.confirm`
- Filter ringan: dropdown tipe (semua/masuk/keluar) — opsional jika API mendukung

#### Dompet (`/wallets`)
- Grid kartu dompet, saldo `tabular-nums`
- Tambah/edit via slide-over panel; edit inline
- Hapus dengan konfirmasi inline

#### Kategori (`/categories`)
- Grid/daftar kategori, dipisah label Pemasukan/Pengeluaran
- Tambah/edit via slide-over panel
- Hapus dengan konfirmasi inline; error API (kategori terpakai) tampil inline, bukan `alert()`

#### Analitik (`/analytics`)
- Bar chart 6 bulan, gradient emerald tipis, tooltip custom format Rupiah
- Kartu ringkasan kecil (total in/out/net periode)

### Auth (`/login`, `/register`)
- Layout split: kiri brand/pitch, kanan form — atau form kartu glass center
- Error inline (bukan alert), field border merah + pesan jelas
- Fokus otomatis ke field pertama

## States & Aksesibilitas

- Loading: skeleton loader shimmer yang meniru bentuk layout (bukan spinner)
- Empty: pesan + CTA kontekstual (mis. "Belum ada transaksi" + `[+ Catat pertama]`)
- Error form: inline, merah, fokus ke field yang salah
- Error fetch: banner retry
- 404: halaman custom branded + tombol kembali ke Dashboard
- Favicon: logo dompet SVG branded (emerald)
- Focus ring visible (emerald, offset)
- `skip-to-content` link
- Contrast teks ≥ WCAG AA pada dark
- Aksi ikon diberi `aria-label`

## Motion

- Semua interaktif: `transition 200–300ms`, hanya `transform`/`opacity`
- Staggered entry ringan pada list (fade + `translateY(4px)` → 0)
- `prefers-reduced-motion` dihormati (matikan animasi)

## Teknis

- Tailwind v3 (sudah ada): extend `tailwind.config.js` — warna, font `Outfit`, shadow, keyframes `shimmer`, `blur`
- Ikon: tambah dependency `@phosphor-icons/react`
- Font: `Outfit` via `<link>` Google Fonts di `index.html`
- Komponen baru yang perlu dibuat: `SlideOver`, `Skeleton`, `EmptyState`, `ConfirmButton`, `ErrorBanner`, `SpotlightCard` (wrapper hover spotlight), `StatCard`, `PageHeader`, `IconButton`
- `App.css` (sisa scaffold Vite, `.counter`/`.hero`/dsb) dihapus; tidak dipakai
- Meta tag: `<title>`, `description`, `og:*` di `index.html`
- Test: `npm test` (vitest) dan `npm run build` wajib pass setelah perubahan
- Tidak mengubah kontrak API (types di `src/api/types.ts` tetap); UX "API menyusul" berarti UI dibangun terhadap shape data yang sudah ada

## Di luar scope (YAGNI)

- Tidak: migrasi ke Tailwind v4, library animasi baru (framer-motion), dark/light toggle, multi-akun, upload avatar, notifikasi realtime
- Tidak: merombak struktur routing/AuthContext/API client (kecuali penyesuaian kecil yang mendukung UX di atas)

## Prioritas implementasi

1. Font swap + palet + base CSS + grain
2. Layout/nav + halaman auth
3. Komponen dasar (StatCard, Skeleton, EmptyState, SlideOver, dll)
4. Dashboard (hero + donut + sparkline)
5. Transaksi (slide-over + konfirmasi inline)
6. Dompet + Kategori
7. Analitik
8. 404 + favicon + meta
9. A11y + motion polish
10. Test & build pass

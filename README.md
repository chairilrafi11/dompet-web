# dompet-web

Frontend untuk aplikasi manajemen dompet. React + Vite + TypeScript + Tailwind + TanStack Query + Recharts.

## Prasyarat

- Node.js 18+
- `dompet-api` berjalan di port 8020

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:8021 (proxy /api -> http://localhost:8020)
```

## Build

```bash
npm run build      # output ke dist/
npm run preview    # preview hasil build
```

## Test

```bash
npm test           # vitest run
```

## Struktur

```
src/
  api/          # axios client + interceptor JWT, endpoint calls
  auth/         # AuthContext, ProtectedRoute
  components/   # Layout (navbar)
  lib/          # format.ts (formatRupiah)
  pages/        # Login, Register, Dashboard, Transactions, Wallets, Categories, Analytics
  test/         # test setup
  App.tsx       # routing
  main.tsx      # providers (QueryClient, Router, Auth)
```

## Halaman

- `/login`, `/register` — autentikasi (JWT disimpan di localStorage)
- `/` — Dashboard (saldo + pie chart pengeluaran per kategori)
- `/transactions` — catat & hapus transaksi
- `/wallets` — kelola dompet
- `/categories` — kelola kategori
- `/analytics` — tren 6 bulan terakhir

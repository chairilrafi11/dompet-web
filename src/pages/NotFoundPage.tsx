import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 px-4 text-center">
      <p className="text-7xl font-bold text-brand-bright">404</p>
      <h1 className="text-xl font-semibold text-fg-primary">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-fg-secondary">
        Halaman yang kamu cari tidak ada atau sudah dipindah.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  )
}

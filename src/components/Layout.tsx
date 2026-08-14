import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { SignOut } from '@phosphor-icons/react'
import { useAuth } from '../auth/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transaksi', end: false },
  { to: '/wallets', label: 'Dompet', end: false },
  { to: '/categories', label: 'Kategori', end: false },
  { to: '/analytics', label: 'Analitik', end: false },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { displayName, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (displayName ?? '?')
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-ink-950 text-fg-primary">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:font-medium focus:text-ink-950"
      >
        Lewati ke konten
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-ink-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span className="text-brand-bright">◆</span>dompet
            </div>
            <nav className="hidden gap-1 md:flex" aria-label="Utama">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-brand-dim font-medium text-brand-bright'
                        : 'text-fg-secondary hover:bg-white/5 hover:text-fg-primary'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-dim text-sm font-semibold text-brand-bright">
                {initials}
              </div>
              <span className="hidden text-sm text-fg-secondary sm:inline">{displayName}</span>
              <button
                aria-label="Keluar"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="rounded-lg border border-line p-2 text-fg-secondary transition-colors hover:border-danger/40 hover:text-danger"
              >
                <SignOut size={16} />
              </button>
            </div>
          </div>
          <nav
            className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-3 md:hidden"
            aria-label="Utama"
          >
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-dim font-medium text-brand-bright'
                      : 'text-fg-secondary hover:bg-white/5 hover:text-fg-primary'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}

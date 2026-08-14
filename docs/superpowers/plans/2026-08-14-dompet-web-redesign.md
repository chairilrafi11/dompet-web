# Dompet Web Redesign — Fintech Premium Dark — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `dompet-web` UI into a dark fintech-premium design (glassmorphism, spotlight border, grain) plus complete UX states (loading/empty/error/404) and a11y, without changing the API contract.

**Architecture:** Keep the existing stack (React 19 + Vite + Tailwind v3 + TanStack Query + Recharts). Extend Tailwind theme with design tokens. Introduce small focused UI components (SpotlightCard, SlideOver, Skeleton, EmptyState, ErrorBanner, ConfirmButton, StatCard, PageHeader). Refactor each page to use them. Pure data helpers stay in `src/lib`. All styling via Tailwind classes + one small `index.css` layer (grain, focus, reduced-motion).

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind v3, TanStack Query v5, Recharts v3, `@phosphor-icons/react` (new dep), Vitest + Testing Library.

**Verification commands:** `npm test` (vitest), `npm run build` (tsc -b && vite build), `npm run lint` (oxlint). TDD is applied to the interactive components in Task 2; remaining tasks are visual refactors verified by build + test + lint.

**Design spec:** `docs/superpowers/specs/2026-08-14-dompet-web-redesign-design.md`

---

## File Structure

Created:
- `src/components/SpotlightCard.tsx` — glass card with cursor spotlight
- `src/components/StatCard.tsx` — labeled stat tile
- `src/components/PageHeader.tsx` — page title + action
- `src/components/Skeleton.tsx` — shimmer placeholder
- `src/components/EmptyState.tsx` — empty view with CTA
- `src/components/ErrorBanner.tsx` — inline error + retry
- `src/components/ConfirmButton.tsx` — two-step inline delete confirm
- `src/components/SlideOver.tsx` — right-side panel
- `src/components/components.test.tsx` — tests for interactive components
- `src/pages/NotFoundPage.tsx` — branded 404

Modified:
- `tailwind.config.js` — tokens
- `src/index.css` — base layer, grain, a11y
- `src/main.tsx` — grain overlay
- `index.html` — title, meta, Outfit font
- `public/favicon.svg` — branded wallet logo
- `src/components/Layout.tsx` — nav redesign
- `src/pages/LoginPage.tsx`, `RegisterPage.tsx` — auth redesign
- `src/pages/DashboardPage.tsx`, `TransactionsPage.tsx`, `WalletsPage.tsx`, `CategoriesPage.tsx`, `AnalyticsPage.tsx`
- `src/App.tsx` — 404 route

Deleted:
- `src/App.css` (dead Vite scaffold, unimported)

---

### Task 1: Design tokens + font + grain

**Files:**
- Modify: `package.json` (via install)
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Modify: `index.html`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install Phosphor icons**

Run: `npm install @phosphor-icons/react`
Expected: adds `@phosphor-icons/react` to `package.json` dependencies.

- [ ] **Step 2: Replace tailwind config**

`tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0c0f0e',
          900: '#111514',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.03)',
          card: 'rgba(255,255,255,0.045)',
        },
        line: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.14)',
        },
        fg: {
          primary: '#e7ebe9',
          secondary: '#9aa4a0',
          muted: '#6b7672',
        },
        brand: {
          DEFAULT: '#10b981',
          bright: '#34d399',
          dim: 'rgba(16,185,129,0.12)',
        },
        danger: '#f87171',
      },
      boxShadow: {
        card: '0 8px 24px -12px rgba(0,0,0,0.5)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        fadeup: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        fadeup: 'fadeup 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Rewrite base CSS**

`src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    color-scheme: dark;
  }
  body {
    @apply bg-ink-950 font-sans text-fg-primary antialiased;
  }
  ::selection {
    background: rgba(16, 185, 129, 0.3);
  }
  :focus-visible {
    outline: 2px solid #10b981;
    outline-offset: 2px;
  }
}

@layer components {
  .grain {
    position: fixed;
    inset: 0;
    z-index: 50;
    pointer-events: none;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Update index.html (font, meta, title)**

`index.html` full replacement:

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Dompet — kelola saldo, transaksi, dan analitik keuangan harian." />
    <meta property="og:title" content="Dompet" />
    <meta property="og:description" content="Kelola keuangan harian: saldo, transaksi, kategori, dan analitik." />
    <meta property="og:type" content="website" />
    <title>Dompet</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Add grain overlay to main.tsx**

`src/main.tsx` — render grain inside `#root` tree (after `<App />`):

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
```

Wait — grain must live inside the component tree so it renders. Replace the `createRoot` call to wrap children with a fragment containing a grain div:

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
```

Add after `<App />` a sibling grain element by wrapping in a fragment. Final `main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <div className="grain" aria-hidden="true" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 6: Verify**

Run: `npm run build`
Expected: PASS (tsc + vite build).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tailwind.config.js src/index.css index.html src/main.tsx
git commit -m "feat(design): dark fintech tokens, Outfit font, grain overlay"
```

---

### Task 2: Shared UI components (TDD)

**Files:**
- Create: `src/components/SpotlightCard.tsx`
- Create: `src/components/StatCard.tsx`
- Create: `src/components/PageHeader.tsx`
- Create: `src/components/Skeleton.tsx`
- Create: `src/components/EmptyState.tsx`
- Create: `src/components/ErrorBanner.tsx`
- Create: `src/components/ConfirmButton.tsx`
- Create: `src/components/SlideOver.tsx`
- Test: `src/components/components.test.tsx`

- [ ] **Step 1: Write the failing tests**

`src/components/components.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import EmptyState from './EmptyState'
import ErrorBanner from './ErrorBanner'
import ConfirmButton from './ConfirmButton'
import SlideOver from './SlideOver'
import StatCard from './StatCard'

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with "Cannot find module './EmptyState'" (components not yet created).

- [ ] **Step 3: Implement components**

`src/components/SpotlightCard.tsx`:

```tsx
import { useRef, type MouseEvent, type ReactNode } from 'react'

export default function SpotlightCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={`relative overflow-hidden rounded-2xl border border-line bg-surface-card backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-line-strong ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background:
            'radial-gradient(240px circle at var(--mx,50%) var(--my,50%), rgba(16,185,129,0.12), transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
```

`src/components/StatCard.tsx`:

```tsx
import type { ReactNode } from 'react'
import SpotlightCard from './SpotlightCard'

const tones = {
  default: 'text-fg-primary',
  income: 'text-brand-bright',
  expense: 'text-danger',
} as const

export default function StatCard({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string
  value: string
  icon?: ReactNode
  tone?: keyof typeof tones
}) {
  return (
    <SpotlightCard className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-fg-secondary">{label}</p>
        {icon && <span className="text-fg-muted">{icon}</span>}
      </div>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${tones[tone]}`}>{value}</p>
    </SpotlightCard>
  )
}
```

`src/components/PageHeader.tsx`:

```tsx
import type { ReactNode } from 'react'

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-fg-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
```

`src/components/Skeleton.tsx`:

```tsx
export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}
```

`src/components/EmptyState.tsx`:

```tsx
import type { ReactNode } from 'react'

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
      <p className="font-medium text-fg-primary">{title}</p>
      {description && <p className="text-sm text-fg-secondary">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
```

`src/components/ErrorBanner.tsx`:

```tsx
export default function ErrorBanner({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-danger/30 px-3 py-1 text-danger transition-colors hover:bg-danger/15"
        >
          Coba lagi
        </button>
      )}
    </div>
  )
}
```

`src/components/ConfirmButton.tsx`:

```tsx
import { useState } from 'react'
import { Trash } from '@phosphor-icons/react'

export default function ConfirmButton({
  onConfirm,
  busy = false,
}: {
  onConfirm: () => void
  busy?: boolean
}) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        aria-label="Hapus"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-line p-2 text-fg-secondary transition-colors hover:border-danger/40 hover:text-danger"
      >
        <Trash size={16} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={busy}
        onClick={() => {
          setConfirming(false)
          onConfirm()
        }}
        className="rounded-lg bg-danger px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-danger/80 disabled:opacity-60"
      >
        Yakin
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg-secondary transition-colors hover:bg-white/5"
      >
        Batal
      </button>
    </div>
  )
}
```

`src/components/SlideOver.tsx`:

```tsx
import { useEffect, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'

export default function SlideOver({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-line bg-ink-900 p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg-primary">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-2 text-fg-secondary transition-colors hover:bg-white/5 hover:text-fg-primary"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (6 tests).

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "feat(ui): shared glass components with tests"
```

---

### Task 3: Layout / navigation redesign

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Implement new layout**

`src/components/Layout.tsx` full replacement:

```tsx
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

  return (
    <div className="min-h-screen bg-ink-950 text-fg-primary">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:font-medium focus:text-ink-950"
      >
        Lewati ke konten
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="text-brand-bright">◆</span>dompet
          </div>
          <nav className="flex gap-1 overflow-x-auto" aria-label="Utama">
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
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat(ui): sticky glass nav with pill active state"
```

---

### Task 4: Auth pages redesign

**Files:**
- Modify: `src/pages/LoginPage.tsx`
- Modify: `src/pages/RegisterPage.tsx`

- [ ] **Step 1: Rewrite LoginPage**

`src/pages/LoginPage.tsx` full replacement:

```tsx
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import ErrorBanner from '../components/ErrorBanner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const auth = await login(email, password)
      setAuth(auth)
      navigate('/')
    } catch {
      setError('Email atau password salah')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-surface-card p-8 backdrop-blur-sm"
      >
        <div className="space-y-1 text-center">
          <p className="text-2xl font-semibold tracking-tight">
            <span className="text-brand-bright">◆</span> dompet
          </p>
          <p className="text-sm text-fg-secondary">Masuk untuk kelola keuanganmu</p>
        </div>
        {error && <ErrorBanner message={error} />}
        <input
          className="w-full rounded-xl border border-line bg-white/5 px-4 py-2.5 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-line bg-white/5 px-4 py-2.5 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="w-full rounded-xl bg-brand py-2.5 font-semibold text-ink-950 transition-colors hover:bg-brand-bright active:scale-[0.98]"
          type="submit"
        >
          Masuk
        </button>
        <p className="text-center text-sm text-fg-secondary">
          Belum punya akun?{' '}
          <Link className="font-medium text-brand-bright hover:underline" to="/register">
            Daftar
          </Link>
        </p>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite RegisterPage**

`src/pages/RegisterPage.tsx` full replacement:

```tsx
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import ErrorBanner from '../components/ErrorBanner'

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const auth = await register(email, password, displayName)
      setAuth(auth)
      navigate('/')
    } catch {
      setError('Pendaftaran gagal. Periksa input Anda.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-surface-card p-8 backdrop-blur-sm"
      >
        <div className="space-y-1 text-center">
          <p className="text-2xl font-semibold tracking-tight">
            <span className="text-brand-bright">◆</span> dompet
          </p>
          <p className="text-sm text-fg-secondary">Buat akun baru</p>
        </div>
        {error && <ErrorBanner message={error} />}
        <input
          className="w-full rounded-xl border border-line bg-white/5 px-4 py-2.5 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none"
          placeholder="Nama"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-line bg-white/5 px-4 py-2.5 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-line bg-white/5 px-4 py-2.5 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="w-full rounded-xl bg-brand py-2.5 font-semibold text-ink-950 transition-colors hover:bg-brand-bright active:scale-[0.98]"
          type="submit"
        >
          Daftar
        </button>
        <p className="text-center text-sm text-fg-secondary">
          Sudah punya akun?{' '}
          <Link className="font-medium text-brand-bright hover:underline" to="/login">
            Masuk
          </Link>
        </p>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/LoginPage.tsx src/pages/RegisterPage.tsx
git commit -m "feat(ui): glass auth pages with inline errors"
```

---

### Task 5: Dashboard redesign

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

- [ ] **Step 1: Rewrite DashboardPage**

`src/pages/DashboardPage.tsx` full replacement:

```tsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowDownRight, ArrowUpRight, Plus, TrendUp, Wallet } from '@phosphor-icons/react'
import { getByCategory, getMonthlyTrend, getSummary } from '../api/analytics'
import { getWallets } from '../api/wallets'
import { formatRupiah } from '../lib/format'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import Skeleton from '../components/Skeleton'
import SpotlightCard from '../components/SpotlightCard'
import StatCard from '../components/StatCard'

const PIE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#2dd4bf', '#14b8a6']

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const summaryQ = useQuery({ queryKey: ['summary'], queryFn: getSummary })
  const breakdownQ = useQuery({ queryKey: ['by-category'], queryFn: getByCategory })
  const walletsQ = useQuery({ queryKey: ['wallets'], queryFn: getWallets })
  const trendQ = useQuery({ queryKey: ['monthly-trend'], queryFn: () => getMonthlyTrend(6) })

  const loading = summaryQ.isLoading || walletsQ.isLoading || breakdownQ.isLoading
  const hasError =
    summaryQ.isError || walletsQ.isError || breakdownQ.isError || trendQ.isError

  if (loading) return <DashboardSkeleton />

  if (hasError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <ErrorBanner
          message="Gagal memuat data. Coba lagi."
          onRetry={() => {
            summaryQ.refetch()
            walletsQ.refetch()
            breakdownQ.refetch()
            trendQ.refetch()
          }}
        />
      </div>
    )
  }

  const wallets = walletsQ.data ?? []
  const breakdown = breakdownQ.data ?? []
  const summary = summaryQ.data
  const trend = (trendQ.data ?? []).map((m) => ({ ...m, net: m.income - m.expense }))
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
  const totalExpense = breakdown.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan keuanganmu"
        action={
          <Link
            to="/transactions"
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" /> Catat
          </Link>
        }
      />

      <SpotlightCard className="p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-fg-secondary">
              <Wallet size={16} /> Saldo Total
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-fg-primary">
              {formatRupiah(totalBalance)}
            </p>
            {summary && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-fg-secondary">
                {summary.net >= 0 ? (
                  <ArrowUpRight className="text-brand-bright" size={16} />
                ) : (
                  <ArrowDownRight className="text-danger" size={16} />
                )}
                Net bulan ini{' '}
                <span
                  className={`font-medium tabular-nums ${
                    summary.net >= 0 ? 'text-brand-bright' : 'text-danger'
                  }`}
                >
                  {formatRupiah(summary.net)}
                </span>
              </p>
            )}
          </div>
        </div>
      </SpotlightCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Pemasukan bulan ini"
          value={formatRupiah(summary?.income ?? 0)}
          tone="income"
          icon={<ArrowUpRight size={18} />}
        />
        <StatCard
          label="Pengeluaran bulan ini"
          value={formatRupiah(summary?.expense ?? 0)}
          tone="expense"
          icon={<ArrowDownRight size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SpotlightCard className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg-primary">
            <span className="text-brand-bright">◔</span> Pengeluaran per Kategori
          </h3>
          {breakdown.length === 0 ? (
            <EmptyState title="Belum ada pengeluaran bulan ini" description="Catat transaksi pertamamu." />
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {breakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-fg-secondary">Total</span>
                <span className="text-lg font-semibold tabular-nums">{formatRupiah(totalExpense)}</span>
              </div>
            </div>
          )}
          <ul className="mt-4 space-y-2">
            {breakdown.map((b, i) => (
              <li key={b.category} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-fg-secondary">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {b.category}
                </span>
                <span className="font-medium tabular-nums">{formatRupiah(b.amount)}</span>
              </li>
            ))}
          </ul>
        </SpotlightCard>

        <SpotlightCard className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg-primary">
            <TrendUp className="text-brand-bright" size={18} /> Tren Net 6 Bulan
          </h3>
          {trend.length === 0 ? (
            <EmptyState title="Belum ada data tren" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                <Area
                  type="monotone"
                  dataKey="net"
                  name="Net"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#netGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SpotlightCard>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat(ui): glass dashboard with hero balance, donut, trend"
```

---

### Task 6: Transactions redesign

**Files:**
- Modify: `src/pages/TransactionsPage.tsx`

- [ ] **Step 1: Rewrite TransactionsPage**

`src/pages/TransactionsPage.tsx` full replacement:

```tsx
import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from '@phosphor-icons/react'
import { createTransaction, deleteTransaction, getTransactions } from '../api/transactions'
import { getWallets } from '../api/wallets'
import { getCategories } from '../api/categories'
import type { CategoryType } from '../api/types'
import { formatRupiah } from '../lib/format'
import ConfirmButton from '../components/ConfirmButton'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import SlideOver from '../components/SlideOver'
import SpotlightCard from '../components/SpotlightCard'

const inputClass =
  'w-full rounded-xl border border-line bg-white/5 px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none'

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const { data: wallets = [] } = useQuery({ queryKey: ['wallets'], queryFn: getWallets })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => getCategories() })
  const transactionsQ = useQuery({ queryKey: ['transactions'], queryFn: () => getTransactions() })

  const [open, setOpen] = useState(false)
  const [walletId, setWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['wallets'] })
  }

  const create = useMutation({
    mutationFn: () => {
      const category = categories.find((c) => c.id === Number(categoryId))!
      return createTransaction({
        walletId: Number(walletId),
        categoryId: Number(categoryId),
        amount: Number(amount),
        type: category.type,
        note: note || null,
        date: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      setAmount('')
      setNote('')
      setOpen(false)
      invalidate()
    },
    onError: () => setError('Gagal menyimpan transaksi. Coba lagi.'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: invalidate,
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    create.mutate()
  }

  const transactions = transactionsQ.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi"
        subtitle={transactions.length > 0 ? `${transactions.length} catatan` : 'Catat dan kelola transaksi'}
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" /> Catat
          </button>
        }
      />

      {transactionsQ.isError && (
        <ErrorBanner message="Gagal memuat transaksi." onRetry={() => transactionsQ.refetch()} />
      )}

      {transactions.length === 0 ? (
        <EmptyState
          title="Belum ada transaksi"
          description="Catat pengeluaran atau pemasukan pertamamu."
          action={
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright"
            >
              <Plus size={16} weight="bold" /> Catat pertama
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <SpotlightCard key={t.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-fg-primary">{t.categoryName}</p>
                  <p className="truncate text-sm text-fg-secondary">
                    {t.walletName}
                    {t.note ? ` · ${t.note}` : ''}
                  </p>
                  <p className="text-xs text-fg-muted">
                    {new Date(t.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`font-semibold tabular-nums ${
                      t.type === 0 ? 'text-brand-bright' : 'text-danger'
                    }`}
                  >
                    {t.type === 0 ? '+' : '-'}
                    {formatRupiah(t.amount)}
                  </span>
                  <ConfirmButton onConfirm={() => remove.mutate(t.id)} busy={remove.isPending} />
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}

      <SlideOver open={open} title="Catat Transaksi" onClose={() => setOpen(false)}>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <ErrorBanner message={error} />}
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Dompet</label>
            <select
              className={inputClass}
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              required
            >
              <option value="">Pilih dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Kategori</label>
            <select
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 0 ? 'Masuk' : 'Keluar'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Jumlah</label>
            <input
              className={inputClass}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Catatan</label>
            <input
              className={inputClass}
              value={note}
              placeholder="Opsional"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <button
            disabled={create.isPending}
            className="w-full rounded-xl bg-brand py-2.5 font-semibold text-ink-950 transition-colors hover:bg-brand-bright disabled:opacity-60"
            type="submit"
          >
            {create.isPending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </SlideOver>
    </div>
  )
}
```

Note: type `CategoryType` is imported but unused (createTransaction infers `type` from `category.type`). Remove it from imports to satisfy `noUnusedLocals`:

```tsx
import { createTransaction, deleteTransaction, getTransactions } from '../api/transactions'
```

Use only that line for the transactions import; drop `type { CategoryType }`.

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/TransactionsPage.tsx
git commit -m "feat(ui): slide-over create form and inline delete confirm"
```

---

### Task 7: Wallets redesign

**Files:**
- Modify: `src/pages/WalletsPage.tsx`

- [ ] **Step 1: Rewrite WalletsPage**

`src/pages/WalletsPage.tsx` full replacement:

```tsx
import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PencilSimple, Plus, Wallet } from '@phosphor-icons/react'
import { createWallet, deleteWallet, getWallets, updateWallet } from '../api/wallets'
import type { Wallet as WalletModel } from '../api/types'
import { formatRupiah } from '../lib/format'
import ConfirmButton from '../components/ConfirmButton'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import SlideOver from '../components/SlideOver'
import SpotlightCard from '../components/SpotlightCard'

const inputClass =
  'w-full rounded-xl border border-line bg-white/5 px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none'

interface FormState {
  name: string
  initialBalance: string
}

const emptyForm: FormState = { name: '', initialBalance: '0' }

export default function WalletsPage() {
  const queryClient = useQueryClient()
  const walletsQ = useQuery({ queryKey: ['wallets'], queryFn: getWallets })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editing, setEditing] = useState<WalletModel | null>(null)
  const [error, setError] = useState('')

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['wallets'] })

  const create = useMutation({
    mutationFn: () => createWallet(form.name, Number(form.initialBalance)),
    onSuccess: () => {
      setOpen(false)
      setForm(emptyForm)
      invalidate()
    },
    onError: () => setError('Gagal menyimpan dompet. Coba lagi.'),
  })

  const update = useMutation({
    mutationFn: () => updateWallet(editing!.id, form.name, Number(form.initialBalance)),
    onSuccess: () => {
      setOpen(false)
      setForm(emptyForm)
      setEditing(null)
      invalidate()
    },
    onError: () => setError('Gagal menyimpan dompet. Coba lagi.'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteWallet(id),
    onSuccess: invalidate,
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (editing) update.mutate()
    else create.mutate()
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setOpen(true)
  }

  function openEdit(w: WalletModel) {
    setEditing(w)
    setForm({ name: w.name, initialBalance: String(w.initialBalance) })
    setError('')
    setOpen(true)
  }

  const wallets = walletsQ.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dompet"
        subtitle="Kelola sumber dana"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" /> Tambah
          </button>
        }
      />

      {walletsQ.isError && (
        <ErrorBanner message="Gagal memuat dompet." onRetry={() => walletsQ.refetch()} />
      )}

      {wallets.length === 0 ? (
        <EmptyState
          title="Belum ada dompet"
          description="Buat dompet pertama untuk mulai mencatat."
          action={
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright"
            >
              <Plus size={16} weight="bold" /> Tambah dompet
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((w) => (
            <SpotlightCard key={w.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-fg-secondary">
                  <Wallet size={18} /> {w.name}
                </div>
                <div className="flex gap-1">
                  <button
                    aria-label={`Edit ${w.name}`}
                    onClick={() => openEdit(w)}
                    className="rounded-lg border border-line p-2 text-fg-secondary transition-colors hover:border-brand/40 hover:text-brand-bright"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <ConfirmButton onConfirm={() => remove.mutate(w.id)} busy={remove.isPending} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-semibold tabular-nums text-fg-primary">
                {formatRupiah(w.balance)}
              </p>
            </SpotlightCard>
          ))}
        </div>
      )}

      <SlideOver
        open={open}
        title={editing ? 'Edit Dompet' : 'Tambah Dompet'}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <ErrorBanner message={error} />}
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Nama</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Saldo awal</label>
            <input
              className={inputClass}
              type="number"
              value={form.initialBalance}
              onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
              required
            />
          </div>
          <button
            disabled={create.isPending || update.isPending}
            className="w-full rounded-xl bg-brand py-2.5 font-semibold text-ink-950 transition-colors hover:bg-brand-bright disabled:opacity-60"
            type="submit"
          >
            {create.isPending || update.isPending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </SlideOver>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/WalletsPage.tsx
git commit -m "feat(ui): wallet card grid with slide-over form"
```

---

### Task 8: Categories redesign

**Files:**
- Modify: `src/pages/CategoriesPage.tsx`

- [ ] **Step 1: Rewrite CategoriesPage**

`src/pages/CategoriesPage.tsx` full replacement:

```tsx
import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PencilSimple, Plus, Tag } from '@phosphor-icons/react'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../api/categories'
import type { Category, CategoryType } from '../api/types'
import ConfirmButton from '../components/ConfirmButton'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import SlideOver from '../components/SlideOver'
import SpotlightCard from '../components/SpotlightCard'

const inputClass =
  'w-full rounded-xl border border-line bg-white/5 px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none'

interface FormState {
  name: string
  type: CategoryType
}

const emptyForm: FormState = { name: '', type: 1 }

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const categoriesQ = useQuery({ queryKey: ['categories'], queryFn: () => getCategories() })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editing, setEditing] = useState<Category | null>(null)
  const [error, setError] = useState('')

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] })

  const create = useMutation({
    mutationFn: () => createCategory(form.name, form.type),
    onSuccess: () => {
      setOpen(false)
      setForm(emptyForm)
      invalidate()
    },
    onError: () => setError('Gagal menyimpan kategori. Coba lagi.'),
  })

  const update = useMutation({
    mutationFn: () => updateCategory(editing!.id, form.name, form.type),
    onSuccess: () => {
      setOpen(false)
      setForm(emptyForm)
      setEditing(null)
      invalidate()
    },
    onError: () => setError('Gagal menyimpan kategori. Coba lagi.'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: invalidate,
    onError: () => setError('Kategori sedang dipakai transaksi.'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (editing) update.mutate()
    else create.mutate()
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setOpen(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setForm({ name: c.name, type: c.type })
    setError('')
    setOpen(true)
  }

  const categories = categoriesQ.data ?? []
  const income = categories.filter((c) => c.type === 0)
  const expense = categories.filter((c) => c.type === 1)

  const renderGroup = (title: string, items: Category[]) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-fg-secondary">{title}</h3>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-fg-muted">
          Belum ada kategori
        </p>
      ) : (
        items.map((c) => (
          <SpotlightCard key={c.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-dim text-brand-bright">
                  <Tag size={16} />
                </span>
                <p className="font-medium text-fg-primary">{c.name}</p>
              </div>
              <div className="flex gap-1">
                <button
                  aria-label={`Edit ${c.name}`}
                  onClick={() => openEdit(c)}
                  className="rounded-lg border border-line p-2 text-fg-secondary transition-colors hover:border-brand/40 hover:text-brand-bright"
                >
                  <PencilSimple size={14} />
                </button>
                <ConfirmButton onConfirm={() => remove.mutate(c.id)} busy={remove.isPending} />
              </div>
            </div>
          </SpotlightCard>
        ))
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori"
        subtitle="Kelola label pemasukan dan pengeluaran"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" /> Tambah
          </button>
        }
      />

      {categoriesQ.isError && (
        <ErrorBanner message="Gagal memuat kategori." onRetry={() => categoriesQ.refetch()} />
      )}
      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {renderGroup('Pemasukan', income)}
        {renderGroup('Pengeluaran', expense)}
      </div>

      <SlideOver
        open={open}
        title={editing ? 'Edit Kategori' : 'Tambah Kategori'}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <ErrorBanner message={error} />}
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Nama</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Tipe</label>
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: Number(e.target.value) as CategoryType })}
            >
              <option value={0}>Pemasukan</option>
              <option value={1}>Pengeluaran</option>
            </select>
          </div>
          <button
            disabled={create.isPending || update.isPending}
            className="w-full rounded-xl bg-brand py-2.5 font-semibold text-ink-950 transition-colors hover:bg-brand-bright disabled:opacity-60"
            type="submit"
          >
            {create.isPending || update.isPending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </SlideOver>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CategoriesPage.tsx
git commit -m "feat(ui): categorized list with slide-over form"
```

---

### Task 9: Analytics redesign

**Files:**
- Modify: `src/pages/AnalyticsPage.tsx`

- [ ] **Step 1: Rewrite AnalyticsPage**

`src/pages/AnalyticsPage.tsx` full replacement:

```tsx
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getMonthlyTrend } from '../api/analytics'
import { formatRupiah } from '../lib/format'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import Skeleton from '../components/Skeleton'
import SpotlightCard from '../components/SpotlightCard'
import StatCard from '../components/StatCard'

const tooltipStyle = {
  background: '#111514',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '12px',
  color: '#e7ebe9',
}

export default function AnalyticsPage() {
  const trendQ = useQuery({
    queryKey: ['monthly-trend'],
    queryFn: () => getMonthlyTrend(6),
  })

  const trend = trendQ.data ?? []
  const totalIncome = trend.reduce((s, m) => s + m.income, 0)
  const totalExpense = trend.reduce((s, m) => s + m.expense, 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Analitik" subtitle="Tren keuangan 6 bulan terakhir" />

      {trendQ.isError && (
        <ErrorBanner message="Gagal memuat data analitik." onRetry={() => trendQ.refetch()} />
      )}

      {trendQ.isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      ) : trend.length === 0 ? (
        <EmptyState title="Belum ada data analitik" description="Tren muncul setelah ada transaksi." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Total pemasukan" value={formatRupiah(totalIncome)} tone="income" />
            <StatCard label="Total pengeluaran" value={formatRupiah(totalExpense)} tone="expense" />
          </div>
          <SpotlightCard className="p-5">
            <h3 className="mb-4 font-semibold text-fg-primary">Pemasukan vs Pengeluaran</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trend}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#9aa4a0', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7672', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  formatter={(v) => formatRupiah(Number(v))}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#f87171" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </SpotlightCard>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AnalyticsPage.tsx
git commit -m "feat(ui): styled analytics with summary cards"
```

---

### Task 10: 404 + favicon + cleanup

**Files:**
- Create: `src/pages/NotFoundPage.tsx`
- Modify: `src/App.tsx`
- Modify: `public/favicon.svg`
- Delete: `src/App.css`

- [ ] **Step 1: Create NotFoundPage**

`src/pages/NotFoundPage.tsx`:

```tsx
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
```

- [ ] **Step 2: Add catch-all route**

`src/App.tsx` — add import and route. After the `/analytics` route, add:

```tsx
import NotFoundPage from './pages/NotFoundPage'
```

and inside `<Routes>` (after the analytics `Route`):

```tsx
      <Route path="*" element={<NotFoundPage />} />
```

- [ ] **Step 3: Replace favicon**

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#0c0f0e"/>
  <path d="M20 18h24a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6Z" fill="none" stroke="#10b981" stroke-width="4" stroke-linejoin="round"/>
  <path d="M20 30h24M28 30v-6M36 30v-6" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
  <circle cx="32" cy="46" r="2.5" fill="#34d399"/>
</svg>
```

- [ ] **Step 4: Delete dead App.css**

Run: `rm src/App.css`
(It is not imported anywhere — verified earlier: only `index.css` is imported in `main.tsx`.)

- [ ] **Step 5: Verify**

Run: `npm test && npm run build`
Expected: PASS both.

- [ ] **Step 6: Commit**

```bash
git add src/pages/NotFoundPage.tsx src/App.tsx public/favicon.svg
git rm src/App.css
git commit -m "feat(ui): branded 404 and favicon, remove dead css"
```

---

### Task 11: Final verification

**Files:** none

- [ ] **Step 1: Run full checks**

Run: `npm run lint`
Expected: no errors (oxlint). Fix any reported issues (e.g. unused imports) inline.

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 2: Manual smoke test**

Run: `npm run dev` (requires `dompet-api` on port 8020). Open `http://localhost:8021` and verify:
- Login page renders glass card, error inline on bad credentials
- Dashboard: hero saldo, donut, trend render; skeleton while loading; error banner on failure
- Transactions: slide-over opens/closes, Esc closes, delete shows inline "Yakin/Batal"
- Wallets/Categories: grid + slide-over forms
- Analytics: chart + summary cards
- Unknown URL shows branded 404
- Tab title is "Dompet"; favicon shows wallet icon

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: final polish after verification"
```

---

## Self-Review Notes

- Spec coverage: tokens/font (T1), nav (T3), auth (T4), dashboard hero+donut+trend (T5), transactions slide-over+inline confirm (T6), wallets grid (T7), categories groups (T8), analytics (T9), 404+favicon+meta+cleanup (T10), a11y focus/skip-link/reduced-motion/grain (T1+T3), loading/empty/error states throughout.
- No placeholders: every file has complete code; every task ends with a verification command and commit.
- Type consistency: `FormState`, `CategoryType`, `Category`, `WalletModel` aliases consistent across tasks. `StatCard` tones are `default | income | expense`. Component props (`onConfirm`, `open/onClose/title`, `message/onRetry`, `title/description/action`) match across all call sites.

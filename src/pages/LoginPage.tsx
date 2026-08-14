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

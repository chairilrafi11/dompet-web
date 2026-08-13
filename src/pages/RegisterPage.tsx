import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

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
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded-lg shadow w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-center">Daftar</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Nama"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-emerald-600 text-white py-2 rounded" type="submit">
          Daftar
        </button>
        <p className="text-sm text-center">
          Sudah punya akun?{' '}
          <Link className="text-emerald-600" to="/login">
            Masuk
          </Link>
        </p>
      </form>
    </div>
  )
}

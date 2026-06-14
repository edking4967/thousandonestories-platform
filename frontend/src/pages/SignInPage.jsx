import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: wire up auth
  }

  return (
    <main style={{ padding: '48px 40px 64px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-8">
          New here?{' '}
          <a href="#" className="text-gray-700 underline hover:text-gray-900 transition-colors">
            Create an account
          </a>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-500 transition-colors"
              placeholder="••••••••"
            />
            <div className="mt-1 text-right">
              <a href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white text-sm font-medium py-2 px-4 hover:bg-gray-700 transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-700 transition-colors">&larr; Back to stories</Link>
        </p>
      </div>
    </main>
  )
}

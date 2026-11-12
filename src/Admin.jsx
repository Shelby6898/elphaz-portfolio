import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import ProfileEditor from './ProfileEditor'
import AnalyticsDashboard from './AnalyticsDashboard'
import AnalyticsErrorBoundary from './AnalyticsErrorBoundary'
import './Admin.css'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [accessStatus, setAccessStatus] = useState('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [authActionLoading, setAuthActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!supabase) return undefined

    let active = true

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return

      if (sessionError) setError(sessionError.message)
      setSession(data?.session ?? null)
      setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, newSession) => {
        console.info('[Portfolio auth event]', {
          event,
          hasSession: Boolean(newSession),
          time: new Date().toISOString(),
        })

        setSession(newSession)

        // Refreshing a token must not unmount ProfileEditor and discard
        // a file selected in the browser's native file picker.
        if (event === 'PASSWORD_RECOVERY') {
          setAuthMode('reset')
          setPassword('')
          setConfirmPassword('')
          setError('')
          setMessage('Enter and confirm your new password.')
        } else if (event === 'SIGNED_OUT') {
          setAccessStatus('idle')
          setError('')
          setMessage('')
        } else if (
          event === 'SIGNED_IN' ||
          event === 'USER_UPDATED'
        ) {
          setAccessStatus(current =>
            current === 'allowed' && newSession
              ? 'allowed'
              : newSession
                ? 'checking'
                : 'idle'
          )
          setError('')
          setMessage('')
        }
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !session) return undefined

    let active = true

    async function checkAdminAccess() {
      const { data, error: accessError } =
        await supabase.rpc('is_portfolio_admin')

      if (!active) return

      if (accessError) {
        setAccessStatus('error')
        setError(
          'Could not verify administrator access. Check the Supabase function permissions.'
        )
      } else {
        setAccessStatus(data === true ? 'allowed' : 'denied')
      }
    }

    checkAdminAccess()

    return () => {
      active = false
    }
  }, [session])

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!supabase) return

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (loginError) {
      setError('Login failed. Check your email and password, then try again.')
    } else {
      setPassword('')
      setMessage('Signed in. Verifying administrator access...')
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!supabase) return

    setAuthActionLoading(true)

    try {
      const { error: recoveryError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/admin`,
        })

      if (recoveryError) {
        setError('Unable to request a password reset. Please try again later.')
      } else {
        setMessage(
          'If an account exists for that email, a password recovery link has been sent.'
        )
      }
    } catch {
      setError('Unable to request a password reset. Please try again later.')
    } finally {
      setAuthActionLoading(false)
    }
  }

  async function handlePasswordReset(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!supabase) return

    if (password.length < 8) {
      setError('Your new password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setAuthActionLoading(true)

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({ password })

      if (updateError) {
        setError('Could not update your password. Please try again.')
        return
      }

      setPassword('')
      setConfirmPassword('')
      setAuthMode('login')

      const { error: logoutError } = await supabase.auth.signOut()

      if (logoutError) {
        setMessage(
          'Your password was updated. Please sign out before signing in again.'
        )
      } else {
        setMessage('Password updated successfully. Sign in with your new password.')
      }
    } catch {
      setError('Could not update your password. Please try again.')
    } finally {
      setAuthActionLoading(false)
    }
  }

  async function handleLogout() {
    if (!supabase) return

    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) {
      setError('Could not sign out. Please try again.')
    } else {
      setSession(null)
      setAccessStatus('idle')
      setMessage('You have signed out.')
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <h1>Admin configuration needed</h1>
          <p>Check the Supabase environment variables in your local configuration.</p>
          <a href="/">Return to portfolio</a>
        </section>
      </main>
    )
  }

  if (loading) {
    return <main className="admin-page"><p>Loading secure session...</p></main>
  }

  if (authMode === 'forgot') {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <a className="admin-back" href="/">← Public portfolio</a>
          <p className="admin-eyebrow">ACCOUNT RECOVERY</p>
          <h1>Reset your password</h1>
          <p>Enter your administrator email address to request a recovery link.</p>

          <form className="admin-form" onSubmit={handleForgotPassword}>
            <label htmlFor="recovery-email">Email address</label>
            <input
              id="recovery-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit" disabled={authActionLoading}>
              {authActionLoading ? 'Sending request...' : 'Send recovery link'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setAuthMode('login')
              setError('')
              setMessage('')
            }}
          >
            Back to sign in
          </button>

          {error && <p className="admin-error" role="alert">{error}</p>}
          {message && <p className="admin-message" role="status">{message}</p>}
        </section>
      </main>
    )
  }

  if (authMode === 'reset') {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <p className="admin-eyebrow">ACCOUNT RECOVERY</p>
          <h1>Choose a new password</h1>
          <p>Enter your new password below.</p>

          <form className="admin-form" onSubmit={handlePasswordReset}>
            <label htmlFor="new-admin-password">New password</label>
            <input
              id="new-admin-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <label htmlFor="confirm-admin-password">Confirm new password</label>
            <input
              id="confirm-admin-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <button type="submit" disabled={authActionLoading}>
              {authActionLoading ? 'Updating password...' : 'Update password'}
            </button>
          </form>

          {error && <p className="admin-error" role="alert">{error}</p>}
          {message && <p className="admin-message" role="status">{message}</p>}
        </section>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <a className="admin-back" href="/">← Public portfolio</a>
          <p className="admin-eyebrow">RESTRICTED AREA</p>
          <h1>Portfolio administration</h1>
          <p>Sign in with your existing administrator account.</p>

          <form className="admin-form" onSubmit={handleLogin}>
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="submit">Sign in securely</button>
          </form>

          <button
            type="button"
            onClick={() => {
              setAuthMode('forgot')
              setError('')
              setMessage('')
            }}
          >
            Forgot password?
          </button>

          {error && <p className="admin-error" role="alert">{error}</p>}
          {message && <p className="admin-message" role="status">{message}</p>}
        </section>
      </main>
    )
  }

  if (accessStatus === 'checking') {
    return <main className="admin-page"><p>Verifying administrator access...</p></main>
  }

  if (accessStatus !== 'allowed') {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <h1>Access denied</h1>
          <p>This account is not authorized to administer this portfolio.</p>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button type="button" onClick={handleLogout}>Sign out</button>
          <p><a href="/">Return to portfolio</a></p>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <section className="admin-panel admin-dashboard">
        <a className="admin-back" href="/">← View public portfolio</a>
        <p className="admin-eyebrow">ADMINISTRATOR VERIFIED</p>
        <h1>Profile dashboard</h1>
        <p>Signed in as {session.user.email}</p>

        <ProfileEditor />
        <AnalyticsErrorBoundary>
          <AnalyticsDashboard />
        </AnalyticsErrorBoundary>

        <button type="button" onClick={handleLogout}>Sign out</button>
      </section>
    </main>
  )
}

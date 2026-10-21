import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import ProfileEditor from './ProfileEditor'
import './Admin.css'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [accessStatus, setAccessStatus] = useState('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        if (event === 'SIGNED_OUT') {
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

        <button type="button" onClick={handleLogout}>Sign out</button>
      </section>
    </main>
  )
}

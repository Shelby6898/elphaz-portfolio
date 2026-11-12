import { supabase } from './supabase'

const CONSENT_KEY = 'portfolio_analytics_consent'
const VISITOR_KEY = 'portfolio_analytics_visitor'
const SESSION_KEY = 'portfolio_analytics_session'
const VISITOR_TTL = 30 * 24 * 60 * 60 * 1000
const SESSION_TTL = 30 * 60 * 1000

export function getAnalyticsConsent() {
  try {
    const value = localStorage.getItem(CONSENT_KEY)
    return value === 'accepted' || value === 'declined' ? value : null
  } catch {
    return null
  }
}

export function setAnalyticsConsent(choice) {
  if (choice !== 'accepted' && choice !== 'declined') return

  try {
    localStorage.setItem(CONSENT_KEY, choice)

    if (choice === 'declined') {
      localStorage.removeItem(VISITOR_KEY)
      sessionStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // Analytics remains disabled if browser storage is unavailable.
  }
}

function getIdentity() {
  const now = Date.now()
  let visitorId
  let sessionId

  try {
    const savedVisitor = JSON.parse(localStorage.getItem(VISITOR_KEY) || 'null')

    if (savedVisitor?.id && savedVisitor.expiresAt > now) {
      visitorId = savedVisitor.id
    } else {
      visitorId = crypto.randomUUID()
      localStorage.setItem(
        VISITOR_KEY,
        JSON.stringify({ id: visitorId, expiresAt: now + VISITOR_TTL }),
      )
    }

    const savedSession = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')

    if (savedSession?.id && now - savedSession.lastSeen < SESSION_TTL) {
      sessionId = savedSession.id
    } else {
      sessionId = crypto.randomUUID()
    }

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: sessionId, lastSeen: now }),
    )
  } catch {
    return null
  }

  return { visitorId, sessionId }
}

function getDeviceType() {
  const ua = navigator.userAgent || ''

  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile'
  if (/windows|macintosh|linux|cros/i.test(ua)) return 'desktop'

  return 'unknown'
}

function getBrowserFamily() {
  const ua = navigator.userAgent || ''

  if (/edg\//i.test(ua)) return 'edge'
  if (/firefox\//i.test(ua)) return 'firefox'
  if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) return 'chrome'
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return 'safari'

  return 'other'
}

function getReferrerHost() {
  try {
    if (!document.referrer) return null

    const host = new URL(document.referrer).hostname
    if (!host || host === window.location.hostname) return null

    return host.slice(0, 120)
  } catch {
    return null
  }
}

export async function trackEvent(eventType, target = null) {
  if (getAnalyticsConsent() !== 'accepted' || !supabase) return

  const identity = getIdentity()
  if (!identity) return

  const pagePath = `${window.location.pathname}${window.location.hash}`.slice(0, 160)

  if (eventType === 'page_view') {
    const key = `portfolio_analytics_page_${pagePath}`
    const lastView = Number(sessionStorage.getItem(key) || 0)

    if (Date.now() - lastView < 5000) return

    sessionStorage.setItem(key, String(Date.now()))
  }

  if (eventType === 'project_view' && target) {
    const key = `portfolio_analytics_project_${target}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  }

  try {
    await supabase.functions.invoke('portfolio-analytics', {
      body: {
        visitor_id: identity.visitorId,
        session_id: identity.sessionId,
        event_type: eventType,
        page_path: pagePath,
        target,
        referrer_host: getReferrerHost(),
        device_type: getDeviceType(),
        browser_family: getBrowserFamily(),
      },
    })
  } catch {
    // Analytics failures must never interrupt the portfolio.
  }
}

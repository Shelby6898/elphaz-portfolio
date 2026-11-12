import { useEffect, useState } from 'react'
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  trackEvent,
} from './lib/analytics'

function projectSlug(card) {
  const heading = card.querySelector('h3')
  return heading?.textContent
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || null
}

export default function AnalyticsConsent() {
  const [choice, setChoice] = useState(() => getAnalyticsConsent())

  useEffect(() => {
    if (choice !== 'accepted') return

    trackEvent('page_view')

    let observer

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const slug = projectSlug(entry.target)
          if (slug) trackEvent('project_view', slug)

          observer.unobserve(entry.target)
        })
      }, { threshold: 0.4 })

      document.querySelectorAll('.project-card').forEach((card) => {
        observer.observe(card)
      })
    }

    const handleClick = (event) => {
      const element = event.target
      if (!(element instanceof Element)) return

      const link = element.closest('a[href]')
      if (!link) return

      const href = link.getAttribute('href') || ''
      const label = (
        link.getAttribute('aria-label') ||
        link.textContent ||
        ''
      ).trim().toLowerCase()

      if (href.startsWith('mailto:')) {
        trackEvent('contact_click', 'email')
        return
      }

      if (href.includes('cv') || label.includes('cv')) {
        trackEvent('cv_click', 'resume')
        return
      }

      if (
        href.startsWith('#') ||
        link.classList.contains('back-to-top')
      ) return

      if (href.startsWith('https://github.com/')) {
        trackEvent('outbound_click', 'github')
      } else if (href.startsWith('https://taifatech.org')) {
        trackEvent('outbound_click', 'taifatech')
      } else if (
        href.startsWith('https://celestique-beauty-spa.vercel.app/')
      ) {
        trackEvent('outbound_click', 'celestique')
      } else if (
        href.startsWith('https://') ||
        href.startsWith('http://')
      ) {
        trackEvent('outbound_click', 'external')
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      observer?.disconnect()
      document.removeEventListener('click', handleClick)
    }
  }, [choice])

  function choose(value) {
    setAnalyticsConsent(value)
    setChoice(value)
  }

  if (choice) {
    return (
      <button
        type="button"
        className="analytics-preferences"
        onClick={() => choose(choice === 'accepted' ? 'declined' : 'accepted')}
        aria-label="Change analytics preference"
      >
        Analytics: {choice === 'accepted' ? 'On' : 'Off'} · Change
      </button>
    )
  }

  return (
    <aside className="analytics-consent" aria-label="Analytics preferences">
      <div>
        <strong>Help improve this portfolio</strong>
        <p>
          Optional analytics help measure page visits and link engagement.
          If accepted, a random first-party visitor ID is stored for up to
          30 days. We do not store IP addresses, email addresses, or full
          browsing fingerprints. You can change your choice at any time.
        </p>
      </div>

      <div className="analytics-consent-actions">
        <button type="button" onClick={() => choose('accepted')}>
          Accept analytics
        </button>
        <button
          type="button"
          className="analytics-decline"
          onClick={() => choose('declined')}
        >
          Decline
        </button>
      </div>
    </aside>
  )
}

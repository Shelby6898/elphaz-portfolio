import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'

const EVENT_LABELS = {
  page_view: 'Page view',
  project_view: 'Project viewed',
  cv_click: 'CV access',
  contact_click: 'Contact click',
  outbound_click: 'External link click',
}

function formatDate(value) {
  return new Date(value).toLocaleString()
}

function CountCard({ label, value }) {
  return (
    <article className="analytics-stat">
      <span>{label}</span>
      <strong>{Number(value || 0).toLocaleString()}</strong>
    </article>
  )
}

function RankedList({ title, items, empty = 'No data for this period.' }) {
  return (
    <section className="analytics-card">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="analytics-muted">{empty}</p>
      ) : (
        <ol className="analytics-ranked-list">
          {items.map(([label, count]) => (
            <li key={label}>
              <span title={label}>{label || 'Direct / unknown'}</span>
              <strong>{count.toLocaleString()}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState(30)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cleaning, setCleaning] = useState(false)

  const loadEvents = useCallback(async () => {
    if (!supabase) return

    setLoading(true)
    setError('')
    setNotice('')

    const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000)

    const { data, error: queryError } = await supabase
      .from('portfolio_analytics_events')
      .select('id, created_at, visitor_id, session_id, event_type, page_path, target, referrer_host, device_type, browser_family')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(5000)

    if (queryError) {
      setError('Could not load analytics. Verify administrator permissions and database access.')
      setEvents([])
    } else {
      setEvents(data || [])
    }

    setLoading(false)
  }, [range])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const summary = useMemo(() => {
    const unique = (field) => new Set(events.map((event) => event[field])).size
    const countBy = (field) => {
      const counts = new Map()
      events.forEach((event) => {
        const key = event[field] || 'Direct / unknown'
        counts.set(key, (counts.get(key) || 0) + 1)
      })
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
    }

    const pageViews = events.filter((event) => event.event_type === 'page_view').length
    const daily = new Map()

    events.forEach((event) => {
      const day = event.created_at.slice(0, 10)
      daily.set(day, (daily.get(day) || 0) + 1)
    })

    const days = Array.from({ length: range }, (_, index) => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (range - index - 1))
      const key = date.toISOString().slice(0, 10)
      return { day: key, count: daily.get(key) || 0 }
    })

    return {
      visitors: unique('visitor_id'),
      sessions: unique('session_id'),
      pageViews,
      projects: events.filter((event) => event.event_type === 'project_view').length,
      cv: events.filter((event) => event.event_type === 'cv_click').length,
      contacts: events.filter((event) => event.event_type === 'contact_click').length,
      outbound: events.filter((event) => event.event_type === 'outbound_click').length,
      pages: countBy('page_path'),
      sources: countBy('referrer_host'),
      devices: countBy('device_type'),
      browsers: countBy('browser_family'),
      days,
    }
  }, [events, range])

  async function cleanOldEvents() {
    if (!window.confirm('Permanently delete analytics events older than 90 days?')) return

    setCleaning(true)
    setError('')
    setNotice('')

    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    const { error: deleteError, count } = await supabase
      .from('portfolio_analytics_events')
      .delete({ count: 'exact' })
      .lt('created_at', cutoff)

    if (deleteError) {
      setError('Retention cleanup failed. Check administrator delete permissions.')
    } else {
      setNotice(`Retention cleanup completed. ${count ?? 0} old event(s) deleted.`)
      await loadEvents()
    }

    setCleaning(false)
  }

  const maxDaily = Math.max(1, ...summary.days.map((day) => day.count))

  return (
    <section className="analytics-dashboard">
      <div className="analytics-heading">
        <div>
          <p className="admin-eyebrow">PORTFOLIO PERFORMANCE</p>
          <h2>Website analytics</h2>
          <p className="analytics-muted">
            Opt-in visitors only. Pseudonymous event data; no IP addresses or raw browser identifiers.
          </p>
        </div>
        <label className="analytics-filter">
          Reporting period
          <select value={range} onChange={(event) => setRange(Number(event.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {notice && <p className="admin-message" role="status">{notice}</p>}

      {loading ? (
        <p className="analytics-muted">Loading analytics...</p>
      ) : (
        <>
          <div className="analytics-stats">
            <CountCard label="Unique visitors" value={summary.visitors} />
            <CountCard label="Sessions" value={summary.sessions} />
            <CountCard label="Page views" value={summary.pageViews} />
            <CountCard label="Project views" value={summary.projects} />
            <CountCard label="CV clicks" value={summary.cv} />
            <CountCard label="Contact clicks" value={summary.contacts} />
          </div>

          <section className="analytics-card">
            <h3>Daily activity</h3>
            <div
              className="analytics-chart"
              style={{ gridTemplateColumns: `repeat(${summary.days.length}, minmax(0, 1fr))` }}
              role="img"
              aria-label={`Daily recorded events over the last ${range} days`}
            >
              {summary.days.map((day, index) => {
                const showDateLabel = range === 7
                return (
                  <div className="analytics-bar-column" key={day.day} title={`${day.day}: ${day.count} events`}>
                    <span className="analytics-bar-value">{showDateLabel && day.count ? day.count : ''}</span>
                    <div
                      className="analytics-bar"
                      style={{ height: `${Math.max(2, (day.count / maxDaily) * 100)}%` }}
                    />
                    <span className="analytics-bar-label">{showDateLabel ? day.day.slice(5) : ''}</span>
                  </div>
                )
              })}
            </div>
            <p className="analytics-muted">Daily recorded events, not all website visits.</p>
          </section>

          <div className="analytics-grid">
            <RankedList title="Popular pages" items={summary.pages} />
            <RankedList title="Referrer hostnames" items={summary.sources} />
            <RankedList title="Device categories" items={summary.devices} />
            <RankedList title="Browser categories" items={summary.browsers} />
          </div>

          <section className="analytics-card">
            <h3>Engagement events</h3>
            <div className="analytics-event-summary">
              <span>Project views <strong>{summary.projects}</strong></span>
              <span>CV clicks <strong>{summary.cv}</strong></span>
              <span>Contact clicks <strong>{summary.contacts}</strong></span>
              <span>Outbound clicks <strong>{summary.outbound}</strong></span>
            </div>
          </section>

          <section className="analytics-card">
            <div className="analytics-heading">
              <div>
                <h3>Recent activity</h3>
                <p className="analytics-muted">Latest recorded events. Visitor identifiers are not displayed.</p>
              </div>
              <button type="button" onClick={loadEvents}>Refresh</button>
            </div>
            {events.length === 0 ? (
              <p className="analytics-muted">No events recorded in this period yet.</p>
            ) : (
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr><th>Time</th><th>Event</th><th>Page</th><th>Target</th></tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 30).map((event) => (
                      <tr key={event.id}>
                        <td>{formatDate(event.created_at)}</td>
                        <td>{EVENT_LABELS[event.event_type] || event.event_type}</td>
                        <td>{event.page_path}</td>
                        <td>{event.target || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="analytics-muted">
              The dashboard loads at most 5,000 events per reporting period. Counts are based on the loaded records.
            </p>
          </section>
        </>
      )}

      <section className="analytics-retention">
        <div>
          <h3>Data retention</h3>
          <p className="analytics-muted">
            Raw events are intended to be retained for no more than 90 days. Run cleanup regularly.
          </p>
        </div>
        <button type="button" onClick={cleanOldEvents} disabled={cleaning}>
          {cleaning ? 'Cleaning...' : 'Delete events older than 90 days'}
        </button>
      </section>
    </section>
  )
}

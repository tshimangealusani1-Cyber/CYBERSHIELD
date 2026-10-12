import { useEffect, useState } from 'react'
import './HoneypotDashboard.css'

function HoneypotDashboard() {
  const [status, setStatus] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHoneypotData = async () => {
    try {
      setError('')

      const [statusResponse, eventsResponse] = await Promise.all([
        fetch('http://127.0.0.1:5000/api/honeypot/status'),
        fetch('http://127.0.0.1:5000/api/honeypot/events'),
      ])

      if (!statusResponse.ok || !eventsResponse.ok) {
        throw new Error('Could not connect to the honeypot API')
      }

      const statusData = await statusResponse.json()
      const eventsData = await eventsResponse.json()

      setStatus(statusData)
      setEvents(eventsData.events || [])
    } catch (err) {
      console.error(err)
      setError(
        'Unable to connect to the CYBERSHIELD honeypot backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHoneypotData()

    const interval = setInterval(loadHoneypotData, 5000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="honeypot-page">
        <div className="honeypot-loading">
          Loading honeypot telemetry...
        </div>
      </div>
    )
  }

  return (
    <div className="honeypot-page">
      <div className="honeypot-header">
        <div>
          <span className="dashboard-label">
            CYBERSHIELD SECURITY OPERATIONS
          </span>

          <h1>Honeypot Dashboard</h1>

          <p>
            Monitor suspicious activity detected by the
            CYBERSHIELD honeypot.
          </p>
        </div>

        <div className="honeypot-status">
          <span className="status-indicator"></span>

          <div>
            <strong>HONEYPOT ACTIVE</strong>
            <small>Telemetry monitoring enabled</small>
          </div>
        </div>
      </div>

      {error && (
        <div className="honeypot-error">
          {error}
        </div>
      )}

      <section className="honeypot-stats">
        <div className="stat-card">
          <span>THREATS DETECTED</span>
          <strong>{status?.threats_detected ?? 0}</strong>
          <small>Total recorded events</small>
        </div>

        <div className="stat-card">
          <span>ATTACK ATTEMPTS</span>
          <strong>{status?.attack_attempts ?? 0}</strong>
          <small>Observed attempts</small>
        </div>

        <div className="stat-card">
          <span>SUSPICIOUS SOURCES</span>
          <strong>{status?.suspicious_sources ?? 0}</strong>
          <small>Unique source IPs</small>
        </div>

        <div className="stat-card critical-stat">
          <span>CRITICAL EVENTS</span>
          <strong>{status?.critical_events ?? 0}</strong>
          <small>High-priority activity</small>
        </div>
      </section>

      <section className="honeypot-events">
        <div className="events-header">
          <div>
            <span className="dashboard-label">
              LIVE TELEMETRY
            </span>

            <h2>Security Events</h2>
          </div>

          <button
            className="refresh-button"
            onClick={loadHoneypotData}
          >
            Refresh
          </button>
        </div>

        {events.length === 0 ? (
          <div className="no-events">
            No honeypot events detected.
          </div>
        ) : (
          <div className="events-table-wrapper">
            <table className="events-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>EVENT</th>
                  <th>SOURCE IP</th>
                  <th>SEVERITY</th>
                  <th>STATUS</th>
                  <th>DETAILS</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.timestamp}</td>

                    <td>
                      <strong>{event.event}</strong>
                    </td>

                    <td className="source-ip">
                      {event.source_ip}
                    </td>

                    <td>
                      <span
                        className={`severity severity-${event.severity.toLowerCase()}`}
                      >
                        {event.severity}
                      </span>
                    </td>

                    <td>
                      <span className="event-status">
                        {event.status}
                      </span>
                    </td>

                    <td className="event-details">
                      {event.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default HoneypotDashboard
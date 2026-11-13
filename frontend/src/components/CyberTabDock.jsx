import { useRef, useState } from 'react'
import './CyberTabDock.css'

const tabs = [
  { id: 'phone-lab', label: 'Smartphone Lab', short: 'Phone', icon: 'phone' },
  { id: 'desktop-lab', label: 'Windows Lab', short: 'Windows', icon: 'windows' },
  { id: 'leaderboard', label: 'Leaderboard', short: 'Ranks', icon: 'trophy' },
  { id: 'academy', label: 'Learning Paths', short: 'Learning', icon: 'book' },
  { id: 'threat-intel', label: 'Threat Intelligence', short: 'Threats', icon: 'shield' },
  { id: 'achievements', label: 'Achievements', short: 'Awards', icon: 'medal' },
]

function TabIcon({ name }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  switch (name) {
    case 'phone': return <svg {...common}><rect x="6.5" y="2.5" width="11" height="19" rx="2.3"/><path d="M10 5h4M10.5 18.5h3"/></svg>
    case 'windows': return <svg {...common}><path d="M3 5.2 10.8 4v7H3zM12.2 3.8 21 2.5V11h-8.8zM3 12.5h7.8v7L3 18.3zM12.2 12.5H21v8.8l-8.8-1.4z" fill="currentColor" stroke="none"/></svg>
    case 'trophy': return <svg {...common}><path d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 12.5V18m-4 3h8m-7-3h6"/></svg>
    case 'book': return <svg {...common}><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20M8 6h8M8 9.5h7"/></svg>
    case 'shield': return <svg {...common}><path d="M12 2.5 20 5v6.2c0 5-3.4 8.4-8 10.3-4.6-1.9-8-5.3-8-10.3V5l8-2.5Z"/><path d="m8.8 11.8 2.1 2.1 4.4-4.6"/></svg>
    default: return <svg {...common}><circle cx="12" cy="8" r="5"/><path d="m8.5 12-1 9 4.5-2.5 4.5 2.5-1-9"/></svg>
  }
}

export default function CyberTabDock({ activePage = '', onSelect }) {
  const [dragIndex, setDragIndex] = useState(-1)
  const gesture = useRef(null)
  const dragged = useRef(false)
  const dragTime = useRef(0)
  const activeIndex = tabs.findIndex(tab => tab.id === activePage)
  const shownIndex = dragIndex >= 0 ? dragIndex : activeIndex

  const indexAt = (clientX, element) => {
    const rect = element.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width - 1, clientX - rect.left))
    return Math.max(0, Math.min(tabs.length - 1, Math.floor((x / rect.width) * tabs.length)))
  }

  const pointerDown = event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    gesture.current = { x: event.clientX, index: indexAt(event.clientX, event.currentTarget) }
    dragged.current = false
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const pointerMove = event => {
    if (!gesture.current) return
    const distance = Math.abs(event.clientX - gesture.current.x)
    if (distance > 18) {
      dragged.current = true
      setDragIndex(indexAt(event.clientX, event.currentTarget))
    }
  }

  const pointerUp = event => {
    if (!gesture.current) return
    if (dragged.current) {
      const index = indexAt(event.clientX, event.currentTarget)
      onSelect(tabs[index].id)
      dragTime.current = Date.now()
      setDragIndex(-1)
    }
    gesture.current = null
  }

  const pointerCancel = () => { gesture.current = null; setDragIndex(-1) }

  return (
    <nav className="cyber-tab-dock" aria-label="CyberShield modules">
      <div
        className="cyber-tab-rail"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerCancel}
        style={{ '--tab-index': shownIndex, '--tab-count': tabs.length, '--indicator-left': `${((shownIndex + 0.5) / tabs.length) * 100}%` }}
      >
        {shownIndex >= 0 && <span className="cyber-tab-signal" aria-hidden="true" />}
        {tabs.map((tab, index) => (
          <button
            type="button"
            key={tab.id}
            className={`cyber-tab-item ${activeIndex === index ? 'is-active' : ''} ${dragIndex === index ? 'is-preview' : ''}`}
            aria-current={activeIndex === index ? 'page' : undefined}
            aria-label={tab.label}
            onClick={() => {
              if (dragged.current && Date.now() - dragTime.current < 450) { dragged.current = false; return }
              dragged.current = false
              onSelect(tab.id)
            }}
          >
            <span className="cyber-tab-icon"><TabIcon name={tab.icon} /></span>
            <span className="cyber-tab-label"><span className="cyber-tab-full-label">{tab.label}</span><span className="cyber-tab-short-label">{tab.short}</span></span>
          </button>
        ))}
      </div>
      <div className="cyber-tab-hint"><i /> TAP A MODULE OR DRAG THE BLUE SIGNAL</div>
    </nav>
  )
}

import { useEffect, useState } from 'react'
import './DesktopSimulator.css'

const missions = [
  {
    level: 'FOUNDATION', app: 'mail', title: '01 · Investigate the email',
    objective: 'A message claims your student account will be suspended. Inspect the sender and the attachment before deciding what to do.',
    tip: 'Display names can be copied. Expand the sender address and compare the actual domain with a trusted university address.',
    required: ['senderChecked', 'attachmentChecked', 'mailReported'],
  },
  {
    level: 'FOUNDATION', app: 'browser', title: '02 · Verify the destination',
    objective: 'The email links to a student verification page. Inspect the full address, identify the lookalike domain, then leave the page safely.',
    tip: 'A padlock only indicates an encrypted connection. It does not confirm who owns the website.',
    required: ['urlChecked', 'pageClosed'],
  },
  {
    level: 'INTERMEDIATE', app: 'files', title: '03 · Contain a suspicious download',
    objective: 'A file appeared after the invoice email was opened. Check its properties, run the simulated file scan and quarantine it.',
    tip: 'An archive from an unknown publisher deserves scrutiny. Do not open or execute it to find out what it does.',
    required: ['fileProperties', 'fileScanned', 'fileQuarantined'],
  },
  {
    level: 'INTERMEDIATE', app: 'defender', title: '04 · Validate endpoint protection',
    objective: 'Review the workstation protection status, run a quick scan and isolate the detected training threat.',
    tip: 'A scan result is only useful when you review the detection and take an appropriate containment action.',
    required: ['protectionReviewed', 'quickScan', 'threatIsolated'],
  },
  {
    level: 'ADVANCED', app: 'network', title: '05 · Review workstation security',
    objective: 'Inspect the active connection profile and firewall state. Keep the device on the trusted profile and confirm the firewall is enabled.',
    tip: 'Treat unexpected network profiles as a warning. Do not disable the firewall to make a connection work.',
    required: ['profileChecked', 'trustedProfile', 'firewallChecked'],
  },
  {
    level: 'ADVANCED', app: 'terminal', title: '06 · Triage the incident',
    objective: 'Correlate the sign-in events, classify the incident and submit a short incident record.',
    tip: 'Repeated failed sign-ins from an unfamiliar source can indicate credential guessing. Record evidence before containment.',
    required: ['eventsReviewed', 'incidentClassified', 'incidentSubmitted'],
  },
]

const objectiveLabels = {
  senderChecked: 'Inspect sender address', attachmentChecked: 'Inspect attachment', mailReported: 'Report phishing',
  urlChecked: 'Inspect full URL', pageClosed: 'Close suspicious page',
  fileProperties: 'Review file properties', fileScanned: 'Run file scan', fileQuarantined: 'Quarantine the file',
  protectionReviewed: 'Review protection status', quickScan: 'Run quick scan', threatIsolated: 'Isolate detected threat',
  profileChecked: 'Inspect active profile', trustedProfile: 'Confirm trusted profile', firewallChecked: 'Confirm firewall enabled',
  eventsReviewed: 'Review event timeline', incidentClassified: 'Classify incident', incidentSubmitted: 'Submit incident record',
}

const appMeta = {
  mail: ['Outlook', '✉'], browser: ['Microsoft Edge', '🌐'], files: ['File Explorer', '📁'],
  defender: ['Windows Security', '🛡'], network: ['Settings', '⚙'], terminal: ['Incident Console', '⌘'],
  photos: ['Photos', '▧'], calendar: ['Calendar', '▦'], notepad: ['Notepad', '▤'],
  calculator: ['Calculator', '＋'], paint: ['Paint', '◒'], snipping: ['Snipping Tool', '✂'],
  chrome: ['Google Chrome', '◉'], store: ['Microsoft Store', '▣'], recycle: ['Recycle Bin', '▥'],
  solitaire: ['Solitaire & Casual Games', '♠'], todo: ['To Do', '✓'], linkedin: ['LinkedIn', 'in'],
  clock: ['Clock', '◷'], youtube: ['YouTube', '▶'],
}

const startPinned = ['browser','store','photos','network','solitaire','mail','todo','linkedin','calculator','clock','notepad','paint','snipping','files','chrome','youtube']

function WindowsAppIcon({ id, size = 34 }) {
  const common = { width: size, height: size, viewBox: '0 0 48 48', 'aria-hidden': true, className: `ds-app-icon ds-icon-${id}` }
  if (id === 'mail') return <svg {...common}><defs><linearGradient id="ds-mail" x2="1" y2="1"><stop stopColor="#62b7ff"/><stop offset="1" stopColor="#1765c7"/></linearGradient></defs><rect x="3" y="5" width="42" height="38" rx="10" fill="url(#ds-mail)"/><path d="M10 15h28v19H10z" fill="none" stroke="white" strokeWidth="2.6"/><path d="m11 16 13 10 13-10" fill="none" stroke="white" strokeWidth="2.6" strokeLinejoin="round"/></svg>
  if (id === 'browser') return <svg {...common}><defs><linearGradient id="ds-edge-a" x1=".1" y1=".9" x2=".9" y2=".1"><stop stopColor="#0aa6a6"/><stop offset=".52" stopColor="#087adf"/><stop offset="1" stopColor="#53d5c5"/></linearGradient></defs><circle cx="24" cy="24" r="21" fill="url(#ds-edge-a)"/><path d="M42 29c-3 10-13 14-22 11-8-3-12-11-9-18 2-7 9-11 17-10 6 1 10 5 11 10-3-3-7-4-11-3-5 1-8 5-7 9 1 3 4 5 8 5 5 0 9-2 13-4z" fill="#fff" opacity=".95"/><path d="M8 26c2-8 10-14 19-13 7 1 11 5 12 10-5-5-15-6-22-1-4 2-7 6-7 11-2-2-3-5-2-7z" fill="#8de6f1"/></svg>
  if (id === 'files') return <svg {...common}><path d="M4 13a5 5 0 0 1 5-5h11l5 5h14a5 5 0 0 1 5 5v19a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" fill="#f8c348"/><path d="M4 18h40l-4 19a5 5 0 0 1-5 4H9a5 5 0 0 1-5-5z" fill="#ffdc78"/><path d="M5 19h38" stroke="#fff1b4" strokeWidth="2"/></svg>
  if (id === 'defender') return <svg {...common}><defs><linearGradient id="ds-shield" x2="1" y2="1"><stop stopColor="#51b5ff"/><stop offset="1" stopColor="#1652bd"/></linearGradient></defs><path d="M24 3 41 9v12c0 11-7 19-17 24C14 40 7 32 7 21V9z" fill="url(#ds-shield)"/><path d="m15 24 6 6 13-14" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (id === 'network') return <svg {...common}><circle cx="24" cy="24" r="17" fill="#d9e6f5" stroke="#7593b5" strokeWidth="2"/><circle cx="24" cy="24" r="6" fill="#8196ad"/><g fill="#8196ad">{Array.from({length:8},(_,i)=><rect key={i} x="21" y="1" width="6" height="9" rx="2" transform={`rotate(${i*45} 24 24)`}/>)}</g></svg>
  if (id === 'recycle') return <svg {...common}><path d="M12 13h24l-2 29H14z" fill="#dbe8f7" stroke="#6e8eaf" strokeWidth="2"/><path d="M9 8h30M18 8V4h12v4M19 18l2 18M29 18l-2 18" stroke="#4e739b" strokeWidth="2.6" strokeLinecap="round"/><path d="M16 14h16" stroke="#ffffff" strokeWidth="2"/></svg>
  if (id === 'photos') return <svg {...common}><rect x="4" y="4" width="40" height="40" rx="9" fill="#237eea"/><circle cx="24" cy="24" r="12" fill="#f4c95b"/><path d="M24 8a16 16 0 0 1 13 7l-13 9Z" fill="#ef6d7b"/><path d="M10 32a16 16 0 0 0 25 4L24 24Z" fill="#69c98c"/><path d="M8 18a16 16 0 0 1 16-10v17Z" fill="#7bd7ea"/></svg>
  if (id === 'calendar') return <svg {...common}><rect x="5" y="7" width="38" height="35" rx="7" fill="#fff"/><path d="M5 15h38" stroke="#e45454" strokeWidth="8"/><text x="24" y="34" textAnchor="middle" fontSize="17" fontWeight="700" fill="#343b48">13</text></svg>
  if (id === 'notepad') return <svg {...common}><rect x="8" y="4" width="32" height="40" rx="5" fill="#fff"/><path d="M15 15h18M15 22h18M15 29h18M15 36h12" stroke="#65a6d9" strokeWidth="2.4" strokeLinecap="round"/></svg>
  if (id === 'calculator') return <svg {...common}><rect x="7" y="4" width="34" height="40" rx="6" fill="#3c536e"/><rect x="12" y="9" width="24" height="9" rx="2" fill="#d8eddf"/><g fill="#f0f4fa"><circle cx="15" cy="25" r="3"/><circle cx="24" cy="25" r="3"/><circle cx="33" cy="25" r="3"/><circle cx="15" cy="35" r="3"/><circle cx="24" cy="35" r="3"/><circle cx="33" cy="35" r="3"/></g></svg>
  if (id === 'paint') return <svg {...common}><path d="M24 4c-11 0-20 8-20 19 0 8 6 13 12 13h4c3 0 4-3 3-5-1-3 1-5 5-5 7 0 12-4 12-10C40 10 33 4 24 4Z" fill="#f5d06c" stroke="#d79f36" strokeWidth="2"/><circle cx="15" cy="18" r="3" fill="#e65a65"/><circle cx="23" cy="12" r="3" fill="#4c91e8"/><circle cx="32" cy="17" r="3" fill="#64c895"/></svg>
  if (id === 'snipping') return <svg {...common}><rect x="6" y="8" width="36" height="30" rx="5" fill="#fff"/><path d="m14 15 20 17M34 15 14 32" stroke="#ec6a69" strokeWidth="3" strokeLinecap="round"/><circle cx="14" cy="14" r="4" fill="#dbe7f6" stroke="#7186a1"/><circle cx="34" cy="14" r="4" fill="#dbe7f6" stroke="#7186a1"/></svg>
  if (id === 'chrome') return <svg {...common}><circle cx="24" cy="24" r="20" fill="#e5c84d"/><path d="M24 4a20 20 0 0 1 17 10H21l-9 15-8-14A20 20 0 0 1 24 4Z" fill="#e85a50"/><path d="M41 14A20 20 0 0 1 21 44l9-16-9-14Z" fill="#5abf80"/><circle cx="24" cy="24" r="8" fill="#438de5" stroke="#fff" strokeWidth="2"/></svg>
  if (id === 'store') return <svg {...common}><path d="M9 17h30l-2 25H11z" fill="#dce8f7" stroke="#91a8c6" strokeWidth="2"/><path d="M17 17a7 7 0 0 1 14 0" fill="none" stroke="#91a8c6" strokeWidth="3"/><path d="M17 24h6v6h-6z" fill="#e85b5b"/><path d="M25 24h6v6h-6z" fill="#61b77d"/><path d="M17 32h6v6h-6z" fill="#e9c553"/><path d="M25 32h6v6h-6z" fill="#4c91df"/></svg>
  if (id === 'solitaire') return <svg {...common}><rect x="5" y="4" width="27" height="38" rx="5" fill="#fff"/><rect x="16" y="8" width="27" height="36" rx="5" fill="#f5f8ff" stroke="#c7d2e0"/><path d="M25 18c-7-8-13 2 0 11 13-9 7-19 0-11Z" fill="#e45765"/></svg>
  if (id === 'todo') return <svg {...common}><rect x="4" y="4" width="40" height="40" rx="9" fill="#2188df"/><path d="m13 18 4 4 7-8M13 31l4 4 7-8" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M29 19h7M29 32h7" stroke="white" strokeWidth="2.4" strokeLinecap="round"/></svg>
  if (id === 'linkedin') return <svg {...common}><rect x="4" y="4" width="40" height="40" rx="5" fill="#0a75b8"/><text x="24" y="33" textAnchor="middle" fontSize="25" fontWeight="700" fill="white">in</text></svg>
  if (id === 'clock') return <svg {...common}><circle cx="24" cy="24" r="20" fill="#eaf1fb" stroke="#9bacbf" strokeWidth="2"/><circle cx="24" cy="24" r="15" fill="none" stroke="#8b9eb7"/><path d="M24 12v13l9 5" fill="none" stroke="#4e6584" strokeWidth="3" strokeLinecap="round"/></svg>
  if (id === 'youtube') return <svg {...common}><rect x="3" y="8" width="42" height="32" rx="9" fill="#f32632"/><path d="m20 16 13 8-13 8Z" fill="white"/></svg>
  return <svg {...common}><rect x="4" y="6" width="40" height="36" rx="7" fill="#1c2a3e"/><path d="m13 17 7 7-7 7M25 31h10" fill="none" stroke="#7ce0b0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function WindowsMark({ size = 25 }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true"><path fill="#18a5f8" d="M3 8 21 5v17H3zM25 4l20-3v21H25zM3 26h18v17L3 40zM25 26h20v21l-20-3z"/></svg>
}

export default function DesktopSimulator({ onBack }) {
  const [active, setActive] = useState('')
  const [selectedDesktopIcon, setSelectedDesktopIcon] = useState('')
  const [task, setTask] = useState(0)
  const [completed, setCompleted] = useState([])
  const [actions, setActions] = useState({})
  const [feed, setFeed] = useState(['Training workstation started', 'No real device or network access is available'])
  const [toast, setToast] = useState('')
  const [startOpen, setStartOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const [systemClock, setSystemClock] = useState(() => new Date())
  const [missionPanelOpen, setMissionPanelOpen] = useState(false)
  const current = missions[task]
  const systemTimeLabel = systemClock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const systemDateLabel = systemClock.toLocaleDateString([], { day: 'numeric', month: 'short' })
  const toggleFocusMode = async () => {
    if (!focusMode) {
      setFocusMode(true)
      setMissionPanelOpen(false)
      try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen() } catch { /* CSS immersive mode remains available */ }
    } else {
      setFocusMode(false)
      setMissionPanelOpen(false)
      try { if (document.fullscreenElement) await document.exitFullscreen() } catch { /* Ignore browser fullscreen exit errors */ }
    }
  }
  useEffect(() => {
    const timer = window.setInterval(() => setSystemClock(new Date()), 15000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    const onFullscreenChange = () => { if (!document.fullscreenElement) { setFocusMode(false); setMissionPanelOpen(false) } }
    const onEscape = (event) => { if (event.key === 'Escape' && !document.fullscreenElement) { setFocusMode(false); setMissionPanelOpen(false) } }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])
  const currentActions = actions[task] || {}
  const progress = Math.round((completed.length / missions.length) * 100)

  const notify = (message) => { setToast(message); window.clearTimeout(notify.timer); notify.timer = window.setTimeout(() => setToast(''), 2400) }
  const addLog = (message) => setFeed(old => [message, ...old].slice(0, 8))
  const action = (key, message) => {
    const next = { ...currentActions, [key]: true }
    setActions(old => ({ ...old, [task]: next }))
    addLog(message)
    if (current.required.every(item => next[item])) {
      setCompleted(old => old.includes(task) ? old : [...old, task])
      notify('All mission objectives satisfied. Review the outcome and continue.')
    } else notify('Evidence recorded. Continue with the remaining objective steps.')
  }
  const launch = (id) => { setActive(id); setSelectedDesktopIcon(id); setStartOpen(false); setQuickOpen(false); setNoticeOpen(false); addLog(`${appMeta[id]?.[0] || id} opened`) }
  const next = () => {
    if (!completed.includes(task)) return
    if (task === missions.length - 1) {
      addLog('Desktop investigation completed · all six missions passed')
      notify('Investigation complete — returning to CyberShield home.')
      window.setTimeout(async () => {
        try { if (document.fullscreenElement) await document.exitFullscreen() } catch { /* Continue to home if fullscreen exit is unavailable */ }
        onBack?.()
      }, 650)
      return
    }
    const nextTask = task + 1
    setTask(nextTask); setActive(missions[nextTask].app); addLog(`Mission ${nextTask + 1} unlocked · ${missions[nextTask].title}`)
  }
  const reset = () => {
    setActive(''); setTask(0); setCompleted([]); setActions({}); setFeed(['Training workstation restarted']);
    setStartOpen(false); setQuickOpen(false); setNoticeOpen(false); notify('Desktop simulation reset')
  }
  const openStartApp = (id) => launch(id)

  const renderMail = () => <div className="ds-app-content">
    <div className="ds-app-toolbar"><strong>Inbox</strong><span>Focused　 Other　　↻</span></div>
    <div className="ds-mail-list">
      <div className="ds-mail-item"><b>Campus Library</b><span>Book return reminder</span><small>Yesterday · Normal message</small></div>
      <div className="ds-mail-item flagged"><b>Eduvos Finance Office <em>External sender</em></b><span>URGENT: Outstanding invoice — action required</span><small>finance@eduv0s-billing.example · 09:14</small><p>Your student account will be suspended today. Open invoice_update.zip to confirm payment details.</p>
        <div className="ds-button-row">
          <button className={currentActions.senderChecked ? 'is-done' : ''} onClick={() => action('senderChecked', 'Expanded sender address · edu v0s lookalike domain identified')}>{currentActions.senderChecked ? '✓ Sender inspected' : 'Inspect sender details'}</button>
          <button className={currentActions.attachmentChecked ? 'is-done' : ''} onClick={() => action('attachmentChecked', 'Attachment inspected · unexpected ZIP from unknown sender')}>{currentActions.attachmentChecked ? '✓ Attachment inspected' : 'Inspect attachment'}</button>
          <button className="danger-action" disabled={!currentActions.senderChecked || !currentActions.attachmentChecked} onClick={() => action('mailReported', 'Email reported as phishing after evidence review')}>{currentActions.mailReported ? '✓ Reported' : 'Report phishing'}</button>
        </div>
      </div>
      <div className="ds-mail-item"><b>IT Service Desk</b><span>Scheduled maintenance notice</span><small>08:40 · Normal message</small></div>
    </div>
    <p className="ds-status-note">{currentActions.mailReported ? 'The suspicious email has been reported.' : 'Select the sender and attachment evidence before reporting this message.'}</p>
  </div>

  const renderBrowser = () => <div className="ds-app-content">
    <div className="ds-browser-address"><span>🔒</span><code>https://eduv0s-account-verify.example/portal</code><button onClick={() => action('urlChecked', 'Address inspected · zero substituted for the letter o in the domain')}>{currentActions.urlChecked ? '✓ Inspected' : 'Inspect URL'}</button></div>
    <div className="ds-browser-page"><div className="ds-browser-brand">EDUVOS <small>STUDENT ACCESS</small></div><div className="ds-browser-alert">ACTION REQUIRED · TRAINING SIMULATION</div><h2>Verify your student account</h2><p>Your access may be restricted. This fictional page asks learners to review a suspicious domain and its urgent language.</p><div className="ds-disabled-form"><label>Student email</label><input disabled placeholder="No information is collected"/><label>Password</label><input disabled placeholder="Credential fields are disabled"/><button disabled>Continue (disabled)</button></div><div className="ds-risk-box"><b>Potential warning signs</b><ul><li>Lookalike domain containing a zero</li><li>Unexpected verification request</li><li>Threat of account suspension</li></ul></div><button className="ds-primary-action" disabled={!currentActions.urlChecked} onClick={() => action('pageClosed', 'Suspicious page closed after domain review')}>{currentActions.pageClosed ? '✓ Page safely closed' : 'Close suspicious page'}</button></div>
    <p className="ds-status-note">Isolated training page. No external websites are contacted and no credentials can be entered.</p>
  </div>

  const renderFiles = () => <div className="ds-app-content">
    <div className="ds-pathbar">This PC　›　Local Disk (C:)　›　Users　›　Student　›　Downloads</div>
    <div className="ds-file-row"><span>📄</span><div><b>Lecture_Notes.pdf</b><small>PDF document · 2.4 MB</small></div></div>
    <div className="ds-file-row"><span>📄</span><div><b>Timetable_November.pdf</b><small>PDF document · 860 KB</small></div></div>
    <div className={`ds-file-row suspicious-file ${currentActions.fileQuarantined ? 'quarantined' : ''}`}><span>📦</span><div><b>Invoice_Update.zip</b><small>{currentActions.fileQuarantined ? 'Quarantined · isolated in training' : 'ZIP archive · Unknown publisher · 8.7 MB'}</small></div><span className="ds-file-warning">{currentActions.fileQuarantined ? 'Isolated' : 'Unverified'}</span></div>
    <div className="ds-button-row ds-file-actions">
      <button onClick={() => action('fileProperties', 'File properties reviewed · unknown publisher and unexpected archive confirmed')}>{currentActions.fileProperties ? '✓ Properties checked' : 'View file properties'}</button>
      <button disabled={!currentActions.fileProperties} onClick={() => action('fileScanned', 'Simulated scan complete · suspicious archive detected')}>{currentActions.fileScanned ? '✓ Scan complete' : 'Scan file'}</button>
      <button className="danger-action" disabled={!currentActions.fileScanned} onClick={() => action('fileQuarantined', 'Suspicious archive quarantined in the isolated simulation')}>{currentActions.fileQuarantined ? '✓ Quarantined' : 'Quarantine'}</button>
    </div>
    <p className="ds-status-note">Training files only. No local files are opened, changed, or executed.</p>
  </div>

  const renderDefender = () => <div className="ds-app-content">
    <div className="ds-protection-banner"><span>🛡️</span><div><b>You're protected</b><small>Windows Security · simulated workstation</small></div></div>
    <div className="ds-protection-card"><div><b>Virus & threat protection</b><small>{currentActions.quickScan ? 'Quick scan complete · 1 simulated threat detected' : 'Last scan: not run in this exercise'}</small></div><span className="ds-status-pill">{currentActions.threatIsolated ? 'Threat isolated' : currentActions.quickScan ? 'Action needed' : 'Review'}</span></div>
    <div className="ds-protection-card"><div><b>Firewall & network protection</b><small>Firewall is on · Public profile monitored</small></div><span className="ds-green">● On</span></div>
    <div className="ds-protection-card"><div><b>App & browser control</b><small>Reputation-based protection is enabled</small></div><span className="ds-green">● On</span></div>
    <div className="ds-button-row"><button onClick={() => action('protectionReviewed', 'Protection overview reviewed · firewall and browser protection enabled')}>{currentActions.protectionReviewed ? '✓ Status reviewed' : 'Review protection status'}</button><button disabled={!currentActions.protectionReviewed} onClick={() => action('quickScan', 'Quick scan complete · one simulated threat found')}>{currentActions.quickScan ? '✓ Scan complete' : 'Run quick scan'}</button><button className="danger-action" disabled={!currentActions.quickScan} onClick={() => action('threatIsolated', 'Detected training threat isolated')}>{currentActions.threatIsolated ? '✓ Threat isolated' : 'Isolate threat'}</button></div>
    <p className="ds-status-note">All protection actions are simulated and do not interact with Windows Defender on your computer.</p>
  </div>

  const renderNetwork = () => <div className="ds-app-content">
    <div className="ds-settings-heading"><span>⚙</span><div><b>Settings</b><small>Network & internet</small></div></div>
    <div className="ds-network-card"><div><b>Wi-Fi · Campus-Student-Secure</b><small>Connected · WPA3 · Private profile</small></div><span className="ds-green">● Connected</span></div>
    <div className="ds-network-card"><div><b>Firewall</b><small>Microsoft Defender Firewall is enabled</small></div><span className="ds-green">● On</span></div>
    <div className="ds-network-card"><div><b>Unknown-Guest-Free</b><small>Open network · Public profile · Unverified</small></div><span className="ds-amber">Untrusted</span></div>
    <div className="ds-button-row"><button onClick={() => action('profileChecked', 'Active connection profile reviewed · WPA3 private network')}>{currentActions.profileChecked ? '✓ Profile reviewed' : 'Inspect active profile'}</button><button disabled={!currentActions.profileChecked} onClick={() => action('trustedProfile', 'Trusted secure profile confirmed; unknown guest network avoided')}>{currentActions.trustedProfile ? '✓ Trusted profile confirmed' : 'Confirm trusted profile'}</button><button onClick={() => action('firewallChecked', 'Firewall status checked and confirmed enabled')}>{currentActions.firewallChecked ? '✓ Firewall checked' : 'Confirm firewall is on'}</button></div>
    <p className="ds-status-note">These network profiles are fictional examples. Nothing connects to or changes your real network.</p>
  </div>

  const renderTerminal = () => <div className="ds-terminal-window">
    <div className="ds-terminal-title">CYBERSHIELD INCIDENT CONSOLE · CASE CS-2048</div>
    <div className="ds-terminal-feed"><p>[09:02:11] INFO　Workstation started</p><p>[09:07:42] WARN　Failed sign-in · account: student</p><p>[09:07:44] WARN　Failed sign-in · source: unknown device</p><p>[09:07:49] ALERT Repeated authentication failures detected</p><p>[09:08:03] INFO　Invoice_Update.zip downloaded from unverified sender</p><p>[09:08:10] ALERT Suspicious account verification URL visited</p><p>[09:08:31] INFO　All timestamps and events are simulated</p></div>
    <div className="ds-terminal-controls"><button onClick={() => action('eventsReviewed', 'Incident timeline reviewed · sign-in failures correlated with suspicious email')}>{currentActions.eventsReviewed ? '✓ Events reviewed' : 'Review event timeline'}</button><button disabled={!currentActions.eventsReviewed} onClick={() => action('incidentClassified', 'Incident classified as suspected phishing-led account compromise')}>{currentActions.incidentClassified ? '✓ Classified' : 'Classify incident'}</button><button className="ds-submit-incident" disabled={!currentActions.incidentClassified} onClick={() => action('incidentSubmitted', 'Incident record CS-2048 submitted with evidence and severity')}>{currentActions.incidentSubmitted ? '✓ Record submitted' : 'Submit incident record'}</button></div>
    <p className="ds-terminal-note">No real commands run · This console is a fictional incident timeline.</p>
  </div>

  const renderWindow = () => {
    if (active === 'mail') return renderMail()
    if (active === 'browser') return renderBrowser()
    if (active === 'files') return renderFiles()
    if (active === 'defender') return renderDefender()
    if (active === 'network') return renderNetwork()
    if (active === 'terminal') return renderTerminal()
    if (['photos','calendar','notepad','calculator','paint','snipping','chrome','store','recycle','solitaire','todo','linkedin','clock','youtube'].includes(active)) return <div className="ds-app-content ds-utility-window"><div className="ds-app-toolbar"><strong>{appMeta[active]?.[0]}</strong><span>Windows 11 · Local simulation</span></div><div className="ds-utility-card"><WindowsAppIcon id={active} size={58}/><h2>{appMeta[active]?.[0]}</h2><p>This system application is represented inside the CyberShield training workstation. It does not access your computer or the internet.</p><button onClick={() => launch(current.app)}>Return to mission application</button></div></div>
    return <div className="ds-welcome"><div className="ds-windows-logo">▦</div><h2>Welcome to the training workstation</h2><p>Open an app from the desktop or Start menu to begin your investigation.</p><button onClick={() => launch(current.app)}>Open current mission app</button></div>
  }

  return <main className={`ds-page ${focusMode ? 'ds-device-focus' : ''} ${focusMode && missionPanelOpen ? 'ds-show-mission' : ''}`}>
    {focusMode && <div className="ds-focus-toolbar"><span><WindowsMark size={19}/> Windows 11 training desktop</span><div><button onClick={() => setMissionPanelOpen(v => !v)}>☰ Mission</button><button onClick={toggleFocusMode}>Exit full screen ×</button></div></div>}
    <header className="ds-header"><div><span>CYBERSHIELD · DESKTOP LAB</span><h1>Windows 11 security workstation</h1><p>A simulated desktop investigation with progressive, evidence-based missions.</p></div><div className="ds-header-actions"><button onClick={toggleFocusMode}>⛶ Full screen device</button><button onClick={onBack}>← Back to Lab</button></div></header>
    <div className="ds-layout">
      <section className="ds-computer">
        <div className="ds-laptop-lid"><div className="ds-screen">
          <div className="ds-bloom-wallpaper" aria-hidden="true"><img src="/windows11-bloom-reference.jpg" alt="" /></div>
          {!active ? <div className="ds-desktop-content"><div className="ds-desktop-icons">{Object.entries(appMeta).filter(([id])=>['recycle','browser','mail','files','defender','network','terminal','chrome','store','photos','notepad','snipping'].includes(id)).map(([id,[label]])=><button key={id} onDoubleClick={() => launch(id)} onClick={() => setSelectedDesktopIcon(id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') launch(id) }} className={selectedDesktopIcon === id ? 'selected' : ''}><span><WindowsAppIcon id={id} size={38}/></span>{label}</button>)}</div></div> : <section className="ds-app-window"><div className="ds-window-title"><div><span><WindowsAppIcon id={active} size={19}/></span><b>{appMeta[active]?.[0]}</b></div><div className="ds-window-controls"><button aria-label="Minimize" onClick={() => setActive('')}>−</button><button aria-label="Maximize device view" onClick={toggleFocusMode}>□</button><button aria-label="Close" onClick={() => setActive('')}>×</button></div></div>{renderWindow()}</section>}
          {startOpen && <div className="ds-start-menu"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search apps and settings" autoFocus/><div className="ds-start-section-head"><b>Pinned</b><button type="button" onClick={() => setSearch('')}>All apps　›</button></div><div className="ds-start-grid">{startPinned.filter(id => `${id} ${appMeta[id][0]}`.toLowerCase().includes(search.toLowerCase())).map(id=><button key={id} onClick={() => openStartApp(id)}><span><WindowsAppIcon id={id} size={29}/></span>{appMeta[id][0]}</button>)}</div><div className="ds-start-section-head ds-recommended-head"><b>Recommended</b><span>More　›</span></div><div className="ds-recommended-grid"><button onClick={() => launch('files')}><span>▧</span><b>Incident_Evidence.zip</b><small>Recently added</small></button><button onClick={() => launch('terminal')}><span>▤</span><b>Security_Notes.txt</b><small>Recently opened</small></button></div><div className="ds-start-footer"><span>◉　Student · Training account</span><button onClick={reset}>↻ Reset lab</button></div></div>}
          {quickOpen && <div className="ds-quick-panel"><b>Quick settings</b><div className="ds-quick-grid"><button onClick={() => notify('Training Wi-Fi is connected to the fictional secure profile')}>◉　Wi-Fi <small>Connected</small></button><button onClick={() => notify('Bluetooth is off in the simulation')}>ᛒ　Bluetooth</button><button onClick={() => notify('Airplane mode is off')}>✈　Airplane mode</button><button onClick={() => notify('Battery saver is off')}>▰　Battery saver</button></div><div className="ds-quick-footer">Brightness　━━━━━━●　100%</div></div>}
          {noticeOpen && <div className="ds-notice-panel"><b>Notifications</b><p>CyberShield training environment is ready.</p><p>Mission {task + 1}: {current.title}</p><small>No real Windows notifications are accessed.</small></div>}
          <div className="ds-taskbar"><div className="ds-taskbar-center"><button className="ds-taskbar-start" onClick={() => {setStartOpen(v => !v);setQuickOpen(false);setNoticeOpen(false)}} aria-label="Start"><WindowsMark size={22}/></button><button className="ds-taskbar-search" onClick={() => {setStartOpen(true);setQuickOpen(false);setNoticeOpen(false)}}>⌕　Search</button><div className="ds-taskbar-pins">{[['browser'],['files'],['mail'],['photos'],['store'],['chrome'],['defender'],['terminal'],['network']].map(([id])=><button key={id} onClick={() => launch(id)} aria-label={appMeta[id][0]}><WindowsAppIcon id={id} size={23}/></button>)}</div></div><div className="ds-tray"><button onClick={() => {setQuickOpen(v=>!v);setStartOpen(false);setNoticeOpen(false)}}>⌃　◉　🔊</button><button onClick={() => {setNoticeOpen(v=>!v);setStartOpen(false);setQuickOpen(false)}}>{systemDateLabel}<br/>{systemTimeLabel}</button></div></div>
        </div></div><div className="ds-laptop-base"><div className="ds-keyboard-deck"/><div className="ds-trackpad"/></div><small className="ds-caption">SIMULATED WINDOWS DESKTOP · NO REAL FILES, COMMANDS OR NETWORK SETTINGS</small>
      </section>
      <aside className="ds-panel"><div className="ds-panel-topline"><span className="ds-kicker">GUIDED MISSION</span><span className={`ds-state-pill ${completed.includes(task) ? 'complete' : ''}`}>{completed.includes(task) ? 'Completed' : 'In progress'}</span></div><div className="ds-mission-heading"><span>{current.level} · {String(task + 1).padStart(2,'0')} / {String(missions.length).padStart(2,'0')}</span><b>{current.title.replace(/^\d+ · /,'')}</b></div><p className="ds-mission-description">{current.objective}</p><div className="ds-progress-label"><b>MISSION PROGRESS</b><span>{completed.length}/{missions.length}</span></div><div className="ds-progress"><i style={{width:`${progress}%`}}/></div><div className="ds-objective-list">{current.required.map(key=><div key={key} className={currentActions[key]?'done':''}><span>{currentActions[key]?'✓':'○'}</span>{objectiveLabels[key]}</div>)}</div><details className="ds-panel-details"><summary>Investigation hint</summary><p>{current.tip}</p></details><button className="ds-next" disabled={!completed.includes(task)} onClick={next}>{task===missions.length-1?'Complete investigation':'Next mission'} <span>→</span></button><small className="ds-hint">{completed.includes(task)?'Mission complete. Continue when ready.':'Complete the steps above to continue.'}</small><details className="ds-panel-details ds-activity-details"><summary>Activity log <span>{feed.length} events</span></summary>{feed.map((item,i)=><p key={`${item}-${i}`}>· {item}</p>)}</details><button className="ds-reset" onClick={reset}>Reset simulation</button>
      </aside>
    </div>
    {toast&&<div className="ds-toast" role="status">{toast}</div>}
  </main>
}

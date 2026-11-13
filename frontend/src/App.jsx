import { useEffect, useState } from 'react'
import './App.css'
import './App.motion.css'
import PhoneSimulator from './components/PhoneSimulator'
import DesktopSimulator from './components/DesktopSimulator'
import LearningHub, { readAcademyProgress } from './LearningHub'
import ThreatIntel from './ThreatIntel'
import ShieldGlobe from './components/ShieldGlobe'
import CyberTabDock from './components/CyberTabDock'
import './CyberTheme.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000').replace(/\/$/, '')

const scenarios = [
  {
    id: 1,
    type: 'Authentication · MFA fatigue',
    sender: 'Account sign-in alert',
    email: 'Channel: repeated authenticator prompts',
    subject: 'Approve a sign-in you did not start',
    message:
      'You receive several unexpected multi-factor authentication (MFA) approval prompts while you are not trying to sign in. A caller then claims to be IT support and asks you to approve one so they can “clear the alerts”.',
    question: 'What is the safest response?',
    correctChoice: 'deny_report',
    choices: [
      { id: 'approve_one', label: 'Approve one prompt to make the alerts stop', description: 'The caller says it will clear the problem.' },
      { id: 'deny_report', label: 'Deny every prompt and report the unexpected requests', description: 'Do not approve sign-ins you did not initiate; contact IT using a known channel.' },
      { id: 'share_code', label: 'Read the verification code to the caller', description: 'They say they need it to cancel the sign-in.' },
    ],
  },
  {
    id: 2,
    type: 'QR code · Quishing',
    sender: 'Parking payment sign',
    email: 'Channel: QR code on a public parking meter',
    subject: 'Scan to pay for parking',
    message:
      'A sticker on a parking meter says “Scan here — cashless payment only”. The QR code opens a page with a slightly misspelled web address and asks for your card details. The meter also has a printed payment reference you can use with the official app.',
    question: 'How should you pay safely?',
    correctChoice: 'official_app',
    choices: [
      { id: 'official_app', label: 'Use the official parking app or type the verified address yourself', description: 'Check the meter instructions and destination before paying.' },
      { id: 'scan_pay', label: 'Enter card details because the QR sticker is on the meter', description: 'Assume the sticker must be legitimate.' },
      { id: 'ask_stranger', label: 'Ask a nearby stranger to scan it on their phone first', description: 'Rely on someone else to check the code.' },
    ],
  },
  {
    id: 3,
    type: 'Recruitment · Job scam',
    sender: 'Recruitment coordinator',
    email: 'Channel: direct message about a job offer',
    subject: 'You are hired — pay a registration fee today',
    message:
      'You receive an offer for a remote student job after a very short chat. The recruiter promises high pay, asks you to pay a refundable onboarding fee, and requests a photo of your identity document before sharing a formal contract.',
    question: 'What should you do before proceeding?',
    correctChoice: 'verify_employer',
    choices: [
      { id: 'pay_fee', label: 'Pay the fee because it is described as refundable', description: 'Secure the job before the offer expires.' },
      { id: 'send_id', label: 'Send your ID document to reserve the position', description: 'The recruiter says every new employee must do this.' },
      { id: 'verify_employer', label: 'Verify the company independently and refuse upfront fees', description: 'Find official contact details and confirm the vacancy before sharing documents.' },
    ],
  },
  {
    id: 4,
    type: 'Tech support · Impersonation',
    sender: 'Caller claiming to be university IT',
    email: 'Channel: unexpected phone call',
    subject: 'Your device has been compromised',
    message:
      'A caller says they are from university IT and claims your laptop is infected. They pressure you to install a remote-access tool and read out a one-time code so they can “secure your account”. You were not expecting support.',
    question: 'What is the safest next step?',
    correctChoice: 'end_verify',
    choices: [
      { id: 'install_remote', label: 'Install the tool and follow the caller’s instructions', description: 'Let them take control so they can fix the problem.' },
      { id: 'end_verify', label: 'End the call and contact IT using the official helpdesk number', description: 'Do not install software or share one-time codes with an unsolicited caller.' },
      { id: 'give_code', label: 'Share only the one-time code, not your password', description: 'Assume the code is safe to share because it expires.' },
    ],
  },
  {
    id: 5,
    type: 'Physical security · Malicious USB',
    sender: 'Unlabelled USB drive found outside a computer lab',
    email: 'Channel: removable device found in a public place',
    subject: 'A USB drive marked “Exam timetable”',
    message:
      'You find a USB drive near a campus computer lab. A label says “Exam timetable — urgent”. A classmate suggests plugging it into a university computer to identify the owner, but you do not know what is stored on it.',
    question: 'What should you do with the device?',
    correctChoice: 'hand_to_it',
    choices: [
      { id: 'plug_in', label: 'Plug it into a campus computer to see what is on it', description: 'Check whether the files identify the owner.' },
      { id: 'personal_laptop', label: 'Try it on your own laptop instead', description: 'Keep the unknown device away from university systems.' },
      { id: 'hand_to_it', label: 'Do not plug it in; hand it to campus IT or security', description: 'Let authorised staff handle an unknown removable device safely.' },
    ],
  },

  {
    id: 6, type: 'Cloud identity · OAuth consent', sender: 'Cloud collaboration platform', email: 'Channel: third-party app permission request', subject: 'Grant access to your university files',
    message: 'A document-sharing app asks for permission to read every file in your cloud drive and maintain access even when you are offline. The request came from a link in an unexpected shared document. The app name resembles a familiar service but its publisher is unfamiliar.',
    question: 'Which action best limits the identity and data risk?', correctChoice: 'verify_publisher', choices: [
      {id:'grant_all',label:'Accept all permissions because the app uses the university logo',description:'A familiar logo is not proof that the publisher is trusted.'},
      {id:'verify_publisher',label:'Cancel, verify the publisher and request through the official software catalogue',description:'Check the app identity, requested scopes and approval process independently.'},
      {id:'grant_read',label:'Grant access now and revoke it if anything looks wrong',description:'Broad access may expose data before you notice misuse.'}
    ]
  },
  {
    id: 7, type: 'Email security · Business email compromise', sender: 'Finance director display name', email: 'Channel: supplier bank-detail change request', subject: 'Urgent: update payment details before close of business',
    message: 'A supplier sends an invoice from a lookalike domain and asks finance to replace its bank account. The message says the usual contact is unavailable and discourages calling because the change is confidential. The invoice amount matches an expected payment.',
    question: 'What is the strongest verification procedure?', correctChoice: 'known_contact', choices: [
      {id:'reply_email',label:'Reply to the message and ask the sender to confirm',description:'A compromised mailbox or lookalike sender can answer.'},
      {id:'pay_small',label:'Send a small test payment to see whether it arrives',description:'A test transfer still sends funds to unverified details.'},
      {id:'known_contact',label:'Pause payment and verify the change using a previously known phone number',description:'Use an independent trusted channel and follow dual-approval controls.'}
    ]
  },
  {
    id: 8, type: 'Endpoint security · Malware response', sender: 'Endpoint detection alert', email: 'Channel: managed workstation security notification', subject: 'Suspicious process spawned by an office document',
    message: 'An endpoint alert reports that a spreadsheet launched a script interpreter which attempted outbound connections. The user says the file came from a known supplier. The device is still connected to the corporate network and the alert severity is high.',
    question: 'What should you do first as the analyst?', correctChoice: 'isolate_preserve', choices: [
      {id:'delete_file',label:'Delete the spreadsheet and close the alert',description:'This may destroy evidence and leave active processes running.'},
      {id:'isolate_preserve',label:'Follow the incident playbook: isolate the host, preserve evidence and escalate',description:'Contain potential spread while maintaining evidence for investigation.'},
      {id:'reboot',label:'Reboot immediately and ask the user to continue working',description:'A reboot can alter volatile evidence and may not contain the threat.'}
    ]
  },
  {
    id: 9, type: 'Network security · Segmentation and lateral movement', sender: 'Security operations console', email: 'Channel: correlated authentication and network telemetry', subject: 'Service account authenticates across unrelated servers',
    message: 'A service account normally used by one application server authenticates to several workstation subnets within minutes. The source host also makes unusual SMB connections. There is no approved maintenance window, but the account is used by a critical service.',
    question: 'Which response balances containment and service continuity?', correctChoice: 'validate_contain', choices: [
      {id:'disable_all',label:'Disable every service account in the environment immediately',description:'This is broad and may cause avoidable outages.'},
      {id:'ignore_service',label:'Ignore the activity because service accounts often authenticate widely',description:'The observed pattern differs from the stated baseline.'},
      {id:'validate_contain',label:'Validate the owner and baseline, then coordinate scoped containment and credential rotation',description:'Confirm scope quickly, preserve evidence and contain the suspected identity safely.'}
    ]
  },
  {
    id: 10, type: 'Incident response · Data exposure', sender: 'Data loss prevention alert', email: 'Channel: outbound cloud upload detection', subject: 'Large archive uploaded to an unfamiliar file-sharing tenant',
    message: 'A user account uploads a compressed archive containing project documents to a newly observed external tenant. The user claims it was required for a partner review, but the partner is not listed in the approved sharing register. The upload is complete and the account remains active.',
    question: 'What is the most defensible next action?', correctChoice: 'contain_scope', choices: [
      {id:'delete_local',label:'Delete the local archive and assume the exposure is resolved',description:'The external copy may still be accessible.'},
      {id:'contain_scope',label:'Restrict the sharing link or session, preserve logs and initiate the data-incident process',description:'Limit further access, establish what was exposed and notify the response owner.'},
      {id:'public_notice',label:'Immediately publish a public warning before confirming the scope',description:'External notification should follow the organisation’s incident and legal process.'}
    ]
  }
]

function evaluateReason(reason) {
  const text = reason.toLowerCase()

  const indicators = [
    'suspicious',
    'phishing',
    'fake',
    'scam',
    'urgent',
    'link',
    'sender',
    'email',
    'verify',
    'official',
    'domain',
    'password',
    'credential',
    'bank',
    'information',
    'details',
    'security',
    'attachment',
    'download',
    'contact',
  ]

  const matches = indicators.filter((word) =>
    text.includes(word),
  ).length

  if (reason.trim().length < 15) {
    return 5
  }

  if (matches >= 3) {
    return 10
  }

  if (matches >= 1) {
    return 7
  }

  return 5
}

function getRiskLevel(score) {
  if (score >= 80) {
    return {
      label: 'LOW RISK',
      description: 'Strong phishing awareness',
    }
  }

  if (score >= 60) {
    return {
      label: 'MODERATE RISK',
      description: 'Some awareness gaps detected',
    }
  }

  return {
    label: 'HIGH RISK',
    description: 'Significant awareness gaps detected',
  }
}

function shuffleItems(items) {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function App() {
  const [page, setPage] = useState('home')
  const [studentSession, setStudentSession] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('cybershield_student_session') || 'null') } catch { return null }
  })
  const [authMode, setAuthMode] = useState('register')
  const [studentEmail, setStudentEmail] = useState('')
  const [studentNickname, setStudentNickname] = useState('')
  const [studentPassword, setStudentPassword] = useState('')
  const [studentAuthError, setStudentAuthError] = useState('')
  const [studentAuthLoading, setStudentAuthLoading] = useState(false)
  const [currentScenario, setCurrentScenario] = useState(0)
  const [adminToken, setAdminToken] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [adminLoginLoading, setAdminLoginLoading] = useState(false)

  const [choice, setChoice] = useState('')
  const [reason, setReason] = useState('')

  const [responses, setResponses] = useState([])
  const [assessmentChoiceOrder, setAssessmentChoiceOrder] = useState({})
  const [assessmentReport, setAssessmentReport] = useState(null)

  const [aiLoading, setAiLoading] = useState(false)

  const [assessmentHistory, setAssessmentHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState('')

  const [honeypotStatus, setHoneypotStatus] = useState(null)
  const [honeypotEvents, setHoneypotEvents] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [honeypotLoading, setHoneypotLoading] = useState(false)

  const [honeypotError, setHoneypotError] = useState('')
  const [simulationLoading, setSimulationLoading] = useState(false)
  const [simulationMessage, setSimulationMessage] = useState('')
  const [activeSimulation, setActiveSimulation] = useState('')

  // Beginner-friendly GUI honeypot mission
  const [missionAnswer, setMissionAnswer] = useState('')
  const [missionSubmitted, setMissionSubmitted] = useState(false)
  const [selectedMissionDevice, setSelectedMissionDevice] = useState('honeypot')
  const [selectedScamScenario, setSelectedScamScenario] = useState('email')
  const [scamChoice, setScamChoice] = useState('')
  const [scamChecked, setScamChecked] = useState(false)
  const [scamClueOpen, setScamClueOpen] = useState(false)
  const [scamProgress, setScamProgress] = useState({})
  const [showScamResults, setShowScamResults] = useState(false)
  const [scamSaveStatus, setScamSaveStatus] = useState('idle')
  const [scamLoadError, setScamLoadError] = useState('')
  const [phishingSimulation, setPhishingSimulation] = useState({ stage: 'email', busy: false, message: '', events: [], points: 0 })
  const [selectedInboxMessage, setSelectedInboxMessage] = useState('student')
  const [learnerId] = useState(() => {
    const storageKey = 'cybershield_anonymous_learner_id'
    const createId = () => window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        })
    try {
      let id = window.localStorage.getItem(storageKey)
      if (!id) {
        id = createId()
        window.localStorage.setItem(storageKey, id)
      }
      return id
    } catch {
      return createId()
    }
  })

  const handleStudentAuth = async (event) => {
    event.preventDefault()
    if (studentAuthLoading) return
    setStudentAuthLoading(true)
    setStudentAuthError('')
    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: studentEmail.trim(), password: studentPassword }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success || !data.token) throw new Error(data.error || 'Authentication failed.')
      if (data.user?.role !== 'student') throw new Error('Please use a student account to access CyberShield learning tools.')
      const session = { token: data.token, user: data.user }
      window.localStorage.setItem('cybershield_student_session', JSON.stringify(session))
      setStudentSession(session)
      setStudentPassword('')
      setStudentNickname('')
      setStudentAuthError('')
      setPage(data.user?.nickname ? 'home' : 'nickname')
    } catch (error) {
      setStudentAuthError(error.message || 'Could not connect to CyberShield. Please try again.')
    } finally {
      setStudentAuthLoading(false)
    }
  }

  const handleNicknameSave = async (event) => {
    event.preventDefault()
    const nickname = studentNickname.trim()
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(nickname)) { setStudentAuthError('Use 3–20 letters, numbers, underscores or hyphens.'); return }
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/nickname`, {method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${studentSession?.token || ''}`}, body:JSON.stringify({nickname})})
      const data = await response.json().catch(()=>({}))
      if (response.status === 401) {
        window.localStorage.removeItem('cybershield_student_session')
        setStudentSession(null)
        setPage('home')
        throw new Error('Your sign-in session expired. Please sign in again, then choose your nickname.')
      }
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not save nickname.')
      const session = {...studentSession, user:{...studentSession.user, nickname:data.nickname}}
      window.localStorage.setItem('cybershield_student_session', JSON.stringify(session)); setStudentSession(session); setStudentNickname(''); setStudentAuthError(''); setPage('home')
    } catch (error) { setStudentAuthError(error.message || 'Could not save nickname.') }
  }

  const handleStudentLogout = () => {
    window.localStorage.removeItem('cybershield_student_session')
    setStudentSession(null)
    setStudentPassword('')
    setPage('home')
  }

  const loadAssessmentHistory = async () => {
    if (!studentSession?.token) return
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/assessment/history`, {
        headers: { Authorization: `Bearer ${studentSession.token}` },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not load your assessment history.')
      }
      setAssessmentHistory(data.history || [])
    } catch (error) {
      setHistoryError(error.message || 'Could not load assessment history.')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (studentSession?.token && studentSession.user?.role === 'student' && !studentSession.user?.nickname && page !== 'nickname') setPage('nickname')
  }, [studentSession?.token, studentSession?.user?.nickname])

  useEffect(() => {
    if ((page === 'history' || page === 'achievements') && studentSession?.token) loadAssessmentHistory()
  }, [page, studentSession?.token])

  useEffect(() => {
    if (!['results', 'home', 'leaderboard'].includes(page)) return
    let cancelled = false
    const loadLeaderboard = async () => {
      setLeaderboardLoading(true)
      setLeaderboardError('')
      try {
        const response = await fetch(`${API_BASE_URL}/api/leaderboard?limit=10`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.success) throw new Error(data.error || 'Leaderboard is temporarily unavailable.')
        if (!cancelled) setLeaderboard(data.leaderboard || [])
      } catch (error) {
        if (!cancelled) setLeaderboardError(error.message || 'Could not load leaderboard.')
      } finally {
        if (!cancelled) setLeaderboardLoading(false)
      }
    }
    loadLeaderboard()
    return () => { cancelled = true }
  }, [page])

  /*
   * HONEYPOT DATA
   */

  const handleAdminLogin = async (event) => {
    event.preventDefault()
    if (adminLoginLoading) return
    setAdminLoginLoading(true)
    setAdminLoginError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.error || 'Login failed. Check your credentials.')
      }
      if (data.user?.role !== 'admin') {
        throw new Error('This account does not have administrator access.')
      }
      setAdminToken(data.token)
      setAdminPassword('')
      setAdminLoginError('')
    } catch (error) {
      setAdminLoginError(error.message || 'Could not sign in. Check that the backend is running.')
    } finally {
      setAdminLoginLoading(false)
    }
  }

  const handleAdminLogout = () => {
    setAdminToken('')
    setAdminEmail('')
    setAdminPassword('')
    setAdminLoginError('')
    setHoneypotStatus(null)
    setHoneypotEvents([])
    setAuditLogs([])
    setPage('honeypot')
  }

  const loadHoneypot = async () => {
    if (!adminToken) return

    setHoneypotLoading(true)
    setHoneypotError('')

    try {
      const [statusResponse, eventsResponse, auditResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/honeypot/status`, { headers: { Authorization: `Bearer ${adminToken}` } }),
          fetch(`${API_BASE_URL}/api/honeypot/events`, { headers: { Authorization: `Bearer ${adminToken}` } }),
          fetch(`${API_BASE_URL}/api/audit/logs?limit=20`, { headers: { Authorization: `Bearer ${adminToken}` } }),
        ])

      if ([statusResponse, eventsResponse, auditResponse].some((response) => response.status === 401 || response.status === 403)) {
        setAdminToken('')
        throw new Error('Your admin session expired or does not have permission. Please sign in again.')
      }
      if (!statusResponse.ok || !eventsResponse.ok || !auditResponse.ok) {
        throw new Error('Failed to load honeypot or audit-log data')
      }

      const statusData = await statusResponse.json()
      const eventsData = await eventsResponse.json()
      const auditData = await auditResponse.json()

      setHoneypotStatus(statusData)
      setHoneypotEvents(eventsData.events || [])
      setAuditLogs(auditData.logs || [])
    } catch (error) {
      console.error('Honeypot error:', error)

      setHoneypotError(
        'Could not connect to the CYBERSHIELD honeypot backend. Make sure the Flask server is running on port 5000.',
      )
    } finally {
      setHoneypotLoading(false)
    }
  }


  const simulateHoneypotEvent = async (simulationType) => {
    if (simulationLoading) return

    setSimulationLoading(true)
    setSimulationMessage('')
    setActiveSimulation(simulationType)
    const simulations = {
      ssh: {
        event: 'SSH Login Attempt',
        source_ip: '192.168.1.200',
        severity: 'High',
        details: 'Simulated failed SSH login attempt using a test account.',
        status: 'Detected',
      },
      bruteForce: {
        event: 'Brute Force Attempt',
        source_ip: '192.168.1.201',
        severity: 'Critical',
        details: 'Simulated repeated failed authentication attempts.',
        status: 'Blocked',
      },
      portScan: {
        event: 'Port Scan',
        source_ip: '192.168.1.202',
        severity: 'Medium',
        details: 'Simulated scan of multiple network ports.',
        status: 'Detected',
      },
      suspiciousCommand: {
        event: 'Suspicious Command',
        source_ip: '192.168.1.203',
        severity: 'High',
        details: 'Simulated suspicious command activity in a controlled environment.',
        status: 'Detected',
      },
    }

    const eventData = simulations[simulationType]

    if (!eventData) {
      setSimulationMessage('Unknown simulation type.')
      setSimulationLoading(false)
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/honeypot/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(eventData),
        },
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not record simulation event.')
      }

      setSimulationMessage('Simulation event recorded successfully.')
      await loadHoneypot()
    } catch (error) {
      console.error('Simulation error:', error)
      setSimulationMessage(
        'Could not record the event. Check that the Flask backend is running.',
      )
    } finally {
      setSimulationLoading(false)
      setActiveSimulation('')
    }
  }


  const scamProgressUrl = `${API_BASE_URL}/api/scam-progress/${learnerId}`

  const saveScamProgress = async (progress) => {
    setScamSaveStatus('saving')
    try {
      const response = await fetch(scamProgressUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not save progress.')
      setScamSaveStatus('saved')
      setScamLoadError('')
      return true
    } catch (error) {
      console.error('Scam progress save error:', error)
      setScamSaveStatus('error')
      setScamLoadError('Your answer is visible for this session, but could not be saved. Check that the Flask backend is running.')
      return false
    }
  }


  const recordPhishingSimulationEvent = async (eventType) => {
    if (phishingSimulation.busy) return
    setPhishingSimulation((current) => ({ ...current, busy: true, message: '' }))
    try {
      const response = await fetch(`${API_BASE_URL}/api/phishing-simulation/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_id: learnerId,
          scenario_id: `${selectedScamScenario}-001`,
          event_type: eventType,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not record this simulation event.')
      const stage = ['suspicious_link_clicked', 'qr_link_opened', 'marketplace_checkout_clicked', 'social_payment_clicked'].includes(eventType)
        ? 'landing'
        : eventType === 'mock_action_attempted' || eventType === 'mock_signin_attempted' ? 'submitted'
        : eventType === 'email_reported' ? 'reported' : 'feedback'
      const actionMessages = {
        inbox_message_opened: 'Message opened. Take a moment to inspect the sender, wording and links.',
        suspicious_link_clicked: 'Risky click recorded. You have opened a safe mock website inside CYBERSHIELD.',
        qr_link_opened: 'QR destination opened inside this safe simulation. No external site was contacted.',
        marketplace_checkout_clicked: 'You selected the seller’s risky payment option. A mock checkout is shown for learning.',
        social_payment_clicked: 'You followed the payment request. This is a safe mock screen; no money can be sent.',
        mock_action_attempted: 'Risky action recorded. No real information was entered or transmitted.',
        mock_signin_attempted: 'Risky sign-in action recorded. No credentials were requested or stored.',
        email_reported: 'Message reported. Good choice — this scenario contains warning signs.',
        phone_answered: 'You answered the simulated call. Listen carefully: the caller is asking for sensitive information.',
        phone_shared_code_attempted: 'Risky choice recorded. Never share one-time codes with an incoming caller.',
        social_profile_opened: 'Profile opened. A familiar-looking account is not proof that a request is genuine.',
        recovery_action_selected: 'Recovery step recorded. Using official channels is the safest approach.',
        safe_exit_selected: 'You backed out before sharing information. That is a safer decision.',
      }
      setPhishingSimulation((current) => ({
        ...current,
        stage,
        events: [...current.events, data.event],
        message: actionMessages[eventType] || 'Your simulated action has been recorded.',
        lastEvent: eventType,
        points: (current.points || 0) + (data.event?.points || 0),
      }))
    } catch (error) {
      console.error('Phishing simulation event error:', error)
      setPhishingSimulation((current) => ({ ...current, message: 'Could not save this action. Check that the Flask backend is running.' }))
    } finally {
      setPhishingSimulation((current) => ({ ...current, busy: false }))
    }
  }

  useEffect(() => {
    if (page !== 'scam-centre') return
    let cancelled = false
    const loadScamProgress = async () => {
      setScamSaveStatus('loading')
      setScamLoadError('')
      try {
        const response = await fetch(scamProgressUrl)
        const data = await response.json()
        if (!response.ok || !data.success) throw new Error(data.error || 'Could not load saved progress.')
        if (!cancelled) {
          setScamProgress(data.progress || {})
          setScamSaveStatus('saved')
        }
      } catch (error) {
        console.error('Scam progress load error:', error)
        if (!cancelled) {
          setScamSaveStatus('error')
          setScamLoadError('Could not load saved progress. Make sure Flask is running; your current practice can still continue.')
        }
      }
    }
    loadScamProgress()
    return () => { cancelled = true }
  }, [page, learnerId])

  /*
   * LOAD HONEYPOT WHEN PAGE OPENS
   */

  useEffect(() => {
    if (page === 'honeypot' && adminToken) {
      loadHoneypot()
    }
  }, [page, adminToken])

  /*
   * CURRENT SCENARIO
   */

  const scenario = scenarios[currentScenario]

  /*
   * RETURN HOME
   */

  const goHome = () => {
    setPage('home')
    setCurrentScenario(0)
    setChoice('')
    setReason('')
    setResponses([])
    setAssessmentReport(null)
    setAiLoading(false)
  }

  const navigateCoreTab = (targetPage) => {
    setPage(targetPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /*
   * START ASSESSMENT
   */

  const startAssessment = () => {
    setPage('assessment')
    setCurrentScenario(0)
    setChoice('')
    setReason('')
    setResponses([])
    setAssessmentReport(null)
    setAssessmentChoiceOrder(Object.fromEntries(
      scenarios.map((item) => [item.id, shuffleItems(item.choices)])
    ))
  }

  /*
   * HANDLE ASSESSMENT CONTINUE
   */

  const handleContinue = async () => {
    if (!choice || aiLoading) return

    const selectedChoice = scenario.choices.find(
      (item) => item.id === choice,
    )

    const newResponse = {
      scenario: scenario.id,
      choice,
      decisionCorrect: choice === scenario.correctChoice,
    }

    const updatedResponses = [...responses, newResponse]

    // Move through the first four scenarios without making an AI request.
    if (currentScenario < scenarios.length - 1) {
      setResponses(updatedResponses)
      setCurrentScenario(currentScenario + 1)
      setChoice('')
      return
    }

    // Submit all ten answers once, after the final scenario.
    setAiLoading(true)
    try {
      const answers = updatedResponses.map((response) => ({
        scenarioId: response.scenario,
        selectedChoiceId: response.choice,
        reasoning: '',
      }))

      const response = await fetch(
        `${API_BASE_URL}/api/assessment/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentSession?.token || ''}` },
          body: JSON.stringify({ answers }),
        },
      )

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Assessment request failed: ${response.status}`)
      }

      // Use the server's authoritative marking, not browser-side answer keys.
      const markedResponses = (data.scenarioResults || []).map((result) => ({
        scenario: result.scenarioId,
        choice: result.selectedChoiceId,
        decisionCorrect: result.correct,
        correctChoice: result.correctChoiceId,
        learningPoint: result.learningPoint,
      }))

      setResponses(markedResponses)
      setAssessmentReport(data)
      setPage('results')
      loadAssessmentHistory()
    } catch (error) {
      console.error('Assessment completion error:', error)
      alert(
        error.message || 'CyberShield could not submit your assessment. Please try again.',
      )
    } finally {
      setAiLoading(false)
    }
  }

  /*
   * GET CHOICE LABEL
   */

  const getChoiceLabel = (
    scenarioId,
    choiceId,
  ) => {
    const foundScenario = scenarios.find(
      (item) => item.id === scenarioId,
    )

    const foundChoice =
      foundScenario?.choices.find(
        (item) => item.id === choiceId,
      )

    return foundChoice?.label || choiceId
  }

  /*
   * CALCULATE RESULTS
   */

  const calculateResults = () => {
    if (assessmentReport) {
      return {
        score: assessmentReport.score ?? 0,
        correct: assessmentReport.correctAnswers ?? 0,
        reasoning: null,
      }
    }

    if (!responses.length) {
      return {
        score: 0,
        correct: 0,
        reasoning: 0,
      }
    }

    const correct = responses.filter(
      (response) =>
        response.decisionCorrect,
    ).length

    const finalScore = Math.round(
      (correct / scenarios.length) * 100,
    )

    return {
      score: finalScore,
      correct,
      reasoning: null,
    }
  }

  /*
   * STRENGTHS
   */

  const getStrengths = () => {
    const reportedStrengths = assessmentReport?.aiFeedback?.strengths?.length
      ? assessmentReport.aiFeedback.strengths
      : assessmentReport?.strengths
    if (reportedStrengths?.length) return reportedStrengths

    const strengths = []

    const correctCount =
      responses.filter(
        (response) =>
          response.decisionCorrect,
      ).length

    if (correctCount >= 4) {
      strengths.push(
        'Strong decision-making when faced with suspicious messages.',
      )
    }

    if (
      responses.some(
        (response) =>
          response.scenario === 2 &&
          response.decisionCorrect,
      )
    ) {
      strengths.push(
        'Good awareness of suspicious banking verification requests.',
      )
    }

    if (!strengths.length) {
      strengths.push(
        'You completed the assessment and demonstrated an awareness of several phishing indicators.',
      )
    }

    return strengths
  }

  /*
   * WEAKNESSES
   */

  const getWeaknesses = () => {
    const reportedGaps = assessmentReport?.aiFeedback?.areas_to_improve?.length
      ? assessmentReport.aiFeedback.areas_to_improve
      : assessmentReport?.knowledgeGaps
    if (reportedGaps?.length) return reportedGaps

    const weaknesses = []

    responses.forEach((response) => {
      if (!response.decisionCorrect) {
        const scenarioData =
          scenarios.find(
            (item) =>
              item.id === response.scenario,
          )

        if (scenarioData) {
          weaknesses.push(
            `Scenario ${response.scenario}: Be more cautious when dealing with ${scenarioData.sender} requests.`,
          )
        }
      }
    })

    if (!weaknesses.length) {
      weaknesses.push(
        'No major weaknesses were detected in this prototype assessment.',
      )
    }

    return weaknesses
  }

  /*
   * HOME
   */

  if (!studentSession?.token) {
    return (
      <div className="phishaware auth-screen">
        <style>{`
.auth-screen{position:relative;isolation:isolate;overflow:hidden;min-height:100vh;background:radial-gradient(ellipse at 50% 45%,#17233d 0%,#10141d 48%,#0b0e14 100%)}
.auth-screen:before,.auth-screen:after{content:"";position:fixed;z-index:-1;width:260px;height:260px;border-radius:50%;filter:blur(70px);opacity:.48;pointer-events:none;animation:cyberFloat 12s ease-in-out infinite alternate}
.auth-screen:before{background:#286cff;top:10%;left:8%}.auth-screen:after{background:#00c8ff;right:7%;bottom:8%;animation-delay:-5s}
.auth-card{width:min(100%,460px);margin:24px auto;padding:clamp(24px,5vw,38px);border:1px solid rgba(255,255,255,.13);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.035));box-shadow:0 24px 80px rgba(0,0,0,.38),inset 0 1px rgba(255,255,255,.1);backdrop-filter:blur(22px);animation:authRise .75s cubic-bezier(.2,.8,.2,1) both}
.auth-card h1{margin:22px 0 14px;font-size:clamp(30px,6vw,38px);line-height:1.12;letter-spacing:-1.3px;text-align:center;overflow-wrap:normal}
.auth-card .auth-copy{max-width:340px;margin:0 auto 18px;text-align:center;line-height:1.65;color:#b8c9e8}
.auth-card label{display:block;margin:15px 0 7px;font-weight:600;text-align:left}
.auth-card .auth-input{display:block;width:100%;box-sizing:border-box;min-height:48px;padding:13px 15px;border:1px solid rgba(166,194,255,.28);border-radius:12px;outline:none;color:#f5f8ff;background:rgba(9,18,35,.48);box-shadow:inset 0 1px 2px rgba(0,0,0,.16);backdrop-filter:blur(12px);transition:border-color .2s,box-shadow .2s,background .2s}
.auth-card .auth-input:focus{border-color:#6b9cff;background:rgba(20,42,78,.62);box-shadow:0 0 0 4px rgba(74,130,255,.16),0 0 24px rgba(48,112,255,.14)}
.auth-card .continue-button{margin-top:18px;border-radius:12px;box-shadow:0 10px 28px rgba(55,105,255,.28)}
@keyframes cyberFloat{from{transform:translate3d(-18px,-10px,0) scale(.92)}to{transform:translate3d(34px,28px,0) scale(1.18)}}
@keyframes authRise{from{opacity:0;transform:translateY(22px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(prefers-reduced-motion:reduce){.auth-screen:before,.auth-screen:after,.auth-card{animation:none!important}}
        `}</style>
        <nav className="navbar">
          <div className="logo"><div className="logo-mark">C</div>CYBERSHIELD</div>
          <div className="nav-status"><span className="status-dot"></span>Secure student access</div>
        </nav>
        <main className="results-page" style={{ minHeight: '75vh', display: 'grid', placeItems: 'center', padding: '32px 20px' }}>
          <section className="email-card auth-card">
            <div className="email-content">
              <span className="scenario-label">WELCOME TO CYBERSHIELD</span>
              <h1>{authMode === 'register' ? <>Create your<br />account</> : 'Welcome back'}</h1>
              <p className="auth-copy">{authMode === 'register' ? 'Create a student account to access security awareness training, assessments and learning activities.' : 'Sign in to continue to your CyberShield learning space.'}</p>
              <form onSubmit={handleStudentAuth}>
                <label htmlFor="student-email">Email address</label>
                <input id="student-email" type="email" autoComplete="email" required maxLength={254} value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} className="auth-input" />
                <label htmlFor="student-password">Password</label>
                <input id="student-password" type="password" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} required minLength={authMode === 'register' ? 10 : 1} maxLength={72} value={studentPassword} onChange={(event) => setStudentPassword(event.target.value)} className="auth-input" />
                {authMode === 'register' && <small style={{ display: 'block', marginBottom: 14 }}>Use at least 10 characters. Your password is securely hashed.</small>}
                {studentAuthError && <p role="alert" style={{ color: '#ff7777', margin: '12px 0' }}>{studentAuthError}</p>}
                <button className="continue-button" type="submit" disabled={studentAuthLoading}>{studentAuthLoading ? 'Please wait...' : authMode === 'register' ? 'Create account →' : 'Sign in →'}</button>
              </form>
              <p style={{ marginTop: 20, textAlign: 'center' }}>
                {authMode === 'register' ? 'Already have an account? ' : 'New to CyberShield? '}
                <button type="button" className="mission-back-button" onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setStudentAuthError('') }}>{authMode === 'register' ? 'Sign in' : 'Create an account'}</button>
              </p>
            </div>
          </section>
        </main>
      </div>
    )
  }

  if (page === 'nickname') {
    return <div className="phishaware nickname-screen">
      <nav className="navbar"><div className="logo"><div className="logo-mark">C</div><span>CYBERSHIELD</span></div><div className="nav-status"><span className="status-dot"></span>Secure student access</div></nav>
      <main className="nickname-shell"><section className="nickname-card">
        <span className="learning-kicker">LEADERBOARD PROFILE</span>
        <h1>Choose your nickname.</h1>
        <p className="auth-copy">This unique name identifies you on the CyberShield leaderboard.</p>
        <form onSubmit={handleNicknameSave}>
          <label htmlFor="first-nickname">Nickname</label>
          <input id="first-nickname" className="auth-input nickname-input" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_-]+" value={studentNickname} onChange={e=>setStudentNickname(e.target.value)} placeholder="e.g. ZeroTrace" autoComplete="off"/>
          <small>3–20 characters · Letters, numbers, underscores and hyphens.</small>
          {studentAuthError && <p className="nickname-error" role="alert">{studentAuthError}</p>}
          <button className="continue-button" type="submit">Save nickname <span aria-hidden="true">→</span></button>
        </form>
      </section></main>
    </div>
  }

  if (page === 'leaderboard') {
    return <div className="phishaware">
      <nav className="navbar"><button className="logo logo-button" onClick={goHome}><div className="logo-mark">C</div>CYBERSHIELD</button><div className="nav-status">LEARNER RANKINGS</div></nav>
      <main className="learning-shell"><button className="learning-back" onClick={goHome}>← Dashboard</button>
        <header className="learning-heading"><span className="learning-kicker">CYBERSHIELD COMMUNITY</span><h1>Leaderboard.</h1><p>Ranked by each learner’s highest completed assessment score.</p></header>
        <section className="leaderboard-card">
          <div className="leaderboard-heading"><div><h2>Top learners</h2><p>Only real learners with completed assessments appear here.</p></div><span className="leaderboard-live"><i></i> LIVE</span></div>
          {leaderboardLoading ? <p>Loading rankings…</p> : leaderboardError ? <p>{leaderboardError}</p> : leaderboard.length ? <div className="leaderboard-list">{leaderboard.map((entry,index)=><div className={`leaderboard-row ${index===0?'leaderboard-first':''}`} key={`${entry.rank}-${entry.nickname}`}><span className="leaderboard-rank">{index===0?'♛':String(entry.rank).padStart(2,'0')}</span><strong>{entry.nickname}</strong><span className="leaderboard-score">{entry.score}<small>/100</small></span></div>)}</div> : <p>Be one of the first learners. Complete an assessment to appear here.</p>}
        </section>
      </main>
      <CyberTabDock activePage="leaderboard" onSelect={navigateCoreTab} />
    </div>
  }

  if (page === 'academy') {
    return <div className="phishaware"><nav className="navbar"><button className="logo logo-button" onClick={goHome}><div className="logo-mark">C</div>CYBERSHIELD</button><div className="nav-status nav-status--positive">{studentSession?.user?.email || 'Learner workspace'}</div></nav><LearningHub onBack={goHome} token={studentSession?.token} apiBaseUrl={API_BASE_URL} /><CyberTabDock activePage="academy" onSelect={navigateCoreTab} /></div>
  }

  if (page === 'threat-intel') {
    return <div className="phishaware"><nav className="navbar"><button className="logo logo-button" onClick={goHome}><div className="logo-mark">C</div>CYBERSHIELD</button><div className="nav-status">SECURITY BRIEFING ROOM</div></nav><ThreatIntel onBack={goHome} /><CyberTabDock activePage="threat-intel" onSelect={navigateCoreTab} /></div>
  }

  if (page === 'achievements') {
    const progress = readAcademyProgress()
    const completedPaths = Object.values(progress).filter(item => item?.completed).length
    const completedLessons = Object.values(progress).reduce((sum,item) => sum + (item?.lessons?.length || 0), 0)
    const awards = [
      {icon:'◈',title:'First Steps',detail:'Complete your first Academy lesson',earned:completedLessons>=1},
      {icon:'◆',title:'Knowledge Builder',detail:'Complete five Academy lessons',earned:completedLessons>=5},
      {icon:'✦',title:'Pathfinder',detail:'Complete one full learning path',earned:completedPaths>=1},
      {icon:'★',title:'Academy Graduate',detail:'Complete all three learning paths',earned:completedPaths>=3},
      {icon:'⬡',title:'Assessment Ready',detail:'Complete the CyberShield assessment',earned:assessmentHistory.length > 0},
    ]
    return <div className="phishaware"><nav className="navbar"><button className="logo logo-button" onClick={goHome}><div className="logo-mark">C</div>CYBERSHIELD</button><div className="nav-status">ACHIEVEMENTS</div></nav><main className="learning-shell"><button className="learning-back" onClick={goHome}>← Dashboard</button><header className="learning-heading"><span className="learning-kicker">YOUR SECURITY JOURNEY</span><h1>Progress worth protecting.</h1><p>Earn recognition by building practical security habits and completing learning activities.</p></header><div className="learning-overview"><div><strong>{completedLessons}</strong><span>Lessons completed</span></div><div><strong>{completedPaths}/3</strong><span>Learning paths completed</span></div><div><strong>{awards.filter(a=>a.earned).length}/{awards.length}</strong><span>Achievements unlocked</span></div></div><div className="achievement-grid">{awards.map(a=><article className={`achievement-card ${a.earned?'earned':''}`} key={a.title}><span className="achievement-icon">{a.earned?a.icon:'🔒'}</span><div><b>{a.title}</b><p>{a.detail}</p><small>{a.earned?'UNLOCKED':'NOT YET EARNED'}</small></div></article>)}</div><button className="learning-primary" onClick={()=>setPage('academy')}>Continue learning →</button></main><CyberTabDock activePage="achievements" onSelect={navigateCoreTab} /></div>
  }

  if (page === 'home') {
    return (
      <div className="phishaware">
        <nav className="navbar">
          <button
            className="logo logo-button"
            onClick={goHome}
          >
            <div className="logo-mark">
              C
            </div>

            CYBERSHIELD
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="nav-status nav-status--positive"><span className="status-dot"></span>{studentSession.user?.email || 'Signed in'}</div>
            <button type="button" className="mission-back-button" onClick={handleStudentLogout}>Sign out</button>
          </div>
        </nav>

        <main>
          <section className="hero">
            <div className="badge">
              AI-POWERED SECURITY AWARENESS
            </div>
            <ShieldGlobe />

            <h1>
              Think before
              <br />
              <span className="gradient-text">
                you click.
              </span>
            </h1>

            <p className="hero-description">
              CYBERSHIELD helps you practise everyday situations involving suspicious messages, phone calls, social media, websites and online payments — so you can spot scams before they cause harm.
            </p>



            <div className="home-launch-grid">

            <button
              className="scam-centre-launch"
              onClick={() => setPage('phone-lab')}
            >
              <span className="scam-centre-launch-icon" aria-hidden="true">▣</span>
              <span className="scam-centre-launch-copy">
                <strong>Smartphone Lab</strong>
                <small>Explore a simulated phone, inspect suspicious messages and practise safe decisions.</small>
              </span>
              <span className="scam-centre-launch-arrow" aria-hidden="true">→</span>
            </button>

            <button
              className="scam-centre-launch"
              onClick={() => setPage('desktop-lab')}
            >
              <span className="scam-centre-launch-icon" aria-hidden="true">▣</span>
              <span className="scam-centre-launch-copy">
                <strong>Windows Lab</strong>
                <small>Investigate suspicious email, websites, downloads and endpoint alerts in a simulated workstation.</small>
              </span>
              <span className="scam-centre-launch-arrow" aria-hidden="true">→</span>
            </button>

              <button className="scam-centre-launch" onClick={() => setPage('leaderboard')}>
                <span className="scam-centre-launch-icon" aria-hidden="true">♛</span>
                <span className="scam-centre-launch-copy"><strong>Leaderboard</strong><small>See learners ranked by their best assessment score.</small></span>
                <span className="scam-centre-launch-arrow" aria-hidden="true">→</span>
              </button>
              <button className="scam-centre-launch" onClick={() => setPage('academy')}>
                <span className="scam-centre-launch-icon" aria-hidden="true">⌘</span>
                <span className="scam-centre-launch-copy"><strong>Learning Paths</strong><small>Build practical security skills.</small></span>
                <span className="scam-centre-launch-arrow" aria-hidden="true">→</span>
              </button>
              <button className="scam-centre-launch" onClick={() => setPage('threat-intel')}>
                <span className="scam-centre-launch-icon" aria-hidden="true">⌁</span>
                <span className="scam-centre-launch-copy"><strong>Threat Intelligence</strong><small>Explore threats and defensive actions.</small></span>
                <span className="scam-centre-launch-arrow" aria-hidden="true">→</span>
              </button>
              <button className="scam-centre-launch" onClick={() => setPage('achievements')}>
                <span className="scam-centre-launch-icon" aria-hidden="true">★</span>
                <span className="scam-centre-launch-copy"><strong>Achievements</strong><small>Track your learning milestones.</small></span>
                <span className="scam-centre-launch-arrow" aria-hidden="true">→</span>
              </button>
            </div>

            <section className="home-learning-strip">
              <div><span className="learning-kicker">LEARNER DEVELOPMENT</span><h2>Build your next security skill.</h2><p>Continue structured lessons, review current attack patterns and track your progress.</p></div>
              <div className="home-learning-actions"><button onClick={() => setPage('academy')}>Learning Paths <span>→</span></button><button onClick={() => setPage('threat-intel')}>Threat Intelligence <span>→</span></button><button onClick={() => setPage('achievements')}>Achievements <span>→</span></button></div>
            </section>

            <div className="home-primary-actions">
              <button
                className="start-button home-assessment-button"
                onClick={startAssessment}
              >
                <span>Start Assessment</span><span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className="home-history-button"
                onClick={() => setPage('history')}
              >
                View assessment history <span aria-hidden="true">↗</span>
              </button>
            </div>

          </section>

          <section className="features">
            <div className="feature-card">
              <div className="feature-icon">
                ◈
              </div>

              <h3>Realistic scenarios</h3>

              <p>
                Experience phishing situations
                designed to reflect real-world
                attacks.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                ✦
              </div>

              <h3>AI evaluation</h3>

              <p>
Your decisions are evaluated against practical phishing-awareness criteria.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                ↗
              </div>

              <h3>Personalised feedback</h3>

              <p>
                Discover your weaknesses and
                receive guidance to improve your
                phishing awareness.
              </p>
            </div>
          </section>
        </main>

        <CyberTabDock activePage="" onSelect={navigateCoreTab} />
        <footer className="footer">
          CYBERSHIELD · Security Awareness
          Assessment
        </footer>
      </div>
    )
  }

  /*
   * HONEYPOT MONITOR
   *
   * IMPORTANT:
   * There is ONLY ONE honeypot page.
   * Do not add another if (page === 'honeypot')
   * block below this.
   */
  

  if (page === 'phone-lab') {
    return (
      <div className="phishaware">
        <nav className="navbar">
          <button className="logo logo-button" onClick={goHome}>
            <div className="logo-mark">C</div>
            CYBERSHIELD
          </button>
          <div className="nav-status nav-status--positive"><span className="status-dot"></span> Isolated training environment</div>
        </nav>
        <PhoneSimulator onBack={goHome} />
        <CyberTabDock activePage="phone-lab" onSelect={navigateCoreTab} />
      </div>
    )
  }

  if (page === 'desktop-lab') {
    return (
      <div className="phishaware">
        <nav className="navbar">
          <button className="logo logo-button" onClick={goHome}>
            <div className="logo-mark">C</div>
            CYBERSHIELD
          </button>
          <div className="nav-status nav-status--positive"><span className="status-dot"></span> Isolated training environment</div>
        </nav>
        <DesktopSimulator onBack={goHome} />
        <CyberTabDock activePage="desktop-lab" onSelect={navigateCoreTab} />
      </div>
    )
  }

  /*
   * BEGINNER MISSION 01 — INTRODUCTION
   */
  if (page === 'mission01') {
    return (
      <div className="phishaware mission-app">
        <nav className="navbar">
          <button className="logo logo-button" onClick={goHome}>
            <div className="logo-mark">C</div>
            CYBERSHIELD
          </button>
          <div className="nav-status">
            <span className="status-dot"></span>
            Interactive Learning
          </div>
        </nav>

        <main className="mission-page">
          <div className="mission-breadcrumb">
            <button type="button" onClick={goHome}>Home</button>
            <span aria-hidden="true">/</span>
            <span>Mission 01</span>
          </div>

          <section className="mission-hero-card">
            <div className="mission-hero-art" aria-hidden="true">
              <div className="mission-art-orbit orbit-one"></div>
              <div className="mission-art-orbit orbit-two"></div>
              <div className="mission-art-shield">✓</div>
              <div className="mission-art-node node-one">●</div>
              <div className="mission-art-node node-two">●</div>
              <div className="mission-art-node node-three">●</div>
              <div className="mission-art-line line-one"></div>
              <div className="mission-art-line line-two"></div>
            </div>

            <div className="mission-intro-copy">
              <span className="mission-eyebrow">YOUR FIRST INVESTIGATION · BEGINNER</span>
              <h1>Something Suspicious Is Happening</h1>
              <p className="mission-lead">
                You do not need to be an IT expert. We will guide you through
                a short, safe activity that teaches you how to recognise a possible cyber threat.
              </p>

              <div className="mission-briefing">
                <div className="mission-briefing-icon" aria-hidden="true">!</div>
                <div>
                  <h2>Your mission</h2>
                  <p>
                    A pretend university computer has received several failed login attempts.
                    Someone might be trying to guess a password. Your job is to investigate
                    the clues and decide what the activity means.
                  </p>
                </div>
              </div>

              <div className="mission-learning-grid">
                <div className="mission-learning-item">
                  <span aria-hidden="true">⌕</span>
                  <div>
                    <strong>What you will do</strong>
                    <p>Look at a simple activity log and make a decision.</p>
                  </div>
                </div>
                <div className="mission-learning-item">
                  <span aria-hidden="true">✦</span>
                  <div>
                    <strong>What you will learn</strong>
                    <p>Why repeated failed logins can be a warning sign.</p>
                  </div>
                </div>
              </div>

              <div className="mission-meta">
                <span><strong>5–10 min</strong><small>Estimated time</small></span>
                <span><strong>Beginner</strong><small>No experience needed</small></span>
                <span><strong>Safe practice</strong><small>Simulated activity only</small></span>
              </div>

              <button
                className="mission-primary-button"
                onClick={() => {
                  setMissionAnswer('')
                  setMissionSubmitted(false)
                  setPage('mission01-investigation')
                }}
              >
                Start Mission <span aria-hidden="true">→</span>
              </button>
              <button className="mission-back-button" onClick={goHome}>
                Back to Home
              </button>
            </div>
          </section>
          <p className="mission-safety-note">
            Training note: this mission uses fictional activity. It does not connect to or attack a real computer.
          </p>
        </main>
      </div>
    )
  }

  /*
   * BEGINNER MISSION 01 — INVESTIGATION
   */
  if (page === 'mission01-investigation') {
    const answerIsCorrect = missionAnswer === 'suspicious'

    return (
      <div className="phishaware mission-app">
        <nav className="navbar">
          <button className="logo logo-button" onClick={goHome}>
            <div className="logo-mark">C</div>
            CYBERSHIELD
          </button>
          <div className="nav-status">
            <span className="status-dot"></span>
            Mission in progress
          </div>
        </nav>

        <main className="mission-page">
          <div className="mission-breadcrumb">
            <button type="button" onClick={() => setPage('mission01')}>Mission briefing</button>
            <span aria-hidden="true">/</span>
            <span>Investigate the clues</span>
          </div>

          <section className="mission-investigation-header">
            <span className="mission-eyebrow">MISSION 01 · STEP 1 OF 3</span>
            <h1>Can you spot what is unusual?</h1>
            <p>
              Read the activity below. You do not need to understand every technical word.
              Look for what happens repeatedly and how quickly it happens.
            </p>
          </section>

          <section className="mission-evidence-card">
            <div className="mission-evidence-heading">
              <div>
                <span className="mission-evidence-kicker">SIMULATED EVIDENCE</span>
                <h2>University computer: Login activity</h2>
              </div>
              <span className="mission-demo-badge">Practice data</span>
            </div>
            <p className="mission-evidence-explainer">
              This is a record of attempts to sign in to a computer. “Failed” means the login
              did not work. The times show how close together the attempts happened.
            </p>
            <div className="mission-log-table" role="table" aria-label="Simulated login activity">
              <div className="mission-log-row mission-log-head" role="row">
                <span role="columnheader">Time</span>
                <span role="columnheader">What happened</span>
                <span role="columnheader">Result</span>
              </div>
              {[
                ['10:41:02', 'Someone tried to sign in as “admin”', 'Failed'],
                ['10:41:03', 'Someone tried to sign in as “admin”', 'Failed'],
                ['10:41:04', 'Someone tried to sign in as “root”', 'Failed'],
                ['10:41:05', 'Someone tried to sign in as “admin”', 'Failed'],
                ['10:41:06', 'Someone tried to sign in as “root”', 'Failed'],
                ['10:41:08', 'A sign-in as “admin” worked', 'Successful'],
              ].map((entry) => (
                <div className="mission-log-row" role="row" key={entry[0]}>
                  <span role="cell">{entry[0]}</span>
                  <span role="cell">{entry[1]}</span>
                  <span role="cell">
                    <span className={entry[2] === 'Failed' ? 'mission-result-failed' : 'mission-result-success'}>
                      {entry[2]}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mission-clue">
              <span aria-hidden="true">💡</span>
              <p><strong>Helpful clue:</strong> Several failed attempts happen within seconds, and then one login succeeds.</p>
            </div>
          </section>

          <section className="mission-question-card">
            <span className="mission-eyebrow">YOUR TURN</span>
            <h2>What do you think is happening?</h2>
            <p>Choose the answer that best matches the clues. It is okay to make a mistake — you will get an explanation.</p>
            <div className="mission-answer-options">
              <button
                type="button"
                className={`mission-answer-option ${missionAnswer === 'normal' ? 'is-selected' : ''}`}
                onClick={() => { setMissionAnswer('normal'); setMissionSubmitted(false) }}
                aria-pressed={missionAnswer === 'normal'}
              >
                <span className="mission-answer-letter">A</span>
                <span><strong>Everything looks normal</strong><small>People sometimes mistype their passwords.</small></span>
              </button>
              <button
                type="button"
                className={`mission-answer-option ${missionAnswer === 'suspicious' ? 'is-selected' : ''}`}
                onClick={() => { setMissionAnswer('suspicious'); setMissionSubmitted(false) }}
                aria-pressed={missionAnswer === 'suspicious'}
              >
                <span className="mission-answer-letter">B</span>
                <span><strong>This looks suspicious</strong><small>Someone may be trying different login details to get access.</small></span>
              </button>
              <button
                type="button"
                className={`mission-answer-option ${missionAnswer === 'phishing' ? 'is-selected' : ''}`}
                onClick={() => { setMissionAnswer('phishing'); setMissionSubmitted(false) }}
                aria-pressed={missionAnswer === 'phishing'}
              >
                <span className="mission-answer-letter">C</span>
                <span><strong>This is definitely a phishing email</strong><small>The evidence is about computer logins, not an email.</small></span>
              </button>
            </div>

            <button
              className="mission-primary-button mission-submit-button"
              disabled={!missionAnswer}
              onClick={() => setMissionSubmitted(true)}
            >
              Check My Answer <span aria-hidden="true">→</span>
            </button>

            {missionSubmitted && (
              <div className={`mission-feedback ${answerIsCorrect ? 'feedback-correct' : 'feedback-retry'}`} role="status" aria-live="polite">
                <h3>{answerIsCorrect ? 'Correct — good investigation!' : 'Good try. Let’s look at the clues again.'}</h3>
                <p>
                  {answerIsCorrect
                    ? 'Repeated failed login attempts in a short time can indicate a brute force attempt — when someone tries many passwords to gain access. The successful login afterwards makes the activity worth investigating further. This example is simulated; the log alone does not prove who was responsible.'
                    : 'Notice how many attempts happened within a few seconds. This pattern may mean someone is trying several login details. Choose “This looks suspicious” to match the evidence.'}
                </p>
                {!answerIsCorrect && (
                  <button type="button" className="mission-secondary-button" onClick={() => { setMissionAnswer(''); setMissionSubmitted(false) }}>
                    Try Again
                  </button>
                )}
                {answerIsCorrect && (
                  <div className="mission-completion">
                    <strong>Mission step complete</strong>
                    <p>You identified a possible login attack and learned why repeated attempts matter.</p>
                    <button type="button" className="mission-primary-button" onClick={() => { setMissionAnswer(''); setMissionSubmitted(false); setSelectedMissionDevice('honeypot'); setPage('mission01-map') }}>
                      Explore the Network Map <span aria-hidden="true">→</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="mission-footer-actions">
            <button className="mission-back-button" onClick={() => setPage('mission01')}>← Back to Mission Briefing</button>
            <button className="mission-back-button" onClick={goHome}>Exit to Home</button>
          </div>
        </main>
      </div>
    )
  }


  /*
   * BEGINNER MISSION 01 — INTERACTIVE NETWORK MAP
   */
  if (page === 'mission01-map') {
    const devices = {
      laptop: {
        name: 'Student laptop',
        category: 'User device',
        status: 'Normal activity',
        tone: 'normal',
        icon: '▣',
        description: 'This represents a student’s computer. In a real network, it sends and receives information through the network.',
        clue: 'No suspicious activity is shown on this device in our fictional scenario.'
      },
      router: {
        name: 'Network router',
        category: 'Network equipment',
        status: 'Connection point',
        tone: 'normal',
        icon: '⌁',
        description: 'A router helps information travel between devices and networks. Think of it as a traffic director for network data.',
        clue: 'The router connects the pretend student laptop and the server in this learning map.'
      },
      server: {
        name: 'University server',
        category: 'Computer providing a service',
        status: 'Login attempts detected',
        tone: 'warning',
        icon: '▤',
        description: 'A server is a computer that provides something to other devices, such as files, websites, or account access.',
        clue: 'This server is the system where repeated login failures were recorded.'
      },
      honeypot: {
        name: 'CYBERSHIELD honeypot',
        category: 'Training decoy',
        status: 'Monitoring simulated activity',
        tone: 'alert',
        icon: '◉',
        description: 'A honeypot is a decoy system designed to attract or record activity that defenders want to study. This one is only a browser-based training illustration.',
        clue: 'The suspicious login pattern is shown here for learning. It is not a real attacker or live network connection.'
      }
    }
    const selectedDevice = devices[selectedMissionDevice] || devices.honeypot

    return (
      <div className="phishaware mission-app">
        <nav className="navbar">
          <button className="logo logo-button" onClick={goHome}>
            <div className="logo-mark">C</div>
            CYBERSHIELD
          </button>
          <div className="nav-status"><span className="status-dot"></span> Mission in progress</div>
        </nav>

        <main className="mission-page mission-map-page">
          <div className="mission-breadcrumb">
            <button type="button" onClick={goHome}>Home</button><span aria-hidden="true">/</span>
            <button type="button" onClick={() => setPage('mission01')}>Mission 01</button><span aria-hidden="true">/</span>
            <span>Network Map</span>
          </div>

          <header className="mission-map-heading">
            <span className="mission-eyebrow">MISSION 01 · EXPLORE</span>
            <h1>Explore the Network</h1>
            <p>Click each device to learn what it does and how it relates to the suspicious login activity. This is a safe, fictional network.</p>
          </header>

          <section className="mission-network-card" aria-label="Interactive fictional network map">
            <div className="mission-network-topline">
              <div><span className="mission-live-dot"></span><strong>Training network</strong></div>
              <span>4 devices · simulated</span>
            </div>
            <div className="mission-network-canvas">
              <svg className="mission-network-lines" viewBox="0 0 800 330" preserveAspectRatio="none" aria-hidden="true">
                <line x1="130" y1="85" x2="400" y2="165" />
                <line x1="400" y1="165" x2="670" y2="85" />
                <line x1="400" y1="165" x2="400" y2="275" />
                <circle cx="400" cy="165" r="5" />
              </svg>
              <button type="button" className={`mission-device device-laptop ${selectedMissionDevice === 'laptop' ? 'device-selected' : ''}`} onClick={() => setSelectedMissionDevice('laptop')} aria-pressed={selectedMissionDevice === 'laptop'}>
                <span className="mission-device-icon">▣</span><strong>Student laptop</strong><small>User device</small>
              </button>
              <button type="button" className={`mission-device device-router ${selectedMissionDevice === 'router' ? 'device-selected' : ''}`} onClick={() => setSelectedMissionDevice('router')} aria-pressed={selectedMissionDevice === 'router'}>
                <span className="mission-device-icon">⌁</span><strong>Router</strong><small>Network link</small>
              </button>
              <button type="button" className={`mission-device device-server ${selectedMissionDevice === 'server' ? 'device-selected' : ''}`} onClick={() => setSelectedMissionDevice('server')} aria-pressed={selectedMissionDevice === 'server'}>
                <span className="mission-device-icon">▤</span><strong>University server</strong><small>Login attempts</small><span className="mission-device-alert">!</span>
              </button>
              <button type="button" className={`mission-device device-honeypot ${selectedMissionDevice === 'honeypot' ? 'device-selected' : ''}`} onClick={() => setSelectedMissionDevice('honeypot')} aria-pressed={selectedMissionDevice === 'honeypot'}>
                <span className="mission-device-icon">◉</span><strong>CYBERSHIELD honeypot</strong><small>Training decoy</small>
              </button>
            </div>
            <p className="mission-network-hint">Tip: select a device above. The information panel below will explain it in plain language.</p>
          </section>

          <section className={`mission-device-details detail-${selectedDevice.tone}`} aria-live="polite">
            <div className="mission-device-details-icon">{selectedDevice.icon}</div>
            <div className="mission-device-details-copy">
              <span className="mission-eyebrow">{selectedDevice.category}</span>
              <h2>{selectedDevice.name}</h2>
              <span className={`mission-device-status status-${selectedDevice.tone}`}>{selectedDevice.status}</span>
              <p>{selectedDevice.description}</p>
              <div className="mission-device-clue"><strong>What this means for your investigation</strong><p>{selectedDevice.clue}</p></div>
            </div>
          </section>

          <section className="mission-next-step-card">
            <div><span className="mission-eyebrow">YOUR NEXT TASK</span><h2>Follow the evidence</h2><p>The university server recorded repeated failed logins. A defender would check the times, account names, and whether a login later succeeded before deciding what to do next.</p></div>
            <button type="button" className="mission-primary-button" onClick={() => { setMissionAnswer(''); setMissionSubmitted(false); setPage('mission01-investigation') }}>Review Login Evidence <span aria-hidden="true">→</span></button>
          </section>

          <div className="mission-footer-actions">
            <button className="mission-back-button" onClick={() => setPage('mission01-investigation')}>← Back to Login Evidence</button>
            <button className="mission-back-button" onClick={goHome}>Exit to Home</button>
          </div>
          <p className="mission-safety-note">Training note: this map is a visual simulation. It does not discover devices or connect to a real network.</p>
        </main>
      </div>
    )
  }


  if (page === 'simulation') {
  return (
    <main className="results-page results-reveal">
      <div className="results-container">
        <header className="results-header">
          <h1>Honeypot Simulation</h1>
          <p>
            Run controlled security simulations and observe
            how CYBERSHIELD records security events.
          </p>
          <p>
            These are simulated events, not real network attacks.
          </p>
        </header>

        <section className="email-card">
          <div className="email-content">
            <div className="email-subject">
              Select a Security Simulation
            </div>

            <div className="choices">
              <button
                className="choice"
                disabled={simulationLoading}
                onClick={() => simulateHoneypotEvent('ssh')}
              >
                <span>
                  <strong>
                    {activeSimulation === 'ssh'
                      ? 'Running SSH Simulation...'
                      : 'SSH Login Attempt'}
                  </strong>
                  <small>Simulate a failed login attempt.</small>
                </span>
              </button>

              <button
                className="choice"
                disabled={simulationLoading}
                onClick={() => simulateHoneypotEvent('bruteForce')}
              >
                <span>
                  <strong>Brute Force Attempt</strong>
                  <small>Simulate repeated authentication failures.</small>
                </span>
              </button>

              <button
                className="choice"
                disabled={simulationLoading}
                onClick={() => simulateHoneypotEvent('portScan')}
              >
                <span>
                  <strong>Port Scan</strong>
                  <small>Simulate suspicious port-scanning activity.</small>
                </span>
              </button>

              <button
                className="choice"
                disabled={simulationLoading}
                onClick={() => simulateHoneypotEvent('suspiciousCommand')}
              >
                <span>
                  <strong>Suspicious Command</strong>
                  <small>Simulate suspicious command activity.</small>
                </span>
              </button>
            </div>

            {simulationLoading && (
              <p>Recording simulated event...</p>
            )}

            {simulationMessage && (
              <p role="status">{simulationMessage}</p>
            )}
          </div>
        </section>

        <div className="choices">
          <button
            className="choice"
            onClick={() => setPage('honeypot')}
          >
            Open Honeypot Monitor →
          </button>

          <button
            className="choice"
            onClick={() => setPage('home')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </main>
  )
}


  /*
   * SCAM AWARENESS CENTRE — everyday digital safety practice
   */
  if (page === 'scam-centre') {
    const scamScenarios = {
      email: {
        label: 'Email & messages',
        icon: '✉',
        title: 'A message says your account will be closed',
        sender: 'Account Support · support@micros0ft-check.example',
        message: 'Your account will be suspended today. Confirm your password using the link below to keep access.',
        question: 'What is the safest next step?',
        choices: [
          { id: 'click', label: 'Click the link before the deadline', description: 'The message sounds urgent.' },
          { id: 'verify', label: 'Open the official app or website yourself', description: 'Do not use the message link.' },
          { id: 'reply', label: 'Reply and ask if the message is real', description: 'The sender may not be who they claim.' },
        ],
        correct: 'verify',
        feedback: 'Urgency and requests for passwords are warning signs. Open the service using an app or web address you already know, or contact support through its official channel. Never share your password or one-time PIN.'
      },
      phone: {
        label: 'Phone calls',
        icon: '☎',
        title: 'Someone claiming to be your bank calls',
        sender: 'Incoming call · “Bank Fraud Department”',
        message: 'The caller says your account is under attack and asks you to read out the one-time PIN sent to your phone so they can “block the fraud”.',
        question: 'What should you do?',
        choices: [
          { id: 'pin', label: 'Read out the PIN to stop the fraud', description: 'A caller who sounds confident can still be a scammer.' },
          { id: 'hangup', label: 'End the call and contact your bank yourself', description: 'Use the number on your bank card or official app.' },
          { id: 'details', label: 'Give your ID number first', description: 'Personal details can also be misused.' },
        ],
        correct: 'hangup',
        feedback: 'Never share a one-time PIN, password or banking approval with an incoming caller. End the call and contact your bank using a trusted number or the official banking app.'
      },
      social: {
        label: 'Social media',
        icon: '◎',
        title: 'A friend messages you for urgent money',
        sender: 'Direct message · Your friend’s profile',
        message: '“Hey, I’m locked out and need money urgently. Please send it to this new account. I’ll explain later.”',
        question: 'What is the safest response?',
        choices: [
          { id: 'send', label: 'Send the money because it is your friend', description: 'Their account may have been taken over.' },
          { id: 'verify', label: 'Verify with your friend another way', description: 'Call their known number or speak in person.' },
          { id: 'post', label: 'Post their message publicly', description: 'This does not verify who sent it.' },
        ],
        correct: 'verify',
        feedback: 'A real account can be compromised. Verify unusual requests using another trusted channel before sending money, sharing codes or clicking links.'
      },
      website: {
        label: 'Websites & QR codes',
        icon: '⌘',
        title: 'A delivery text asks you to pay a small fee',
        sender: 'SMS · “Parcel delivery failed”',
        message: 'Your parcel is on hold. Scan this QR code or open the link to pay a small redelivery fee and enter your card details.',
        question: 'What should you do?',
        choices: [
          { id: 'pay', label: 'Pay the small fee to release the parcel', description: 'A small amount can still expose card details.' },
          { id: 'official', label: 'Check the delivery using the official app or website', description: 'Find the service independently.' },
          { id: 'scan', label: 'Scan the QR code to see where it goes', description: 'QR codes can hide unsafe links.' },
        ],
        correct: 'official',
        feedback: 'Do not rely on links or QR codes in unexpected messages. Check your parcel through the delivery company’s official app or website, using details you already trust.'
      },
      shopping: {
        label: 'Shopping & payments',
        icon: '▣',
        title: 'A seller asks for proof of payment before you pay',
        sender: 'Online marketplace · Private seller',
        message: 'The seller offers a bargain and sends a screenshot saying the payment platform is “down”. They ask you to pay by instant transfer and promise to ship later.',
        question: 'What is the safer choice?',
        choices: [
          { id: 'transfer', label: 'Pay by instant transfer to secure the bargain', description: 'It may be difficult to recover the money.' },
          { id: 'protected', label: 'Use the platform’s protected payment method', description: 'Keep communication and payment on the trusted platform.' },
          { id: 'screenshot', label: 'Trust the screenshot as proof', description: 'Screenshots can be edited or misleading.' },
        ],
        correct: 'protected',
        feedback: 'Be wary of pressure, unusually low prices and requests to move payment off-platform. Use trusted payment methods, check the seller and never treat a screenshot as proof that money has cleared.'
      },
      recovery: {
        label: 'If you were scammed',
        icon: '♡',
        title: 'You clicked a link and entered your password',
        sender: 'What happened next?',
        message: 'You now suspect the message was fake. It is normal to feel worried, but acting quickly can reduce harm.',
        question: 'What should you do first?',
        choices: [
          { id: 'wait', label: 'Wait to see if anything happens', description: 'A scammer may already have your details.' },
          { id: 'secure', label: 'Use the real service to change your password and secure the account', description: 'Use a trusted device and official website or app.' },
          { id: 'reply', label: 'Reply to the message and ask them to delete your details', description: 'Do not continue engaging with the suspected scammer.' },
        ],
        correct: 'secure',
        feedback: 'Use the official app or website to change the compromised password, and change it anywhere else you reused it. Enable multi-factor authentication, sign out other sessions if possible, and contact your bank immediately if you shared financial information or approved a payment. Report the message and ask a trusted person for help if needed.'
      }
    }
    const activeScam = scamScenarios[selectedScamScenario]
    const scenarioOrderSeed = { email: 0, phone: 1, social: 2, website: 3, shopping: 4, recovery: 5 }[selectedScamScenario] || 0
    const orderedScamChoices = [...activeScam.choices].sort((a, b) => {
      const aRank = (activeScam.choices.indexOf(a) + scenarioOrderSeed) % activeScam.choices.length
      const bRank = (activeScam.choices.indexOf(b) + scenarioOrderSeed) % activeScam.choices.length
      return aRank - bRank
    })
    const choiceIsCorrect = scamChoice === activeScam.correct
    const scamKeys = Object.keys(scamScenarios)
    const completedScams = scamKeys.filter((key) => scamProgress[key]?.answered).length
    const correctScams = scamKeys.filter((key) => scamProgress[key]?.correct).length
    const scamPercent = completedScams ? Math.round((correctScams / completedScams) * 100) : 0

    const recordScamAnswer = async () => {
      if (!scamChoice) return
      const updatedProgress = {
        ...scamProgress,
        [selectedScamScenario]: {
          answered: true,
          correct: choiceIsCorrect,
          choice: scamChoice,
        },
      }
      setScamProgress(updatedProgress)
      setScamChecked(true)
      await saveScamProgress(updatedProgress)
    }

    if (showScamResults) {
      return (
        <div className="phishaware scam-centre-page">
          <nav className="navbar">
            <button className="logo logo-button" onClick={goHome}><div className="logo-mark">C</div> CYBERSHIELD</button>
            <div className="nav-status"><span className="status-dot"></span> Your learning summary</div>
          </nav>
          <main className="scam-centre-content scam-results-content">
            <div className="scam-centre-breadcrumb"><button onClick={goHome}>Home</button><span>/</span><button onClick={() => setShowScamResults(false)}>Scam Awareness Centre</button><span>/</span><span>Results</span></div>
            <header className="scam-centre-header">
              <span className="scenario-label">YOUR PRACTICE RESULTS</span>
              <h1>{completedScams === scamKeys.length ? 'Practice complete!' : 'Your progress so far'}</h1>
              <p>This score reflects your choices in these fictional practice situations. It is a learning guide, not a guarantee that every real scam will be detected.</p>
            </header>
            <section className="scam-score-hero">
              <div className="scam-score-ring"><strong>{scamPercent}%</strong><span>correct</span></div>
              <div className="scam-score-copy">
                <h2>{correctScams} of {completedScams} completed scenarios answered safely</h2>
                <p>{completedScams < scamKeys.length ? `You've completed ${completedScams} of ${scamKeys.length} scenarios. Return to the centre to finish the remaining practice.` : scamPercent === 100 ? 'Excellent work. You chose the safer response in every scenario.' : scamPercent >= 67 ? 'Good progress. Review the explanations for any choices you missed, then practise again.' : 'Keep practising. Scams often use urgency and trust to pressure people. Review the advice and try again.'}</p>
              </div>
            </section>
            <section className="scam-results-list">
              <h2>Scenario breakdown</h2>
              {scamKeys.map((key) => {
                const item = scamScenarios[key]
                const result = scamProgress[key]
                return (
                  <div className="scam-result-row" key={key}>
                    <span className={`scam-result-status ${!result?.answered ? 'pending' : result.correct ? 'passed' : 'needs-review'}`}>{!result?.answered ? 'Not tried' : result.correct ? 'Safe choice' : 'Review'}</span>
                    <div><strong>{item.label}</strong><p>{!result?.answered ? 'Choose this category in the centre to practise this situation.' : result.correct ? 'You selected the safer response.' : `Remember: ${item.feedback}`}</p></div>
                    <button type="button" onClick={() => { setSelectedScamScenario(key); setScamChoice(''); setScamChecked(false); setScamClueOpen(false); setShowScamResults(false) }}>Practise</button>
                  </div>
                )
              })}
            </section>
            <div className="scam-results-actions">
              <button className="start-button" onClick={() => setShowScamResults(false)}>Return to Scam Awareness Centre</button>
              <button className="mission-back-button" onClick={async () => { setScamProgress({}); setSelectedScamScenario('email'); setScamChoice(''); setScamChecked(false); setScamClueOpen(false); setShowScamResults(false); await saveScamProgress({}) }}>Reset progress and try again</button>
            </div>
            <p className={`scam-save-status ${scamSaveStatus}`} role="status">
              {scamSaveStatus === 'loading' ? 'Loading saved progress…' : scamSaveStatus === 'saving' ? 'Saving your progress…' : scamSaveStatus === 'saved' ? '✓ Progress saved anonymously' : scamSaveStatus === 'error' ? 'Progress could not be saved' : 'Progress has not been saved yet'}
            </p>
            {scamLoadError && <p className="scam-save-error" role="alert">{scamLoadError}</p>}
            <p className="scam-centre-disclaimer">Progress is saved anonymously in the local CYBERSHIELD database for this browser profile. No name or email address is required.</p>
          </main>
        </div>
      )
    }

    return (
      <div className="phishaware scam-centre-page">
        <nav className="navbar">
          <button className="logo logo-button" onClick={goHome}>
            <div className="logo-mark">C</div>
            CYBERSHIELD
          </button>
          <div className="nav-status">
            <span className="status-dot"></span>
            Everyday digital safety
          </div>
        </nav>

        <main className="scam-centre-content">
          <div className="scam-centre-breadcrumb">
            <button onClick={goHome}>Home</button><span>/</span><span>Scam Awareness Centre</span>
          </div>
          <header className="scam-centre-header">
            <span className="scenario-label">REAL-LIFE SCAM PRACTICE</span>
            <h1>Pause. Check. Protect yourself.</h1>
            <p>Practise everyday situations before they happen in real life. No technical knowledge needed, and none of these activities contact a real person or website.</p>
          </header>

          <section className="scam-progress-card simulation-session-card" aria-label="Simulation session progress">
            <div className="scam-progress-labels"><strong>Your practice session</strong><span>{phishingSimulation.events.length} actions recorded</span></div>
            <div className="scam-progress-track" role="progressbar" aria-label="Simulation activity" aria-valuemin={0} aria-valuemax={10} aria-valuenow={Math.min(phishingSimulation.events.length, 10)}><span style={{ width: `${Math.min(phishingSimulation.events.length / 10, 1) * 100}%` }} /></div>
            <div className="scam-progress-bottom"><span>Session score: {phishingSimulation.points} points</span><span>Explore the device and learn from each action.</span></div>
            <p className={`scam-save-status ${scamSaveStatus}`} role="status">
              {scamSaveStatus === 'loading' ? 'Loading saved progress…' : scamSaveStatus === 'saving' ? 'Saving your progress…' : scamSaveStatus === 'saved' ? '✓ Previous learning progress saved anonymously' : scamSaveStatus === 'error' ? 'Previous learning progress could not be loaded' : 'Explore the simulation to begin'}
            </p>
            {scamLoadError && <p className="scam-save-error" role="alert">{scamLoadError}</p>}
          </section>

          <section className="scam-category-grid" aria-label="Choose a scam topic">
            {Object.entries(scamScenarios).map(([key, item]) => (
              <button
                key={key}
                className={`scam-category-card ${selectedScamScenario === key ? 'active' : ''}`}
                onClick={() => { setSelectedScamScenario(key); setScamChoice(''); setScamChecked(false); setScamClueOpen(false); setPhishingSimulation({ stage: 'email', busy: false, message: '', events: [], points: 0 }); setSelectedInboxMessage('student') }}
                aria-pressed={selectedScamScenario === key}
              >
                <span className="scam-category-icon" aria-hidden="true">{item.icon}</span>
                <strong>{item.label}</strong>
                <small>{key === 'recovery' ? 'What to do after a mistake' : `Practise a ${item.label.toLowerCase()} situation`}</small>
              </button>
            ))}
          </section>

          <section className="scam-practice-card">
            <div className="scam-practice-topline">
              <span className="scenario-label">PRACTICE SCENARIO</span>
              <span className="scam-fiction-badge">Fictional example</span>
            </div>
            <h2>{activeScam.title}</h2>

            <div className="device-simulation-shell">
              <div className="device-topbar">
                <div className="device-window-controls"><i></i><i></i><i></i></div>
                <span>CYBERSHIELD DEVICE SIMULATION</span>
                <span className="device-demo-pill">TRAINING MODE</span>
              </div>
              <div className="device-statusbar"><span>09:41</span><span>●●●  Wi-Fi  ▰</span></div>
              <div className="device-app-tabs" role="tablist" aria-label="Simulated device apps">
                {[['email','✉','Mail'],['social','◎','Social'],['website','⌘','Browser'],['shopping','▣','Shop'],['phone','☎','Phone'],['recovery','＋','Safety']].map(([key, icon, label]) => (
                  <button key={key} type="button" role="tab" aria-selected={selectedScamScenario === key} className={selectedScamScenario === key ? 'device-app-tab active' : 'device-app-tab'} onClick={() => { setSelectedScamScenario(key); setScamChoice(''); setScamChecked(false); setScamClueOpen(false); setPhishingSimulation({ stage: 'email', busy: false, message: '', events: [], points: 0 }) }}><span>{icon}</span>{label}</button>
                ))}
              </div>
              {['landing', 'submitted'].includes(phishingSimulation.stage) ? (
                <div className="device-browser-view">
                  <div className="device-browser-toolbar"><button type="button" onClick={() => setPhishingSimulation((current) => ({ ...current, stage: 'email', message: '' }))} aria-label="Back to previous app">←</button><span className="device-address"><span>⚠</span> {selectedScamScenario === 'shopping' ? 'pay-marketplace.example/checkout' : selectedScamScenario === 'social' ? 'secure-transfer.example/claim' : selectedScamScenario === 'website' ? 'parcel-redelivery.example/pay' : 'student-verify.example/login'}</span><span>↻</span></div>
                  <div className="device-browser-warning"><strong>⚠ Suspicious website · Simulation</strong><p>This is a local training screen inside CYBERSHIELD. It does not connect to a real website.</p></div>
                  <div className="device-fake-site">
                    <div className="device-fake-brand"><span>{selectedScamScenario === 'shopping' ? 'S' : selectedScamScenario === 'website' ? 'P' : 'C'}</span><strong>{selectedScamScenario === 'shopping' ? 'Marketplace Secure Pay' : selectedScamScenario === 'website' ? 'Parcel Delivery' : selectedScamScenario === 'social' ? 'Quick Transfer' : 'Student Portal'}</strong></div>
                    <h3>{selectedScamScenario === 'shopping' ? 'Complete your payment' : selectedScamScenario === 'website' ? 'Pay redelivery fee' : selectedScamScenario === 'social' ? 'Claim your transfer' : 'Verify your account'}</h3>
                    <p>{selectedScamScenario === 'shopping' ? 'The seller asks you to pay outside the protected marketplace.' : selectedScamScenario === 'website' ? 'A small fee is requested before your parcel can be released.' : selectedScamScenario === 'social' ? 'The message asks you to act quickly and send money to new details.' : 'Your account may be suspended unless you verify it immediately.'}</p>
                    <div className="device-fake-field"><span>{selectedScamScenario === 'shopping' || selectedScamScenario === 'website' ? 'Payment details' : 'Account details'}</span><strong>Disabled in training mode</strong></div>
                    <div className="device-fake-field"><span>Security check</span><strong>No personal data collected</strong></div>
                    <button type="button" className="phishing-sim-primary" disabled={phishingSimulation.busy || phishingSimulation.stage === 'submitted'} onClick={() => recordPhishingSimulationEvent('mock_action_attempted')}>{phishingSimulation.stage === 'submitted' ? 'Action recorded — no data sent' : 'Continue (simulation only) →'}</button>
                    <button type="button" className="phishing-sim-secondary" onClick={() => { setPhishingSimulation((current) => ({ ...current, stage: 'feedback', message: 'You stopped before submitting anything. In a real situation, close the page and verify independently.' })); recordPhishingSimulationEvent('safe_exit_selected') }}>Stop and leave</button>
                  </div>
                  <div className="device-warning-list"><strong>Warning signs to review</strong><span>• Unexpected request and urgency</span><span>• Unverified web address</span><span>• Request for sensitive details or payment</span></div>
                </div>
              ) : selectedScamScenario === 'email' ? (
                <div className="device-mail-view">
                  <div className="device-app-heading"><div><small>MAILBOX</small><h3>Inbox <span>3</span></h3></div><button type="button" onClick={() => recordPhishingSimulationEvent('email_reported')}>Report selected</button></div>
                  <div className="device-message-list">
                    <button type="button" className={`device-message-row ${selectedInboxMessage === 'student' ? 'selected' : ''}`} onClick={() => { setSelectedInboxMessage('student'); recordPhishingSimulationEvent('inbox_message_opened') }}><span className="device-message-avatar blue">U</span><span><strong>Student Portal</strong><small>Action required: Verify your account</small><em>Your account will be suspended unless...</em></span><time>09:41</time></button>
                    <button type="button" className={`device-message-row ${selectedInboxMessage === 'library' ? 'selected' : ''}`} onClick={() => { setSelectedInboxMessage('library'); setPhishingSimulation((current) => ({ ...current, message: 'This is a safe sample reminder. The sender and request should still be checked.' })); }}><span className="device-message-avatar">L</span><span><strong>Library Services</strong><small>Book return reminder</small><em>Your borrowed book is due this week.</em></span><time>08:15</time></button>
                    <button type="button" className={`device-message-row ${selectedInboxMessage === 'parcel' ? 'selected' : ''}`} onClick={() => { setSelectedInboxMessage('parcel'); setSelectedScamScenario('website'); setPhishingSimulation({ stage: 'email', busy: false, message: 'This delivery message is also a fictional practice item. Check delivery status in the official app.', events: [], points: 0 }); }}><span className="device-message-avatar amber">P</span><span><strong>Parcel Delivery</strong><small>Delivery problem: action required</small><em>Pay a small fee to release your parcel.</em></span><time>Yesterday</time></button>
                  </div>
                  <article className="device-open-email"><div className="device-email-subject">{selectedInboxMessage === 'library' ? 'Book return reminder' : selectedInboxMessage === 'parcel' ? 'Delivery problem: action required' : 'Action required: Verify your account'}</div><div className="device-email-sender"><span className={`device-message-avatar ${selectedInboxMessage === 'parcel' ? 'amber' : 'blue'}`}>{selectedInboxMessage === 'library' ? 'L' : selectedInboxMessage === 'parcel' ? 'P' : 'U'}</span><div><strong>{selectedInboxMessage === 'library' ? 'Library Services' : selectedInboxMessage === 'parcel' ? 'Parcel Delivery' : 'Student Portal Support'}</strong><small>{selectedInboxMessage === 'library' ? 'library@campus.example' : selectedInboxMessage === 'parcel' ? 'delivery@parcel-redelivery.example' : 'support@student-verify.example'}</small><small>To: student · Details ▾</small></div><button type="button" onClick={() => setScamClueOpen((open) => !open)}>Details</button></div>{scamClueOpen && <div className="device-sender-details"><strong>Sender address</strong><span>{selectedInboxMessage === 'library' ? 'library@campus.example' : selectedInboxMessage === 'parcel' ? 'delivery@parcel-redelivery.example' : 'support@student-verify.example'}</span><strong>Reply-to</strong><span>unverified-mailbox.example</span></div>}{selectedInboxMessage === 'library' ? <><p>Hello,</p><p>Your borrowed book is due this week. You can review the return date through the official library portal.</p><button type="button" className="device-email-link" onClick={() => setPhishingSimulation((current) => ({ ...current, message: 'This sample message has no risky action. Check the library portal using your usual bookmark.' }))}>View library reminder <span>↗</span></button></> : selectedInboxMessage === 'parcel' ? <><p>Your parcel is on hold. Pay a small redelivery fee today or the package may be returned.</p><button type="button" className="device-email-link" disabled={phishingSimulation.busy} onClick={() => { setSelectedScamScenario('website'); recordPhishingSimulationEvent('qr_link_opened') }}>Pay redelivery fee <span>↗</span></button></> : <><p>Dear Student,</p><p>Your student account will be temporarily suspended unless you verify your details today. Use the button below to avoid losing access to your learning materials.</p><button type="button" className="device-email-link" disabled={phishingSimulation.busy} onClick={() => recordPhishingSimulationEvent('suspicious_link_clicked')}>Verify Student Account <span>↗</span></button></>}<div className="device-email-footer">Kind regards,<br/>Student Support Team</div></article>
                  <div className="device-action-bar"><button type="button" onClick={() => recordPhishingSimulationEvent('email_reported')}>⚑ Report phishing</button><button type="button" onClick={() => recordPhishingSimulationEvent('safe_exit_selected')}>Archive / leave</button></div>
                </div>
              ) : selectedScamScenario === 'phone' ? (
                <div className="device-phone-view"><div className="device-call-avatar">☎</div><small>INCOMING CALL · SIMULATION</small><h3>Bank Fraud Department</h3><p>{activeScam.message}</p><div className="device-call-actions"><button type="button" onClick={() => recordPhishingSimulationEvent('safe_exit_selected')}>Decline call</button><button type="button" onClick={() => recordPhishingSimulationEvent('phone_answered')}>Answer</button></div>{phishingSimulation.stage === 'feedback' && <div className="device-call-transcript"><strong>Caller says:</strong><p>“Read me the one-time code so I can protect your account.”</p><button type="button" className="phishing-sim-primary" onClick={() => recordPhishingSimulationEvent('phone_shared_code_attempted')}>Read out code (risky choice)</button><button type="button" className="phishing-sim-secondary" onClick={() => recordPhishingSimulationEvent('safe_exit_selected')}>Refuse and hang up</button></div>}</div>
              ) : selectedScamScenario === 'social' ? (
                <div className="device-social-view"><div className="device-app-heading"><div><small>SOCIAL · MESSAGES</small><h3>Jamie M. <span>●</span></h3></div><span>•••</span></div><div className="device-social-profile"><span className="device-message-avatar purple">J</span><div><strong>Jamie M. · @jamie_student</strong><small>Fictional profile · 342 followers</small></div><button type="button" onClick={() => recordPhishingSimulationEvent('social_profile_opened')}>View profile</button></div><div className="device-chat-bubble">{activeScam.message}</div><div className="device-chat-bubble received">“Please use these new payment details, I’m in a rush.”</div><div className="device-chat-actions"><button type="button" onClick={() => recordPhishingSimulationEvent('social_payment_clicked')}>Send money</button><button type="button" onClick={() => recordPhishingSimulationEvent('email_reported')}>Report message</button><button type="button" onClick={() => recordPhishingSimulationEvent('safe_exit_selected')}>Verify another way</button></div></div>
              ) : selectedScamScenario === 'shopping' ? (
                <div className="device-shop-view"><div className="device-app-heading"><div><small>MARKETPLACE</small><h3>Today's deal</h3></div><span>♡</span></div><div className="device-product-visual">🎧<small>Illustration only</small></div><h3>Wireless headphones</h3><div className="device-product-price">R199 <del>R1,499</del></div><p>{activeScam.message}</p><div className="device-seller-card"><strong>Seller: New account</strong><span>Requests direct bank transfer</span><span>Buyer protection: Not available</span></div><div className="device-shop-actions"><button type="button" onClick={() => recordPhishingSimulationEvent('marketplace_checkout_clicked')}>Buy now / pay seller</button><button type="button" onClick={() => recordPhishingSimulationEvent('email_reported')}>Report listing</button></div></div>
              ) : selectedScamScenario === 'website' ? (
                <div className="device-web-message-view"><div className="device-app-heading"><div><small>MESSAGES</small><h3>Parcel Delivery</h3></div><span>09:41</span></div><div className="device-sms-bubble">{activeScam.message}<button type="button" className="device-inline-link" onClick={() => recordPhishingSimulationEvent('qr_link_opened')}>parcel-redelivery.example/pay-fee ↗</button></div><div className="device-qr-card"><div className="device-fake-qr">▦<span>QR</span></div><div><strong>Redelivery payment</strong><small>Scan code or open the address above</small><button type="button" onClick={() => recordPhishingSimulationEvent('qr_link_opened')}>Open link in browser →</button></div></div><p className="device-muted-note">The link and QR code are simulated controls. They cannot contact an external site.</p></div>
              ) : (
                <div className="device-recovery-view"><div className="device-app-heading"><div><small>ACCOUNT SAFETY</small><h3>Secure your account</h3></div><span>✓</span></div><p>{activeScam.message}</p>{['Open the official service directly','Change the affected password','Change reused passwords elsewhere','Enable multi-factor authentication','Contact your bank if financial details were involved'].map((task, index) => <label key={task} className="device-recovery-task"><input type="checkbox" onChange={(event) => { if (event.target.checked) recordPhishingSimulationEvent('recovery_action_selected') }}/><span>{task}</span></label>)}<button type="button" className="phishing-sim-secondary" onClick={() => recordPhishingSimulationEvent('safe_exit_selected')}>Finish safety checklist</button></div>
              )}
              {phishingSimulation.message && <div className="device-live-feedback" role="status"><strong>Activity feedback</strong><p>{phishingSimulation.message}</p><span>Session score change: {phishingSimulation.points || 0} points</span>{phishingSimulation.stage === 'reported' && <button type="button" onClick={() => setPhishingSimulation((current) => ({ ...current, stage: 'email', message: '' }))}>Back to inbox</button>}</div>}
              <div className="device-bottom-nav"><span>● Home</span><span>◉ Apps</span><span>▢ Activity</span><span>⚙ Settings</span></div>
            </div>
            <p className="scam-demo-note">Interactive fictional device. Links stay inside this training experience; no real calls, payments or credentials are used.</p>
            <div className="scam-inspect-row"><span>Want a clue? Inspect warning signs before deciding.</span><button type="button" onClick={() => setScamClueOpen((open) => !open)} aria-expanded={scamClueOpen}>{scamClueOpen ? 'Hide clues −' : 'Inspect clues +'}</button></div>
            {scamClueOpen && <div className="scam-clue-panel"><strong>Things worth checking</strong><ul>{(selectedScamScenario === 'phone' ? ['The caller contacted you unexpectedly.', 'They are asking for a one-time PIN or sensitive details.', 'You can end the call and contact the bank using a trusted number.'] : selectedScamScenario === 'social' ? ['A familiar account can be taken over.', 'The request asks for urgent money and new payment details.', 'Verify with your friend using a different channel.'] : selectedScamScenario === 'shopping' ? ['The price may be unrealistically low.', 'The seller is pushing a direct transfer.', 'Use platform protections and check seller history.'] : selectedScamScenario === 'recovery' ? ['Use trusted official channels.', 'Secure affected accounts and any reused passwords.', 'Contact your bank promptly if financial details may be at risk.'] : selectedScamScenario === 'website' ? ['The message was unexpected and creates urgency.', 'The address is not independently verified.', 'QR codes can hide unsafe destinations.'] : ['The message threatens account closure.', 'It asks you to verify sensitive information.', 'Use the official app or website instead of the message link.']).map((clue) => <li key={clue}>{clue}</li>)}</ul></div>}

            <div className="simulation-learning-note">
              <span className="scenario-label">LEARN BY DOING</span>
              <h3>Explore the simulated device</h3>
              <p>Open messages, inspect sender details, try the simulated links, and choose how to respond. CYBERSHIELD records your actions and explains the risks as you go — there is no extra multiple-choice quiz here.</p>
              <ul>
                <li>Pause when a message creates urgency or asks for sensitive information.</li>
                <li>Use <strong>Inspect clues</strong> when you want help spotting warning signs.</li>
                <li>Never enter a real password, PIN, banking detail or identity number.</li>
              </ul>
            </div>
          </section>

          <section className="scam-safety-rules">
            <h2>Remember these three habits</h2>
            <div className="scam-safety-rule-grid">
              <div><span>01</span><strong>Pause</strong><p>Urgency and fear are often used to rush decisions.</p></div>
              <div><span>02</span><strong>Verify</strong><p>Contact the person or organisation using details you find independently.</p></div>
              <div><span>03</span><strong>Protect</strong><p>Never share passwords, one-time PINs or banking approval codes.</p></div>
            </div>
          </section>

          <div className="scam-centre-footer-actions">
            <button className="mission-back-button" onClick={goHome}>← Back to Home</button>
          </div>
          <p className="scam-centre-disclaimer">All messages and scenarios here are fictional practice examples. CYBERSHIELD does not ask for real passwords, PINs, banking details or identity numbers.</p>
        </main>
      </div>
    )
  }

  if (page === 'honeypot' && !adminToken) {
    return (
      <div className="phishaware">
        <nav className="navbar">
          <button className="logo logo-button" onClick={goHome}>
            <div className="logo-mark">C</div>
            CYBERSHIELD
          </button>
          <div className="nav-status"><span className="status-dot"></span>Admin sign-in required</div>
        </nav>
        <main className="results-page results-reveal">
          <section className="email-card" style={{ maxWidth: 520, margin: '48px auto' }}>
            <div className="email-content">
              <span className="scenario-label">RESTRICTED AREA</span>
              <h1>Admin login</h1>
              <p>Sign in with an administrator account to view honeypot telemetry and submit controlled simulations.</p>
              <form onSubmit={handleAdminLogin}>
                <label htmlFor="admin-email">Email</label>
                <input id="admin-email" type="email" autoComplete="username" required value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} className="auth-input" />
                <label htmlFor="admin-password">Password</label>
                <input id="admin-password" type="password" autoComplete="current-password" required value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} className="auth-input" />
                {adminLoginError && <p role="alert" style={{ color: '#c0392b' }}>{adminLoginError}</p>}
                <button className="continue-button" type="submit" disabled={adminLoginLoading}>
                  {adminLoginLoading ? 'Signing in...' : 'Sign in securely →'}
                </button>
              </form>
              <p style={{ marginTop: 16, fontSize: 13 }}>Use your configured admin account. Do not enter these credentials on a public or shared computer.</p>
              <button className="mission-back-button" onClick={goHome}>← Back to Home</button>
            </div>
          </section>
        </main>
      </div>
    )
  }

  if (page === 'honeypot') {
    return (
      <div className="phishaware">
        <nav className="navbar">
          <button
            className="logo logo-button"
            onClick={goHome}
          >
            <div className="logo-mark">
              C
            </div>

            CYBERSHIELD
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="nav-status">
              <span className="status-dot"></span>
              Honeypot monitoring
            </div>
            <button className="mission-back-button" onClick={handleAdminLogout}>Log out</button>
          </div>
        </nav>

        <main className="results-page results-reveal">
          <div className="assessment-header">
            <span className="scenario-label">
              HONEYPOT MONITOR
            </span>

            <h1>
              Security activity detected.
            </h1>

            <p>
              CYBERSHIELD is monitoring the
              honeypot for suspicious activity
              and unauthorized access attempts.
            </p>


  <section className="email-card">
    <div className="email-content">
      <div className="email-subject">
        Honeypot Attack Simulator
      </div>

      <p>
        Run controlled security simulations and watch
        the resulting events appear in the monitoring dashboard.
        These are simulated events, not real network attacks.
      </p>

      <div className="choices">
        <button
          className="choice"
          disabled={simulationLoading}
          onClick={() => simulateHoneypotEvent('ssh')}
        >
          <span>
            <strong>SSH Login Attempt</strong>
            <small>Simulate a failed login attempt.</small>
          </span>
        </button>

        <button
          className="choice"
          disabled={simulationLoading}
          onClick={() => simulateHoneypotEvent('bruteForce')}
        >
          <span>
            <strong>Brute Force Attempt</strong>
            <small>Simulate repeated authentication failures.</small>
          </span>
        </button>

        <button
          className="choice"
          disabled={simulationLoading}
          onClick={() => simulateHoneypotEvent('portScan')}
        >
          <span>
            <strong>Port Scan</strong>
            <small>Simulate suspicious port-scanning activity.</small>
          </span>
        </button>

        <button
          className="choice"
          disabled={simulationLoading}
          onClick={() => simulateHoneypotEvent('suspiciousCommand')}
        >
          <span>
            <strong>Suspicious Command</strong>
            <small>Simulate suspicious command activity.</small>
          </span>
        </button>
      </div>

      {simulationLoading && (
        <p>Recording simulated event...</p>
      )}

      {simulationMessage && (
        <p role="status">{simulationMessage}</p>
      )}
    </div>
  </section>


          </div>


          {honeypotLoading && (
            <section className="email-card">
              <div className="email-content">
                Loading honeypot data...
              </div>
            </section>
          )}

          {!honeypotLoading &&
            honeypotError && (
              <section className="email-card">
                <div className="email-content">
                  <div className="email-subject">
                    Honeypot connection error
                  </div>

                  <p>
                    {honeypotError}
                  </p>

                  <button
                    className="continue-button"
                    onClick={
                      loadHoneypot
                    }
                  >
                    Try Again →
                  </button>
                </div>
              </section>
            )}

          {!honeypotLoading &&
            !honeypotError &&
            honeypotStatus && (
              <>
                <section className="score-card score-card-reveal">
                  <div className="score-circle score-circle-animated" aria-label={`Score ${results.score} out of 100`}>
                    <span>●</span>
                    <small>
                      ACTIVE
                    </small>
                  </div>

                  <div className="score-information">
                    <span className="risk-label">
                      HONEYPOT ACTIVE
                    </span>

                    <h2>
                      {
                        honeypotStatus.honeypot
                      }
                    </h2>

                    <p>
                      The honeypot is currently
                      monitoring and recording
                      suspicious security
                      activity.
                    </p>
                  </div>
                </section>

                <section className="results-grid">
                  <div className="result-panel">
                    <div className="result-panel-icon">
                      !
                    </div>

                    <h3>
                      Threats Detected
                    </h3>

                    <p>
                      {
                        honeypotStatus.threats_detected
                      }
                    </p>
                  </div>

                  <div className="result-panel">
                    <div className="result-panel-icon">
                      ↗
                    </div>

                    <h3>
                      Attack Attempts
                    </h3>

                    <p>
                      {
                        honeypotStatus.attack_attempts
                      }
                    </p>
                  </div>

                  <div className="result-panel">
                    <div className="result-panel-icon">
                      ◈
                    </div>

                    <h3>
                      Suspicious Sources
                    </h3>

                    <p>
                      {
                        honeypotStatus.suspicious_sources
                      }
                    </p>
                  </div>

                  <div className="result-panel">
                    <div className="result-panel-icon">
                      ⚠
                    </div>

                    <h3>
                      Critical Events
                    </h3>

                    <p>
                      {
                        honeypotStatus.critical_events
                      }
                    </p>
                  </div>
                </section>

                <section className="email-card">
                  <div className="email-content">
                    <div className="email-subject">Security Audit Log</div>
                    <p>Recent authentication, access-control and event-ingestion activity. This view is available to administrators only.</p>
                    {auditLogs.length === 0 ? (
                      <p>No audit records returned.</p>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log.id} className="scenario-result">
                          <div>
                            <strong>{log.event_type}</strong>
                            <span>{log.timestamp}</span>
                          </div>
                          <p><strong>User ID:</strong> {log.user_id ?? 'System / unauthenticated'}</p>
                          <p><strong>IP address:</strong> {log.ip_address || 'Not recorded'}</p>
                          <p><strong>Details:</strong> {JSON.stringify(log.details || {})}</p>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <button
                  className="continue-button"
                  onClick={
                    loadHoneypot
                  }
                >
                  Refresh Security Events and Audit Log
                  →
                </button>

                <button
                  className="continue-button"
                  onClick={goHome}
                >
                  Return to Home →
                </button>
              </>
            )}
        </main>
      </div>
    )
  }

  if (page === 'history') {
    return (
      <div className="phishaware">
        <nav className="navbar">
          <button className="logo logo-button" onClick={goHome}>
            <div className="logo-mark">C</div>
            CYBERSHIELD
          </button>
          <div className="nav-status"><span className="status-dot"></span>Assessment history</div>
        </nav>
        <main className="results-page results-reveal">
          <div className="assessment-header">
            <span className="scenario-label">YOUR LEARNING RECORD</span>
            <h1>Assessment history</h1>
            <p>Review your previous CyberShield assessment scores and scenario results.</p>
          </div>
          {historyLoading ? (
            <section className="email-card"><div className="email-content"><p>Loading your assessment history...</p></div></section>
          ) : historyError ? (
            <section className="email-card"><div className="email-content"><p role="alert">{historyError}</p><button className="continue-button" onClick={loadAssessmentHistory}>Try again →</button></div></section>
          ) : assessmentHistory.length === 0 ? (
            <section className="email-card"><div className="email-content"><h2>No completed assessments yet</h2><p>Complete your first 10-question assessment and your score will appear here.</p><button className="continue-button" onClick={startAssessment}>Start Assessment →</button></div></section>
          ) : (
            <div className="history-list">
              {assessmentHistory.map((item, index) => (
                <section className="email-card" key={`${item.timestamp}-${index}`}>
                  <div className="email-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <h2>Assessment {assessmentHistory.length - index}</h2>
                      <span className="risk-label">{item.riskLevel} RISK</span>
                    </div>
                    <p><strong>{item.score}/100</strong> · {item.correctAnswers} of {item.totalQuestions} correct</p>
                    <p>{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Date unavailable'}</p>
                    {item.scenarios.map((scenario, scenarioIndex) => (
                      <div className="scenario-result" key={`${scenario.title}-${scenarioIndex}`}>
                        <div><strong>{scenario.title}</strong><span className={scenario.correct ? 'result-correct' : 'result-incorrect'}>{scenario.correct ? 'Correct' : 'Needs improvement'}</span></div>
                        {scenario.learningPoint && <p>{scenario.learningPoint}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          <button className="continue-button" onClick={loadAssessmentHistory}>Refresh history →</button>
          <button className="mission-back-button" onClick={goHome}>← Back to Dashboard</button>
        </main>
      </div>
    )
  }

  /*
   * RESULTS
   */

  if (page === 'challenge-intro') {
    return (
      <div className="phishaware challenge-intro-page">
        <nav className="navbar">
          <button className="logo logo-button" onClick={goHome}><div className="logo-mark">C</div> CYBERSHIELD</button>
          <div className="nav-status"><span className="status-dot"></span> Challenge briefing</div>
        </nav>
        <main className="challenge-briefing">
          <span className="scenario-label">60-SECOND SECURITY CHALLENGE</span>
          <div className="briefing-orbit" aria-hidden="true"><span>CS</span><i></i><b></b></div>
          <p className="briefing-overline">THE THREAT IS REAL. THE ENVIRONMENT IS SAFE.</p>
          <h1>One decision can change everything.</h1>
          <p className="briefing-copy">Five situations. Five decisions. Suspicious messages, account pressure, QR codes, job offers and unexpected support calls. Your task is to pause, investigate and choose the safest response.</p>
          <div className="briefing-stages">
            <div><strong>01</strong><b>Investigate</b><span>Look beyond the sender and the story.</span></div>
            <div><strong>02</strong><b>Decide</b><span>Choose how you would respond.</span></div>
            <div><strong>03</strong><b>Improve</b><span>Get your score and learning feedback.</span></div>
          </div>
          <div className="briefing-actions">
            <button className="start-button" onClick={startAssessment}>Start the challenge <span aria-hidden="true">→</span></button>
            <button className="mission-back-button" onClick={goHome}>Not now</button>
          </div>
          <small className="briefing-safety">Training simulation only · Never use real credentials or payment details.</small>
        </main>
      </div>
    )
  }

  if (page === 'results') {
    const results = calculateResults()
    const risk = getRiskLevel(
      results.score,
    )

    return (
      <div className="phishaware">
        <nav className="navbar">
          <button
            className="logo logo-button"
            onClick={goHome}
          >
            <div className="logo-mark">
              C
            </div>

            CYBERSHIELD
          </button>

          <div className="nav-status">
            <span className="status-dot"></span>
            Assessment complete
          </div>
        </nav>

        <main className="results-page results-reveal">
          <div className="assessment-header">
            <span className="scenario-label">
              ASSESSMENT COMPLETE
            </span>

            <h1>
              Your security awareness
              result.
            </h1>

            <p>
Your score reflects your decisions across all ten scenarios.
            </p>
          </div>

          <section className="score-card score-card-reveal">
            <div className="score-circle score-circle-animated" aria-label={`Score ${results.score} out of 100`}>
              <span>
                {results.score}
              </span>

              <small>/100</small>
            </div>

            <div className="score-information">
              <span className="risk-label">
                {risk.label}
              </span>

              <h2>
                {risk.description}
              </h2>

              <p>
                You correctly identified{' '}
                {results.correct} out of{' '}
                {scenarios.length} phishing
                scenarios.
              </p>
            </div>
          </section>

          <section className="results-grid">
            <div className="result-panel">
              <div className="result-panel-icon">
                ✓
              </div>

              <h3>
                Strengths
              </h3>

              {getStrengths().map(
                (strength, index) => (
                  <p key={index}>
                    • {strength}
                  </p>
                ),
              )}
            </div>

            <div className="result-panel">
              <div className="result-panel-icon">
                !
              </div>

              <h3>
                Areas to improve
              </h3>

              {getWeaknesses().map(
                (weakness, index) => (
                  <p key={index}>
                    • {weakness}
                  </p>
                ),
              )}
            </div>
          </section>

          <section className="email-card">
            <div className="email-content">
              <div className="email-subject">
                Scenario Performance
              </div>

              {responses.map(
                (response) => (
                  <div
                    key={response.scenario}
                    className="scenario-result"
                  >
                    <div>
                      <strong>
                        Scenario{' '}
                        {
                          response.scenario
                        }
                      </strong>

                      <span
                        className={
                          response.decisionCorrect
                            ? 'result-correct'
                            : 'result-incorrect'
                        }
                      >
                        {response.decisionCorrect
                          ? 'Correct decision'
                          : 'Risky decision'}
                      </span>
                    </div>

                    <p>
                      Decision:{' '}
                      {getChoiceLabel(
                        response.scenario,
                        response.choice,
                      )}
                    </p>

                  </div>
                ),
              )}
            </div>
          </section>

          <section className="leaderboard-card">
            <div className="leaderboard-heading">
              <div><span className="scenario-label">CYBERSHIELD COMMUNITY</span><h2>Live leaderboard</h2><p>Learners ranked by their highest completed assessment score.</p></div>
              <span className="leaderboard-live"><i></i> LIVE</span>
            </div>
            {leaderboardLoading ? <p>Loading rankings…</p> : leaderboardError ? <p>{leaderboardError}</p> : leaderboard.length ? (
              <div className="leaderboard-list">
                {leaderboard.map((entry, index) => <div className={`leaderboard-row ${index === 0 ? 'leaderboard-first' : ''}`} key={`${entry.rank}-${entry.nickname}`}>
                  <span className="leaderboard-rank">{index === 0 ? '♛' : String(entry.rank).padStart(2, '0')}</span>
                  <strong>{entry.nickname}</strong><span className="leaderboard-score">{entry.score}<small>/100</small></span>
                </div>)}
              </div>
            ) : <p>Be one of the first learners on the leaderboard. Complete an assessment to appear here.</p>}
          </section>

          <section className="recommendation-card">
            <span className="scenario-label">
              CYBERSHIELD RECOMMENDATION
            </span>

            <h2>
              {assessmentReport?.aiFeedback?.available
                ? 'Your personalised learning feedback'
                : 'Think beyond the message.'}
            </h2>

            <p>
              {assessmentReport?.aiFeedback?.summary || assessmentReport?.summary ||
                'Before interacting with a suspicious message, verify the sender, inspect the domain, avoid unexpected links or attachments, and confirm requests through an official communication channel.'}
            </p>

            {(assessmentReport?.aiFeedback?.recommendations || []).map((item, index) => (
              <p key={index}>• {item}</p>
            ))}

            {assessmentReport && !assessmentReport.aiAvailable && (
              <small>AI feedback could not be generated for this attempt. Your score, scenario marking and saved assessment are still available.</small>
            )}
          </section>

          <button
            className="continue-button"
            onClick={goHome}
          >
            Return to Home →
          </button>
        </main>
      </div>
    )
  }

  /*
   * ASSESSMENT
   */

  return (
    <div className="phishaware">
      <nav className="navbar">
        <button
          className="logo logo-button"
          onClick={goHome}
        >
          <div className="logo-mark">
            C
          </div>

          CYBERSHIELD
        </button>

        <div className="nav-status">
          <span className="status-dot"></span>
          Assessment active
        </div>
      </nav>

      <main className="assessment-page">
        <div className="assessment-header">
          <span className="scenario-label">
            SCENARIO{' '}
            {String(
              scenario.id,
            ).padStart(2, '0')}
          </span>

          <div className="assessment-type-pill">{scenario.type}</div>

          <h1>
            Make the safest security decision.
          </h1>

          <p>
            Review the evidence and choose the strongest response.
          </p>
        </div>

        <section className="email-card">
          <div className="email-top">
            <div className="email-avatar">
              {scenario.sender.charAt(0)}
            </div>

            <div>
              <strong>
                {scenario.sender}
              </strong>

              <p>
                {scenario.email}
              </p>
            </div>
          </div>

          <div className="email-content">
            <div className="email-subject">
              {scenario.subject}
            </div>

            <p>
              {scenario.message}
            </p>

          </div>
        </section>

        <section className="decision-section">
          <h2>
            {scenario.question}
          </h2>

          <div className="choices">
            {(assessmentChoiceOrder[scenario.id] || scenario.choices).map(
              (item, index) => (
                <button
                  key={item.id}
                  className={`choice ${
                    choice === item.id
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    setChoice(item.id)
                  }
                >
                  <span className="choice-number">
                    {String.fromCharCode(
                      65 + index,
                    )}
                  </span>

                  <span>
                    <strong>
                      {item.label}
                    </strong>

                    <small>
                      {item.description}
                    </small>
                  </span>
                </button>
              ),
            )}
          </div>

          <button
            className="continue-button"
            disabled={!choice || aiLoading}
            onClick={handleContinue}
          >
            {aiLoading
              ? 'Submitting assessment...'
              : currentScenario ===
                  scenarios.length - 1
                ? 'Finish Assessment →'
                : 'Continue →'}
          </button>
        </section>
      </main>
    </div>
  )
}

export default App
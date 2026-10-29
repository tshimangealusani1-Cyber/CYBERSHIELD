import { useEffect, useState } from 'react'
import './App.css'

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
  const [currentScenario, setCurrentScenario] = useState(0)
  const [adminToken, setAdminToken] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [adminLoginLoading, setAdminLoginLoading] = useState(false)

  const [choice, setChoice] = useState('')

  const [responses, setResponses] = useState([])
  const [assessmentChoiceOrder, setAssessmentChoiceOrder] = useState({})

  const [aiLoading, setAiLoading] = useState(false)

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

  /*
   * HONEYPOT DATA
   */

  const handleAdminLogin = async (event) => {
    event.preventDefault()
    if (adminLoginLoading) return
    setAdminLoginLoading(true)
    setAdminLoginError('')
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
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
          fetch('http://127.0.0.1:5000/api/honeypot/status', { headers: { Authorization: `Bearer ${adminToken}` } }),
          fetch('http://127.0.0.1:5000/api/honeypot/events', { headers: { Authorization: `Bearer ${adminToken}` } }),
          fetch('http://127.0.0.1:5000/api/audit/logs?limit=20', { headers: { Authorization: `Bearer ${adminToken}` } }),
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
        'http://127.0.0.1:5000/api/honeypot/events',
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


  const scamProgressUrl = `http://127.0.0.1:5000/api/scam-progress/${learnerId}`

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
      const response = await fetch('http://127.0.0.1:5000/api/phishing-simulation/events', {
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
    setAiLoading(false)
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
    setAssessmentChoiceOrder(Object.fromEntries(
      scenarios.map((item) => [item.id, shuffleItems(item.choices)])
    ))
  }

  /*
   * HANDLE ASSESSMENT CONTINUE
   */

  const handleContinue = async () => {
    if (
      !choice ||
      aiLoading
    ) {
      return
    }

    setAiLoading(true)

    try {
      const selectedChoice = scenario.choices.find(
        (item) => item.id === choice,
      )

      const response = await fetch(
        'http://127.0.0.1:5000/api/evaluate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scenario: {
              id: scenario.id,
              sender: scenario.sender,
              email: scenario.email,
              subject: scenario.subject,
              message: scenario.message,
            },

            choice: {
              id: choice,
              label: selectedChoice?.label || choice,
              description:
                selectedChoice?.description || '',
            },

            reasoning: 'No written explanation requested. Evaluate the selected decision against the scenario and provide concise practical feedback.',
          }),
        },
      )

      if (!response.ok) {
        throw new Error(
          `AI request failed: ${response.status}`,
        )
      }

      const data = await response.json()

      console.log('AI evaluation:', data)

      const evaluation = data.evaluation || data

      const newResponse = {
        scenario: scenario.id,
        choice,
        decisionCorrect:
          choice === scenario.correctChoice,

        aiEvaluation: evaluation,
      }

      const updatedResponses = [
        ...responses,
        newResponse,
      ]

      setResponses(updatedResponses)

      if (
        currentScenario <
        scenarios.length - 1
      ) {
        setCurrentScenario(
          currentScenario + 1,
        )

        setChoice('')
      } else {
        setPage('results')
      }
    } catch (error) {
      console.error(
        'AI evaluation error:',
        error,
      )

      alert(
        'CYBERSHIELD could not reach the AI evaluator. Make sure the Flask backend and Ollama are running.',
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

          <div className="nav-status">
            <span className="status-dot"></span>
            System online
          </div>
        </nav>

        <main>
          <section className="hero">
            <div className="badge">
              AI-POWERED SECURITY AWARENESS
            </div>

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



            <button
              className="scam-centre-launch"
              onClick={() => {
                setSelectedScamScenario('email')
                setScamChoice('')
                setScamChecked(false)
                setPage('scam-centre')
              }}
            >
              <span className="scam-centre-launch-icon" aria-hidden="true">◉</span>
              <span className="scam-centre-launch-copy">
                <strong>Explore the Scam Awareness Centre</strong>
                <small>Practise spotting email, phone, social media, website and payment scams.</small>
              </span>
              <span className="scam-centre-launch-arrow" aria-hidden="true">→</span>
            </button>

            <button
              className="start-button home-assessment-button"
              onClick={startAssessment}
            >
              Start Assessment <span aria-hidden="true">→</span>
            </button>

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
    <main className="results-page">
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
            <button className="mission-back-button" onClick={() => setPage('honeypot')}>Open technical event monitor (prototype)</button>
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
        <main className="results-page">
          <section className="email-card" style={{ maxWidth: 520, margin: '48px auto' }}>
            <div className="email-content">
              <span className="scenario-label">RESTRICTED AREA</span>
              <h1>Admin login</h1>
              <p>Sign in with an administrator account to view honeypot telemetry and submit controlled simulations.</p>
              <form onSubmit={handleAdminLogin}>
                <label htmlFor="admin-email">Email</label>
                <input id="admin-email" type="email" autoComplete="username" required value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} style={{ display: 'block', width: '100%', boxSizing: 'border-box', margin: '8px 0 16px', padding: 12 }} />
                <label htmlFor="admin-password">Password</label>
                <input id="admin-password" type="password" autoComplete="current-password" required value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} style={{ display: 'block', width: '100%', boxSizing: 'border-box', margin: '8px 0 16px', padding: 12 }} />
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

        <main className="results-page">
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
                <section className="score-card">
                  <div className="score-circle">
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
                    <div className="email-subject">
                      Recent Security Events
                    </div>

                    {honeypotEvents.length ===
                    0 ? (
                      <p>
                        No security events
                        recorded.
                      </p>
                    ) : (
                      honeypotEvents.map(
                        (event) => (
                          <div
                            key={event.id}
                            className="scenario-result"
                          >
                            <div>
                              <strong>
                                {event.event}
                              </strong>

                              <span
                                className={
                                  event.severity ===
                                  'Critical'
                                    ? 'result-incorrect'
                                    : event.severity ===
                                      'High'
                                    ? 'reason-warning'
                                    : 'result-correct'
                                }
                              >
                                {
                                  event.severity
                                }
                              </span>
                            </div>

                            <p>
                              <strong>
                                Source:
                              </strong>{' '}
                              {
                                event.source_ip
                              }
                            </p>

                            <p>
                              <strong>
                                Time:
                              </strong>{' '}
                              {
                                event.timestamp
                              }
                            </p>

                            <p>
                              {
                                event.details
                              }
                            </p>

                            <p>
                              <strong>
                                Status:
                              </strong>{' '}
                              {event.status}
                            </p>
                          </div>
                        ),
                      )
                    )}
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

  /*
   * RESULTS
   */

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

        <main className="results-page">
          <div className="assessment-header">
            <span className="scenario-label">
              ASSESSMENT COMPLETE
            </span>

            <h1>
              Your security awareness
              result.
            </h1>

            <p>
Your score is based on the safety of your decisions across all five scenarios.
            </p>
          </div>

          <section className="score-card">
            <div className="score-circle">
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

          <section className="recommendation-card">
            <span className="scenario-label">
              CYBERSHIELD RECOMMENDATION
            </span>

            <h2>
              Think beyond the message.
            </h2>

            <p>
              Before interacting with a
              suspicious message, verify the
              sender, inspect the domain, avoid
              unexpected links or attachments,
              and confirm requests through an
              official communication channel.
            </p>
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
            Can you spot the phishing
            attempt?
          </h1>

          <p>
            Examine the message carefully
            before making your decision.
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

            <button
              className="fake-link"
              type="button"
              onClick={() => {}}
            >
              Continue
            </button>
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
              ? 'AI is analysing...'
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
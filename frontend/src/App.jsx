import { useEffect, useState } from 'react'
import './App.css'

const scenarios = [
  {
    id: 1,
    sender: 'Microsoft Security',
    email: 'security@micros0ft-support.com',
    subject: 'Urgent: Your account requires verification',
    message:
      'Your Microsoft account will be suspended within 24 hours unless you verify your credentials. Click the button below to confirm your identity.',
    question: 'What would you do?',
    correctChoice: 'report',
    choices: [
      {
        id: 'open',
        label: 'Open the link',
        description: 'Verify my account immediately.',
      },
      {
        id: 'report',
        label: 'Report the email',
        description: 'Treat the message as suspicious.',
      },
      {
        id: 'delete',
        label: 'Delete the email',
        description: 'Remove it without interacting with it.',
      },
    ],
  },

  {
    id: 2,
    sender: 'ABSA Online Banking',
    email: 'security@absa-secure-login.co.za',
    subject: 'Unusual activity detected on your account',
    message:
      'We detected unusual activity on your account. To prevent temporary suspension, please confirm your banking details using the secure verification link below.',
    question: 'How would you respond?',
    correctChoice: 'official',
    choices: [
      {
        id: 'link',
        label: 'Use the verification link',
        description: 'Confirm my details to prevent suspension.',
      },
      {
        id: 'official',
        label: 'Contact the bank directly',
        description:
          'Use the official banking app or website instead.',
      },
      {
        id: 'ignore',
        label: 'Ignore the message',
        description: 'Do not interact with it.',
      },
    ],
  },

  {
    id: 3,
    sender: 'Microsoft 365',
    email: 'admin@microsft365-help.com',
    subject: 'Your password expires today',
    message:
      'Your organisational Microsoft 365 password expires today. Failure to update your password will result in loss of access. Update your password using the button below.',
    question: 'What would you do?',
    correctChoice: 'verify',
    choices: [
      {
        id: 'update',
        label: 'Update my password',
        description: 'Use the button provided in the message.',
      },
      {
        id: 'verify',
        label: 'Verify through the official service',
        description:
          'Open Microsoft 365 directly instead of using the email link.',
      },
      {
        id: 'delete',
        label: 'Delete the message',
        description: 'Remove it without interacting with it.',
      },
    ],
  },

  {
    id: 4,
    sender: 'HR Department',
    email: 'hr-payroll@company-payrol1.com',
    subject: 'Important: Payroll information required',
    message:
      'The payroll department is updating employee records. Please provide your employee number, ID information and banking details before the end of the day.',
    question: 'What would you do?',
    correctChoice: 'verify',
    choices: [
      {
        id: 'send',
        label: 'Send the requested information',
        description: 'Reply with the requested details.',
      },
      {
        id: 'verify',
        label: 'Verify the request',
        description: 'Contact HR through an official channel first.',
      },
      {
        id: 'ignore',
        label: 'Ignore the request',
        description: 'Do not provide any information.',
      },
    ],
  },

  {
    id: 5,
    sender: 'IT Support',
    email: 'support@it-helpdesk-security.com',
    subject: 'Remote access request',
    message:
      'IT Support requires remote access to your computer to resolve a security issue. Please download and install the attached support tool immediately.',
    question: 'What would you do?',
    correctChoice: 'verify',
    choices: [
      {
        id: 'install',
        label: 'Install the tool',
        description: 'Allow IT Support to resolve the issue.',
      },
      {
        id: 'verify',
        label: 'Verify with IT first',
        description:
          'Contact the IT department through an official channel.',
      },
      {
        id: 'delete',
        label: 'Delete the message',
        description: 'Do not download or install anything.',
      },
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

function App() {
  const [page, setPage] = useState('home')
  const [currentScenario, setCurrentScenario] = useState(0)

  const [choice, setChoice] = useState('')
  const [reason, setReason] = useState('')

  const [responses, setResponses] = useState([])

  const [aiLoading, setAiLoading] = useState(false)

  const [honeypotStatus, setHoneypotStatus] = useState(null)
  const [honeypotEvents, setHoneypotEvents] = useState([])
  const [honeypotLoading, setHoneypotLoading] = useState(false)

  const [honeypotError, setHoneypotError] = useState('')

  /*
   * HONEYPOT DATA
   */

  const loadHoneypot = async () => {
    setHoneypotLoading(true)
    setHoneypotError('')

    try {
      const [statusResponse, eventsResponse] =
        await Promise.all([
          fetch('http://127.0.0.1:5000/api/honeypot/status'),
          fetch('http://127.0.0.1:5000/api/honeypot/events'),
        ])

      if (!statusResponse.ok || !eventsResponse.ok) {
        throw new Error('Failed to load honeypot data')
      }

      const statusData = await statusResponse.json()
      const eventsData = await eventsResponse.json()

      setHoneypotStatus(statusData)
      setHoneypotEvents(eventsData.events || [])
    } catch (error) {
      console.error('Honeypot error:', error)

      setHoneypotError(
        'Could not connect to the CYBERSHIELD honeypot backend. Make sure the Flask server is running on port 5000.',
      )
    } finally {
      setHoneypotLoading(false)
    }
  }

  /*
   * LOAD HONEYPOT WHEN PAGE OPENS
   */

  useEffect(() => {
    if (page === 'honeypot') {
      loadHoneypot()
    }
  }, [page])

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
  }

  /*
   * HANDLE ASSESSMENT CONTINUE
   */

  const handleContinue = async () => {
    if (
      !choice ||
      reason.trim().length < 10 ||
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

            reasoning: reason.trim(),
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
        reason: reason.trim(),

        decisionCorrect:
          choice === scenario.correctChoice,

        reasoningScore: evaluateReason(reason),

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
        setReason('')
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

    const decisionScore =
      (correct / scenarios.length) * 70

    const reasoningScore =
      responses.reduce(
        (total, response) =>
          total + response.reasoningScore,
        0,
      ) / responses.length

    const finalScore = Math.round(
      decisionScore +
        (reasoningScore / 10) * 30,
    )

    return {
      score: finalScore,
      correct,
      reasoning: Math.round(
        reasoningScore,
      ),
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
      responses.filter(
        (response) =>
          response.reasoningScore >= 10,
      ).length >= 3
    ) {
      strengths.push(
        'Good ability to explain phishing indicators and security concerns.',
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

    if (
      responses.filter(
        (response) =>
          response.reasoningScore <= 5,
      ).length >= 2
    ) {
      weaknesses.push(
        'Your explanations could identify more specific warning signs instead of giving short responses.',
      )
    }

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
              CYBERSHIELD evaluates how you
              respond to realistic phishing
              scenarios and helps identify the
              behaviours that put you at risk.
            </p>

            <button
              className="start-button"
              onClick={startAssessment}
            >
              Start Assessment →
            </button>

            <button
              className="start-button"
              onClick={() =>
                setPage('honeypot')
              }
            >
              Open Honeypot Monitor →
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
                Your decisions and reasoning can
                be evaluated against
                phishing-awareness criteria.
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

          <div className="nav-status">
            <span className="status-dot"></span>
            Honeypot monitoring
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

                <button
                  className="continue-button"
                  onClick={
                    loadHoneypot
                  }
                >
                  Refresh Security Events
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
              CYBERSHIELD analysed your
              decisions and reasoning across
              all five scenarios.
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

                    <p>
                      Reasoning:{' '}
                      {response.reason}
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
            {scenario.choices.map(
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

          <div className="reason-section">
            <label htmlFor="reason">
              Why did you make this choice?
            </label>

            <textarea
              id="reason"
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value,
                )
              }
              placeholder="Explain what made you trust or distrust the message..."
            />

            {reason.length > 0 &&
              reason.trim().length < 10 && (
                <small className="reason-warning">
                  Please provide at least 10
                  characters explaining your
                  decision.
                </small>
              )}
          </div>

          <button
            className="continue-button"
            disabled={
              !choice ||
              reason.trim().length <
                10 ||
              aiLoading
            }
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
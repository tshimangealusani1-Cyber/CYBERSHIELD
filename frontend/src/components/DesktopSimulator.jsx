import { useMemo, useState } from 'react'
import './DesktopSimulator.css'

const tasks = [
  { app: 'mail', title: 'Mission 1 · Inspect the email', objective: 'Open the suspicious invoice email. Inspect the sender, urgency and attachment. Report it as phishing.', tip: 'Unexpected attachments and pressure to act quickly are warning signs.' },
  { app: 'browser', title: 'Mission 2 · Verify the website', objective: 'Open the browser and inspect the student account verification page. Identify the suspicious domain and leave the page.', tip: 'A padlock does not prove a website is legitimate. Check the full domain.' },
  { app: 'files', title: 'Mission 3 · Investigate the download', objective: 'Inspect the Downloads folder. Do not run the unknown file. Quarantine the suspicious installer.', tip: 'Do not execute unexpected files, even if their names look official.' },
  { app: 'defender', title: 'Mission 4 · Run a security scan', objective: 'Open Security Centre and run the simulated quick scan. Review the detected threat.', tip: 'Use trusted security tools and investigate unexpected alerts.' },
  { app: 'terminal', title: 'Mission 5 · Review system activity', objective: 'Open the activity console and inspect the simulated suspicious login entry. Mark the incident for review.', tip: 'Unexpected sign-in activity should be verified through official channels.' },
]

export default function DesktopSimulator({ onBack }) {
  const [active, setActive] = useState('')
  const [task, setTask] = useState(0)
  const [done, setDone] = useState([])
  const [feed, setFeed] = useState(['Training workstation started'])
  const [toast, setToast] = useState('')
  const [reported, setReported] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [quarantined, setQuarantined] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [siteOpen, setSiteOpen] = useState(false)

  const current = tasks[task]
  const addLog = (message) => setFeed(old => [message, ...old].slice(0, 6))
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200) }
  const finish = (index = task) => {
    setDone(old => old.includes(index) ? old : [...old, index])
    addLog(`${tasks[index].title} · objective completed`)
    notify('Objective completed')
  }
  const next = () => {
    if (!done.includes(task)) return
    if (task < tasks.length - 1) {
      const n = task + 1
      setTask(n)
      setActive(tasks[n].app)
      notify(`Next: ${tasks[n].title}`)
    } else notify('All desktop investigation missions completed')
  }
  const launch = (id) => { setActive(id); addLog(`${id[0].toUpperCase()}${id.slice(1)} opened`) }

  const renderWindow = () => {
    if (active === 'mail') return <div className="ds-window-body">
      <div className="ds-toolbar"><b>Outlook · Inbox</b><button onClick={() => notify('Inbox refreshed')}>↻ Refresh</button></div>
      <div className="ds-mail-row"><b>Campus Library</b><span>Book return reminder</span><small>Yesterday · Normal message</small></div>
      <div className="ds-mail-row ds-suspicious"><b>Eduvos Finance Office</b><span>URGENT: Outstanding invoice — action required</span><small>From: finance@eduv0s-billing.example · 09:14</small><p>Your student account will be suspended today. Open the attached invoice_update.zip to confirm payment details.</p><div className="ds-actions"><button onClick={() => {setReported(true);finish(0)}}>{reported ? '✓ Reported' : '⚑ Report phishing'}</button><button onClick={() => notify('Attachment blocked in this safe simulation')}>Inspect attachment</button></div></div>
      <div className="ds-mail-row"><b>IT Service Desk</b><span>Scheduled maintenance notice</span><small>08:40 · Normal message</small></div>
    </div>
    if (active === 'browser') return <div className="ds-window-body">
      <div className="ds-address"><span>🔒</span> https://eduv0s-account-verify.example <button onClick={() => {setSiteOpen(true);addLog('Suspicious website opened in isolated browser')}}>Go</button></div>
      <div className="ds-webpage"><small>STUDENT PORTAL · TRAINING COPY</small><h2>Account verification required</h2><p>Your account access may be restricted. Verify your details to continue.</p><div className="ds-fake-form"><label>Student email</label><input placeholder="student@example.com" disabled/><label>Password</label><input placeholder="••••••••" disabled/><button onClick={() => notify('Safe simulation: no credentials are collected')}>Continue (disabled demo)</button></div><p className="ds-danger">Training warning: the domain uses a zero in place of the letter “o”. Do not enter credentials.</p><button onClick={() => {setSiteOpen(false);finish(1)}}>Close suspicious page and report</button></div>
    </div>
    if (active === 'files') return <div className="ds-window-body">
      <div className="ds-toolbar"><b>File Explorer · Downloads</b><span>This PC › Downloads</span></div>
      {['Lecture_Notes.pdf','Timetable_November.pdf','Invoice_Update.zip'].map((f,i)=><div className="ds-file" key={f}><span>{i===2?'📦':'📄'}</span><b>{f}</b><small>{i===2?'Unknown publisher · Executable archive':'Document'}</small>{i===2&&<button onClick={()=>{setQuarantined(true);finish(2)}}>{quarantined?'Quarantined':'Quarantine'}</button>}</div>)}
      <p className="ds-muted">Select the suspicious file and quarantine it. Files are fictional and remain inside this training environment.</p>
    </div>
    if (active === 'defender') return <div className="ds-window-body">
      <div className="ds-security-hero"><span>🛡️</span><div><b>Windows Security</b><small>Protection overview · Simulated</small></div></div>
      <div className="ds-security-card"><b>Virus & threat protection</b><p>{scanned?'Quick scan complete · 1 simulated threat detected':'Your device has not been scanned today.'}</p><button onClick={()=>{setScanned(true);addLog('Quick scan completed · 1 simulated threat found');finish(3)}}>{scanned?'Scan again':'Quick scan'}</button></div>
      <div className="ds-security-card"><b>Firewall & network protection</b><p><span className="ds-green-dot"/> Firewall is on</p></div>
      <div className="ds-security-card"><b>Account protection</b><p>Review sign-in activity and account security.</p></div>
    </div>
    if (active === 'terminal') return <div className="ds-terminal"><p>CYBERSHIELD INCIDENT CONSOLE v1.0</p><p>Loading simulated endpoint events...</p><p>[09:02:11] INFO  Workstation started</p><p>[09:07:42] WARN  Failed sign-in · user: student</p><p>[09:07:44] WARN  Failed sign-in · source: unknown device</p><p>[09:07:49] ALERT Repeated authentication failures detected</p><p>[09:08:03] INFO  No real system commands are executed in this lab</p><button onClick={()=>{setReviewed(true);finish(4)}}>{reviewed?'✓ Incident flagged':'Flag incident for review'}</button></div>
    return <div className="ds-welcome"><div className="ds-windows-logo">▦</div><h2>Welcome to the training workstation</h2><p>Choose an application from the desktop to begin your investigation.</p></div>
  }

  return <main className="ds-page">
    <header className="ds-header"><div><span>CYBERSHIELD · DESKTOP LAB</span><h1>Windows security investigation</h1><p>Investigate a connected incident across common desktop applications.</p></div><button onClick={onBack}>← Back to Lab</button></header>
    <div className="ds-layout">
      <section className="ds-computer">
        <div className="ds-screen">
          <div className="ds-topbar"><b>◧ CYBERSHIELD WORKSTATION</b><span>● Protected training environment</span></div>
          {!active ? <div className="ds-desktop-icons">{[['mail','✉','Outlook'],['browser','🌐','Browser'],['files','📁','File Explorer'],['defender','🛡️','Security'],['terminal','⌘','Incident Console']].map(([id,icon,label])=><button key={id} onClick={()=>launch(id)}><span>{icon}</span>{label}</button>)}</div> : <section className="ds-app-window"><div className="ds-window-title"><b>{({mail:'Outlook',browser:'Browser',files:'File Explorer',defender:'Windows Security',terminal:'Incident Console'})[active]}</b><button onClick={()=>setActive('')}>×</button></div>{renderWindow()}</section>}
          <div className="ds-taskbar"><button onClick={()=>setActive('')}>⊞</button><span>Search</span><button onClick={()=>launch('mail')}>✉</button><button onClick={()=>launch('browser')}>🌐</button><small>9:41 AM · Training</small></div>
        </div>
        <small className="ds-caption">SIMULATED WINDOWS DESKTOP · NO REAL FILES OR SYSTEM COMMANDS</small>
      </section>
      <aside className="ds-panel"><span className="ds-kicker">GUIDED INVESTIGATION</span><h2>Compromised workstation</h2><p>Follow the evidence from a suspicious email to a possible endpoint compromise.</p><div className="ds-progress-label"><b>MISSION {task+1} / {tasks.length}</b><span>{done.length}/{tasks.length} complete</span></div><div className="ds-progress"><i style={{width:`${done.length/tasks.length*100}%`}}/></div><h3>{current.title}</h3><p>{current.objective}</p><div className="ds-tip"><b>Investigation tip</b>{current.tip}</div><button className="ds-next" disabled={!done.includes(task)} onClick={next}>{task===tasks.length-1?'Finish investigation':'Continue to next mission'} →</button><small className="ds-hint">{done.includes(task)?'Objective completed. Continue when ready.':'Complete the objective to unlock Continue.'}</small><div className="ds-activity"><b>ACTIVITY LOG</b>{feed.map((item,i)=><p key={`${item}-${i}`}>• {item}</p>)}</div><button className="ds-reset" onClick={()=>{setActive('');setTask(0);setDone([]);setFeed(['Training workstation restarted']);setReported(false);setScanned(false);setQuarantined(false);setReviewed(false);setSiteOpen(false)}}>Reset desktop simulation</button></aside>
    </div>
    {toast&&<div className="ds-toast">{toast}</div>}
  </main>
}

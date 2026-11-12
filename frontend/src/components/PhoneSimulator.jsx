import { useState } from 'react'
import './PhoneSimulator.css'

const appTiles = [
  { id: 'messages', label: 'Messages', icon: '✉', color: '#28c76f', unread: 1 },
  { id: 'mail', label: 'Mail', icon: '✉', color: '#4385f5' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '◔', color: '#20c76a' },
  { id: 'instagram', label: 'Instagram', icon: '◎', color: '#d94c91' },
  { id: 'tiktok', label: 'TikTok', icon: '♪', color: '#111827' },
  { id: 'x', label: 'X', icon: '𝕏', color: '#111827' },
  { id: 'phone', label: 'Phone', icon: '☎', color: '#26c66b' },
  { id: 'settings', label: 'Settings', icon: '⚙', color: '#687386' },
]

const initialEvents = [
  { title: 'Simulation ready', detail: 'A fictional smartphone is ready. The same student-account incident appears across multiple applications.', time: 'Now' },
]

export default function PhoneSimulator({ onBack }) {
  const [screen, setScreen] = useState('lock')
  const [activeApp, setActiveApp] = useState('')
  const [events, setEvents] = useState(initialEvents)
  const [linkWarning, setLinkWarning] = useState(false)
  const [callState, setCallState] = useState('incoming')
  const [reported, setReported] = useState(false)
  const [whatsappChatOpen, setWhatsappChatOpen] = useState(false)
  const [notification, setNotification] = useState('')
  const missions = [
    { app: 'messages', title: 'Mission 1: Investigate the SMS', objective: 'Open the suspicious message, inspect the sender and destination, then report or block the message.', task: 'Inspect the suspicious delivery SMS and report it.', tip: 'Look for urgency, unfamiliar domains and requests for account verification.' },
    { app: 'mail', title: 'Mission 2: Verify the university email', objective: 'Open the university security email. Compare its sender, wording and request with the SMS. Report it if suspicious.', task: 'Inspect and report the suspicious university email.', tip: 'A familiar display name does not prove that an email is genuine.' },
    { app: 'whatsapp', title: 'Mission 3: Investigate WhatsApp', objective: 'Open the IT Helpdesk conversation. Inspect what the sender requests and decide how to respond.', task: 'Inspect the unknown IT Helpdesk chat and identify the dangerous request.', tip: 'Never share a one-time password or verification code with another person.' },
    { app: 'instagram', title: 'Mission 4: Check the social profile', objective: 'Inspect the support profile and its post. Decide whether the account is legitimate and report suspicious impersonation.', task: 'Inspect and report the suspicious support profile.', tip: 'Check account identity, history and independent verification.' },
    { app: 'phone', title: 'Mission 5: Handle the incoming call', objective: 'Inspect the caller and decide whether to answer. If answered, do not disclose sensitive information.', task: 'Handle the unsolicited IT support call safely.', tip: 'End unexpected calls requesting passwords, codes or remote access.' },
    { app: 'settings', title: 'Mission 6: Secure the device', objective: 'Explore Privacy & Security and Notifications. Identify where you would review account and device security.', task: 'Inspect the device security settings.', tip: 'Use official settings and trusted channels to secure accounts.' },
  ]
  const [missionIndex, setMissionIndex] = useState(0)
  const [completedMissions, setCompletedMissions] = useState([])
  const currentMission = missions[missionIndex]
  const completeMission = (index = missionIndex) => {
    setCompletedMissions(old => old.includes(index) ? old : [...old, index])
  }
  const continueMission = () => {
    if (!completedMissions.includes(missionIndex)) return
    if (missionIndex < missions.length - 1) {
      const next = missionIndex + 1
      setMissionIndex(next)
      openApp(missions[next].app)
      toast(`Next mission: ${missions[next].title}`)
    } else {
      toast('All smartphone missions completed!')
      log('Smartphone investigation completed', 'All six mission objectives were completed.')
    }
  }

  const log = (title, detail) => setEvents(old => [{ title, detail, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...old].slice(0, 8))
  const toast = (message) => { setNotification(message); window.setTimeout(() => setNotification(''), 2400) }
  const openApp = (id) => { setActiveApp(id); setScreen('app'); setLinkWarning(false); log(`Opened ${appTiles.find(a => a.id === id)?.label || id}`, 'Application opened inside the isolated training device.') }
  const goHome = () => { setScreen('home'); setActiveApp(''); setLinkWarning(false) }
  const reportMessage = () => { setReported(true); completeMission(0); log('Suspicious message reported', 'The fictional SMS was reported to the simulated security team.'); toast('Mission 1 completed — message reported') }

  const renderApp = () => {
    if (activeApp === 'messages') return <div className="ps-app-view">
      <div className="ps-app-top"><button onClick={goHome}>‹</button><div className="ps-contact"><span className="ps-avatar">P</span><strong>Campus Parcel</strong><small>Unknown sender · SMS</small></div><button onClick={() => toast('Contact details opened')}>ⓘ</button></div>
      <div className="ps-date">Today 10:42</div>
      <div className="ps-bubble ps-incoming">Your campus parcel is on hold. Confirm your student delivery address within 2 hours. University account verification may be required: <button className="ps-inline-link" onClick={() => { setLinkWarning(true); log('Suspicious link selected', 'The training link was intercepted before navigation.') }}>campus-delivery-verify.example</button></div>
      {linkWarning && <div className="ps-warning"><strong>CyberShield safety intercept</strong><p>This fictional link has an unfamiliar domain and uses urgency. No external website was opened.</p><button onClick={() => { setLinkWarning(false); log('Link inspection completed', 'The learner reviewed the suspicious destination.') }}>Understood</button></div>}
      <div className="ps-message-actions"><button onClick={reportMessage}>{reported ? '✓ Reported' : '⚑ Report message'}</button><button onClick={() => { log('Sender blocked', 'The fictional sender was blocked.'); toast('Sender blocked') }}>Block sender</button></div>
      <div className="ps-composer"><span>iMessage / SMS</span><button onClick={() => toast('Message composer opened')}>＋</button><button onClick={() => toast('This training device does not send real messages')}>↑</button></div>
    </div>
    if (activeApp === 'mail') return <div className="ps-app-view"><div className="ps-app-top"><button onClick={goHome}>‹</button><strong>Inbox</strong><button onClick={() => toast('Inbox refreshed')}>↻</button></div><div className="ps-mail-search">⌕ Search mail</div><article className="ps-mail-item" onClick={() => toast('Opened: Student account storage warning')}><b>Eduvos Student Services</b><small>Student account security notice</small><p>A parcel delivery was flagged. Review the sender and compare this message with the SMS you received.</p><span>10:18 · Training example</span></article><article className="ps-mail-item ps-suspicious" onClick={() => { log('Suspicious email opened', 'A simulated account-warning email was inspected.'); toast('Inspect the sender and wording, then report the email if suspicious.') }}><b>University IT Desk <em>SIMULATED</em></b><small>URGENT: Verify your student account</small><p>Your account may be restricted. Confirm your identity using the secure student portal immediately. This message refers to the parcel notification you received.</p><span>09:54 · Fictional phishing example</span></article><div className="ps-message-actions"><button onClick={() => { log('Email reported', 'The suspicious training email was reported.'); completeMission(1); toast('Mission 2 completed — email reported') }}>⚑ Report phishing</button><button onClick={() => toast('Compose window opened')}>＋ Compose</button></div></div>
    if (activeApp === 'whatsapp') return <div className="ps-app-view">
      <div className="ps-app-top"><button onClick={() => whatsappChatOpen ? setWhatsappChatOpen(false) : goHome()}>‹</button><strong>WhatsApp</strong><button onClick={() => toast('New chat opened')}>＋</button></div>
      {!whatsappChatOpen ? <>
        <div className="ps-chat-row" onClick={() => toast('Chat opened: Aiden') }><span className="ps-avatar">A</span><div><b>Aiden · Classmate</b><small>Don't share any verification codes.</small></div><time>09:12</time></div>
        <div className="ps-chat-row" onClick={() => { setWhatsappChatOpen(true); log('Unknown WhatsApp chat opened', 'The learner opened the fictional IT Helpdesk conversation and can now inspect the request.'); toast('Inspect the request before deciding how to respond') }}><span className="ps-avatar ps-avatar-alert">!</span><div><b>University IT Helpdesk</b><small>Send the 6-digit code you just received so we can secure your account.</small></div><time>08:47</time></div>
        <div className="ps-chat-row" onClick={() => toast('Class group opened')}><span className="ps-avatar">C</span><div><b>IT Security Class</b><small>IT says never share your one-time code.</small></div><time>Yesterday</time></div>
      </> : <>
        <div className="ps-contact" style={{padding: '14px'}}><span className="ps-avatar ps-avatar-alert">!</span><strong>University IT Helpdesk</strong><small>Business account · Not in contacts</small></div>
        <div className="ps-date">Today 08:47</div>
        <div className="ps-bubble ps-incoming">We detected an issue with your student account. Send us the 6-digit verification code you just received so we can secure your account.</div>
        <div className="ps-warning"><strong>Think before responding</strong><p>A legitimate support team should not ask you to disclose a one-time verification code in a chat.</p></div>
        <div className="ps-message-actions"><button onClick={() => { log('Helpdesk impersonator reported and blocked', 'The learner refused to share the code and reported the suspicious contact.'); completeMission(2); toast('Mission 3 completed — contact reported and blocked') }}>⚑ Report and block</button><button onClick={() => toast('Safe choice: do not send a verification code')}>Do not share code</button></div>
      </>}
      <div className="ps-message-actions"><button onClick={() => toast('Calls list opened')}>☎ Calls</button><button onClick={() => toast('Status list opened')}>◉ Updates</button></div>
    </div>
    if (activeApp === 'instagram' || activeApp === 'tiktok' || activeApp === 'x') { const name = activeApp === 'instagram' ? 'Instagram' : activeApp === 'tiktok' ? 'TikTok' : 'X'; return <div className="ps-app-view"><div className="ps-app-top"><button onClick={goHome}>‹</button><strong>{name}</strong><button onClick={() => toast('Notifications opened')}>♡</button></div><div className="ps-social-story"><span>◎</span><span>Friends</span><span>Campus</span><span>Explore</span></div><article className="ps-social-post"><div className="ps-post-head"><span className="ps-avatar">{activeApp === 'x' ? 'X' : 'C'}</span><b>{activeApp === 'x' ? 'Eduvos Account Support' : 'student.account.support'}</b><small>Sponsored · Fictional</small></div><div className="ps-post-art"><span>🎁</span><strong>STUDENT ACCOUNT ALERT</strong><small>Verify your account to avoid suspension</small></div><p>Impersonation warning: this profile claims to represent university IT and directs students to a verification page. Check the account independently.</p><div className="ps-post-actions"><button onClick={() => toast('Liked in simulation')}>♡ Like</button><button onClick={() => toast('Comments opened')}>▢ Comment</button><button onClick={() => { log('Suspicious social post reported', 'A fictional impersonation profile was reported.'); completeMission(3); toast('Social profile mission completed') }}>⚑ Report</button></div></article></div> }
    if (activeApp === 'phone') return <div className="ps-app-view"><div className="ps-app-top"><button onClick={goHome}>‹</button><strong>Phone</strong><button onClick={() => toast('Keypad opened')}>⌗</button></div><div className="ps-call-screen"><span className="ps-avatar ps-avatar-alert">IT</span><h3>{callState === 'incoming' ? 'University IT Desk' : callState === 'declined' ? 'Call declined' : 'Call ended'}</h3><p>{callState === 'incoming' ? 'Incoming call · Unknown number' : 'Simulated call status'}</p>{callState === 'incoming' ? <div className="ps-call-actions"><button className="ps-decline" onClick={() => { setCallState('declined'); completeMission(4); log('Suspicious call declined', 'The learner declined an unsolicited IT support call.'); toast('Call mission completed — call declined') }}>✕<small>Decline</small></button><button className="ps-answer" onClick={() => { setCallState('answered'); log('Suspicious call answered', 'The learner answered a simulated call connected to the same student-account incident.'); toast('Simulation: caller claims to be IT and requests the one-time code') }}>☎<small>Answer</small></button></div> : <div className="ps-message-actions"><button className="ps-primary" onClick={() => { setCallState('declined'); completeMission(4); log('Suspicious call ended', 'The learner ended the unsolicited simulated IT support call.'); toast('Mission 5 completed — call ended safely') }}>End call</button><button onClick={() => setCallState('incoming')}>Reset call</button></div>}</div></div>
    if (activeApp === 'settings') return <div className="ps-app-view"><div className="ps-app-top"><button onClick={goHome}>‹</button><strong>Settings</strong><span/></div>{['Airplane Mode','Wi-Fi','Bluetooth','Notifications','Privacy & Security','General','About this device'].map((item,i)=><button className="ps-setting-row" key={item} onClick={() => { log(`${item} opened`, 'A device settings panel was opened.'); if (item === 'Privacy & Security' || item === 'About this device') completeMission(5); toast(`${item} settings opened`) }}><span>{['✈','◉','ᛒ','◉','◈','⚙','ⓘ'][i]}</span>{item}<b>›</b></button>)}</div>
    return null
  }

  return <div className="ps-lab-page">
    <header className="ps-lab-header"><div><span className="ps-eyebrow">CYBERSHIELD · INTERCONNECTED MISSION</span><h1>Student account investigation</h1><p>One phone. Multiple apps. Follow the clues and decide what is safe.</p></div><button className="ps-back" onClick={onBack}>← Back to Lab</button></header>
    <div className="ps-lab-layout">
      <section className="ps-device-stage"><div className="ps-device"><div className="ps-dynamic-island"/><div className="ps-status"><span>9:41</span><span>▮▮▮  Wi-Fi  ▰</span></div>
        {screen === 'lock' && <button className="ps-lock-screen" onClick={() => setScreen('home')}><span>Thursday, 12 November</span><strong>9:41</strong><small>Tap to unlock</small><div className="ps-lock-notice">✉ <span><b>Campus Parcel</b><small>Your delivery needs attention.</small></span></div><span className="ps-lock-bottom">◉</span></button>}
        {screen === 'home' && <div className="ps-home-screen"><div className="ps-home-date">Thursday, November 12 <b>9:41</b></div><div className="ps-app-grid">{appTiles.map(tile=><button key={tile.id} className="ps-app-tile" onClick={() => openApp(tile.id)}><span style={{ background: tile.color }}>{tile.icon}{tile.unread && <i/>}</span><small>{tile.label}</small></button>)}</div><div className="ps-dock">{['phone','messages','mail','settings'].map(id=>{const tile=appTiles.find(a=>a.id===id);return <button key={id} onClick={() => openApp(id)} title={tile.label} style={{background:tile.color}}>{tile.icon}</button>})}</div></div>}
        {screen === 'app' && renderApp()}
        <div className="ps-home-indicator" onClick={goHome}/>
      </div><div className="ps-device-caption"><span className="ps-live-dot"/> SIMULATED DEVICE · ISOLATED SESSION</div></section>
      <aside className="ps-mission-panel"><div className="ps-panel-kicker">ACTIVE TRAINING MISSION</div><h2>Investigate the compromised student account</h2><p>A suspicious delivery SMS, university email and messages from people claiming to be IT support may be connected. Investigate the phone and decide what to do.</p><div className="ps-mission-progress"><div className="ps-progress-label"><b>MISSION {missionIndex + 1} OF {missions.length}</b><span>{completedMissions.length}/{missions.length} completed</span></div><div className="ps-progress-track"><span style={{ width: `${completedMissions.length / missions.length * 100}%` }}/></div></div><h3 className="ps-current-mission">{currentMission.title}</h3><p className="ps-mission-objective">{currentMission.objective}</p><div className="ps-mission-tip"><b>Your objective</b><span>{currentMission.task}</span></div><div className="ps-mission-tip"><b>Investigation tip</b><span>{currentMission.tip}</span></div><button className="ps-continue" disabled={!completedMissions.includes(missionIndex)} onClick={continueMission}>{missionIndex === missions.length - 1 ? 'Finish investigation' : 'Continue to next mission'} <span>→</span></button><small className="ps-continue-hint">{completedMissions.includes(missionIndex) ? 'Objective completed. Continue when ready.' : 'Complete the current objective to unlock Continue.'}</small><div className="ps-mission-tip"><b>Learning objective</b><span>Recognise urgency, unknown senders and suspicious web addresses.</span></div><div className="ps-event-feed"><div className="ps-feed-head"><b>SIMULATION ACTIVITY</b><span>{events.length} events</span></div>{events.map((event,i)=><div className="ps-feed-item" key={`${event.title}-${i}`}><span/><div><b>{event.title}</b><small>{event.detail}</small><time>{event.time}</time></div></div>)}</div><button className="ps-reset" onClick={() => { setScreen('lock');setActiveApp('');setEvents([{ title: 'Simulation reset', detail: 'The phone returned to its lock screen and all mission progress was cleared.', time: 'Now' }]);setReported(false);setLinkWarning(false);setCallState('incoming');setWhatsappChatOpen(false);setMissionIndex(0);setCompletedMissions([]) }}>Reset simulation</button></aside>
    </div>{notification && <div className="ps-toast" role="status">{notification}</div>}
  </div>
}

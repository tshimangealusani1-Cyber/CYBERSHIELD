import { useEffect, useState } from 'react'
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
  { id: 'safari', label: 'Safari', icon: '🧭', color: '#1689ed' },
]


function PhoneAppGlyph({ id }) {
  const base = { viewBox: '0 0 48 48', width: 31, height: 31, 'aria-hidden': true, className: 'ps-app-glyph' }
  if (id === 'messages') return <svg {...base}><path d="M8 10h32a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H20L9 43v-6h-1a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4Z" fill="none" stroke="white" strokeWidth="3.2" strokeLinejoin="round"/><path d="M13 20h22M13 27h15" stroke="white" strokeWidth="2.8" strokeLinecap="round"/></svg>
  if (id === 'mail') return <svg {...base}><path d="M6 11h36v26H6z" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round"/><path d="m7 13 17 14 17-14" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round"/></svg>
  if (id === 'whatsapp') return <svg {...base}><path d="M24 5a18 18 0 0 0-15.5 27.2L6 42l10-2.5A18 18 0 1 0 24 5Z" fill="none" stroke="white" strokeWidth="3"/><path d="M17 15c-2 2-1 7 4 12s10 6 12 3l-4-4-4 2-6-6 2-4-4-3Z" fill="white"/></svg>
  if (id === 'instagram') return <svg {...base}><rect x="6" y="6" width="36" height="36" rx="11" fill="none" stroke="white" strokeWidth="3"/><circle cx="24" cy="24" r="8" fill="none" stroke="white" strokeWidth="3"/><circle cx="35" cy="13" r="2.5" fill="white"/></svg>
  if (id === 'tiktok') return <svg {...base}><path d="M28 7v22a9 9 0 1 1-8-9" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"/><path d="M28 8c2 6 6 9 12 10" fill="none" stroke="#ff4d70" strokeWidth="4" strokeLinecap="round"/></svg>
  if (id === 'x') return <svg {...base}><path d="M9 8h8l22 32h-8L9 8Zm0 32L21 25m7-8 11-9" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/></svg>
  if (id === 'phone') return <svg {...base}><path d="M14 7h7l3 9-5 4c3 6 6 9 12 12l4-5 8 3v7c0 3-3 5-6 5C20 40 8 28 6 13c0-3 3-6 8-6Z" fill="white"/></svg>
  if (id === 'settings') return <svg {...base}><path d="m20 5 8 0 1.5 5 4 2.3 5-1 4 7-3.5 3.5v4.4l3.5 3.8-4 7-5-1-4 2.2L28 43h-8l-1.5-4.8-4-2.2-5 1-4-7 3.5-3.8v-4.4L5.5 18l4-7 5 1 4-2.3Z" fill="none" stroke="white" strokeWidth="2.6" strokeLinejoin="round"/><circle cx="24" cy="24" r="7" fill="none" stroke="white" strokeWidth="3"/></svg>
  return <svg {...base}><circle cx="24" cy="24" r="17" fill="none" stroke="white" strokeWidth="2.6"/><path d="m30 12-5 13-13 11 5-13z" fill="white"/><circle cx="24" cy="24" r="3" fill="#247ee9"/></svg>
}

function IOSWallpaper() {
  return <svg className="ps-ios-wallpaper" viewBox="0 0 430 920" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="celosia-night" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#04172b"/><stop offset=".48" stopColor="#0d3a55"/><stop offset="1" stopColor="#06152d"/></linearGradient>
    <linearGradient id="celosia-ribbon-a" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d8f4ee"/><stop offset=".2" stopColor="#78cbd4"/><stop offset=".52" stopColor="#277eb6"/><stop offset=".82" stopColor="#17477f"/><stop offset="1" stopColor="#071c42"/></linearGradient>
    <linearGradient id="celosia-ribbon-b" x1="1" y1="0" x2="0" y2="1"><stop stopColor="#e4f6e8"/><stop offset=".22" stopColor="#9bdcc8"/><stop offset=".48" stopColor="#4c9ca5"/><stop offset=".8" stopColor="#245a78"/><stop offset="1" stopColor="#0a2444"/></linearGradient>
    <linearGradient id="celosia-edge" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#effff8" stopOpacity=".05"/><stop offset=".48" stopColor="#d8fff4" stopOpacity=".8"/><stop offset="1" stopColor="#8ec8ea" stopOpacity=".08"/></linearGradient>
    <filter id="celosia-shadow" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation="20"/></filter>
  </defs>
  <rect width="430" height="920" fill="url(#celosia-night)"/>
  <ellipse cx="225" cy="430" rx="260" ry="430" fill="#3ab9bd" opacity=".16" filter="url(#celosia-shadow)"/>
  <path d="M-48 228C44 38 235 13 337 143c62 79 41 151-23 211-47 45-117 77-172 127-65 59-98 123-102 208C3 576-27 460-48 228Z" fill="#020718" opacity=".72" filter="url(#celosia-shadow)"/>
  <path d="M-48 228C44 38 235 13 337 143c62 79 41 151-23 211-47 45-117 77-172 127-65 59-98 123-102 208C3 576-27 460-48 228Z" fill="url(#celosia-ribbon-a)"/>
  <path d="M-25 193C69 42 227 28 310 132c45 57 31 114-19 162-46 44-111 77-160 126-42 42-72 92-88 151 12-105 53-184 120-249 57-54 116-86 128-133 13-49-23-91-78-108C133 63 52 104-25 193Z" fill="url(#celosia-edge)" opacity=".72"/>
  <path d="M-50 748C71 557 230 486 362 550c94 45 103 144 46 232-58 89-171 142-327 180 84-74 140-141 153-209 12-60-15-101-67-118-60-20-125 16-217 113Z" fill="#020718" opacity=".75" filter="url(#celosia-shadow)"/>
  <path d="M-50 748C71 557 230 486 362 550c94 45 103 144 46 232-58 89-171 142-327 180 84-74 140-141 153-209 12-60-15-101-67-118-60-20-125 16-217 113Z" fill="url(#celosia-ribbon-b)"/>
  <path d="M-4 755C105 605 232 551 336 590c68 26 85 84 52 145-44 81-137 132-253 174 93-76 143-139 145-194 1-39-23-65-62-71-58-9-123 32-222 111Z" fill="url(#celosia-edge)" opacity=".68"/>
  <path d="M178 414c59-45 108-88 149-145 4 84-39 139-105 195-58 49-97 98-120 171 2-94 27-163 76-221Z" fill="#c6ddf4" opacity=".19"/>
  <path d="M84 895c108-87 228-139 358-155v180H84Z" fill="#040b22" opacity=".24"/>
  </svg>
}

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
  const [smsSteps, setSmsSteps] = useState({ sender: false, destination: false })
  const [emailReviewed, setEmailReviewed] = useState(false)
  const [whatsappChatOpen, setWhatsappChatOpen] = useState(false)
  const [notification, setNotification] = useState('')
  const [browserSteps, setBrowserSteps] = useState({ url: false, comparison: false, blocked: false })
  const [wifiSteps, setWifiSteps] = useState({ inspected: false, connected: false })
  const [controlCenter, setControlCenter] = useState(false)
  const [quickToggles, setQuickToggles] = useState({ wifi: true, bluetooth: false, focus: false, airplane: false })
  const [brightness, setBrightness] = useState(82)
  const [focusMode, setFocusMode] = useState(false)
  const [missionPanelOpen, setMissionPanelOpen] = useState(false)
  const missions = [
    { app: 'messages', title: 'Mission 1: Investigate the SMS', objective: 'Open the suspicious message, inspect the sender and destination, then report or block the message.', task: 'Inspect the suspicious delivery SMS and report it.', tip: 'Look for urgency, unfamiliar domains and requests for account verification.' },
    { app: 'mail', title: 'Mission 2: Verify the university email', objective: 'Open the university security email. Compare its sender, wording and request with the SMS. Report it if suspicious.', task: 'Inspect and report the suspicious university email.', tip: 'A familiar display name does not prove that an email is genuine.' },
    { app: 'whatsapp', title: 'Mission 3: Investigate WhatsApp', objective: 'Open the IT Helpdesk conversation. Inspect what the sender requests and decide how to respond.', task: 'Inspect the unknown IT Helpdesk chat and identify the dangerous request.', tip: 'Never share a one-time password or verification code with another person.' },
    { app: 'instagram', title: 'Mission 4: Check the social profile', objective: 'Inspect the support profile and its post. Decide whether the account is legitimate and report suspicious impersonation.', task: 'Inspect and report the suspicious support profile.', tip: 'Check account identity, history and independent verification.' },
    { app: 'phone', title: 'Mission 5: Handle the incoming call', objective: 'Inspect the caller and decide whether to answer. If answered, do not disclose sensitive information.', task: 'Handle the unsolicited IT support call safely.', tip: 'End unexpected calls requesting passwords, codes or remote access.' },
    { app: 'settings', title: 'Mission 6: Secure the device', objective: 'Explore Privacy & Security and Notifications. Identify where you would review account and device security.', task: 'Inspect the device security settings.', tip: 'Use official settings and trusted channels to secure accounts.' },
    { app: 'safari', title: 'Mission 7: Inspect the destination', objective: 'Open the browser, inspect the suspicious destination and compare it with a trusted address. Do not enter personal information.', task: 'Inspect the fictional destination and identify the warning signs.', tip: 'HTTPS does not prove a site is legitimate. Check the exact domain and how you arrived there.' },
    { app: 'wifi', title: 'Mission 8: Review Wi-Fi security', objective: 'Inspect nearby fictional Wi-Fi networks and choose a trusted secured network. Avoid open or lookalike hotspots.', task: 'Connect only to the trusted training network.', tip: 'Avoid unknown open hotspots for sensitive activity; verify network names with the venue.' },
  ]
  const [missionIndex, setMissionIndex] = useState(0)
  const [completedMissions, setCompletedMissions] = useState([])
  const currentMission = missions[missionIndex]
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
    const onFullscreenChange = () => { if (!document.fullscreenElement) { setFocusMode(false); setMissionPanelOpen(false) } }
    const onEscape = (event) => { if (event.key === 'Escape' && !document.fullscreenElement) { setFocusMode(false); setMissionPanelOpen(false) } }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])
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
      log('Smartphone investigation completed', 'All eight mission objectives were completed.')
      toast('Investigation complete — returning to CyberShield home.')
      window.setTimeout(async () => {
        try { if (document.fullscreenElement) await document.exitFullscreen() } catch { /* Continue to home if fullscreen exit is unavailable */ }
        onBack?.()
      }, 650)
    }
  }

  const log = (title, detail) => setEvents(old => [{ title, detail, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...old].slice(0, 8))
  const toast = (message) => { setNotification(message); window.setTimeout(() => setNotification(''), 2400) }
  const openApp = (id) => { setActiveApp(id); setScreen('app'); setLinkWarning(false); log(`Opened ${appTiles.find(a => a.id === id)?.label || id}`, 'Application opened inside the isolated training device.') }
  const goHome = () => { setScreen('home'); setActiveApp(''); setLinkWarning(false) }
  const reportMessage = () => { setReported(true); completeMission(0); log('Suspicious message reported', 'The fictional SMS was reported to the simulated security team.'); toast('Mission 1 completed — message reported') }

  const renderApp = () => {
    if (activeApp === 'messages') return <div className="ps-app-view">
      <div className="ps-app-top"><button onClick={goHome}>‹</button><div className="ps-contact"><span className="ps-avatar">P</span><strong>Campus Parcel</strong><small>Unknown sender · SMS</small></div><button onClick={() => {setSmsSteps(v=>({...v,sender:true}));log('SMS sender details inspected','The sender is an unknown number rather than a verified campus contact.');toast('Sender details inspected')}}>ⓘ</button></div>
      <div className="ps-date">Today 10:42</div>
      <div className="ps-bubble ps-incoming">Your campus parcel is on hold. Confirm your student delivery address within 2 hours. University account verification may be required: <button className="ps-inline-link" onClick={() => { setLinkWarning(true); setSmsSteps(v=>({...v,destination:true})); log('Suspicious link selected', 'The training link was intercepted before navigation.') }}>campus-delivery-verify.example</button></div>
      {linkWarning && <div className="ps-warning"><strong>CyberShield safety intercept</strong><p>This fictional link has an unfamiliar domain and uses urgency. No external website was opened.</p><button onClick={() => { setLinkWarning(false); log('Link inspection completed', 'The learner reviewed the suspicious destination.') }}>Understood</button></div>}
      <div className="ps-message-actions"><button disabled={!smsSteps.sender || !smsSteps.destination} onClick={reportMessage}>{reported ? '✓ Reported' : '⚑ Report message'}</button><button disabled={!smsSteps.sender || !smsSteps.destination} onClick={() => { setReported(true); completeMission(0); log('Sender blocked', 'The fictional sender was blocked.'); toast('Sender blocked') }}>Block sender</button></div>
      <div className="ps-composer"><span>iMessage / SMS</span><button onClick={() => toast('Message composer opened')}>＋</button><button onClick={() => toast('This training device does not send real messages')}>↑</button></div>
    </div>
    if (activeApp === 'mail') return <div className="ps-app-view"><div className="ps-app-top"><button onClick={goHome}>‹</button><strong>Inbox</strong><button onClick={() => toast('Inbox refreshed')}>↻</button></div><div className="ps-mail-search">⌕ Search mail</div><article className="ps-mail-item" onClick={() => toast('Opened: Student account storage warning')}><b>Eduvos Student Services</b><small>Student account security notice</small><p>A parcel delivery was flagged. Review the sender and compare this message with the SMS you received.</p><span>10:18 · Training example</span></article><article className="ps-mail-item ps-suspicious" onClick={() => { setEmailReviewed(true); log('Suspicious email opened', 'A simulated account-warning email was inspected.'); toast('Inspect the sender and wording, then report the email if suspicious.') }}><b>University IT Desk <em>SIMULATED</em></b><small>URGENT: Verify your student account</small><p>Your account may be restricted. Confirm your identity using the secure student portal immediately. This message refers to the parcel notification you received.</p><span>09:54 · Fictional phishing example</span></article><div className="ps-message-actions"><button disabled={!emailReviewed} onClick={() => { log('Email reported', 'The suspicious training email was reported.'); completeMission(1); toast('Mission 2 completed — email reported') }}>⚑ Report phishing</button><button onClick={() => toast('Compose window opened')}>＋ Compose</button></div></div>
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
    if (activeApp === 'settings') return <div className="ps-app-view"><div className="ps-app-top"><button onClick={goHome}>‹</button><strong>Settings</strong><span/></div>{['Airplane Mode','Wi-Fi','Bluetooth','Notifications','Privacy & Security','General','About this device'].map((item,i)=><button className="ps-setting-row" key={item} onClick={() => { if(item==='Wi-Fi'){setActiveApp('wifi');log('Wi-Fi settings opened','Available simulated wireless networks were inspected.');return} log(`${item} opened`, 'A device settings panel was opened.'); if (item === 'Privacy & Security' || item === 'About this device') completeMission(5); toast(`${item} settings opened`) }}><span>{['✈','◉','ᛒ','◉','◈','⚙','ⓘ'][i]}</span>{item}<b>›</b></button>)}</div>
    if (activeApp === 'wifi') return <div className="ps-app-view"><div className="ps-app-top"><button onClick={() => setActiveApp('settings')}>‹</button><strong>Wi-Fi Networks</strong><span>⌕</span></div><p className="ps-lab-intro">Choose a verified network. All networks below are fictional training examples.</p>{[{name:'Eduvos-Student-Secure',detail:'WPA3 · Verified campus network',safe:true},{name:'Eduvos_Free_WiFi',detail:'Open network · No encryption',safe:false},{name:'Eduvos-Student-Support',detail:'WPA2 · Unverified lookalike',safe:false}].map(n=><div className="ps-wifi-card" key={n.name}><div className="ps-wifi-info"><b>{n.name}</b><small>{n.detail}</small></div>{n.safe ? <><button onClick={() => {setWifiSteps(v=>({...v,inspected:true}));log('Secure network details inspected','The training network identity and WPA3 security profile were reviewed.');toast('Verified network details reviewed')}}>{wifiSteps.inspected?'✓ Details reviewed':'Inspect'}</button><button disabled={!wifiSteps.inspected} onClick={() => {setWifiSteps(v=>({...v,connected:true}));completeMission(7);log('Trusted Wi-Fi selected',`${n.name} was selected after verifying its identity and WPA3 security.`);toast('Mission 8 completed — secure training network connected')}}>{wifiSteps.connected?'✓ Connected':'Connect'}</button></> : <button className="ps-wifi-avoid" onClick={() => {log('Risky Wi-Fi avoided',`${n.name} was rejected because it is open or an unverified lookalike.`);toast('Good decision — avoid unknown or lookalike hotspots')}}>Avoid</button>}</div>)}<div className="ps-warning"><strong>Security reminder</strong><p>Verify the network name with the organisation. Avoid open or lookalike hotspots for sensitive activity.</p></div></div>
    if (activeApp === 'safari') return <div className="ps-app-view"><div className="ps-app-top"><button onClick={goHome}>‹</button><strong>Safari</strong><button onClick={() => toast('Private browsing is simulated')}>▢</button></div><div className="ps-safari-toolbar"><span>🔒</span><span>campus-delivery-verify.example</span><button onClick={() => {setBrowserSteps(v=>({...v,url:true}));log('Browser address inspected','The full fictional destination domain was reviewed.')}}>{browserSteps.url?'✓':'Inspect'}</button></div><div className="ps-safari-page"><small>STUDENT PORTAL · FICTIONAL TRAINING PAGE</small><h3>Verify your student account</h3><p>This page claims your student access will be restricted unless you verify your details after a delivery alert.</p><div className="ps-warning"><strong>Potential phishing destination</strong><p>Compare the domain with the official university website. This address uses a lookalike pattern and was reached through an unexpected message.</p></div><div className="ps-safari-actions"><button disabled={!browserSteps.url} onClick={() => {setBrowserSteps(v=>({...v,comparison:true}));log('Trusted domain comparison completed','The destination was compared against the trusted university portal saved in this training scenario.')}}>{browserSteps.comparison?'✓ Domain compared':'Compare trusted domain'}</button><button className="ps-wifi-avoid" disabled={!browserSteps.comparison} onClick={() => {setBrowserSteps(v=>({...v,blocked:true}));completeMission(6);log('Suspicious destination blocked','Learner blocked and left the fictional phishing destination after comparing the domain.');toast('Mission 7 completed — suspicious destination blocked')}}>{browserSteps.blocked?'✓ Destination blocked':'Block and leave page'}</button></div><p className="ps-safety-note">No external websites are opened. No credentials or personal data can be entered.</p></div></div>
    return null
  }

  return <div className={`ps-lab-page ${focusMode ? 'ps-device-focus' : ''} ${focusMode && missionPanelOpen ? 'ps-show-mission' : ''}`}>
    {focusMode && <div className="ps-focus-toolbar"><span>iPhone · CyberShield training device</span><div><button onClick={() => setMissionPanelOpen(v => !v)}>☰ Mission</button><button onClick={toggleFocusMode}>Exit full screen ×</button></div></div>}
    <header className="ps-lab-header"><div><span className="ps-eyebrow">CYBERSHIELD · INTERCONNECTED MISSION</span><h1>Student account investigation</h1><p>One phone. Multiple apps. Follow the clues and decide what is safe.</p></div><div className="ps-header-actions"><button className="ps-fullscreen-button" onClick={toggleFocusMode}>⛶ Full screen device</button><button className="ps-back" onClick={onBack}>← Back to Lab</button></div></header>
    <div className="ps-lab-layout">
      <section className="ps-device-stage"><div className="ps-device"><IOSWallpaper/><div className="ps-dynamic-island"/><div className="ps-status"><span>9:41</span><button onClick={() => setControlCenter(v => !v)} aria-label="Open Control Centre"><svg viewBox="0 0 76 18" width="68" height="16" aria-hidden="true"><path d="M2 15V11h4v4M9 15V8h4v7M16 15V5h4v10M24 6c5 0 9 3 11 7M27 10c3 0 5 1 6 3M30 14h.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="43" y="4" width="25" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5"/><rect x="45.5" y="6.5" width="17" height="6" rx="1.5" fill="currentColor"/><path d="M70 7v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button></div>
        {screen === 'lock' && <button className="ps-lock-screen" onClick={() => setScreen('home')}><span>Friday, 13 November</span><strong>9:41</strong><small>Tap to unlock</small><div className="ps-lock-notice">✉ <span><b>Campus Parcel</b><small>Your delivery needs attention.</small></span></div><span className="ps-lock-bottom">◉</span></button>}
        {screen === 'home' && <div className="ps-home-screen"><div className="ps-home-date">Friday, November 13 <b>9:41</b></div><div className="ps-app-grid">{appTiles.map(tile=><button key={tile.id} className="ps-app-tile" onClick={() => openApp(tile.id)}><span style={{ background: tile.color }}><PhoneAppGlyph id={tile.id}/>{tile.unread && <i/>}</span><small>{tile.label}</small></button>)}</div><div className="ps-dock">{['phone','messages','mail','settings'].map(id=>{const tile=appTiles.find(a=>a.id===id);return <button key={id} onClick={() => openApp(id)} title={tile.label} style={{background:tile.color}}><PhoneAppGlyph id={id}/></button>})}</div></div>}
        {screen === 'app' && renderApp()}
        {controlCenter && <section className="ps-control-centre" aria-label="Simulated Control Centre">
          <div className="ps-control-head"><b>Control Centre</b><button onClick={() => setControlCenter(false)}>Done</button></div>
          <div className="ps-control-grid">
            {[['wifi','◉','Wi-Fi'],['bluetooth','ᛒ','Bluetooth'],['focus','☾','Focus'],['airplane','✈','Airplane']].map(([key,icon,label])=><button key={key} className={quickToggles[key]?'active':''} onClick={() => {setQuickToggles(v=>({...v,[key]:!v[key]}));log(`${label} ${quickToggles[key]?'disabled':'enabled'}`,`${label} setting changed in the simulated Control Centre.`)}}><span>{icon}</span><small>{label}</small></button>)}
          </div>
          <label className="ps-control-slider">Display brightness <b>{brightness}%</b><input type="range" min="10" max="100" value={brightness} onChange={e=>setBrightness(Number(e.target.value))}/></label>
          <div className="ps-control-foot">Training device settings only · No real device controls</div>
        </section>}
        <div className="ps-home-indicator" onClick={() => {setControlCenter(false);goHome()}}/>
      </div><div className="ps-device-caption"><span className="ps-live-dot"/> SIMULATED DEVICE · ISOLATED SESSION</div></section>
      <aside className="ps-mission-panel"><div className="ps-panel-head"><div><span className="ps-panel-kicker">ACTIVE TRAINING</span><small>{missionIndex + 1} OF {missions.length} · STUDENT ACCOUNT</small></div><span className={`ps-mission-state ${completedMissions.includes(missionIndex) ? 'complete' : ''}`}>{completedMissions.includes(missionIndex) ? 'Complete' : 'In progress'}</span></div><h2>{currentMission.title}</h2><div className="ps-objective-card"><span>MISSION OBJECTIVE</span><p>{currentMission.objective}</p></div><div className="ps-mission-progress"><div className="ps-progress-label"><b>OVERALL PROGRESS</b><span>{completedMissions.length}/{missions.length}</span></div><div className="ps-progress-track"><span style={{ width: `${completedMissions.length / missions.length * 100}%` }}/></div></div><details className="ps-panel-details"><summary>Investigation hint</summary><p>{currentMission.tip}</p></details><button className="ps-continue" disabled={!completedMissions.includes(missionIndex)} onClick={continueMission}>{missionIndex === missions.length - 1 ? 'Finish investigation' : 'Continue to next mission'} <span>→</span></button><small className="ps-continue-hint">{completedMissions.includes(missionIndex) ? 'Mission completed. Continue when ready.' : 'Complete the objective in the device to continue.'}</small><details className="ps-panel-details ps-activity-details"><summary>Activity log <span>{events.length} events</span></summary>{events.map((event,i)=><div className="ps-feed-item" key={`${event.title}-${i}`}><b>{event.title}</b><small>{event.detail}</small><time>{event.time}</time></div>)}</details><button className="ps-reset" onClick={() => { setScreen('lock');setActiveApp('');setEvents([{ title: 'Simulation reset', detail: 'The phone returned to its lock screen and all mission progress was cleared.', time: 'Now' }]);setReported(false);setSmsSteps({sender:false,destination:false});setEmailReviewed(false);setLinkWarning(false);setCallState('incoming');setWhatsappChatOpen(false);setBrowserSteps({url:false,comparison:false,blocked:false});setWifiSteps({inspected:false,connected:false});setControlCenter(false);setQuickToggles({wifi:true,bluetooth:false,focus:false,airplane:false});setBrightness(82);setMissionIndex(0);setCompletedMissions([]) }}>Reset simulation</button></aside>
    </div>{notification && <div className="ps-toast" role="status">{notification}</div>}
  </div>
}

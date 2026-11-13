import { useState } from 'react'
import './ShieldyAssistant.css'

const API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000').replace(/\/$/, '')
const starters = ['How can I spot a phishing message?', 'What should I do if I shared an OTP?', 'Give me a hint for this lab']

export default function ShieldyAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hi! I'm Shieldy, your CyberShield guide. Ask me about phishing, account safety, or how to use the training labs." }])
  const send = async (value = input) => {
    const prompt = value.trim()
    if (!prompt || busy) return
    const next = [...messages, { role: 'user', content: prompt }]
    setMessages(next); setInput(''); setBusy(true)
    try {
      const response = await fetch(`${API}/api/assistant/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt, history: messages.slice(-8).map(({ role, content }) => ({ role, content })) }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Assistant unavailable')
      setMessages(old => [...old, { role: 'assistant', content: data.reply, source: data.source }])
    } catch {
      setMessages(old => [...old, { role: 'assistant', content: 'I can still help with the basics: pause before clicking, verify the sender through a trusted channel, never share passwords or one-time codes, and report suspicious activity. The live AI service is currently unavailable.', source: 'offline' }])
    } finally { setBusy(false) }
  }
  return <>
    <button className="shieldy-launch" onClick={() => setOpen(v => !v)} aria-label="Open Shieldy assistant"><span>✦</span><b>{open ? 'Close' : 'Ask Shieldy'}</b></button>
    {open && <section className="shieldy-panel" aria-label="Shieldy cybersecurity assistant">
      <header><div className="shieldy-avatar">✦</div><div><b>Shieldy</b><small>Cybersecurity learning assistant</small></div><button onClick={() => setOpen(false)} aria-label="Close assistant">×</button></header>
      <div className="shieldy-messages">{messages.map((m, i) => <article key={i} className={`shieldy-message ${m.role}`}>{m.content}{m.source === 'gemini' && <small>Gemini · live AI response</small>}{m.source === 'fallback' && <small>Guided fallback response</small>}{m.source === 'offline' && <small>Offline guidance</small>}</article>)}{busy && <article className="shieldy-message assistant">Shieldy is thinking…</article>}</div>
      {messages.length === 1 && <div className="shieldy-starters">{starters.map(s => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>}
      <form onSubmit={e => { e.preventDefault(); send() }}><input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a cybersecurity question…" maxLength={1200}/><button disabled={busy || !input.trim()}>Send</button></form>
      <footer>Training guidance only · Never share real passwords or codes</footer>
    </section>}
  </>
}

import { useEffect, useMemo, useState } from 'react'
import './LearningHub.css'

const courses = [
  { id:'phishing-foundations', title:'Phishing & Social Engineering', level:'Beginner', duration:'35 min', description:'Analyse layered social-engineering attempts, sender spoofing and malicious destinations.', lessons:[
    {title:'How phishing works', body:'Modern phishing chains often combine a compromised mailbox, a lookalike domain, a trusted cloud document and an adversary-in-the-middle sign-in page. Analyse the requested action, identity context, destination and expected workflow together; a single spelling error is not a sufficient detection rule.', task:'Identify the action the sender wants you to take before deciding whether the message is legitimate.'},
    {title:'Inspect the sender and destination', body:'Compare the visible sender with authenticated message details where available, inspect the registrable domain, consider redirect chains and validate the request against known business context. SPF, DKIM and DMARC alignment are useful signals, not proof that a message is safe.', task:'Do not use contact details or links supplied by a suspicious message to verify that same message.'},
    {title:'Pressure and persuasion', body:'Urgency, fear, secrecy, authority and unusually attractive rewards are common manipulation techniques. Pause when a message pressures you to act immediately.', task:'Slow down, verify independently and report suspicious messages through an approved channel.'},
  ]},
  { id:'account-defence', title:'Account & Identity Protection', level:'Beginner', duration:'25 min', description:'Apply identity controls, session analysis, MFA risk reduction and least privilege.', lessons:[
    {title:'Strong unique passwords', body:'Use a unique password for every important account. A reputable password manager can generate and store long random passwords. Never share passwords or one-time codes with callers.', task:'Prioritise your email account because it can often reset access to other services.'},
    {title:'Multi-factor authentication', body:'MFA can be bypassed through prompt bombing, SIM swapping, token theft and adversary-in-the-middle proxies. Prefer phishing-resistant FIDO2/WebAuthn methods where supported; investigate unfamiliar sessions and revoke compromised refresh tokens rather than only changing a password.', task:'Never approve an authentication request just because someone claims to be IT support.'},
    {title:'Recovery and session hygiene', body:'Keep recovery details current, review active sessions and revoke devices you do not recognise. Enable security notifications where available.', task:'Use the service’s official settings page, reached independently.'},
  ]},
  { id:'device-safety', title:'Device & Network Security', level:'Intermediate', duration:'30 min', description:'Investigate endpoint and network risks, evidence preservation and containment decisions.', lessons:[
    {title:'Downloads and attachments', body:'Download software only from trusted official sources. Treat unexpected attachments and executable files with caution. Verify file type, publisher and reason for receiving it.', task:'If a file is unexpected, do not open it; report it to your IT or security team.'},
    {title:'Updates and endpoint protection', body:'Prioritise remediation using exploitability, asset exposure and business impact. Correlate EDR process trees, command-line telemetry, persistence indicators and outbound connections; isolate affected endpoints through the approved response workflow while preserving evidence.', task:'Use approved update channels and report repeated security warnings.'},
    {title:'Public networks and USB devices', body:'Avoid sensitive activity on untrusted networks unless protected by approved controls. Never plug in an unknown USB drive; hand it to authorised IT staff.', task:'Treat found removable media as untrusted.'},
  ]},
]
const storageKey='cybershield_academy_progress_v1'

export function readAcademyProgress(){try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return {}}}

export default function LearningHub({onBack,onProgress,token,apiBaseUrl}) {
  const [progress,setProgress]=useState(readAcademyProgress)
  const [progressReady,setProgressReady]=useState(false)
  const [syncMessage,setSyncMessage]=useState('')
  const [courseId,setCourseId]=useState('')
  const [lessonIndex,setLessonIndex]=useState(0)
  const [quizAnswer,setQuizAnswer]=useState('')
  const [quizDone,setQuizDone]=useState(false)
  const [search,setSearch]=useState('')
  useEffect(()=>{
    let active=true
    const load=async()=>{
      if(token&&apiBaseUrl){
        try{
          const response=await fetch(`${apiBaseUrl}/api/learning/progress`,{headers:{Authorization:`Bearer ${token}`}})
          const data=await response.json()
          if(!response.ok||!data.success)throw new Error(data.error||'Could not sync learning progress')
          if(active&&data.progress&&Object.keys(data.progress).length){setProgress(data.progress);localStorage.setItem(storageKey,JSON.stringify(data.progress))}
          if(active)setSyncMessage('Progress sync enabled')
        }catch{if(active)setSyncMessage('Using this device until account sync is available')}
      }
      if(active)setProgressReady(true)
    }
    load()
    return()=>{active=false}
  },[token,apiBaseUrl])
  useEffect(()=>{
    localStorage.setItem(storageKey,JSON.stringify(progress));onProgress?.(progress)
    if(!progressReady||!token||!apiBaseUrl)return
    const save=async()=>{try{const response=await fetch(`${apiBaseUrl}/api/learning/progress`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({progress})});if(!response.ok)throw new Error();setSyncMessage('Progress saved to your account')}catch{setSyncMessage('Progress saved on this device; account sync will retry next time')}}
    save()
  },[progress,progressReady,token,apiBaseUrl])
  const course=courses.find(c=>c.id===courseId)
  const filtered=useMemo(()=>courses.filter(c=>(c.title+' '+c.description).toLowerCase().includes(search.toLowerCase())),[search])
  const completed=Object.values(progress).filter(v=>v?.completed).length
  const total=courses.reduce((n,c)=>n+c.lessons.length,0)
  const finishLesson=()=>{
    if(!course)return
    const next={...progress,[course.id]:{...(progress[course.id]||{}),lessons:[...new Set([...(progress[course.id]?.lessons||[]),lessonIndex])]}}
    if(lessonIndex===course.lessons.length-1)next[course.id].completed=true
    setProgress(next);setQuizAnswer('');setQuizDone(false)
    if(lessonIndex<course.lessons.length-1)setLessonIndex(i=>i+1)
    else setCourseId('')
  }
  if(course){
    const lesson=course.lessons[lessonIndex]
    const done=progress[course.id]?.lessons||[]
    return <main className="learning-shell">
      <button className="learning-back" onClick={()=>setCourseId('')}>← All learning paths</button>
      <div className="learning-course-head"><span className="learning-kicker">CYBERSHIELD ACADEMY · {course.level.toUpperCase()}</span><h1>{course.title}</h1><p>{course.description}</p><div className="learning-progress"><span style={{width:`${done.length/course.lessons.length*100}%`}}/></div><small>{done.length} of {course.lessons.length} lessons completed</small></div>
      <div className="learning-layout"><aside className="lesson-list">{course.lessons.map((l,i)=><button className={i===lessonIndex?'active':''} key={l.title} onClick={()=>{setLessonIndex(i);setQuizAnswer('');setQuizDone(false)}}><span>{done.includes(i)?'✓':String(i+1).padStart(2,'0')}</span>{l.title}</button>)}</aside>
      <article className="lesson-card"><span className="learning-kicker">LESSON {lessonIndex+1} / {course.lessons.length}</span><h2>{lesson.title}</h2><p>{lesson.body}</p><div className="lesson-task"><b>Field note</b><p>{lesson.task}</p></div><div className="lesson-check"><b>Knowledge check</b><p>{lessonIndex===0?'What should you inspect before trusting a message?':lessonIndex===1?'What should you do with an unexpected MFA prompt?':'What is the safest response to an unknown file or device?'}</p><div className="lesson-options">{(lessonIndex===0?['The sender and real link destination','Only the company logo']:lessonIndex===1?['Approve it to stop notifications','Deny it and report the request']:['Open it on a personal device','Do not open it; report or hand it to IT']).map((v,i)=><button key={v} className={quizAnswer===v?'selected':''} onClick={()=>{setQuizAnswer(v);setQuizDone(false)}}>{v}</button>)}</div>{quizDone&&<p className="lesson-feedback">{quizAnswer===(lessonIndex===0?'The sender and real link destination':lessonIndex===1?'Deny it and report the request':'Do not open it; report or hand it to IT')?'Correct. That is the safer security practice.':'Not quite. Review the lesson and choose the action that verifies independently and avoids unnecessary risk.'}</p>}<button className="learning-primary" disabled={!quizAnswer} onClick={()=>setQuizDone(true)}>Check answer</button></div><button className="learning-primary lesson-next" disabled={!quizDone||quizAnswer!==(lessonIndex===0?'The sender and real link destination':lessonIndex===1?'Deny it and report the request':'Do not open it; report or hand it to IT')} onClick={finishLesson}>{lessonIndex===course.lessons.length-1?'Complete learning path':'Complete lesson →'}</button></article></div>
    </main>
  }
  return <main className="learning-shell"><button className="learning-back" onClick={onBack}>← Dashboard</button><header className="learning-heading"><span className="learning-kicker">CYBERSHIELD ACADEMY</span><h1>Build security instincts.</h1><p>Short, practical learning paths designed to turn security knowledge into safer decisions.</p></header><div className="learning-overview"><div><strong>{completed}</strong><span>Paths completed</span></div><div><strong>{total}</strong><span>Total lessons</span></div><div><strong>{Object.values(progress).reduce((n,v)=>n+(v?.lessons?.length||0),0)}</strong><span>Lessons completed</span></div></div><input className="learning-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search learning paths…" /><div className="learning-sync-status">{syncMessage || 'Your learning progress is saved automatically.'}</div><div className="course-grid">{filtered.map(c=>{const p=progress[c.id]||{};const count=p.lessons?.length||0;return <article className="course-card" key={c.id}><div className="course-meta"><span>{c.level}</span><span>{c.duration}</span></div><h2>{c.title}</h2><p>{c.description}</p><div className="learning-progress"><span style={{width:`${count/c.lessons.length*100}%`}}/></div><small>{count}/{c.lessons.length} lessons · {p.completed?'Completed':'In progress'}</small><button className="learning-primary" onClick={()=>{setCourseId(c.id);setLessonIndex(0)}}>{p.completed?'Review path':count?'Continue learning':'Start learning'} →</button></article>})}</div></main>
}

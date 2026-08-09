/**
 * KaiDemo — Standalone Kai teacher demo page.
 * Shows the full Kai typing-animation UI without requiring auth or a backend.
 * Uses a scripted sequence of messages that mimics the realistic typing demo
 * described in the design spec (typos, corrections, friendly teaching).
 */
import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   TYPING ENGINE  (same logic as KaiTeacher)
   ───────────────────────────────────────────── */

function randDelay(min, max) { return min + Math.random() * (max - min); }

/**
 * Build a stream of events: {action:'type'|'backspace'|'pause', char, delay}
 * Supports explicit typo injection so we can reproduce the exact sequences
 * requested in the design brief.
 */
function buildStream(text, typos = []) {
  // typos: [{at: charIdx, insert: 'wrongChars', deleteCount: N}]
  // at = index in `text` where the wrong chars are injected (before text[at])
  const events = [];
  let i = 0;
  let typoIdx = 0;

  while (i < text.length) {
    const typo = typos[typoIdx];
    if (typo && i === typo.at) {
      // Type the wrong chars
      for (const ch of typo.insert) {
        events.push({ action: 'type',  char: ch,  delay: randDelay(50, 90) });
      }
      // Kai "notices" — pause
      events.push({ action: 'pause', char: '', delay: 400 + Math.random() * 250 });
      // Backspace them out
      for (let b = 0; b < typo.insert.length + (typo.deleteCount || 0); b++) {
        events.push({ action: 'backspace', char: '', delay: randDelay(60, 110) });
      }
      events.push({ action: 'pause', char: '', delay: 150 });
      typoIdx++;
      // skip the chars that were wrong (deleteCount chars from text)
      i += typo.deleteCount || 0;
      continue;
    }

    const ch = text[i];
    let delay = randDelay(40, 85);
    if (['.', '!', '?', ',', ':'].includes(ch)) delay += randDelay(90, 220);
    if (ch === ' ') delay = randDelay(28, 55);
    events.push({ action: 'type', char: ch, delay });
    i++;
  }
  return events;
}

function useStream(events, active) {
  const [displayed, setDisplayed] = useState('');
  const [cursor, setCursor]       = useState(true);
  const [done, setDone]           = useState(false);
  const idxRef  = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setCursor(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!active || !events.length) return;
    idxRef.current = 0;
    setDisplayed('');
    setDone(false);

    const step = () => {
      const idx = idxRef.current;
      if (idx >= events.length) { setDone(true); return; }
      const e = events[idx];
      idxRef.current++;
      if (e.action === 'type')      setDisplayed(d => d + e.char);
      else if (e.action === 'backspace') setDisplayed(d => d.slice(0, -1));
      timerRef.current = setTimeout(step, e.delay);
    };

    timerRef.current = setTimeout(step, 400);
    return () => clearTimeout(timerRef.current);
  }, [events, active]);

  return { displayed, cursor, done };
}

/* ─────────────────────────────────────────────
   SCRIPTED SEQUENCE
   ───────────────────────────────────────────── */

// Each entry: { text, typos?, delayBefore? }
const SCRIPT = [
  {
    text:  'Welcome to Cyber Academy!',
    typos: [
      // "Academil" — wrong 'l' at position 20 (replaces correct 'y!'), needs 1 delete
      { at: 19, insert: 'l', deleteCount: 0 },
    ],
    delayBefore: 600,
  },
  {
    text:  'Today we are learning about phishing.',
    typos: [
      // "phisjing" — wrong 'j' at position 28 (the 's' in 'hing' needs to be removed via backspace)
      { at: 28, insert: 'j', deleteCount: 0 },
    ],
    delayBefore: 1400,
  },
  {
    text:  'Phishing is one of the most common cyberattacks — and understanding it keeps you safe online. 🛡️',
    delayBefore: 1200,
  },
  {
    text:  'Attackers send fake emails pretending to be trusted sources — banks, social networks, even your boss.',
    delayBefore: 1100,
  },
  {
    text:  'Their goal? To trick you into clicking a link, entering your password, or downloading malware.',
    delayBefore: 1000,
  },
  {
    text:  'Can you spot what makes a phishing email suspicious? 🤔',
    delayBefore: 900,
  },
];

/* ─────────────────────────────────────────────
   KAI AVATAR
   ───────────────────────────────────────────── */

function KaiAvatar({ mood = 'neutral', size = 100 }) {
  const faces = {
    neutral:   { eyes: '●●', mouth: '⌣' },
    thinking:  { eyes: '●◑', mouth: '〜' },
    typing:    { eyes: '●●', mouth: '◡' },
    happy:     { eyes: '◕◕', mouth: '⌣' },
    listening: { eyes: '●●', mouth: '○' },
  };
  const f = faces[mood] || faces.neutral;

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 45%, #2563eb 100%)',
      boxShadow: '0 8px 32px rgba(124,58,237,0.40), 0 2px 8px rgba(0,0,0,0.10)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 4, position: 'relative', transition: 'all 0.3s',
    }}>
      {/* Pulse ring when typing */}
      {mood === 'typing' && (
        <div style={{
          position: 'absolute', inset: -5, borderRadius: '50%',
          border: '2px solid rgba(139,92,246,0.5)',
          animation: 'kaiRing 1.4s ease-in-out infinite',
        }} />
      )}
      {/* Headband */}
      <div style={{
        position: 'absolute', top: -3, left: size * 0.1, right: size * 0.1, height: size * 0.18,
        border: '2.5px solid rgba(255,255,255,0.3)', borderBottom: 'none',
        borderRadius: '40px 40px 0 0', pointerEvents: 'none',
      }} />
      {/* Eyes */}
      <div style={{ display: 'flex', gap: size * 0.14, fontSize: size * 0.2, color: '#fff', lineHeight: 1 }}>
        {f.eyes.split('').map((ch, i) => <span key={i}>{ch}</span>)}
      </div>
      {/* Mouth */}
      <div style={{ fontSize: size * 0.22, color: '#fff', lineHeight: 1, marginTop: 2 }}>{f.mouth}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SPEECH BUBBLE
   ───────────────────────────────────────────── */

function Bubble({ text, cursor, isThinking }) {
  return (
    <div className="kai-bubble-mobile" style={{ position: 'relative', width: '100%', maxWidth: 900, minWidth: 220 }}>
      <div style={{
        background: '#fff',
        border: '2px solid #ede9fe',
        borderRadius: 24,
        padding: '18px 26px',
        boxShadow: '0 4px 28px rgba(124,58,237,0.10), 0 1px 4px rgba(0,0,0,0.05)',
        minHeight: 64,
      }}>
        {/* Label */}
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          color: '#7c3aed', textTransform: 'uppercase', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
            background: isThinking ? '#f59e0b' : '#10b981',
            animation: 'dotPulse 1s ease-in-out infinite',
          }} />
          Kai · AI Instructor
        </div>

        {isThinking ? (
          <div style={{ display: 'flex', gap: 6, padding: '4px 0' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 9, height: 9, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                animation: `bounceDot 1.2s ease-in-out ${i*0.18}s infinite`,
              }} />
            ))}
          </div>
        ) : (
          <p style={{
            fontSize: 17, lineHeight: 1.72, color: '#1e1b4b', margin: 0,
            fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '1.72em',
          }}>
            {text}
            <span style={{
              display: 'inline-block', width: 2, height: '1.1em',
              background: '#7c3aed', marginLeft: 2, verticalAlign: 'text-bottom',
              borderRadius: 1, opacity: cursor ? 1 : 0, transition: 'opacity 0.05s',
            }} />
          </p>
        )}
      </div>

      {/* Tail → left */}
      <div style={{ position:'absolute', left:-14, top:30, width:0, height:0,
        borderTop:'10px solid transparent', borderBottom:'10px solid transparent',
        borderRight:'16px solid #ede9fe' }} />
      <div style={{ position:'absolute', left:-10, top:31, width:0, height:0,
        borderTop:'9px solid transparent', borderBottom:'9px solid transparent',
        borderRight:'14px solid #fff' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   STUDENT MESSAGE
   ───────────────────────────────────────────── */

function StudentBubble({ text }) {
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', gap:10, alignItems:'flex-end', marginBottom:20 }}>
      <div style={{
        maxWidth:'68%', background:'linear-gradient(135deg, #7c3aed, #4f46e5)',
        borderRadius:'20px 20px 4px 20px', padding:'13px 18px',
        color:'#fff', fontSize:15, lineHeight:1.65,
        boxShadow:'0 2px 14px rgba(124,58,237,0.28)',
      }}>{text}</div>
      <div style={{
        width:36, height:36, borderRadius:'50%', background:'#e0e7ff',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
      }}>🧑‍💻</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SETTLED KAI MESSAGE  (after typing done)
   ───────────────────────────────────────────── */

function KaiBubbleSettled({ text }) {
  return (
    <div style={{ display:'flex', gap:16, marginBottom:20, alignItems:'flex-start' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
        <div style={{
          width:40, height:40, borderRadius:'50%',
          background:'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
          boxShadow:'0 2px 10px rgba(124,58,237,0.25)',
        }}>✨</div>
      </div>
      <div style={{
        maxWidth:'78%', background:'#fff', border:'1.5px solid #ede9fe',
        borderRadius:'4px 20px 20px 20px', padding:'13px 18px',
        fontSize:15, lineHeight:1.7, color:'#1e1b4b',
        boxShadow:'0 2px 10px rgba(124,58,237,0.07)',
      }}>{text}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   QUICK CHIP INTERACTION
   ───────────────────────────────────────────── */

const QUICK_REPLIES = [
  { label: 'Tell me more 📖',      response: 'Great curiosity! Phishing attacks have evolved a lot — modern ones use AI to personalise every email, making them extremely convincing. Always verify the sender before clicking any link.' },
  { label: 'Give me an example 💡', response: 'Sure! Imagine you receive an email: "Your Netflix account is suspended. Click here to restore access." The link looks real — but it\'s a fake site harvesting your credentials. Classic phishing! 🎣' },
  { label: 'Quiz me! 🎯',          response: 'Here\'s your challenge: An email arrives from "support@paypa1.com" asking you to verify your account. What\'s the first red flag you notice? 🤔' },
  { label: 'What\'s next? ➡️',      response: 'Next up: we\'ll explore spear phishing — highly targeted attacks where hackers research their victim before striking. It\'s like phishing, but with a sniper rifle instead of a net. 🎯' },
];

/* ─────────────────────────────────────────────
   MAIN DEMO PAGE
   ───────────────────────────────────────────── */

export default function KaiDemo({ onGetStarted }) {
  const [settled, setSettled]       = useState([]); // finalized messages
  const [scriptIdx, setScriptIdx]   = useState(0);
  const [phase, setPhase]           = useState('thinking'); // thinking|typing|waiting|done
  const [activeEvents, setActiveEvents] = useState([]);
  const [activeText, setActiveText]     = useState('');
  const [inputVal, setInputVal]         = useState('');
  const [mood, setMood]                 = useState('thinking');
  const [waitTimer, setWaitTimer]       = useState(null);
  const bottomRef = useRef(null);

  const { displayed, cursor, done: typingDone } = useStream(activeEvents, phase === 'typing');

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [settled, displayed, phase]);

  // Drive the script forward
  useEffect(() => {
    if (scriptIdx >= SCRIPT.length) { setPhase('done'); return; }
    const entry = SCRIPT[scriptIdx];
    const delay = entry.delayBefore ?? 800;

    setPhase('thinking');
    setMood('thinking');

    const t = setTimeout(() => {
      const evts = buildStream(entry.text, entry.typos || []);
      setActiveText(entry.text);
      setActiveEvents(evts);
      setPhase('typing');
      setMood('typing');
    }, delay);

    return () => clearTimeout(t);
  }, [scriptIdx]);

  // When typing finishes, settle and schedule next
  useEffect(() => {
    if (!typingDone || phase !== 'typing') return;
    setSettled(s => [...s, { role: 'kai', text: activeText }]);
    setActiveText('');
    setActiveEvents([]);

    const isLast = scriptIdx >= SCRIPT.length - 1;
    setPhase(isLast ? 'done' : 'waiting');
    setMood(isLast ? 'listening' : 'happy');

    if (!isLast) {
      const t = setTimeout(() => setScriptIdx(i => i + 1), 200);
      setWaitTimer(t);
    }
  }, [typingDone, phase]);

  // Handle student quick-chip
  const handleChip = (chip) => {
    clearTimeout(waitTimer);
    const reply = QUICK_REPLIES.find(r => r.label === chip);
    setSettled(s => [...s, { role: 'student', text: chip }]);
    if (reply) {
      setPhase('thinking');
      setMood('thinking');
      setTimeout(() => {
        const evts = buildStream(reply.response, []);
        setActiveText(reply.response);
        setActiveEvents(evts);
        setPhase('typing');
        setMood('typing');
      }, 900);
    }
  };

  const handleSend = () => {
    const msg = inputVal.trim();
    if (!msg) return;
    setInputVal('');
    clearTimeout(waitTimer);
    setSettled(s => [...s, { role: 'student', text: msg }]);
    setPhase('thinking');
    setMood('thinking');
    setTimeout(() => {
      const reply = 'That\'s a great question! To get the full answer with AI-powered explanations, sign up for Cyber Academy — Kai will be your personal instructor throughout every lesson. 🚀';
      const evts = buildStream(reply, []);
      setActiveText(reply);
      setActiveEvents(evts);
      setPhase('typing');
      setMood('typing');
    }, 1100);
  };

  const busy = phase === 'thinking' || phase === 'typing';

  return (
    <div className="kai-dark-theme" style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#020403',
      fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden',
    }}>
      <DemoStyles />

      {/* ── HEADER ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px', background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(14px)', borderBottom: '1px solid #ede9fe',
        boxShadow: '0 1px 12px rgba(124,58,237,0.07)', flexShrink: 0, zIndex: 10,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            boxShadow: '0 2px 10px rgba(124,58,237,0.3)',
          }}>🔐</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1e1b4b', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Cyber Academy
            </div>
            <div style={{ fontSize: 10, color: '#8b7cf6', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              with Kai · AI Instructor
            </div>
          </div>
        </div>

        {/* Lesson badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f5f3ff', border: '1.5px solid #ede9fe',
          borderRadius: 20, padding: '6px 16px',
        }}>
          <span style={{ fontSize: 13, color: '#6d28d9', fontWeight: 600 }}>Module 1 · Introduction to Phishing</span>
          <span style={{
            background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 700,
            borderRadius: 8, padding: '2px 8px', letterSpacing: '0.05em',
          }}>LIVE DEMO</span>
        </div>

        {/* CTA */}
        <button onClick={onGetStarted} style={{
          padding: '9px 22px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
          transition: 'all 0.2s', letterSpacing: '-0.01em',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          Start Learning Free →
        </button>
      </header>

      {/* ── MESSAGES AREA ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '32px 28px 16px' }}>
        <div className="kai-content-width" style={{ maxWidth: 1080, margin: '0 auto' }}>

          {/* Settled messages */}
          {settled.map((m, i) =>
            m.role === 'kai'
              ? <KaiBubbleSettled key={i} text={m.text} />
              : <StudentBubble    key={i} text={m.text} />
          )}

          {/* Live Kai typing area */}
          {(phase === 'thinking' || phase === 'typing') && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24,
              animation: 'fadeSlide 0.3s ease',
            }}>
              {/* Kai column */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, flexShrink:0 }}>
                <KaiAvatar mood={mood} size={80} />
                <span style={{ fontSize:10, fontWeight:700, color:'#8b7cf6', letterSpacing:'0.08em', textTransform:'uppercase' }}>Kai</span>
                {phase === 'typing' && (
                  <div style={{ fontSize:22, animation:'handWave 1.6s ease-in-out infinite' }}>✍️</div>
                )}
                {phase === 'thinking' && (
                  <div style={{ fontSize:22, animation:'thinking 2s ease-in-out infinite' }}>💭</div>
                )}
              </div>

              {/* Bubble */}
              <div style={{ flex:1, paddingTop:4 }}>
                <Bubble
                  text={displayed}
                  cursor={cursor}
                  isThinking={phase === 'thinking'}
                />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── BOTTOM INPUT ── */}
      <div style={{
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(14px)',
        borderTop: '1px solid #ede9fe', padding: '16px 28px 22px', flexShrink: 0,
      }}>
        <div className="kai-content-width" style={{ maxWidth: 1080, margin: '0 auto' }}>

          {/* Quick chips */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
            {QUICK_REPLIES.map(r => (
              <button key={r.label} onClick={() => handleChip(r.label)} disabled={busy} style={{
                padding:'6px 15px', borderRadius:20, border:'1.5px solid #ede9fe',
                background:'#fff', color:'#7c3aed', fontSize:13, fontWeight:500,
                cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1,
                transition:'all 0.15s', fontFamily:'inherit',
                boxShadow:'0 1px 4px rgba(124,58,237,0.08)',
              }}
                onMouseEnter={e => !busy && (e.target.style.background='#f5f3ff')}
                onMouseLeave={e => (e.target.style.background='#fff')}
              >{r.label}</button>
            ))}
          </div>

          {/* Text input */}
          <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <textarea
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              disabled={busy}
              placeholder={busy ? 'Kai is typing…' : 'Ask Kai anything…'}
              rows={1}
              style={{
                flex:1, resize:'none', borderRadius:16,
                border:'2px solid ' + (busy ? '#ede9fe' : '#c4b5fd'),
                padding:'12px 18px', fontSize:15, lineHeight:1.5,
                fontFamily:"'Inter', system-ui, sans-serif",
                background: busy ? '#f9f9ff' : '#fff',
                color:'#1e1b4b', outline:'none', transition:'border-color 0.2s',
                boxShadow: busy ? 'none' : '0 0 0 3px rgba(124,58,237,0.08)',
                maxHeight:120, overflowY:'auto',
              }}
            />
            <button onClick={handleSend} disabled={busy || !inputVal.trim()} style={{
              width:48, height:48, borderRadius:14, flexShrink:0,
              background: busy || !inputVal.trim() ? '#e0d9f9' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border:'none', cursor: busy || !inputVal.trim() ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
              transition:'all 0.2s',
              boxShadow: busy || !inputVal.trim() ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
            }}>
              {busy ? '⏳' : '↑'}
            </button>
          </div>

          {/* Status */}
          <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{
              width:6, height:6, borderRadius:'50%',
              background: phase==='typing' ? '#10b981' : phase==='thinking' ? '#f59e0b' : '#8b7cf6',
              animation: busy ? 'dotPulse 1s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontSize:12, color:'#a78bfa', fontWeight:500 }}>
              {phase==='thinking' ? 'Kai is thinking…'
               : phase==='typing' ? 'Kai is typing…'
               : 'Kai is ready — press Enter to send'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────── */
function DemoStyles() {
  const css = [
    "",
    "      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');",
    "",
    "      @keyframes kaiRing {",
    "        0%,100%{ opacity:0.35; transform:scale(1);    }",
    "        50%    { opacity:0.85; transform:scale(1.06); }",
    "      }",
    "      @keyframes dotPulse {",
    "        0%,100%{ opacity:1;    transform:scale(1);   }",
    "        50%    { opacity:0.45; transform:scale(0.8); }",
    "      }",
    "      @keyframes bounceDot {",
    "        0%,80%,100%{ transform:translateY(0);   opacity:0.7; }",
    "        40%        { transform:translateY(-7px); opacity:1;   }",
    "      }",
    "      @keyframes fadeSlide {",
    "        from{ opacity:0; transform:translateY(10px); }",
    "        to  { opacity:1; transform:translateY(0);    }",
    "      }",
    "      @keyframes handWave {",
    "        0%,100%{ transform:rotate(0deg)   translateY(0);   }",
    "        25%    { transform:rotate(-12deg) translateY(-2px); }",
    "        75%    { transform:rotate(8deg)   translateY(-1px); }",
    "      }",
    "      @keyframes thinking {",
    "        0%,100%{ opacity:0.6; transform:scale(1)   translateY(0);   }",
    "        50%    { opacity:1;   transform:scale(1.1) translateY(-3px); }",
    "      }",
    "",
    "/* ─────────────────────────────────────────────",
    "   BLACK + NEON GREEN MOBILE OVERRIDES",
    "   ───────────────────────────────────────────── */",
    "",
    "html, body, #root {",
    "  background: #020403 !important;",
    "}",
    "",
    "",
    ".kai-content-width {",
    "  width: 100% !important;",
    "  max-width: none !important;",
    "  margin: 0 !important;",
    "}",
    "",
    "@media (max-width: 600px) {",
    "  header {",
    "    padding: 10px 12px !important;",
    "    height: 58px !important;",
    "  }",
    "",
    "  header > div:nth-child(2) {",
    "    display: none !important;",
    "  }",
    "",
    "  header button {",
    "    padding: 8px 11px !important;",
    "    font-size: 10px !important;",
    "  }",
    "",
    "  header > div:first-child > div:first-child {",
    "    width: 32px !important;",
    "    height: 32px !important;",
    "    font-size: 16px !important;",
    "  }",
    "",
    "  header > div:first-child > div:last-child > div:first-child {",
    "    font-size: 12px !important;",
    "  }",
    "",
    "  header > div:first-child > div:last-child > div:last-child {",
    "    font-size: 7px !important;",
    "  }",
    "",
    "  .messages-area {",
    "    padding: 18px 10px 12px !important;",
    "  }",
    "",
    "  .messages-area > div {",
    "    max-width: 100% !important;",
    "  }",
    "",
    "  .live-kai {",
    "    gap: 9px !important;",
    "  }",
    "",
    "  .live-kai > div:first-child {",
    "    width: 46px !important;",
    "  }",
    "",
    "  .live-kai > div:first-child > div:first-child {",
    "    width: 46px !important;",
    "    height: 46px !important;",
    "  }",
    "",
    "  .live-kai > div:nth-child(2) {",
    "    min-width: 0 !important;",
    "  }",
    "",
    "  .kai-bubble-mobile {",
    "    max-width: 100% !important;",
    "  }",
    "",
    "  textarea {",
    "    font-size: 13px !important;",
    "  }",
    "}",
    "",
    "/* Global dark theme */",
    ".kai-dark-theme {",
    "  background:",
    "    radial-gradient(circle at 50% -15%, rgba(0,255,120,.09), transparent 36%),",
    "    radial-gradient(circle at 100% 55%, rgba(0,255,120,.035), transparent 32%),",
    "    #020403 !important;",
    "  color: #d8ffe6 !important;",
    "}",
    "",
    ".kai-dark-theme * {",
    "  scrollbar-color: rgba(0,255,120,.25) transparent;",
    "}",
    "",
    ".kai-dark-theme header {",
    "  background: rgba(2,7,4,.94) !important;",
    "  border-bottom: 1px solid rgba(0,255,120,.14) !important;",
    "  box-shadow: 0 1px 28px rgba(0,255,120,.045) !important;",
    "}",
    "",
    ".kai-dark-theme header > div:first-child > div:first-child {",
    "  background: linear-gradient(135deg,#00ff88,#00b85d) !important;",
    "  box-shadow: 0 0 18px rgba(0,255,120,.24) !important;",
    "  color: #001b0b !important;",
    "}",
    "",
    ".kai-dark-theme header > div:first-child > div:last-child > div:first-child {",
    "  color: #effff5 !important;",
    "}",
    "",
    ".kai-dark-theme header > div:first-child > div:last-child > div:last-child {",
    "  color: #45a96d !important;",
    "}",
    "",
    ".kai-dark-theme header > div:nth-child(2) {",
    "  background: rgba(0,255,120,.035) !important;",
    "  border-color: rgba(0,255,120,.13) !important;",
    "}",
    "",
    ".kai-dark-theme header > div:nth-child(2) span:first-child {",
    "  color: #00ff88 !important;",
    "}",
    "",
    ".kai-dark-theme header button {",
    "  background: linear-gradient(135deg,#00ff88,#00c968) !important;",
    "  color: #00170a !important;",
    "  box-shadow: 0 0 18px rgba(0,255,120,.2) !important;",
    "}",
    "",
    ".kai-dark-theme .kai-bubble {",
    "  background: linear-gradient(145deg,#07130c,#030a06) !important;",
    "  border-color: rgba(0,255,120,.18) !important;",
    "  box-shadow: 0 8px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(0,255,120,.04) !important;",
    "}",
    "",
    ".kai-dark-theme .kai-bubble p {",
    "  color: #c8fbd9 !important;",
    "}",
    "",
    ".kai-dark-theme .kai-bubble-header {",
    "  color: #00ff88 !important;",
    "}",
    "",
    ".kai-dark-theme .settled-kai-bubble {",
    "  background: rgba(5,15,9,.82) !important;",
    "  border-color: rgba(0,255,120,.1) !important;",
    "  color: #9ad9af !important;",
    "}",
    "",
    ".kai-dark-theme .student-bubble {",
    "  background: linear-gradient(135deg,#00ff88,#00c968) !important;",
    "  color: #00170a !important;",
    "  box-shadow: 0 5px 20px rgba(0,255,120,.15) !important;",
    "}",
    "",
    ".kai-dark-theme .student-avatar {",
    "  background: #0b190f !important;",
    "  border-color: rgba(0,255,120,.12) !important;",
    "}",
    "",
    ".kai-dark-theme .kai-content-width > div:last-child {",
    "  color: #4a7d5c !important;",
    "}",
    "",
    ".kai-dark-theme > div:last-child {",
    "  background: rgba(2,8,5,.97) !important;",
    "  border-top-color: rgba(0,255,120,.13) !important;",
    "  box-shadow: 0 -10px 40px rgba(0,0,0,.35) !important;",
    "}",
    "",
    ".kai-dark-theme > div:last-child button {",
    "  border-color: rgba(0,255,120,.14) !important;",
    "  background: rgba(0,255,120,.025) !important;",
    "  color: #79c795 !important;",
    "}",
    "",
    ".kai-dark-theme > div:last-child textarea {",
    "  background: #030a06 !important;",
    "  color: #c9ffda !important;",
    "  border-color: rgba(0,255,120,.2) !important;",
    "  box-shadow: inset 0 0 18px rgba(0,255,120,.025) !important;",
    "}",
    "",
    ".kai-dark-theme > div:last-child textarea::placeholder {",
    "  color: #355942 !important;",
    "}",
    "",
    ".kai-dark-theme > div:last-child > div > div:last-child button {",
    "  background: linear-gradient(135deg,#00ff88,#00c968) !important;",
    "  color: #00170a !important;",
    "  border: none !important;",
    "  box-shadow: 0 0 14px rgba(0,255,120,.2) !important;",
    "}",
    "",
    "/* Shiny green text */",
    ".kai-shiny-green {",
    "  color: #00ff88 !important;",
    "  text-shadow:",
    "    0 0 5px rgba(0,255,120,.55),",
    "    0 0 12px rgba(0,255,120,.28);",
    "}"
  ].join('\n');

  return React.createElement('style', null, css);
}
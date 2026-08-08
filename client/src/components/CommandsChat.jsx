import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../App.jsx';
import { commands as ALL_COMMANDS, CATEGORIES } from '../data/commands';

/* ─────────────────────────────────────────────
   TYPING ANIMATION ENGINE
   ───────────────────────────────────────────── */

function randDelay(min, max) {
  return min + Math.random() * (max - min);
}

function injectTypos(text) {
  if (text.length < 30 || Math.random() > 0.55) {
    return { seq: text, typos: [] };
  }

  const typoMap = {
    a: 's', e: 'r', i: 'o', o: 'p', s: 'a', n: 'm',
    t: 'y', h: 'j', l: 'k', r: 'e', g: 'f', c: 'x',
    p: 'o', d: 's',
  };

  const words = text.split(' ');
  const typoPositions = [];
  const count = Math.random() > 0.6 ? 2 : 1;

  for (let i = 0; i < count; i++) {
    const wordIdx = Math.floor(
      words.length * 0.3 + Math.random() * words.length * 0.5
    );
    const word = words[wordIdx];
    if (!word || word.length < 3) continue;
    const charIdx = Math.floor(Math.random() * (word.length - 1)) + 1;
    const wrongChar =
      typoMap[word[charIdx].toLowerCase()] ||
      String.fromCharCode(word.charCodeAt(charIdx) + 1);
    typoPositions.push({
      wordIdx,
      charIdx,
      wrongChar,
      len: word.length - charIdx,
    });
  }

  return {
    seq: text,
    typos: typoPositions.sort((a, b) => a.wordIdx - b.wordIdx),
  };
}

function buildTypingStream(text) {
  const { typos } = injectTypos(text);
  const words = text.split(' ');
  const stream = [];
  let charPos = 0;
  const wordPositions = words.map((w, i) => {
    const start = charPos;
    charPos += w.length + (i < words.length - 1 ? 1 : 0);
    return start;
  });

  const typoEvents = typos
    .map(t => ({
      position: wordPositions[t.wordIdx] + t.charIdx,
      wrongChar: t.wrongChar,
      deleteCount: t.len,
    }))
    .sort((a, b) => a.position - b.position);

  let i = 0;
  let typoIdx = 0;

  while (i < text.length) {
    const typo = typoEvents[typoIdx];

    if (typo && i === typo.position) {
      const wrongTail =
        typo.wrongChar + text.slice(i + 1, i + typo.deleteCount);
      for (const ch of wrongTail) {
        stream.push({ char: ch, action: 'type', delay: randDelay(45, 90) });
      }
      stream.push({ char: '', action: 'pause', delay: 380 + Math.random() * 300 });
      for (let b = 0; b < wrongTail.length; b++) {
        stream.push({ char: '', action: 'backspace', delay: randDelay(55, 110) });
      }
      stream.push({ char: '', action: 'pause', delay: 160 });
      typoIdx++;
    }

    const ch = text[i];
    let delay = randDelay(38, 88);
    if (['.', ',', '?', '!', ':'].includes(ch)) delay += randDelay(80, 200);
    if (ch === ' ') delay = randDelay(30, 60);
    stream.push({ char: ch, action: 'type', delay });
    i++;
  }

  return stream;
}

function useTypingStream(stream, active) {
  const [displayed, setDisplayed] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!active || !stream.length) return;
    idxRef.current = 0;
    setDisplayed('');
    setDone(false);

    const step = () => {
      const idx = idxRef.current;
      if (idx >= stream.length) { setDone(true); return; }
      const event = stream[idx];
      idxRef.current++;
      if (event.action === 'type') setDisplayed(d => d + event.char);
      else if (event.action === 'backspace') setDisplayed(d => d.slice(0, -1));
      timerRef.current = setTimeout(step, event.delay);
    };

    timerRef.current = setTimeout(step, 200);
    return () => clearTimeout(timerRef.current);
  }, [stream, active]);

  return { displayed, cursorVisible, done };
}

/* ─────────────────────────────────────────────
   KAI AVATAR
   ───────────────────────────────────────────── */

function KaiAvatar({ mood = 'neutral', size = 42 }) {
  const expressions = {
    neutral:   { eyeL: '●', eyeR: '●', mouth: '⌣', brow: '' },
    thinking:  { eyeL: '●', eyeR: '◑', mouth: '〜', brow: '⌢' },
    typing:    { eyeL: '●', eyeR: '●', mouth: '◡', brow: '' },
    happy:     { eyeL: '◕', eyeR: '◕', mouth: '⌣', brow: '' },
    listening: { eyeL: '●', eyeR: '●', mouth: '○', brow: '' },
  };
  const expr = expressions[mood] || expressions.neutral;

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', position: 'relative',
      flexShrink: 0,
      background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #2563eb 100%)',
      boxShadow: '0 8px 32px rgba(124,58,237,0.38), 0 2px 8px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'box-shadow 0.3s ease',
    }}>
      <div style={{
        position: 'absolute', inset: -4, borderRadius: '50%',
        border: '2px solid rgba(139,92,246,0.4)',
        animation: mood === 'typing' ? 'cmdKaiPulse 1.5s ease-in-out infinite' : 'none',
      }} />
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, userSelect: 'none',
      }}>
        {expr.brow && (
          <div style={{ fontSize: size * 0.18, color: 'rgba(255,255,255,0.6)', lineHeight: 1, marginBottom: -2 }}>
            {expr.brow}
          </div>
        )}
        <div style={{ display: 'flex', gap: size * 0.13, alignItems: 'center' }}>
          <span style={{ fontSize: size * 0.22, color: '#fff', lineHeight: 1 }}>{expr.eyeL}</span>
          <span style={{ fontSize: size * 0.22, color: '#fff', lineHeight: 1 }}>{expr.eyeR}</span>
        </div>
        <div style={{ fontSize: size * 0.2, color: '#fff', lineHeight: 1, marginTop: 2 }}>{expr.mouth}</div>
      </div>
      <div style={{
        position: 'absolute', top: -3, left: size * 0.08, right: size * 0.08, height: size * 0.18,
        border: '3px solid rgba(255,255,255,0.35)', borderBottom: 'none',
        borderRadius: '50px 50px 0 0', pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   THINKING DOTS
   ───────────────────────────────────────────── */

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 9, height: 9, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          animation: `cmdBounce 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────── */

function CmdKaiStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      .cmd-main-scroll::-webkit-scrollbar { width: 6px; }
      .cmd-main-scroll::-webkit-scrollbar-track { background: transparent; }
      .cmd-main-scroll::-webkit-scrollbar-thumb { background: #ddd6fe; border-radius: 4px; }
      .cmd-main-scroll::-webkit-scrollbar-thumb:hover { background: #c4b5fd; }

      .cmd-pills-scroll::-webkit-scrollbar { height: 4px; }
      .cmd-pills-scroll::-webkit-scrollbar-track { background: transparent; }
      .cmd-pills-scroll::-webkit-scrollbar-thumb { background: #ddd6fe; border-radius: 4px; }

      @keyframes cmdKaiPulse {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.04); }
      }
      @keyframes cmdDotPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.45; transform: scale(0.8); }
      }
      @keyframes cmdBounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
        40% { transform: translateY(-7px); opacity: 1; }
      }
      @keyframes cmdFadeSlide {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes cmdHandWave {
        0%, 100% { transform: rotate(0deg) translateY(0); }
        25% { transform: rotate(-12deg) translateY(-2px); }
        75% { transform: rotate(8deg) translateY(-1px); }
      }
      @keyframes cmdThinking {
        0%, 100% { opacity: 0.6; transform: scale(1) translateY(0); }
        50% { opacity: 1; transform: scale(1.1) translateY(-3px); }
      }

      @media (max-width: 700px) {
        .cmd-user-pill { display: none !important; }
      }
      @media (max-width: 600px) {
        .cmd-main-scroll { padding: 20px 0 16px !important; }
        .cmd-user-pill { display: none !important; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT - Full-screen conversational UI
   ───────────────────────────────────────────── */

export default function CommandsChat({
  user: propUser,
  onLogout,
  onBack,
  learnedCommands = [],
  onToggleLearned = () => {},
  onAskKai = null,
}) {
  const auth = useAuth();
  const user = propUser || auth?.user;

  const [history, setHistory] = useState([]);
  const [streaming, setStreaming] = useState('');
  const [stream, setStream] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [input, setInput] = useState('');
  const [mood, setMood] = useState('happy');
  const [sendError, setSendError] = useState(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCommandId, setSelectedCommandId] = useState(ALL_COMMANDS[0]?.id || '');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const { displayed, cursorVisible, done: typingDone } = useTypingStream(stream, phase === 'typing');

  // Get unique categories, including 'All' at the start
  const categoryOptions = ['All', ...Array.from(new Set(ALL_COMMANDS.map(c => c.category)))];

  // Initial greeting messages
  const initialGreeting = "Hi! 👋 I'm Kai, your cybersecurity command assistant. Tell me what command you're looking for and I'll guide you.";

  const suggestions = [
    'How do I find my IP address?',
    'Show me basic Linux commands',
    'How do I scan a network?',
    'Explain the ls command',
    'What command checks open ports?',
  ];

  /* Settle typed message */
  useEffect(() => {
    if (typingDone && phase === 'typing' && streaming) {
      setHistory(h => [...h, { role: 'assistant', content: streaming }]);
      setStreaming('');
      setStream([]);
      setPhase('done');
      setMood('listening');
    }
  }, [typingDone, phase, streaming]);

  /* Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, displayed, phase]);

  const beginTyping = useCallback((text) => {
    const s = buildTypingStream(text);
    setStreaming(text);
    setStream(s);
    setPhase('typing');
    setMood('typing');
  }, []);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || phase === 'loading' || phase === 'typing') return;

    setInput('');
    setHistory(h => [...h, { role: 'user', content: msg }]);
    setConversationStarted(true);
    setPhase('loading');
    setMood('thinking');
    setSendError(null);

    try {
      if (typeof onAskKai === 'function') {
        let fullText = '';
        // Pass both commandId and prompt as expected by the API
        const maybePromise = onAskKai({
          commandId: selectedCommandId,
          prompt: msg,
        }, (chunk) => {
          if (!chunk) return;
          fullText += chunk;
        });

        const result = maybePromise && typeof maybePromise.then === 'function' ? await maybePromise : maybePromise;

        if (typeof result === 'string') {
          beginTyping(result);
        } else if (fullText) {
          beginTyping(fullText);
        } else {
          throw new Error('No response received');
        }
      } else {
        const reply = `That's a great question! I'm here to help you master cybersecurity commands. Keep asking and I'll guide you through the concepts step by step.`;
        setTimeout(() => beginTyping(reply), 600);
      }
    } catch (err) {
      console.error('sendMessage error:', err);
      setHistory(h => h.slice(0, -1));
      setInput(msg);
      setSendError(err.message);
      setPhase('done');
      setMood('neutral');
    }
  }, [input, phase, onAskKai, selectedCommandId, beginTyping]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const busy = phase === 'loading' || phase === 'typing';

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      height: '100vh', width: '100vw',
      background: 'linear-gradient(160deg, #f8f7ff 0%, #eff6ff 50%, #fdf4ff 100%)',
      fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden',
    }}>
      <CmdKaiStyles />

      {/* ─────────────────────────────────────
          HEADER
      ───────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px)', borderBottom: '1px solid #ede9fe',
        boxShadow: '0 1px 12px rgba(124,58,237,0.07)', flexShrink: 0, zIndex: 10, gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: '1.5px solid #ede9fe', color: '#7c3aed',
              borderRadius: 10, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s', fontFamily: 'inherit', flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f5f3ff')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            ← Back
          </button>

          <div style={{ width: 1, height: 24, background: '#ede9fe' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
            }}>
              💻
            </div>
            <span style={{
              fontWeight: 700, fontSize: 16, color: '#1e1b4b', letterSpacing: '-0.02em', whiteSpace: 'nowrap',
            }}>
              Commands Library
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div className="cmd-user-pill" style={{
            padding: '6px 14px', borderRadius: 20, background: '#f5f3ff',
            border: '1.5px solid #ede9fe', fontSize: 13, color: '#7c3aed', fontWeight: 500,
          }}>
            👤 {user?.username || 'Student'}
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'none', border: '1.5px solid #fce7f3', color: '#ec4899',
              borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 13,
              fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────
          CATEGORY TABS
      ───────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #ede9fe', padding: '10px 24px',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, zIndex: 9,
        overflowX: 'auto',
      }}>
        {categoryOptions.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '7px 14px', borderRadius: 20, border: selectedCategory === cat
                ? '2px solid #7c3aed'
                : '1.5px solid #ede9fe',
              background: selectedCategory === cat ? '#f5f3ff' : '#fff',
              color: selectedCategory === cat ? '#7c3aed' : '#6b7280',
              fontSize: 13, fontWeight: selectedCategory === cat ? 700 : 600, whiteSpace: 'nowrap',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s', flexShrink: 0,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────
          MAIN CHAT AREA
      ───────────────────────────────────── */}
      <div className="cmd-main-scroll" style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '32px 24px 20px', width: '100%', maxWidth: '100%',
      }}>
        <div style={{ width: '100%', margin: '0 auto', maxWidth: '800px' }}>
          {/* Initial greeting if no conversation started */}
          {!conversationStarted && history.length === 0 && (
            <>
              {/* Kai greeting with icon and message bubble */}
              <div style={{ marginBottom: 32, animation: 'cmdFadeSlide 0.4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 12 }}>
                  <KaiAvatar mood="happy" size={42} />
                  <div style={{
                    background: '#fff', border: '2px solid #ede9fe', borderRadius: 24,
                    padding: '16px 20px',
                    boxShadow: '0 4px 24px rgba(124,58,237,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                    maxWidth: '85%',
                  }}>
                    <p style={{
                      fontSize: 15, lineHeight: 1.6, color: '#1e1b4b', margin: 0,
                      fontWeight: 400,
                    }}>
                      {initialGreeting}
                    </p>
                  </div>
                </div>
              </div>

              {/* Try asking suggestions */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#8b7cf6', textTransform: 'uppercase',
                  letterSpacing: '0.08em', marginBottom: 12,
                }}>
                  Try asking:
                </div>
                <div style={{
                  display: 'grid', gap: 10,
                }}>
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(suggestion)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 12,
                        border: '1.5px solid #ede9fe', background: '#fff', color: '#1e1b4b',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.15s',
                        boxShadow: '0 1px 4px rgba(124,58,237,0.08)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.borderColor = '#7c3aed'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#ede9fe'; }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* History messages */}
          {history.map((msg, i) => (
            <div key={i} style={{ marginBottom: msg.role === 'user' ? 16 : 24, animation: 'cmdFadeSlide 0.3s ease' }}>
              {msg.role === 'user' ? (
                /* User message */
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <div style={{
                    maxWidth: '75%',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    borderRadius: '20px 20px 4px 20px', padding: '12px 18px',
                    color: '#fff', fontSize: 15, lineHeight: 1.65, fontWeight: 400,
                    boxShadow: '0 2px 12px rgba(124,58,237,0.25)',
                  }}>
                    {msg.content}
                  </div>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', background: '#e0e7ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, marginLeft: 10, flexShrink: 0, alignSelf: 'flex-end',
                  }}>
                    🧑‍💻
                  </div>
                </div>
              ) : (
                /* Assistant message */
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <KaiAvatar mood="happy" size={34} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#312e81' }}>Kai</div>
                      <div style={{ fontSize: 11, color: '#8b7cf6', fontWeight: 500 }}>AI Cybersecurity Instructor</div>
                    </div>
                  </div>
                  <div style={{
                    width: '100%', background: '#fff', border: '1.5px solid #ede9fe',
                    borderRadius: 20, padding: '18px 24px', fontSize: 15, lineHeight: 1.7,
                    color: '#1e1b4b', boxShadow: '0 2px 8px rgba(124,58,237,0.07)',
                  }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Kai typing bubble */}
          {(phase === 'loading' || phase === 'typing') && (
            <div style={{ width: '100%', marginBottom: 28, animation: 'cmdFadeSlide 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <KaiAvatar mood={phase === 'typing' ? 'typing' : 'thinking'} size={34} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#312e81' }}>Kai</div>
                  <div style={{ fontSize: 11, color: '#8b7cf6', fontWeight: 500 }}>AI Cybersecurity Instructor</div>
                </div>
                {phase === 'typing' && (
                  <span style={{ fontSize: 18, animation: 'cmdHandWave 1.5s ease-in-out infinite', marginLeft: 'auto' }}>✍️</span>
                )}
                {phase === 'loading' && (
                  <span style={{ fontSize: 18, animation: 'cmdThinking 2s ease-in-out infinite', marginLeft: 'auto' }}>💭</span>
                )}
              </div>

              <div style={{
                background: '#fff', border: '2px solid #ede9fe', borderRadius: 24,
                padding: '24px 32px',
                boxShadow: '0 4px 24px rgba(124,58,237,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                minHeight: 80, width: '100%', position: 'relative', transition: 'all 0.2s ease',
              }}>
                {phase === 'loading' ? (
                  <ThinkingDots />
                ) : (
                  <p style={{
                    fontSize: 16, lineHeight: 1.7, color: '#1e1b4b', margin: 0,
                    fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {displayed}
                    <span style={{
                      display: 'inline-block', width: 2, height: '1.1em', background: '#7c3aed',
                      marginLeft: 2, verticalAlign: 'text-bottom', borderRadius: 1,
                      opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.05s',
                    }} />
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Send error */}
          {sendError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
              background: '#fff', border: '1.5px solid #fecaca', borderRadius: 14,
              padding: '12px 18px', animation: 'cmdFadeSlide 0.25s ease',
              boxShadow: '0 2px 10px rgba(239,68,68,0.08)',
            }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div style={{ flex: 1, fontSize: 14, color: '#7f1d1d', lineHeight: 1.5 }}>
                <strong style={{ color: '#dc2626' }}>Message failed:</strong> {sendError}
              </div>
              <button
                onClick={() => setSendError(null)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ─────────────────────────────────────
          BOTTOM INPUT
      ───────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid #ede9fe', padding: '16px 24px 20px', flexShrink: 0, width: '100%',
      }}>
        <div style={{ width: '100%', margin: '0 auto', maxWidth: '800px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', width: '100%' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={busy}
              placeholder={busy ? 'Kai is typing…' : 'Ask Kai about commands…'}
              rows={1}
              style={{
                flex: 1, resize: 'none', borderRadius: 16,
                border: '2px solid ' + (busy ? '#ede9fe' : '#c4b5fd'),
                padding: '12px 18px', fontSize: 15, lineHeight: 1.5,
                fontFamily: "'Inter', system-ui, sans-serif",
                background: busy ? '#f9f9ff' : '#fff', color: '#1e1b4b',
                outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: busy ? 'none' : '0 0 0 3px rgba(124,58,237,0.08)',
                maxHeight: 120, overflowY: 'auto',
              }}
              onFocus={e => { if (!busy) e.target.style.borderColor = '#7c3aed'; }}
              onBlur={e => { e.target.style.borderColor = busy ? '#ede9fe' : '#c4b5fd'; }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={busy || !input.trim()}
              style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: (busy || !input.trim()) ? '#e0d9f9' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none', cursor: (busy || !input.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                transition: 'all 0.2s',
                boxShadow: (busy || !input.trim()) ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
              }}
            >
              {busy ? '⏳' : '↑'}
            </button>
          </div>

          {/* Status */}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: phase === 'typing' ? '#10b981' : phase === 'loading' ? '#f59e0b' : '#8b7cf6',
              animation: busy ? 'cmdDotPulse 1s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 500 }}>
              {phase === 'loading' ? 'Kai is thinking…' : phase === 'typing' ? 'Kai is typing…' : 'Kai is ready · Enter to send'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

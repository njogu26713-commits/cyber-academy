import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../App.jsx';
import { commands as ALL_COMMANDS } from '../data/commands';

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

function KaiAvatar({ mood = 'neutral', size = 120 }) {
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
   SPEECH BUBBLE
   ───────────────────────────────────────────── */

function SpeechBubble({ text, cursorVisible, mood, isEmpty, block }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'absolute', top: -13, left: 28, width: 0, height: 0,
        borderLeft: '11px solid transparent', borderRight: '11px solid transparent',
        borderBottom: '13px solid #ede9fe', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', top: -10, left: 29, width: 0, height: 0,
        borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
        borderBottom: '11px solid #fff', zIndex: 2,
      }} />

      <div style={{
        background: '#fff', border: '2px solid #ede9fe', borderRadius: 24,
        padding: '24px 32px',
        boxShadow: '0 4px 24px rgba(124,58,237,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        minHeight: 80, width: '100%', position: 'relative', transition: 'all 0.2s ease',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7c3aed',
          textTransform: 'uppercase', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
            background: mood === 'thinking' ? '#f59e0b' : mood === 'typing' ? '#10b981' : '#7c3aed',
            animation: (mood === 'typing' || mood === 'thinking') ? 'cmdDotPulse 1s ease-in-out infinite' : 'none',
          }} />
          Kai · AI Instructor
        </div>

        {isEmpty ? (
          <ThinkingDots />
        ) : (
          <>
            <p style={{
              fontSize: 16, lineHeight: 1.7, color: '#1e1b4b', margin: 0,
              fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {text}
              <span style={{
                display: 'inline-block', width: 2, height: '1.1em', background: '#7c3aed',
                marginLeft: 2, verticalAlign: 'text-bottom', borderRadius: 1,
                opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.05s',
              }} />
            </p>

            {block && (
              <div style={{
                marginTop: 16,
                background: '#1e1b4b', borderRadius: 14, overflow: 'hidden',
                border: '1px solid #312e81',
              }}>
                <div style={{
                  padding: '10px 16px', background: 'rgba(124,58,237,0.15)',
                  borderBottom: '1px solid rgba(124,58,237,0.2)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 14 }}>💻</span>
                  <span style={{ color: '#c4b5fd', fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                    {block.syntax}
                  </span>
                </div>
                {block.example && (
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#a78bfa', fontSize: 12, marginBottom: 8 }}>
                      {block.example.description}
                    </div>
                    <div style={{
                      color: '#ede9fe', fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13, marginBottom: 10,
                    }}>
                      $ {block.example.command}
                    </div>
                    <pre style={{
                      margin: 0, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12, lineHeight: 1.65, whiteSpace: 'pre-wrap',
                    }}>
                      {block.example.output}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HISTORY ITEM (settled messages)
   ───────────────────────────────────────────── */

function HistoryItem({ role, content, block }) {
  if (role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, width: '100%' }}>
        <div style={{
          maxWidth: '75%',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          borderRadius: '20px 20px 4px 20px', padding: '12px 18px',
          color: '#fff', fontSize: 15, lineHeight: 1.65, fontWeight: 400,
          boxShadow: '0 2px 12px rgba(124,58,237,0.25)',
        }}>
          {content}
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: '#e0e7ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, marginLeft: 10, flexShrink: 0, alignSelf: 'flex-end',
        }}>
          🧑‍💻
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          boxShadow: '0 4px 14px rgba(124,58,237,0.22)',
        }}>
          ✨
        </div>
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
        <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</p>

        {block && (
          <div style={{
            marginTop: 16, background: '#1e1b4b', borderRadius: 14, overflow: 'hidden',
            border: '1px solid #312e81',
          }}>
            <div style={{
              padding: '10px 16px', background: 'rgba(124,58,237,0.15)',
              borderBottom: '1px solid rgba(124,58,237,0.2)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>💻</span>
              <span style={{ color: '#c4b5fd', fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                {block.syntax}
              </span>
            </div>
            {block.example && (
              <div style={{ padding: '14px 16px' }}>
                <div style={{ color: '#a78bfa', fontSize: 12, marginBottom: 8 }}>
                  {block.example.description}
                </div>
                <div style={{
                  color: '#ede9fe', fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13, marginBottom: 10,
                }}>
                  $ {block.example.command}
                </div>
                <pre style={{
                  margin: 0, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12, lineHeight: 1.65, whiteSpace: 'pre-wrap',
                }}>
                  {block.example.output}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   QUICK CHIPS
   ───────────────────────────────────────────── */

function QuickChips({ onSend, disabled }) {
  const chips = [
    'Tell me more 📖',
    'Give me an example 💡',
    'Show me the flags ⚙️',
    "What's next? ➡️",
  ];

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      {chips.map(c => (
        <button
          key={c}
          onClick={() => onSend(c)}
          disabled={disabled}
          style={{
            padding: '6px 14px', borderRadius: 20, border: '1.5px solid #ede9fe',
            background: '#fff', color: '#7c3aed', fontSize: 13, fontWeight: 500,
            cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
            transition: 'all 0.15s', fontFamily: 'inherit',
            boxShadow: '0 1px 4px rgba(124,58,237,0.08)',
          }}
          onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#f5f3ff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        >
          {c}
        </button>
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
   MAIN COMPONENT
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

  const [selectedCmdId, setSelectedCmdId] = useState(ALL_COMMANDS[0]?.id || '');
  const [history, setHistory] = useState([]);
  const [streaming, setStreaming] = useState('');
  const [stream, setStream] = useState([]);
  const [streamBlock, setStreamBlock] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [input, setInput] = useState('');
  const [mood, setMood] = useState('happy');
  const [sendError, setSendError] = useState(null);
  const [started, setStarted] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pillsRef = useRef(null);

  const { displayed, cursorVisible, done: typingDone } = useTypingStream(stream, phase === 'typing');

  const cmd = ALL_COMMANDS.find(c => c.id === selectedCmdId) || ALL_COMMANDS[0];
  const isLearned = learnedCommands.includes(cmd.id);
  const totalXP = learnedCommands.reduce((sum, id) => {
    const c = ALL_COMMANDS.find(cmd => cmd.id === id);
    return sum + (c?.xp || 0);
  }, 0);

  /* Settle typed message */
  useEffect(() => {
    if (typingDone && phase === 'typing' && streaming) {
      setHistory(h => [...h, { role: 'assistant', content: streaming, block: streamBlock }]);
      setStreaming('');
      setStream([]);
      setStreamBlock(null);
      setPhase('done');
      setMood('listening');
    }
  }, [typingDone, phase, streaming, streamBlock]);

  /* Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, displayed, phase]);

  const beginTyping = useCallback((text, block = null) => {
    const s = buildTypingStream(text);
    setStreaming(text);
    setStream(s);
    setStreamBlock(block);
    setPhase('typing');
    setMood('typing');
  }, []);

  /* Seed initial Kai message on mount */
  useEffect(() => {
    if (started || !cmd) return;
    setStarted(true);
    const intro = `Let's learn ${cmd.name} together! ${cmd.description}`;
    const block = {
      syntax: cmd.syntax,
      example: cmd.examples?.[0] || null,
    };
    setPhase('loading');
    setMood('thinking');
    const timer = setTimeout(() => beginTyping(intro, block), 800);
    return () => clearTimeout(timer);
  }, [started, cmd, beginTyping]);

  /* Scroll selected pill into view */
  useEffect(() => {
    const container = pillsRef.current;
    if (!container) return;
    const active = container.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCmdId]);

  const handleSelectCommand = useCallback((id) => {
    const newCmd = ALL_COMMANDS.find(c => c.id === id);
    if (!newCmd) return;
    setSelectedCmdId(id);
    setSendError(null);
    const intro = `Let's learn ${newCmd.name}! ${newCmd.description}`;
    const block = {
      syntax: newCmd.syntax,
      example: newCmd.examples?.[0] || null,
    };
    setPhase('loading');
    setMood('thinking');
    setTimeout(() => beginTyping(intro, block), 600);
  }, [beginTyping]);

  const handleNext = useCallback(() => {
    const idx = ALL_COMMANDS.findIndex(c => c.id === selectedCmdId);
    const next = ALL_COMMANDS[(idx + 1) % ALL_COMMANDS.length];
    handleSelectCommand(next.id);
  }, [selectedCmdId, handleSelectCommand]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || phase === 'loading' || phase === 'typing') return;

    setInput('');
    setHistory(h => [...h, { role: 'user', content: msg }]);
    setPhase('loading');
    setMood('thinking');
    setSendError(null);

    try {
      if (typeof onAskKai === 'function') {
        let fullText = '';
        const maybePromise = onAskKai({ id: selectedCmdId, text: msg }, (chunk) => {
          if (!chunk) return;
          fullText += chunk;
        });

        const result = maybePromise && typeof maybePromise.then === 'function' ? await maybePromise : maybePromise;

        if (typeof result === 'string') {
          beginTyping(result, null);
        } else if (fullText) {
          beginTyping(fullText, null);
        } else {
          throw new Error('No response received');
        }
      } else {
        const c = ALL_COMMANDS.find(cmd => cmd.id === selectedCmdId);
        const reply = c
          ? `Great question about ${c.name}! ${c.purpose} The syntax is \`${c.syntax}\`. Try running the example and see what output you get — hands-on practice is the best way to learn!`
          : "I'm here to help you master cybersecurity commands. What would you like to know?";
        setTimeout(() => beginTyping(reply, null), 600);
      }
    } catch (err) {
      console.error('sendMessage error:', err);
      setHistory(h => h.slice(0, -1));
      setInput(msg);
      setSendError(err.message);
      setPhase('done');
      setMood('neutral');
    }
  }, [input, phase, onAskKai, selectedCmdId, beginTyping]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const busy = phase === 'loading' || phase === 'typing' || phase === 'error';
  const showBubble = phase === 'loading' || phase === 'typing';

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

        <div style={{ textAlign: 'center', flex: 1, padding: '0 16px', minWidth: 0 }}>
          <div style={{
            fontSize: 11, color: '#8b7cf6', fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {cmd?.category}
          </div>
          <div style={{
            fontSize: 14, color: '#1e1b4b', fontWeight: 600, marginTop: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {cmd?.name}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            padding: '6px 14px', borderRadius: 20, background: '#f5f3ff',
            border: '1.5px solid #ede9fe', fontSize: 13, color: '#7c3aed', fontWeight: 600,
          }}>
            ⚡ {totalXP} XP
          </div>
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
          COMMAND PILLS ROW
      ───────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #ede9fe', padding: '10px 24px',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, zIndex: 9,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: '#8b7cf6', letterSpacing: '0.08em',
          textTransform: 'uppercase', flexShrink: 0, marginRight: 4,
        }}>
          Commands
        </div>
        <div ref={pillsRef} className="cmd-pills-scroll" style={{
          display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', flex: 1,
        }}>
          {ALL_COMMANDS.map(c => {
            const active = c.id === selectedCmdId;
            const learned = learnedCommands.includes(c.id);
            return (
              <button
                key={c.id}
                data-active={active}
                onClick={() => handleSelectCommand(c.id)}
                style={{
                  padding: '7px 14px', borderRadius: 20, border: active
                    ? '2px solid #7c3aed'
                    : '1.5px solid #ede9fe',
                  background: active ? '#f5f3ff' : '#fff',
                  color: active ? '#7c3aed' : '#6b7280',
                  fontSize: 13, fontWeight: active ? 700 : 600, whiteSpace: 'nowrap',
                  cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
                  transition: 'all 0.15s', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {c.name}
                {learned && <span style={{ fontSize: 10, color: '#10b981' }}>✓</span>}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onToggleLearned(cmd.id)}
          style={{
            padding: '7px 14px', borderRadius: 10, flexShrink: 0,
            background: isLearned ? '#dcfce7' : '#f5f3ff',
            border: '1.5px solid ' + (isLearned ? '#86efac' : '#ede9fe'),
            color: isLearned ? '#166534' : '#7c3aed',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
        >
          {isLearned ? '✓ Learned' : 'Mark Learned'}
        </button>

        <button
          onClick={handleNext}
          disabled={busy}
          style={{
            padding: '7px 14px', borderRadius: 10, flexShrink: 0,
            background: busy ? '#e0d9f9' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
            boxShadow: busy ? 'none' : '0 2px 10px rgba(124,58,237,0.25)',
          }}
        >
          Next →
        </button>
      </div>

      {/* ─────────────────────────────────────
          FULL-WIDTH MAIN AREA
      ───────────────────────────────────── */}
      <div className="cmd-main-scroll" style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '32px 0 20px', width: '100%',
      }}>
        <div style={{ width: '100%', margin: '0 auto' }}>
          {/* History */}
          {history.map((msg, i) => (
            <HistoryItem
              key={i}
              role={msg.role}
              content={msg.content}
              block={msg.block}
            />
          ))}

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

          {/* Kai current teaching message */}
          {showBubble && (
            <div style={{ width: '100%', marginBottom: 28, animation: 'cmdFadeSlide 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingLeft: 4 }}>
                <KaiAvatar mood={mood} size={62} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#312e81' }}>Kai</div>
                  <div style={{ fontSize: 11, color: '#8b7cf6', fontWeight: 600, marginTop: 1 }}>
                    AI Cybersecurity Instructor
                  </div>
                </div>
                {phase === 'typing' && (
                  <span style={{ fontSize: 20, animation: 'cmdHandWave 1.5s ease-in-out infinite' }}>✍️</span>
                )}
                {phase === 'loading' && (
                  <span style={{ fontSize: 20, animation: 'cmdThinking 2s ease-in-out infinite' }}>💭</span>
                )}
              </div>

              <SpeechBubble
                text={displayed}
                cursorVisible={cursorVisible}
                mood={mood}
                isEmpty={phase === 'loading'}
                block={phase === 'typing' && typingDone ? streamBlock : null}
              />
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
        borderTop: '1px solid #ede9fe', padding: '16px 0 20px', flexShrink: 0, width: '100%',
      }}>
        <div style={{ width: '100%', margin: '0 auto' }}>
          {/* Command meta row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap',
          }}>
            <span style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe',
            }}>
              {cmd?.difficulty}
            </span>
            <span style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb',
            }}>
              ⏱ {cmd?.estimatedTime}
            </span>
            <span style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
            }}>
              ⚡ {cmd?.xp} XP
            </span>
          </div>

          <QuickChips onSend={sendMessage} disabled={busy} />

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', width: '100%' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={busy}
              placeholder={busy ? 'Kai is typing…' : `Ask Kai about ${cmd?.name}…`}
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
